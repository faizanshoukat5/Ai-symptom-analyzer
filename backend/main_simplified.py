"""
Simplified Medical Symptom Checker API for testing
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
import requests
import asyncio
import aiohttp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Symptom Checker API",
    description="AI-powered symptom analysis",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://ai-symptom-analyzer.web.app").split(",")
# Add Railway URL and common development ports
cors_origins.extend([
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
    "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004",
    "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", 
    "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002", "http://127.0.0.1:3003", "http://127.0.0.1:3004",
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

# Hugging Face API Configuration
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/d4data/biomedical-ner-all"
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "your_huggingface_token_here")
HUGGINGFACE_HEADERS = {
    "Authorization": f"Bearer {HUGGINGFACE_TOKEN}",
    "Content-Type": "application/json"
}

# Initialize AI Models (load in background to avoid blocking)
BIOMEDICAL_NER_AVAILABLE = True  # Always available via API
MEDICAL_BERT_AVAILABLE = False
SYMPTOM_CLASSIFIER_AVAILABLE = False
MODEL_LOADING_STARTED = False

# Model containers
medical_bert = None
symptom_classifier = None

# Medical terminology dictionary
MEDICAL_TERMS = {
    # Common symptoms and their medical terms
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

# Expanded medical knowledge base for better fallback analysis
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
    """Biomedical NER is now available via Hugging Face API"""
    global BIOMEDICAL_NER_AVAILABLE
    logger.info("Biomedical NER model available via Hugging Face API")
    BIOMEDICAL_NER_AVAILABLE = True
    logger.info("✅ Biomedical NER API configured successfully")

async def call_huggingface_ner_api(text: str) -> List[Dict]:
    """Call Hugging Face biomedical NER API"""
    try:
        payload = {"inputs": text}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                HUGGINGFACE_API_URL,
                headers=HUGGINGFACE_HEADERS,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Hugging Face NER API call successful, found {len(result)} entities")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"Hugging Face API error: {response.status} - {error_text}")
                    return []
    except Exception as e:
        logger.error(f"Error calling Hugging Face NER API: {e}")
        return []

def load_medical_bert_model():
    """Load Medical classification model in background"""
    global MEDICAL_BERT_AVAILABLE, medical_bert
    try:
        from transformers import pipeline
        logger.info("Loading lightweight medical classification model...")
        # Use a simpler, more reliable model with CPU
        medical_bert = pipeline(
            "zero-shot-classification", 
            model="facebook/bart-large-mnli",
            device=-1  # Use CPU to avoid memory issues
        )
        MEDICAL_BERT_AVAILABLE = True
        logger.info("✅ Medical classification model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Medical classification model failed to load: {e}")
        # Try an even simpler approach
        try:
            logger.info("Trying alternative classification approach...")
            medical_bert = pipeline(
                "text-classification", 
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=-1  # Use CPU
            )
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
        # Using a lighter model that's more suitable for text classification
        symptom_classifier = pipeline(
            "text-classification", 
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=-1  # Use CPU
        )
        SYMPTOM_CLASSIFIER_AVAILABLE = True
        logger.info("✅ Symptom severity classifier loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Symptom severity classifier failed to load: {e}")
        SYMPTOM_CLASSIFIER_AVAILABLE = False

# Load models in background sequentially to avoid memory issues
import threading
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
import concurrent.futures

def run_with_timeout(func, args=(), kwargs=None, timeout_seconds=10):
    """Run a function with timeout using ThreadPoolExecutor"""
    if kwargs is None:
        kwargs = {}
    
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(func, *args, **kwargs)
        try:
            result = future.result(timeout=timeout_seconds)
            return result
        except concurrent.futures.TimeoutError:
            logger.warning(f"Function {func.__name__} timed out after {timeout_seconds} seconds")
            raise TimeoutError(f"Operation timed out after {timeout_seconds} seconds")

def load_models_sequentially():
    """Load models one by one to avoid memory pressure"""
    global MODEL_LOADING_STARTED
    
    # Prevent multiple loading attempts
    if MODEL_LOADING_STARTED:
        return
    
    MODEL_LOADING_STARTED = True
    logger.info("🚀 Starting sequential model loading...")
    
    # Try to load biomedical NER first (most important)
    try:
        logger.info("Loading biomedical NER model...")
        load_biomedical_model()
        import time
        time.sleep(5)  # Wait longer between models to allow memory cleanup
    except Exception as e:
        logger.error(f"Failed to load biomedical model: {e}")
    
    # Only load additional models if we have enough memory
    if BIOMEDICAL_NER_AVAILABLE:
        logger.info("Biomedical NER loaded successfully, attempting to load classification model...")
        try:
            load_medical_bert_model()
            time.sleep(5)  # Wait between models
        except Exception as e:
            logger.error(f"Failed to load medical BERT model: {e}")
    else:
        logger.warning("Skipping additional models due to biomedical NER failure")
    
    # Skip symptom classifier for now to save memory
    logger.info("Skipping symptom classifier to preserve memory")
    
    logger.info("🎉 Model loading process completed")
    logger.info(f"Model status: Biomedical NER: {BIOMEDICAL_NER_AVAILABLE} (API), Medical BERT: {MEDICAL_BERT_AVAILABLE}, Symptom Classifier: {SYMPTOM_CLASSIFIER_AVAILABLE}")

# Start model loading in background thread (only once)
if not MODEL_LOADING_STARTED:
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
    # Additional fields for advanced analysis section
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
            "biomedical_ner": "Available via API" if BIOMEDICAL_NER_AVAILABLE else "Not Available",
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
        if BIOMEDICAL_NER_AVAILABLE:
            try:
                entities_result = await extract_medical_entities(symptom_data.symptoms)
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
                # Pass all the collected data to OpenAI for enhanced analysis
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
                # Add all the collected data to the response
                analysis.entities_extracted = entities_extracted
                analysis.ai_models_used = "Ensemble: Biomedical NER + Medical BERT + OpenAI GPT"
                
                logger.info("✅ Analysis completed using Enhanced OpenAI Ensemble")
                return analysis
            except Exception as e:
                logger.warning(f"Enhanced OpenAI analysis failed: {e}")
                # Try basic OpenAI as fallback
                try:
                    analysis = await analyze_with_openai(symptom_data)
                    analysis.entities_extracted = entities_extracted
                    analysis.ai_models_used = "OpenAI GPT with Biomedical Entities"
                    logger.info("✅ Analysis completed using basic OpenAI")
                    return analysis
                except Exception as e2:
                    logger.warning(f"Basic OpenAI also failed: {e2}")
                    # If OpenAI fails, use other models for a response
        
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
        if BIOMEDICAL_NER_AVAILABLE:
            try:
                analysis = await analyze_with_biomedical_ner(symptom_data)
                logger.info("✅ Analysis completed using Biomedical NER only")
                return analysis
            except Exception as e:
                logger.warning(f"Biomedical NER analysis failed: {e}")
        
        # Step 8: Final fallback - use our mock analysis for demonstration
        logger.warning("All AI models failed, using mock analysis")
        return get_mock_analysis(symptom_data)

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return get_basic_fallback_analysis(symptom_data)

async def analyze_with_biomedical_ner(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using biomedical NER API"""
    try:
        # Extract medical entities using API
        entities_result = await call_huggingface_ner_api(symptom_data.symptoms)
        
        # Process entities
        symptoms = []
        body_parts = []
        severity_indicators = []
        
        for entity in entities_result:
            word = entity.get('word', '')
            label = entity.get('entity', '')
            
            if word.startswith('##'):
                continue  # Skip subword tokens
            
            if 'SIGN' in label or 'SYMPTOM' in label:
                symptoms.append(word)
            elif 'BODY' in label or 'ORGAN' in label:
                body_parts.append(word)
            elif word.lower() in ['severe', 'mild', 'moderate', 'intense']:
                severity_indicators.append(word.lower())
        
        # Generate analysis
        condition = f"Symptoms affecting {', '.join(body_parts[:2]) if body_parts else 'multiple areas'}"
        if symptoms:
            condition += f": {', '.join(symptoms[:3])}"
        
        # Determine severity
        if any(word in severity_indicators for word in ['severe', 'intense']):
            severity = "High"
        elif any(word in severity_indicators for word in ['moderate']):
            severity = "Medium"
        else:
            severity = "Low"
        
        return AnalysisResponse(
            condition=condition,
            severity=severity,
            advice=f"Based on biomedical analysis of your symptoms, monitor your condition and consider consulting a healthcare provider if symptoms persist or worsen.",
            confidence=75,
            recommendations=[
                "Monitor your symptoms closely",
                "Keep a symptom diary",
                "Stay hydrated and rest",
                "Consult healthcare provider if symptoms worsen"
            ],
            whenToSeekHelp="Seek immediate medical attention if symptoms become severe or if you develop new concerning symptoms.",
            disclaimer="This analysis uses biomedical AI for informational purposes only. Always consult healthcare professionals for medical advice."
        )
        
    except Exception as e:
        logger.error(f"Biomedical NER analysis error: {e}")
        raise

async def analyze_with_enhanced_openai(data: Dict[str, Any]) -> AnalysisResponse:
    """
    Analyze symptoms with OpenAI using enhanced data from multiple models
    """
    try:
        prompt = create_enhanced_medical_prompt(data)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using the mini model for faster response
            messages=[
                {
                    "role": "system",
                    "content": "You are an advanced medical AI assistant with expertise in clinical diagnosis. Provide accurate, conservative medical guidance based on the symptoms and medical entities provided. Focus on giving practical advice while being appropriately cautious about serious conditions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.3
        )
        
        content = response.choices[0].message.content.strip()
        return parse_openai_response(content)
        
    except Exception as e:
        logger.error(f"Enhanced OpenAI error: {e}")
        raise

async def analyze_with_openai(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using basic OpenAI prompt"""
    try:
        prompt = create_medical_prompt(symptom_data)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant with clinical knowledge. Provide helpful, conservative medical guidance based on the symptoms described."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=600,
            temperature=0.3
        )
        
        content = response.choices[0].message.content.strip()
        return parse_openai_response(content)
        
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        raise

def create_enhanced_medical_prompt(data: Dict[str, Any]) -> str:
    """Create enhanced medical analysis prompt with data from multiple models"""
    symptoms = data.get("symptoms", "")
    entities = data.get("entities_extracted", [])
    medical_terms = data.get("medical_terms", [])
    symptom_classes = data.get("symptom_classes", [])
    severity_score = data.get("severity_score")
    age = data.get("age")
    gender = data.get("gender")
    
    prompt = f"""
Analyze these symptoms and provide a detailed medical assessment:

PATIENT INFORMATION:
Symptoms: {symptoms}
"""
    if age:
        prompt += f"Age: {age}\n"
    if gender:
        prompt += f"Gender: {gender}\n"
    
    # Add extracted medical entities if available
    if entities:
        prompt += f"\nEXTRACTED MEDICAL ENTITIES: {', '.join(entities)}\n"
    
    # Add professional medical terminology if available
    if medical_terms:
        prompt += f"\nRELEVANT MEDICAL TERMINOLOGY: {', '.join(medical_terms)}\n"
    
    # Add symptom classifications if available
    if symptom_classes:
        prompt += f"\nMEDICAL CATEGORIES: {', '.join(symptom_classes)}\n"
    
    # Add severity assessment if available
    if severity_score is not None:
        prompt += f"\nINITIAL SEVERITY ASSESSMENT: {severity_score}/10\n"
    
    prompt += """
Respond with JSON only in this exact format:
{
    "condition": "Most likely condition or assessment based on symptoms",
    "severity": "Low|Medium|High|Critical", 
    "advice": "Detailed primary medical advice (at least 2 sentences)",
    "confidence": <integer between 60-95>,
    "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3", "specific recommendation 4"],
    "whenToSeekHelp": "When to seek immediate medical help",
    "possibleCauses": ["cause 1", "cause 2", "cause 3"],
    "possibleTreatments": ["treatment 1", "treatment 2", "treatment 3"],
    "urgency_score": <integer between 1-10 representing urgency (1=very low, 10=emergency)>
}
"""
    return prompt

def create_medical_prompt(symptom_data: SymptomRequest) -> str:
    """Create basic medical analysis prompt"""
    prompt = f"""
Analyze these symptoms and provide a detailed medical assessment:

PATIENT INFORMATION:
Symptoms: {symptom_data.symptoms}
"""
    if symptom_data.age:
        prompt += f"Age: {symptom_data.age}\n"
    if symptom_data.gender:
        prompt += f"Gender: {symptom_data.gender}\n"
    
    prompt += """
Respond with JSON only in this exact format:
{
    "condition": "Most likely condition or assessment based on symptoms",
    "severity": "Low|Medium|High|Critical", 
    "advice": "Detailed primary medical advice (at least 2 sentences)",
    "confidence": <integer between 60-95>,
    "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
    "whenToSeekHelp": "When to seek immediate medical help",
    "urgency_score": <integer between 1-10 representing urgency (1=very low, 10=emergency)>
}
"""
    return prompt

def parse_openai_response(content: str) -> AnalysisResponse:
    """Parse OpenAI JSON response"""
    try:
        # Clean up response
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        data = json.loads(content.strip())
        
        # Ensure confidence is within reasonable bounds (0-100)
        raw_confidence = data.get("confidence", 75)
        if isinstance(raw_confidence, (int, float)):
            if raw_confidence > 100:
                confidence = min(95, int(raw_confidence / 100))  # Handle case where confidence might be like 8500
            else:
                confidence = min(max(int(raw_confidence), 0), 100)
        else:
            confidence = 75
        
        # Calculate urgency score from severity and other factors
        urgency_score = data.get("urgency_score")
        if urgency_score is None:
            # Calculate urgency score based on severity if not provided
            severity_level = data.get("severity", "Medium")
            if severity_level == "Critical":
                urgency_score = 9
            elif severity_level == "High":
                urgency_score = 7
            elif severity_level == "Medium":
                urgency_score = 5
            else:  # Low
                urgency_score = 3
        
        # Ensure urgency score is within bounds
        urgency_score = max(1, min(10, int(urgency_score)))
        
        return AnalysisResponse(
            condition=data.get("condition", "Symptom analysis"),
            severity=data.get("severity", "Medium"),
            advice=data.get("advice", "Please consult with a healthcare professional."),
            confidence=confidence,
            recommendations=data.get("recommendations", ["Consult healthcare provider"]),
            whenToSeekHelp=data.get("whenToSeekHelp", "Seek medical attention if symptoms worsen."),
            disclaimer="This AI analysis is for informational purposes only. Always consult healthcare professionals.",
            urgency_score=urgency_score
        )
        
    except Exception as e:
        logger.error(f"Failed to parse OpenAI response: {e}")
        return get_basic_fallback_analysis(None)

def get_mock_analysis(symptom_data) -> AnalysisResponse:
    """Provide an enhanced analysis using medical knowledge base when AI models fail"""
    symptoms_text = symptom_data.symptoms.lower() if symptom_data else ""
    
    # Initialize default values
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
                    severity = "High"  # Urgent signs always elevate severity
    
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
        advice_parts.append("with some concerning features")
        severity = "High"
    
    advice_parts.extend([
        "we recommend careful monitoring of your condition.",
        "It's important to consult with a healthcare professional for proper evaluation and treatment."
    ])
    
    if urgent_signs_present:
        advice_parts.append("Given the severity indicators in your description, consider seeking medical attention promptly.")
    
    advice = " ".join(advice_parts)
    
    # Enhanced recommendations based on body systems
    if "cardiovascular" in body_systems:
        recommendations.extend([
            "Avoid strenuous physical activity until evaluated",
            "Monitor for chest pain, shortness of breath, or arm pain"
        ])
    elif "respiratory" in body_systems:
        recommendations.extend([
            "Ensure good ventilation and avoid smoke or irritants",
            "Monitor breathing and seek help if difficulty breathing occurs"
        ])
    elif "gastrointestinal" in body_systems:
        recommendations.extend([
            "Follow a bland diet (BRAT: bananas, rice, applesauce, toast)",
            "Stay hydrated with clear fluids"
        ])
    elif "neurological" in body_systems:
        recommendations.extend([
            "Rest in a quiet, dark environment",
            "Avoid driving if experiencing dizziness or vision changes"
        ])
    
    # Add additional entities based on common medical terms
    for term in ["pain", "ache", "sore", "hurt", "burning", "sharp", "dull"]:
        if term in symptoms_text and term not in entities:
            entities.append(term)
    
    # If no specific entities found, add general ones
    if not entities:
        entities = ["symptom", "discomfort", "medical condition"]
    
    # Calculate urgency score
    urgency_score = 5  # Default medium
    if severity == "High" or urgent_signs_present:
        urgency_score = 8
    elif severity == "Low":
        urgency_score = 3
    elif severity == "Critical":
        urgency_score = 9
    
    # Enhanced when to seek help advice
    when_to_seek_help = "Seek medical attention if symptoms worsen, persist for more than 2-3 days, or if you develop new concerning symptoms."
    
    if urgent_signs_present:
        when_to_seek_help = "Seek medical attention promptly due to concerning symptoms. If symptoms are severe or rapidly worsening, consider emergency care."
    elif severity == "High":
        when_to_seek_help = "Seek medical attention within 24 hours if symptoms persist or worsen."
    
    # Build response
    response_dict = {
        "condition": condition,
        "severity": severity,
        "advice": advice,
        "confidence": 80 if matched_conditions else 65,  # Higher confidence if we matched known conditions
        "recommendations": recommendations,
        "whenToSeekHelp": when_to_seek_help,
        "disclaimer": "This analysis uses a medical knowledge base for informational purposes only. Always consult healthcare professionals for medical advice.",
        "urgency_score": urgency_score,
        "entities_extracted": entities[:10],  # Limit to 10 entities
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

async def extract_medical_entities(symptoms_text: str) -> Dict[str, List[str]]:
    """Extract medical entities from symptoms using Hugging Face biomedical NER API"""
    try:
        if BIOMEDICAL_NER_AVAILABLE:
            try:
                # Call Hugging Face API
                entities_result = await call_huggingface_ner_api(symptoms_text)
                
                if entities_result:
                    # Process and clean entities
                    entities = []
                    current_entity = ""
                    
                    for item in entities_result:
                        word = item.get('word', '')
                        label = item.get('entity', '')
                        score = float(item.get('score', 0))
                        
                        # Skip low confidence results
                        if score < 0.5:
                            continue
                            
                        # Handle subword tokens (those starting with ##)
                        if word.startswith('##'):
                            current_entity += word[2:]  # Remove ## and append
                        else:
                            # If we have a current entity, save it
                            if current_entity and len(current_entity) > 2:
                                entities.append(current_entity.lower())
                            current_entity = word
                    
                    # Don't forget the last entity
                    if current_entity and len(current_entity) > 2:
                        entities.append(current_entity.lower())
                    
                    # Remove duplicates and filter out very short or common words
                    filtered_entities = []
                    for entity in set(entities):
                        if len(entity) > 2 and entity not in ['the', 'and', 'but', 'for', 'with', 'have', 'had', 'has']:
                            filtered_entities.append(entity)
                    
                    if filtered_entities:
                        return {"entities": filtered_entities[:10]}  # Limit to top 10 entities
                
            except Exception as e:
                logger.warning(f"Hugging Face NER API failed: {e}, using rule-based extraction")
        
        # Fallback to rule-based entity extraction
        return extract_entities_rule_based(symptoms_text)
        
    except Exception as e:
        logger.error(f"Error extracting medical entities: {e}")
        return extract_entities_rule_based(symptoms_text)

def extract_entities_rule_based(symptoms_text: str) -> Dict[str, List[str]]:
    """Rule-based medical entity extraction using keyword matching"""
    try:
        symptoms_lower = symptoms_text.lower()
        entities = []
        
        # Medical entity keywords organized by category
        medical_entities = {
            "body_parts": ["head", "chest", "heart", "lung", "stomach", "abdomen", "back", "spine", "joint", "muscle", "skin", "throat", "eye", "ear", "nose", "mouth", "arm", "leg", "hand", "foot"],
            "symptoms": ["pain", "ache", "fever", "cough", "nausea", "vomiting", "diarrhea", "constipation", "headache", "dizziness", "fatigue", "weakness", "swelling", "rash", "itch", "burn", "bleeding", "bruise"],
            "conditions": ["infection", "inflammation", "allergy", "strain", "sprain", "fracture", "migraine", "asthma", "diabetes", "hypertension"],
            "severity": ["mild", "moderate", "severe", "intense", "sharp", "dull", "throbbing", "burning", "stabbing", "cramping"]
        }
        
        # Extract entities from each category
        for category, keywords in medical_entities.items():
            for keyword in keywords:
                if keyword in symptoms_lower:
                    entities.append(keyword)
        
        # Also look for medical terms from our dictionary
        for common_term in MEDICAL_TERMS.keys():
            if common_term in symptoms_lower:
                entities.append(common_term)
        
        # Remove duplicates and limit
        unique_entities = list(set(entities))[:10]
        
        return {"entities": unique_entities}
        
    except Exception as e:
        logger.error(f"Error in rule-based entity extraction: {e}")
        return {"entities": []}

def enhance_with_medical_terminology(entities: List[str]) -> List[str]:
    """Enhance extracted entities with professional medical terminology"""
    try:
        enhanced_terms = []
        
        for entity in entities:
            entity_lower = entity.lower()
            
            # Check if we have a medical term for this entity
            for common_term, medical_term in MEDICAL_TERMS.items():
                if entity_lower in common_term or common_term in entity_lower:
                    enhanced_terms.append(medical_term)
                    break
            else:
                # If no medical term found, keep the original entity
                enhanced_terms.append(entity)
        
        return list(set(enhanced_terms))  # Remove duplicates
        
    except Exception as e:
        logger.error(f"Error enhancing with medical terminology: {e}")
        return entities

def classify_symptoms(symptoms_text: str) -> List[str]:
    """Classify symptoms into medical categories using available models"""
    try:
        if not MEDICAL_BERT_AVAILABLE or not medical_bert:
            # Fallback to rule-based classification using our knowledge base
            return classify_symptoms_rule_based(symptoms_text)
        
        # Define medical categories for classification
        medical_categories = [
            "neurological symptoms",
            "cardiovascular symptoms", 
            "respiratory symptoms",
            "gastrointestinal symptoms",
            "musculoskeletal symptoms",
            "dermatological symptoms",
            "infectious disease symptoms"
        ]
        
        try:
            # Add timeout to prevent hanging
            def run_classification():
                return medical_bert(symptoms_text, medical_categories)
            
            result = run_with_timeout(run_classification, timeout_seconds=15)
            
            # Return top 3 categories with confidence > 0.1
            classified_symptoms = []
            for label, score in zip(result['labels'], result['scores']):
                if score > 0.1:  # Only include if confidence is reasonable
                    classified_symptoms.append(label)
                if len(classified_symptoms) >= 3:  # Limit to top 3
                    break
            
            return classified_symptoms
            
        except (TimeoutError, Exception) as e:
            logger.warning(f"Zero-shot classification failed or timed out: {e}, using rule-based fallback")
            return classify_symptoms_rule_based(symptoms_text)
        
    except Exception as e:
        logger.error(f"Error classifying symptoms: {e}")
        return classify_symptoms_rule_based(symptoms_text)

def classify_symptoms_rule_based(symptoms_text: str) -> List[str]:
    """Rule-based symptom classification using our medical knowledge base"""
    try:
        symptoms_lower = symptoms_text.lower()
        classifications = []
        
        # Check each category based on keywords
        if any(word in symptoms_lower for word in ['head', 'headache', 'migraine', 'dizzy', 'memory', 'confusion', 'seizure']):
            classifications.append("neurological symptoms")
        
        if any(word in symptoms_lower for word in ['chest', 'heart', 'palpitation', 'pressure', 'angina', 'cardiac']):
            classifications.append("cardiovascular symptoms")
        
        if any(word in symptoms_lower for word in ['cough', 'breath', 'lung', 'wheeze', 'respiratory', 'throat', 'airway']):
            classifications.append("respiratory symptoms")
        
        if any(word in symptoms_lower for word in ['stomach', 'nausea', 'vomit', 'diarrhea', 'constipation', 'abdomen', 'digestive']):
            classifications.append("gastrointestinal symptoms")
        
        if any(word in symptoms_lower for word in ['muscle', 'joint', 'back', 'spine', 'bone', 'arthritis', 'strain']):
            classifications.append("musculoskeletal symptoms")
        
        if any(word in symptoms_lower for word in ['skin', 'rash', 'itch', 'burn', 'dermatitis', 'acne']):
            classifications.append("dermatological symptoms")
        
        if any(word in symptoms_lower for word in ['fever', 'infection', 'flu', 'cold', 'virus', 'bacterial']):
            classifications.append("infectious disease symptoms")
        
        return classifications[:3]  # Return top 3
        
    except Exception as e:
        logger.error(f"Error in rule-based classification: {e}")
        return []

def analyze_symptom_severity(symptoms_text: str) -> Optional[int]:
    """Analyze symptom severity using the symptom classifier"""
    try:
        if not SYMPTOM_CLASSIFIER_AVAILABLE or not symptom_classifier:
            return None
        
        # Prepare text for severity analysis
        severity_text = f"The patient reports: {symptoms_text}"
        
        # Use the classifier (this is a simplified approach)
        # In a real implementation, you'd use a model specifically trained for medical severity
        result = symptom_classifier(severity_text)
        
        # Map the result to a severity score (1-10)
        # This is a simplified mapping - in practice you'd have a model trained specifically for this
        label = result[0]['label'] if result else 'NEUTRAL'
        score = result[0]['score'] if result else 0.5
        
        # Simple heuristic mapping
        if 'NEGATIVE' in label.upper():
            severity_score = max(1, int(score * 4))  # 1-4 range for negative/mild
        elif 'POSITIVE' in label.upper():
            severity_score = min(10, int(4 + score * 6))  # 4-10 range for positive/severe
        else:
            severity_score = 5  # Neutral
        
        # Additional keyword-based adjustment
        symptoms_lower = symptoms_text.lower()
        if any(word in symptoms_lower for word in ['severe', 'intense', 'unbearable', 'worst', 'extreme']):
            severity_score = min(10, severity_score + 2)
        elif any(word in symptoms_lower for word in ['mild', 'slight', 'minor', 'little']):
            severity_score = max(1, severity_score - 2)
        
        return severity_score
        
    except Exception as e:
        logger.error(f"Error analyzing symptom severity: {e}")
        return None

def create_ensemble_analysis(
    symptoms: str,
    entities: List[str] = None,
    medical_terms: List[str] = None,
    symptom_classes: List[str] = None,
    severity_score: Optional[int] = None,
    age: Optional[int] = None,
    gender: Optional[str] = None
) -> AnalysisResponse:
    """Create analysis using ensemble of available model outputs"""
    try:
        entities = entities or []
        medical_terms = medical_terms or []
        symptom_classes = symptom_classes or []
        
        # Determine condition based on available data
        condition = "Medical Symptom Analysis"
        
        # Use symptom classes if available
        if symptom_classes:
            primary_class = symptom_classes[0].replace(" symptoms", "")
            condition = f"Possible {primary_class.title()} Condition"
        
        # Enhance with entities if available
        if entities:
            key_entities = [e for e in entities if len(e) > 3][:3]
            if key_entities:
                condition += f" - {', '.join(key_entities).title()}"
        
        # Determine severity
        severity = "Medium"  # Default
        if severity_score:
            if severity_score >= 8:
                severity = "High"
            elif severity_score >= 6:
                severity = "Medium"
            elif severity_score <= 3:
                severity = "Low"
        
        # Create comprehensive advice
        advice_parts = [
            "Based on our comprehensive AI analysis of your symptoms",
        ]
        
        if symptom_classes:
            advice_parts.append(f"which appear to be {symptom_classes[0]}")
        
        if severity_score:
            advice_parts.append(f"with a severity assessment of {severity_score}/10")
        
        advice_parts.extend([
            "we recommend monitoring your condition closely.",
            "Consider consulting with a healthcare professional for proper evaluation and treatment."
        ])
        
        if age and age > 65:
            advice_parts.append("Given your age, it's especially important to seek medical attention if symptoms persist.")
        
        advice = " ".join(advice_parts)
        
        # Create recommendations based on available data
        recommendations = [
            "Monitor your symptoms and keep a detailed symptom diary",
            "Stay hydrated and get adequate rest",
        ]
        
        if symptom_classes:
            if "cardiovascular" in symptom_classes[0]:
                recommendations.extend([
                    "Avoid strenuous physical activity until evaluated",
                    "Monitor blood pressure if possible"
                ])
            elif "respiratory" in symptom_classes[0]:
                recommendations.extend([
                    "Ensure good ventilation and avoid irritants",
                    "Use a humidifier if air is dry"
                ])
            elif "gastrointestinal" in symptom_classes[0]:
                recommendations.extend([
                    "Follow a bland diet (BRAT: bananas, rice, applesauce, toast)",
                    "Stay hydrated with clear fluids"
                ])
            elif "neurological" in symptom_classes[0]:
                recommendations.extend([
                    "Avoid driving if experiencing dizziness or vision changes",
                    "Rest in a quiet, dark environment"
                ])
        
        recommendations.append("Consult a healthcare professional for proper diagnosis and treatment")
        
        # Determine urgency for when to seek help
        when_to_seek_help = "Seek medical attention if symptoms worsen, persist for more than a few days, or if you develop new concerning symptoms."
        
        if severity == "High" or (severity_score and severity_score >= 7):
            when_to_seek_help = "Seek medical attention promptly. If symptoms are severe or rapidly worsening, consider emergency care."
        
        # Determine confidence based on available data
        confidence = 60  # Base confidence
        if entities:
            confidence += 10
        if symptom_classes:
            confidence += 10
        if severity_score:
            confidence += 5
        if medical_terms:
            confidence += 5
        
        confidence = min(90, confidence)  # Cap at 90%
        
        # Determine which models were used
        models_used = []
        if entities:
            models_used.append("Biomedical NER")
        if symptom_classes:
            models_used.append("Medical BERT")
        if severity_score:
            models_used.append("Symptom Classifier")
        
        ai_models_used = "Ensemble: " + " + ".join(models_used) if models_used else "Basic Analysis"
        
        return AnalysisResponse(
            condition=condition,
            severity=severity,
            advice=advice,
            confidence=confidence,
            recommendations=recommendations,
            whenToSeekHelp=when_to_seek_help,
            disclaimer="This analysis uses multiple AI models for informational purposes only. Always consult healthcare professionals for medical advice.",
            urgency_score=severity_score or (7 if severity == "High" else 5 if severity == "Medium" else 3),
            entities_extracted=entities,
            ai_models_used=ai_models_used
        )
        
    except Exception as e:
        logger.error(f"Error creating ensemble analysis: {e}")
        # Fallback to mock analysis if ensemble fails
        return get_mock_analysis(type('SymptomData', (), {'symptoms': symptoms, 'age': age, 'gender': gender})())

if __name__ == "__main__":
    import uvicorn
    
    # Start model loading in background
    logger.info("🚀 Starting sequential model loading...")
    load_models_sequentially()
    
    # Start the server
    logger.info("🚀 Starting FastAPI server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
