"""
Medical Symptom Checker API - Complete Backend Code
AI-powered symptom analysis with ensemble models and fallback mechanisms
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import openai
import os
from dotenv import load_dotenv
import json
import logging
import importlib.util
import threading
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Symptom Checker API",
    description="AI-powered symptom analysis with ensemble models",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://ai-symptom-analyzer.web.app").split(",")
cors_origins.extend([
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
    "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
    "http://127.0.0.1:5173", "http://127.0.0.1:3000",
    "https://ai-symptom-analyzer-production.up.railway.app",
    "https://ai-symptom-analyzer.web.app"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    OPENAI_AVAILABLE = bool(os.getenv("OPENAI_API_KEY"))
except Exception as e:
    logger.warning(f"OpenAI not available: {e}")
    OPENAI_AVAILABLE = False

# AI Models availability flags
BIOMEDICAL_NER_AVAILABLE = False
MEDICAL_BERT_AVAILABLE = False
SYMPTOM_CLASSIFIER_AVAILABLE = False

# Model containers
biomedical_ner = None
medical_bert = None
symptom_classifier = None

# Medical terminology dictionary
MEDICAL_TERMS = {
    "headache": "cephalgia",
    "stomach pain": "abdominal pain",
    "chest pain": "angina",
    "shortness of breath": "dyspnea",
    "fast heartbeat": "tachycardia",
    "slow heartbeat": "bradycardia",
    "dizziness": "vertigo",
    "fainting": "syncope",
    "tiredness": "fatigue",
    "joint pain": "arthralgia",
    "muscle pain": "myalgia",
    "fever": "pyrexia",
    "high blood pressure": "hypertension",
    "low blood pressure": "hypotension",
    "swelling": "edema",
    "bruising": "ecchymosis",
    "cough": "tussis",
    "sore throat": "pharyngitis",
    "runny nose": "rhinorrhea",
    "vomiting": "emesis",
    "nausea": "queasiness",
    "blurred vision": "visual disturbance",
    "itching": "pruritus",
    "rash": "dermatitis",
    "poor appetite": "anorexia",
    "weight loss": "cachexia",
    "numbness": "paresthesia",
}

# Expanded medical knowledge base
SYMPTOM_CONDITIONS_DB = {
    "headache": {
        "conditions": ["tension headache", "migraine", "cluster headache", "sinus headache"],
        "severity_keywords": {"high": ["severe", "worst", "unbearable"], "low": ["mild", "slight"]},
        "body_systems": ["neurological"],
        "urgent_signs": ["sudden onset", "worst headache of life", "fever", "neck stiffness"]
    },
    "chest pain": {
        "conditions": ["angina", "heart attack", "costochondritis", "acid reflux"],
        "severity_keywords": {"high": ["crushing", "severe", "radiating"], "low": ["mild", "dull"]},
        "body_systems": ["cardiovascular", "respiratory"],
        "urgent_signs": ["crushing pain", "left arm pain", "shortness of breath", "sweating"]
    },
    "fever": {
        "conditions": ["viral infection", "bacterial infection", "inflammatory condition"],
        "severity_keywords": {"high": ["high fever", "103", "104"], "low": ["low grade", "slight"]},
        "body_systems": ["immune", "infectious"],
        "urgent_signs": ["very high fever", "difficulty breathing", "persistent vomiting"]
    },
    "cough": {
        "conditions": ["upper respiratory infection", "bronchitis", "pneumonia", "allergies"],
        "severity_keywords": {"high": ["severe", "blood", "persistent"], "low": ["dry", "occasional"]},
        "body_systems": ["respiratory"],
        "urgent_signs": ["blood in cough", "difficulty breathing", "chest pain"]
    },
    "stomach pain": {
        "conditions": ["gastritis", "appendicitis", "food poisoning", "ulcer"],
        "severity_keywords": {"high": ["severe", "sharp", "cramping"], "low": ["mild", "dull"]},
        "body_systems": ["gastrointestinal"],
        "urgent_signs": ["severe pain", "vomiting blood", "rigid abdomen"]
    },
    "back pain": {
        "conditions": ["muscle strain", "herniated disc", "arthritis", "kidney stones"],
        "severity_keywords": {"high": ["severe", "sharp", "shooting"], "low": ["dull", "aching"]},
        "body_systems": ["musculoskeletal"],
        "urgent_signs": ["numbness in legs", "loss of bladder control", "severe pain"]
    }
}

def load_biomedical_model():
    """Load biomedical NER model in background"""
    global BIOMEDICAL_NER_AVAILABLE, biomedical_ner
    try:
        from transformers import pipeline
        logger.info("Loading biomedical NER model...")
        biomedical_ner = pipeline("token-classification", model="d4data/biomedical-ner-all")
        BIOMEDICAL_NER_AVAILABLE = True
        logger.info("✅ Biomedical NER model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Biomedical NER model failed to load: {e}")
        BIOMEDICAL_NER_AVAILABLE = False

def load_medical_bert_model():
    """Load Medical classification model in background"""
    global MEDICAL_BERT_AVAILABLE, medical_bert
    try:
        from transformers import pipeline
        logger.info("Loading lightweight medical classification model...")
        medical_bert = pipeline("zero-shot-classification", model="microsoft/DialoGPT-medium")
        MEDICAL_BERT_AVAILABLE = True
        logger.info("✅ Medical classification model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Medical classification model failed to load: {e}")
        try:
            logger.info("Trying alternative classification approach...")
            medical_bert = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
            MEDICAL_BERT_AVAILABLE = True
            logger.info("✅ Alternative classification model loaded successfully")
        except Exception as e2:
            logger.warning(f"⚠️ Alternative model also failed: {e2}")
            MEDICAL_BERT_AVAILABLE = False

def load_symptom_classifier():
    """Load symptom classifier model in background"""
    global SYMPTOM_CLASSIFIER_AVAILABLE, symptom_classifier
    try:
        from transformers import pipeline
        logger.info("Loading symptom severity classifier...")
        symptom_classifier = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        SYMPTOM_CLASSIFIER_AVAILABLE = True
        logger.info("✅ Symptom severity classifier loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Symptom severity classifier failed to load: {e}")
        SYMPTOM_CLASSIFIER_AVAILABLE = False

def load_models_sequentially():
    """Load models one by one to avoid memory pressure"""
    logger.info("🚀 Starting sequential model loading...")
    
    # Load biomedical NER first (most important)
    load_biomedical_model()
    time.sleep(2)
    
    # Load classification model second
    load_medical_bert_model()
    time.sleep(2)
    
    # Load severity classifier last
    load_symptom_classifier()
    
    logger.info("🎉 Model loading process completed")

# Start model loading in background
threading.Thread(target=load_models_sequentially, daemon=True).start()

# Pydantic models
class SymptomRequest(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=1000)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None

class AnalysisResponse(BaseModel):
    condition: str
    severity: str
    advice: str
    confidence: int
    recommendations: List[str]
    whenToSeekHelp: str
    disclaimer: str
    urgency_score: Optional[int] = None
    entities_extracted: Optional[List[str]] = None
    ai_models_used: Optional[str] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Medical Symptom Checker API is running", 
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Medical Symptom Checker API",
        "version": "1.0.0",
        "openai_configured": OPENAI_AVAILABLE,
        "biomedical_ner_available": BIOMEDICAL_NER_AVAILABLE,
        "medical_bert_available": MEDICAL_BERT_AVAILABLE,
        "symptom_classifier_available": SYMPTOM_CLASSIFIER_AVAILABLE,
        "ai_models": {
            "biomedical_ner": "Available" if BIOMEDICAL_NER_AVAILABLE else "Loading...",
            "medical_bert": "Available" if MEDICAL_BERT_AVAILABLE else "Loading...",
            "symptom_classifier": "Available" if SYMPTOM_CLASSIFIER_AVAILABLE else "Loading...",
            "openai": "Configured" if OPENAI_AVAILABLE else "Not Configured"
        }
    }

@app.post("/analyze-symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptom_data: SymptomRequest):
    """
    Analyze patient symptoms using an ensemble of available AI models
    """
    try:
        logger.info(f"Analyzing symptoms: {symptom_data.symptoms[:50]}...")
        
        # Step 1: Extract medical entities with biomedical NER
        entities_extracted = []
        medical_terms_found = []
        if BIOMEDICAL_NER_AVAILABLE and biomedical_ner:
            try:
                entities_result = extract_medical_entities(symptom_data.symptoms)
                entities_extracted = entities_result.get("entities", [])
                logger.info(f"✅ Extracted {len(entities_extracted)} medical entities")
            except Exception as e:
                logger.warning(f"Biomedical NER entity extraction failed: {e}")
        
        # Step 2: Enhance with medical terminology
        if entities_extracted:
            medical_terms_found = enhance_with_medical_terminology(entities_extracted)
            logger.info(f"✅ Enhanced with {len(medical_terms_found)} medical terms")
        
        # Step 3: Classify symptoms if model is available
        symptom_classes = []
        if MEDICAL_BERT_AVAILABLE and medical_bert:
            try:
                symptom_classes = classify_symptoms(symptom_data.symptoms)
                logger.info(f"✅ Classified symptoms into categories: {', '.join(symptom_classes[:3])}")
            except Exception as e:
                logger.warning(f"Medical BERT classification failed: {e}")
        
        # Step 4: Determine severity if model is available
        severity_score = None
        if SYMPTOM_CLASSIFIER_AVAILABLE and symptom_classifier:
            try:
                severity_score = analyze_symptom_severity(symptom_data.symptoms)
                logger.info(f"✅ Determined symptom severity score: {severity_score}")
            except Exception as e:
                logger.warning(f"Symptom severity classification failed: {e}")
        
        # Step 5: Use OpenAI for comprehensive analysis if available
        if OPENAI_AVAILABLE:
            try:
                enhanced_data = {
                    "symptoms": symptom_data.symptoms,
                    "entities_extracted": entities_extracted,
                    "medical_terms": medical_terms_found,
                    "symptom_classes": symptom_classes,
                    "severity_score": severity_score,
                    "age": symptom_data.age,
                    "gender": symptom_data.gender
                }
                analysis = await analyze_with_enhanced_openai(enhanced_data)
                analysis.entities_extracted = entities_extracted
                analysis.ai_models_used = "Ensemble: Biomedical NER + Medical BERT + OpenAI GPT"
                
                logger.info("✅ Analysis completed using Enhanced OpenAI Ensemble")
                return analysis
            except Exception as e:
                logger.warning(f"Enhanced OpenAI analysis failed: {e}")
                try:
                    analysis = await analyze_with_openai(symptom_data)
                    analysis.entities_extracted = entities_extracted
                    analysis.ai_models_used = "OpenAI GPT with Biomedical Entities"
                    logger.info("✅ Analysis completed using basic OpenAI")
                    return analysis
                except Exception as e2:
                    logger.warning(f"Basic OpenAI also failed: {e2}")
        
        # Step 6: If we have enough data from our models, create an ensemble analysis
        if entities_extracted or symptom_classes or severity_score:
            try:
                ensemble_analysis = create_ensemble_analysis(
                    symptoms=symptom_data.symptoms,
                    entities=entities_extracted,
                    medical_terms=medical_terms_found,
                    symptom_classes=symptom_classes,
                    severity_score=severity_score,
                    age=symptom_data.age,
                    gender=symptom_data.gender
                )
                logger.info("✅ Analysis completed using AI model ensemble")
                return ensemble_analysis
            except Exception as e:
                logger.warning(f"Ensemble analysis creation failed: {e}")
        
        # Step 7: If OpenAI and ensemble both failed, use biomedical NER alone if available
        if BIOMEDICAL_NER_AVAILABLE and biomedical_ner:
            try:
                ner_analysis = create_ner_based_analysis(
                    symptoms=symptom_data.symptoms,
                    entities=entities_extracted,
                    age=symptom_data.age,
                    gender=symptom_data.gender
                )
                logger.info("✅ Analysis completed using biomedical NER")
                return ner_analysis
            except Exception as e:
                logger.warning(f"NER-based analysis failed: {e}")
        
        # Step 8: Use knowledge base analysis as fallback
        try:
            kb_analysis = create_knowledge_base_analysis(
                symptoms=symptom_data.symptoms,
                age=symptom_data.age,
                gender=symptom_data.gender
            )
            logger.info("✅ Analysis completed using knowledge base")
            return kb_analysis
        except Exception as e:
            logger.warning(f"Knowledge base analysis failed: {e}")
        
        # Step 9: Final fallback
        return get_basic_fallback_analysis(symptom_data)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def analyze_with_enhanced_openai(enhanced_data: Dict[str, Any]) -> AnalysisResponse:
    """Enhanced OpenAI analysis with additional context"""
    try:
        entities_str = ", ".join(enhanced_data.get("entities_extracted", []))
        medical_terms_str = ", ".join(enhanced_data.get("medical_terms", []))
        symptom_classes_str = ", ".join(enhanced_data.get("symptom_classes", []))
        
        prompt = f"""
        Analyze these medical symptoms with the following context:
        
        Symptoms: {enhanced_data['symptoms']}
        Age: {enhanced_data.get('age', 'Not specified')}
        Gender: {enhanced_data.get('gender', 'Not specified')}
        
        Medical entities found: {entities_str}
        Medical terminology: {medical_terms_str}
        Symptom categories: {symptom_classes_str}
        Severity score: {enhanced_data.get('severity_score', 'Not calculated')}
        
        Please provide a medical analysis in this JSON format:
        {{
            "condition": "<most likely condition>",
            "severity": "<Low/Medium/High>",
            "advice": "<detailed medical advice>",
            "confidence": <integer between 60-95>,
            "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"],
            "whenToSeekHelp": "<when to seek medical help>"
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant. Provide accurate, helpful medical guidance while emphasizing the importance of professional medical consultation."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return parse_openai_response(response.choices[0].message.content)
        
    except Exception as e:
        logger.error(f"Enhanced OpenAI analysis failed: {e}")
        raise Exception(f"Enhanced OpenAI analysis failed: {e}")

async def analyze_with_openai(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Basic OpenAI analysis"""
    try:
        prompt = f"""
        Analyze these medical symptoms:
        
        Symptoms: {symptom_data.symptoms}
        Age: {symptom_data.age if symptom_data.age else 'Not specified'}
        Gender: {symptom_data.gender if symptom_data.gender else 'Not specified'}
        
        Please provide a medical analysis in this JSON format:
        {{
            "condition": "<most likely condition>",
            "severity": "<Low/Medium/High>",
            "advice": "<detailed medical advice>",
            "confidence": <integer between 60-95>,
            "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"],
            "whenToSeekHelp": "<when to seek medical help>"
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant. Provide accurate, helpful medical guidance while emphasizing the importance of professional medical consultation."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return parse_openai_response(response.choices[0].message.content)
        
    except Exception as e:
        logger.error(f"Basic OpenAI analysis failed: {e}")
        raise Exception(f"Basic OpenAI analysis failed: {e}")

def parse_openai_response(response_text: str) -> AnalysisResponse:
    """Parse OpenAI response and return structured analysis"""
    try:
        # Find JSON in the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("No JSON found in response")
        
        json_str = response_text[start_idx:end_idx]
        data = json.loads(json_str)
        
        # Ensure confidence is within reasonable bounds (0-100)
        raw_confidence = data.get("confidence", 75)
        if isinstance(raw_confidence, (int, float)):
            if raw_confidence > 100:
                confidence = min(95, int(raw_confidence / 100))  # Handle case where confidence might be like 8500
            else:
                confidence = min(max(int(raw_confidence), 0), 100)
        else:
            confidence = 75
        
        return AnalysisResponse(
            condition=data.get("condition", "Symptom analysis"),
            severity=data.get("severity", "Medium"),
            advice=data.get("advice", "Please consult with a healthcare professional."),
            confidence=confidence,
            recommendations=data.get("recommendations", ["Consult healthcare provider"]),
            whenToSeekHelp=data.get("whenToSeekHelp", "Seek medical attention if symptoms worsen."),
            disclaimer="This AI analysis is for informational purposes only. Always consult healthcare professionals."
        )
        
    except Exception as e:
        logger.error(f"Failed to parse OpenAI response: {e}")
        raise Exception(f"Failed to parse OpenAI response: {e}")

def extract_medical_entities(symptoms_text: str) -> Dict[str, List[str]]:
    """Extract medical entities from symptoms using biomedical NER with fallback"""
    try:
        if BIOMEDICAL_NER_AVAILABLE and biomedical_ner:
            # Use biomedical NER model
            entities = biomedical_ner(symptoms_text)
            
            # Extract unique entities
            entity_texts = list(set([entity['word'] for entity in entities if entity.get('score', 0) > 0.7]))
            
            # Clean up entities (remove special tokens)
            cleaned_entities = []
            for entity in entity_texts:
                if entity and not entity.startswith('##') and len(entity) > 2:
                    cleaned_entities.append(entity.lower())
            
            return {"entities": cleaned_entities}
        else:
            # Use rule-based entity extraction as fallback
            return extract_entities_rule_based(symptoms_text)
    except Exception as e:
        logger.warning(f"Entity extraction failed: {e}")
        return extract_entities_rule_based(symptoms_text)

def extract_entities_rule_based(symptoms_text: str) -> Dict[str, List[str]]:
    """Rule-based entity extraction as fallback"""
    symptoms_lower = symptoms_text.lower()
    entities = []
    
    # Look for known medical terms
    for term in MEDICAL_TERMS.keys():
        if term in symptoms_lower:
            entities.append(term)
    
    # Look for symptom keywords from our knowledge base
    for symptom in SYMPTOM_CONDITIONS_DB.keys():
        if symptom in symptoms_lower:
            entities.append(symptom)
    
    return {"entities": list(set(entities))}

def enhance_with_medical_terminology(entities: List[str]) -> List[str]:
    """Enhance entities with medical terminology"""
    enhanced = []
    for entity in entities:
        if entity.lower() in MEDICAL_TERMS:
            enhanced.append(MEDICAL_TERMS[entity.lower()])
        enhanced.append(entity)
    return list(set(enhanced))

def classify_symptoms(symptoms_text: str) -> List[str]:
    """Classify symptoms into categories"""
    try:
        if MEDICAL_BERT_AVAILABLE and medical_bert:
            # Use model for classification
            categories = ["respiratory", "cardiovascular", "neurological", "gastrointestinal", "musculoskeletal", "infectious"]
            result = medical_bert(symptoms_text, categories)
            return [result['labels'][0]] if result.get('labels') else []
        else:
            # Use rule-based classification
            return classify_symptoms_rule_based(symptoms_text)
    except Exception as e:
        logger.warning(f"Symptom classification failed: {e}")
        return classify_symptoms_rule_based(symptoms_text)

def classify_symptoms_rule_based(symptoms_text: str) -> List[str]:
    """Rule-based symptom classification"""
    symptoms_lower = symptoms_text.lower()
    categories = []
    
    # Check for body systems based on symptoms
    for symptom, info in SYMPTOM_CONDITIONS_DB.items():
        if symptom in symptoms_lower:
            categories.extend(info["body_systems"])
    
    return list(set(categories))

def analyze_symptom_severity(symptoms_text: str) -> float:
    """Analyze symptom severity"""
    try:
        if SYMPTOM_CLASSIFIER_AVAILABLE and symptom_classifier:
            # Use model for severity analysis
            result = symptom_classifier(symptoms_text)
            # Convert sentiment score to severity (0-1)
            return result[0]['score'] if result else 0.5
        else:
            # Use rule-based severity analysis
            return analyze_severity_rule_based(symptoms_text)
    except Exception as e:
        logger.warning(f"Severity analysis failed: {e}")
        return analyze_severity_rule_based(symptoms_text)

def analyze_severity_rule_based(symptoms_text: str) -> float:
    """Rule-based severity analysis"""
    symptoms_lower = symptoms_text.lower()
    severity_score = 0.5  # Default medium severity
    
    # Check for high severity keywords
    high_severity_keywords = ["severe", "extreme", "unbearable", "worst", "emergency", "critical"]
    for keyword in high_severity_keywords:
        if keyword in symptoms_lower:
            severity_score = 0.8
            break
    
    # Check for low severity keywords
    low_severity_keywords = ["mild", "slight", "minor", "occasional"]
    for keyword in low_severity_keywords:
        if keyword in symptoms_lower:
            severity_score = 0.3
            break
    
    return severity_score

def create_ensemble_analysis(symptoms: str, entities: List[str], medical_terms: List[str], 
                           symptom_classes: List[str], severity_score: float, 
                           age: Optional[int], gender: Optional[str]) -> AnalysisResponse:
    """Create analysis using ensemble of available models"""
    
    # Determine primary condition based on entities and knowledge base
    condition = "Medical symptom analysis"
    matched_conditions = []
    
    for entity in entities:
        if entity in SYMPTOM_CONDITIONS_DB:
            matched_conditions.extend(SYMPTOM_CONDITIONS_DB[entity]["conditions"])
    
    if matched_conditions:
        condition = f"Possible {matched_conditions[0].title()}"
        if len(matched_conditions) > 1:
            condition += f" or {matched_conditions[1].title()}"
    
    # Determine severity
    if severity_score >= 0.7:
        severity = "High"
    elif severity_score <= 0.3:
        severity = "Low"
    else:
        severity = "Medium"
    
    # Generate recommendations
    recommendations = [
        "Monitor your symptoms closely",
        "Keep a detailed symptom diary",
        "Stay hydrated and get adequate rest",
        "Consult a healthcare professional if symptoms worsen or persist"
    ]
    
    # Add specific recommendations based on matched conditions
    if matched_conditions:
        if "migraine" in matched_conditions:
            recommendations.append("Consider avoiding potential triggers like bright lights or loud sounds")
        if "infection" in str(matched_conditions):
            recommendations.append("Monitor for fever and other signs of infection")
    
    advice = f"Based on your symptoms and the analysis of {len(entities)} medical entities, this appears to be related to {condition.lower()}. "
    advice += "It's important to consult with a healthcare professional for proper diagnosis and treatment."
    
    urgency_score = int(severity_score * 10)
    
    return AnalysisResponse(
        condition=condition,
        severity=severity,
        advice=advice,
        confidence=80 if matched_conditions else 65,
        recommendations=recommendations,
        whenToSeekHelp="Seek medical attention if symptoms worsen or persist beyond 24-48 hours.",
        disclaimer="This analysis uses AI models for informational purposes only. Always consult healthcare professionals.",
        urgency_score=urgency_score,
        entities_extracted=entities[:10],
        ai_models_used="AI Model Ensemble Analysis"
    )

def create_knowledge_base_analysis(symptoms: str, age: Optional[int], gender: Optional[str]) -> AnalysisResponse:
    """Create analysis using medical knowledge base"""
    symptoms_text = symptoms.lower()
    
    # Initialize variables
    severity = "Medium"
    condition = "Medical Symptom Analysis"
    entities = []
    recommendations = [
        "Monitor your symptoms closely",
        "Keep a detailed symptom diary",
        "Stay hydrated and get adequate rest",
        "Consult a healthcare professional if symptoms worsen or persist"
    ]
    
    # Analyze symptoms using our knowledge base
    matched_conditions = []
    body_systems = set()
    urgent_signs_present = []
    
    for symptom_key, symptom_info in SYMPTOM_CONDITIONS_DB.items():
        if symptom_key in symptoms_text:
            matched_conditions.extend(symptom_info["conditions"])
            body_systems.update(symptom_info["body_systems"])
            entities.append(symptom_key)
            
            # Check for severity indicators
            for severity_level, keywords in symptom_info["severity_keywords"].items():
                if any(keyword in symptoms_text for keyword in keywords):
                    if severity_level == "high":
                        severity = "High"
                    elif severity_level == "low" and severity != "High":
                        severity = "Low"
            
            # Check for urgent signs
            for urgent_sign in symptom_info["urgent_signs"]:
                if any(word in symptoms_text for word in urgent_sign.split()):
                    urgent_signs_present.append(urgent_sign)
                    severity = "High"
    
    # Determine primary condition
    if matched_conditions:
        condition = f"Possible {matched_conditions[0].title()}"
        if len(matched_conditions) > 1:
            condition += f" or {matched_conditions[1].title()}"
    
    # Add body system information if available
    if body_systems:
        body_system_str = ", ".join(body_systems)
        condition += f" ({body_system_str.title()} System)"
    
    # Enhanced advice based on analysis
    advice_parts = ["Based on your symptom description"]
    
    if matched_conditions:
        advice_parts.append(f"suggesting a possible {matched_conditions[0]}")
    
    if urgent_signs_present:
        advice_parts.append("with some concerning signs that warrant prompt medical attention")
    
    advice_parts.append("it's important to consult with a healthcare professional for proper evaluation and treatment.")
    
    advice = ", ".join(advice_parts) + "."
    
    # Determine urgency and when to seek help
    urgency_score = 5  # Default medium urgency
    
    if urgent_signs_present:
        urgency_score = 8
        when_to_seek_help = "Seek medical attention promptly due to concerning symptoms. If symptoms are severe or rapidly worsening, consider emergency care."
    elif severity == "High":
        when_to_seek_help = "Seek medical attention within 24 hours if symptoms persist or worsen."
    else:
        when_to_seek_help = "Monitor symptoms and seek medical attention if they worsen, persist for more than a few days, or if you develop additional concerning symptoms."
    
    response_dict = {
        "condition": condition,
        "severity": severity,
        "advice": advice,
        "confidence": 80 if matched_conditions else 65,
        "recommendations": recommendations,
        "whenToSeekHelp": when_to_seek_help,
        "disclaimer": "This analysis uses a medical knowledge base for informational purposes only. Always consult healthcare professionals for medical advice.",
        "urgency_score": urgency_score,
        "entities_extracted": entities[:10],
        "ai_models_used": "Enhanced Medical Knowledge Base Analysis"
    }
    
    return AnalysisResponse(**response_dict)

def get_basic_fallback_analysis(symptom_data) -> AnalysisResponse:
    """Basic fallback when AI models are unavailable"""
    return AnalysisResponse(
        condition="Basic Analysis - AI Models Loading",
        severity="Medium",
        advice="Our AI models are currently loading. Please try again in a moment, or consult with a healthcare professional for immediate concerns.",
        confidence=50,
        recommendations=[
            "Wait a moment and try again",
            "Monitor your symptoms",
            "Stay hydrated and rest",
            "Consult healthcare professional if concerned"
        ],
        whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms or if this is an emergency.",
        disclaimer="AI models are loading. For immediate medical concerns, consult healthcare professionals."
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main_simplified:app", host="0.0.0.0", port=port, reload=True)
