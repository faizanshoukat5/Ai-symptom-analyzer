from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import openai
import os
from dotenv import load_dotenv
import json
import logging

# Add Hugging Face imports
import requests
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Symptom Checker API",
    description="AI-powered symptom analysis using OpenAI GPT",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
from openai import OpenAI
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.chatanywhere.com.cn")  # Use ChatAnywhere endpoint
)

# Get OpenAI model from environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# Initialize Hugging Face API configuration
try:
    logger.info("Configuring Hugging Face API...")
    HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
    HF_MODEL_URL = os.getenv("HUGGINGFACE_MODEL_URL", "awelivita/hugging_face_model")
    
    if HF_API_KEY:
        logger.info(f"Hugging Face API configured with model: {HF_MODEL_URL}")
        HF_MODEL_AVAILABLE = True
    else:
        logger.warning("Hugging Face API key not found in environment variables")
        HF_MODEL_AVAILABLE = False
except Exception as e:
    logger.warning(f"Failed to configure Hugging Face API: {e}")
    HF_MODEL_AVAILABLE = False
    logger.warning(f"Failed to load Hugging Face model: {e}")
    HF_MODEL_AVAILABLE = False

# Pydantic models
class SymptomRequest(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=1000, description="Description of symptoms")
    age: Optional[int] = Field(None, ge=1, le=120, description="Patient age")
    gender: Optional[str] = Field(None, description="Patient gender")

class AnalysisResponse(BaseModel):
    condition: str
    severity: str
    advice: str
    confidence: int
    recommendations: List[str]
    whenToSeekHelp: str
    disclaimer: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Medical Symptom Checker API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Medical Symptom Checker API",
        "version": "1.0.0",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "huggingface_model_available": HF_MODEL_AVAILABLE,
        "ai_models": {
            "openai": "Primary - " + ("Configured" if os.getenv("OPENAI_API_KEY") else "Not Configured"),
            "huggingface": "Fallback - " + ("Available" if HF_MODEL_AVAILABLE else "Not Available")
        },
        "primary_model": "OpenAI GPT-3.5-turbo via ChatAnywhere",
        "fallback_model": "Hugging Face Biomedical NER"
    }

@app.post("/debug-hf-analysis")
async def debug_hf_analysis(symptom_data: SymptomRequest):
    """Debug endpoint to see raw Hugging Face model output"""
    try:
        if not HF_MODEL_AVAILABLE:
            return {"error": "HF API not configured"}
        
        # Call Hugging Face API
        results = await call_huggingface_api(symptom_data.symptoms)
        
        return {
            "input": symptom_data.symptoms,
            "raw_results": results,
            "model_available": HF_MODEL_AVAILABLE,
            "model_url": HF_MODEL_URL
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze-symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptom_data: SymptomRequest):
    """
    Analyze patient symptoms using AI models (OpenAI primary, Hugging Face fallback)
    
    This endpoint receives symptom descriptions and returns AI-powered analysis
    including possible conditions, severity assessment, and medical recommendations.
    """
    try:
        logger.info(f"Analyzing symptoms: {symptom_data.symptoms[:50]}...")

        # Try OpenAI/ChatAnywhere first (primary method)
        if os.getenv("OPENAI_API_KEY"):
            try:
                logger.info("Using OpenAI/ChatAnywhere as primary analysis method")
                
                # Construct the prompt for GPT
                prompt = create_medical_prompt(symptom_data)
                
                # Call OpenAI API
                response = await call_openai_api(prompt)
                
                # Parse and validate the response
                analysis = parse_gpt_response(response)
                
                logger.info("Analysis completed using OpenAI/ChatAnywhere")
                return analysis
            except Exception as openai_error:
                logger.warning(f"OpenAI analysis failed: {openai_error}, falling back to Hugging Face")

        # Fall back to Hugging Face if OpenAI fails or isn't available
        if HF_MODEL_AVAILABLE:
            try:
                logger.info("Using Hugging Face as fallback analysis method")
                analysis = await analyze_symptoms_with_huggingface(symptom_data)
                logger.info("Analysis completed using Hugging Face model")
                return analysis
            except Exception as hf_error:
                logger.warning(f"Hugging Face analysis failed: {hf_error}")
        
        # If both fail, return a basic fallback
        logger.warning("Both AI models failed, returning basic fallback")
        return AnalysisResponse(
            condition="AI Analysis Unavailable",
            severity="Medium", 
            advice="We're unable to provide AI analysis at the moment. Please consult with a healthcare professional for proper evaluation of your symptoms.",
            confidence=0,
            recommendations=[
                "Consult with a healthcare professional",
                "Monitor your symptoms closely", 
                "Seek medical attention if symptoms worsen",
                "Keep a record of your symptoms"
            ],
            whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if your condition rapidly worsens.",
            disclaimer="AI analysis is temporarily unavailable. Always consult healthcare professionals for medical advice."
        )

    except Exception as e:
        logger.error(f"Error analyzing symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def create_medical_prompt(symptom_data: SymptomRequest) -> str:
    """Create a structured prompt for medical symptom analysis"""
    
    prompt = f"""
You are a medical AI assistant providing preliminary symptom analysis. Please analyze the following symptoms and provide a structured response.

PATIENT INFORMATION:
- Symptoms: {symptom_data.symptoms}
"""
    
    if symptom_data.age:
        prompt += f"- Age: {symptom_data.age} years old\n"
    
    if symptom_data.gender:
        prompt += f"- Gender: {symptom_data.gender}\n"
    
    prompt += """
INSTRUCTIONS:
Please provide your analysis in the following JSON format only (no additional text):

{
    "condition": "Most likely condition based on symptoms",
    "severity": "Low|Medium|High|Critical",
    "advice": "Primary medical advice and immediate care instructions",
    "confidence": 85,
    "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2",
        "Specific recommendation 3"
    ],
    "whenToSeekHelp": "Clear criteria for when to seek immediate medical attention"
}

IMPORTANT GUIDELINES:
- Base severity on symptom urgency: Low (minor issues), Medium (concerning but not urgent), High (needs medical attention soon), Critical (seek immediate emergency care)
- Provide practical, actionable advice
- Include 3-4 specific recommendations for symptom management
- Always include clear criteria for when to seek professional medical help
- Be conservative in assessments - when in doubt, recommend medical consultation
- Do not provide specific drug dosages or prescription medication recommendations
"""
    
    return prompt

async def call_openai_api(prompt: str) -> str:
    """Call OpenAI API with the medical prompt"""
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,  # Use model from environment
            messages=[
                {
                    "role": "system", 
                    "content": "You are a knowledgeable medical AI assistant. Provide accurate, helpful, and conservative medical guidance while always emphasizing the importance of professional medical consultation for serious concerns."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.3,  # Lower temperature for more consistent medical advice
            top_p=0.9
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        # Check if it's a quota/billing issue and provide fallback
        if "quota" in str(e).lower() or "insufficient" in str(e).lower() or "429" in str(e):
            logger.warning("OpenAI quota exceeded, using fallback response")
            return get_fallback_response(prompt)
        else:
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

def get_fallback_response(prompt: str) -> str:
    """Provide a fallback response when OpenAI API is unavailable"""
    return """{
    "condition": "Demo Mode - OpenAI Quota Exceeded",
    "severity": "Medium",
    "advice": "This is a demonstration response because the OpenAI API quota has been exceeded. In a real scenario, this would contain AI-generated medical analysis. Please consult with a healthcare professional for actual medical advice.",
    "confidence": 0,
    "recommendations": [
        "This is a demo response due to API quota limits",
        "Please add credits to your OpenAI account to use real AI analysis", 
        "Consult with a healthcare professional for medical concerns",
        "Monitor your symptoms and seek help if they worsen"
    ],
    "whenToSeekHelp": "Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if your condition rapidly worsens."
}"""

def parse_gpt_response(response: str) -> AnalysisResponse:
    """Parse and validate GPT response"""
    try:
        # Try to extract JSON from the response
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        # Parse JSON
        data = json.loads(response.strip())
        
        # Validate required fields and set defaults
        condition = data.get("condition", "Condition analysis unavailable")
        severity = data.get("severity", "Medium")
        advice = data.get("advice", "Please consult with a healthcare professional for proper evaluation.")
        confidence = min(max(data.get("confidence", 75), 0), 100)  # Clamp between 0-100
        recommendations = data.get("recommendations", ["Consult with a healthcare professional"])
        when_to_seek_help = data.get("whenToSeekHelp", "Seek medical attention if symptoms worsen or persist.")
        
        # Ensure severity is valid
        if severity not in ["Low", "Medium", "High", "Critical"]:
            severity = "Medium"
        
        # Add disclaimer
        disclaimer = ("This AI analysis is for informational purposes only and should not replace "
                     "professional medical advice, diagnosis, or treatment. Always consult with a "
                     "qualified healthcare provider for medical concerns.")
        
        return AnalysisResponse(
            condition=condition,
            severity=severity,
            advice=advice,
            confidence=confidence,
            recommendations=recommendations if isinstance(recommendations, list) else [str(recommendations)],
            whenToSeekHelp=when_to_seek_help,
            disclaimer=disclaimer
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse GPT response as JSON: {response}")
        # Return fallback response
        return AnalysisResponse(
            condition="Unable to analyze symptoms - please try again",
            severity="Medium",
            advice="We encountered an issue analyzing your symptoms. Please consult with a healthcare professional.",
            confidence=0,
            recommendations=["Consult with a healthcare professional", "Monitor symptoms", "Seek medical attention if symptoms worsen"],
            whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms or if your condition worsens.",
            disclaimer="This AI analysis is for informational purposes only and should not replace professional medical advice."
        )
    except Exception as e:
        logger.error(f"Error parsing GPT response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process analysis results")

async def analyze_symptoms_with_huggingface(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using Hugging Face API"""
    try:
        if not HF_MODEL_AVAILABLE:
            raise Exception("Hugging Face API not configured")
        
        logger.info("Using Hugging Face API for analysis")
        
        # Call the Hugging Face API
        results = await call_huggingface_api(symptom_data.symptoms)
        
        # Process API response
        if results and isinstance(results, list) and len(results) > 0:
            # Biomedical NER returns a list of entities
            entities = results
            
            # Map the entities to medical assessment
            condition = map_classification_to_condition(entities)
            confidence = calculate_confidence_from_entities(entities)
            severity = determine_severity_from_entities(entities)
            
            return AnalysisResponse(
                condition=condition,
                severity=severity,
                advice=generate_advice_for_condition(condition, severity),
                confidence=confidence,
                recommendations=generate_recommendations_from_entities(entities),
                whenToSeekHelp=generate_when_to_seek_help(severity),
                disclaimer="This analysis uses a biomedical NER model via Hugging Face API for entity extraction. For accurate medical evaluation, consult a healthcare professional."
            )
        else:
            raise Exception("No valid classification results returned from API")
            
    except Exception as e:
        logger.error(f"Hugging Face API analysis error: {str(e)}")
        # Return fallback response
        return AnalysisResponse(
            condition="Hugging Face API Analysis - Limited Information",
            severity="Medium",
            advice="Our AI model has provided a basic analysis via API. For comprehensive evaluation, please consult with a healthcare professional.",
            confidence=50,
            recommendations=[
                "Monitor your symptoms closely",
                "Keep a symptom diary",
                "Consult with a healthcare professional for detailed evaluation",
                "Seek medical attention if symptoms worsen"
            ],
            whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if your condition rapidly worsens.",
            disclaimer="This analysis uses a Hugging Face model via API and may have limited accuracy. Always consult healthcare professionals for medical advice."
        )
            
    except Exception as e:
        logger.error(f"Lightweight analysis error: {str(e)}")
        # Return fallback response
        return AnalysisResponse(
            condition="Local Analysis - Basic Assessment",
            severity="Medium",
            advice="Our lightweight analysis system has provided a basic assessment. For comprehensive evaluation, please consult with a healthcare professional.",
            confidence=50,
            recommendations=[
                "Monitor your symptoms closely",
                "Keep a symptom diary",
                "Consult with a healthcare professional for detailed evaluation",
                "Seek medical attention if symptoms worsen"
            ],
            whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if your condition rapidly worsens.",
            disclaimer="This analysis uses a lightweight rule-based system. Always consult healthcare professionals for medical advice."
        )

def map_classification_to_condition(entities: list) -> str:
    """Map biomedical NER entities to medical condition assessment"""
    if not entities:
        return "No specific medical entities detected - general evaluation recommended"
    
    # Extract entity types and text
    entity_groups = {}
    for entity in entities:
        group = entity.get('entity_group', entity.get('label', 'Unknown'))
        word = entity.get('word', '')
        score = entity.get('score', 0)
        
        if group not in entity_groups:
            entity_groups[group] = []
        entity_groups[group].append({'word': word, 'score': score})
    
    # Analyze different types of medical entities
    symptoms = entity_groups.get('Sign_symptom', [])
    diseases = entity_groups.get('Disease_disorder', [])
    anatomy = entity_groups.get('Biological_structure', [])
    medications = entity_groups.get('Pharmacologic_substance', [])
    
    condition_parts = []
    
    if symptoms:
        symptom_words = [s['word'] for s in symptoms[:3]]
        condition_parts.append(f"Symptoms detected: {', '.join(symptom_words)}")
    
    if diseases:
        disease_words = [d['word'] for d in diseases[:2]]
        condition_parts.append(f"Potential conditions: {', '.join(disease_words)}")
    
    if anatomy:
        anatomy_words = [a['word'] for a in anatomy[:2]]
        condition_parts.append(f"Body systems involved: {', '.join(anatomy_words)}")
    
    if medications:
        med_words = [m['word'] for m in medications[:2]]
        condition_parts.append(f"Medications mentioned: {', '.join(med_words)}")
    
    if condition_parts:
        return " | ".join(condition_parts) + " - Professional medical evaluation recommended"
    else:
        # Fallback for other entity types
        entity_words = [entity.get('word', '') for entity in entities[:3]]
        return f"Medical entities identified: {', '.join(entity_words)} - Healthcare consultation advised"

def determine_severity_from_entities(entities: list) -> str:
    """Determine severity based on biomedical entities"""
    if not entities:
        return 'Low'
    
    # Analyze entity content for severity indicators
    all_text = ' '.join([entity.get('word', '').lower() for entity in entities])
    
    # Critical severity indicators
    critical_terms = [
        'severe', 'acute', 'emergency', 'critical', 'urgent', 'hemorrhage', 
        'cardiac arrest', 'respiratory failure', 'shock', 'stroke', 'heart attack',
        'difficulty breathing', 'chest pain', 'unconscious', 'seizure'
    ]
    
    # High severity indicators  
    high_terms = [
        'chronic', 'persistent', 'progressive', 'significant', 'moderate',
        'fever', 'infection', 'bleeding', 'fracture', 'injury', 'trauma'
    ]
    
    # Medium severity indicators
    medium_terms = [
        'mild', 'intermittent', 'occasional', 'discomfort', 'ache', 'soreness'
    ]
    
    # Check for critical terms
    if any(term in all_text for term in critical_terms):
        return 'Critical'
    
    # Check symptom count and entity types
    symptom_entities = [e for e in entities if 'sign_symptom' in e.get('entity_group', '').lower()]
    disease_entities = [e for e in entities if 'disease' in e.get('entity_group', '').lower()]
    
    if disease_entities:
        return 'High'  # Disease entities suggest higher severity
    elif len(symptom_entities) > 2:
        return 'Medium'  # Multiple symptoms
    elif any(term in all_text for term in high_terms):
        return 'High'
    elif any(term in all_text for term in medium_terms):
        return 'Medium'
    else:
        return 'Low'

def calculate_confidence_from_entities(entities: list) -> int:
    """Calculate confidence based on entity scores and count"""
    if not entities:
        return 30
    
    # Calculate average confidence from entity scores
    scores = [entity.get('score', 0.5) for entity in entities]
    avg_score = sum(scores) / len(scores)
    
    # Base confidence from model scores
    base_confidence = int(avg_score * 100)
    
    # Bonus for multiple high-confidence entities
    high_confidence_entities = [e for e in entities if e.get('score', 0) > 0.9]
    if len(high_confidence_entities) >= 2:
        base_confidence = min(base_confidence + 15, 95)
    elif len(entities) > 2:
        base_confidence = min(base_confidence + 10, 90)
    
    return max(base_confidence, 35)  # Minimum 35% confidence

def generate_recommendations_from_entities(entities: list) -> list:
    """Generate specific recommendations based on detected entities"""
    if not entities:
        return [
            "Monitor your symptoms regularly",
            "Keep a detailed symptom diary",
            "Consult with a healthcare professional",
            "Seek medical attention if symptoms worsen"
        ]
    
    recommendations = []
    entity_groups = {}
    
    # Group entities by type
    for entity in entities:
        group = entity.get('entity_group', 'Unknown')
        if group not in entity_groups:
            entity_groups[group] = []
        entity_groups[group].append(entity.get('word', ''))
    
    # Symptom-specific recommendations
    if 'Sign_symptom' in entity_groups:
        recommendations.append("Monitor the identified symptoms closely")
        recommendations.append("Keep a detailed record of symptom progression")
    
    # Anatomy-specific recommendations
    if 'Biological_structure' in entity_groups:
        body_parts = entity_groups['Biological_structure']
        if any(part in ['chest', 'heart', 'cardiac'] for part in body_parts):
            recommendations.append("Seek immediate medical attention for chest/cardiac symptoms")
        elif any(part in ['head', 'brain', 'neurological'] for part in body_parts):
            recommendations.append("Consider neurological evaluation if symptoms persist")
        else:
            recommendations.append(f"Focus monitoring on the {', '.join(body_parts[:2])} area(s)")
    
    # Disease-specific recommendations
    if 'Disease_disorder' in entity_groups:
        recommendations.append("Schedule prompt medical evaluation for potential condition assessment")
    
    # General recommendations
    recommendations.extend([
        "Maintain adequate hydration and rest",
        "Consult with a healthcare professional for proper evaluation"
    ])
    
    return recommendations[:4]  # Return top 4 recommendations

def generate_advice_for_condition(condition: str, severity: str) -> str:
    """Generate basic advice based on condition and severity"""
    if severity == 'Critical':
        return "Seek immediate medical attention. This appears to be a serious condition requiring urgent care."
    elif severity == 'High':
        return "Schedule an appointment with a healthcare provider soon. Monitor symptoms closely."
    elif severity == 'Medium':
        return "Consider consulting with a healthcare professional. Monitor symptoms and seek care if they worsen."
    else:
        return "Continue monitoring symptoms. Maintain healthy lifestyle practices and consider consulting a healthcare provider if symptoms persist."

def generate_recommendations(condition: str) -> List[str]:
    """Generate basic recommendations"""
    return [
        "Monitor your symptoms regularly",
        "Maintain adequate hydration and rest",
        "Keep a symptom diary",
        "Consult with a healthcare professional for proper evaluation"
    ]

def generate_when_to_seek_help(severity: str) -> str:
    """Generate when to seek help based on severity"""
    if severity in ['Critical', 'High']:
        return "Seek immediate medical attention if symptoms worsen or if you experience difficulty breathing, severe pain, or other concerning symptoms."
    else:
        return "Seek medical attention if symptoms persist for more than a few days, worsen significantly, or if you develop new concerning symptoms."

async def call_huggingface_api(text: str):
    """Call Hugging Face API for text classification"""
    try:
        api_url = f"https://api-inference.huggingface.co/models/{HF_MODEL_URL}"
        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        
        payload = {
            "inputs": text,
            "options": {"wait_for_model": True}
        }
        
        # Make async request to Hugging Face API
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Hugging Face API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Error calling Hugging Face API: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)