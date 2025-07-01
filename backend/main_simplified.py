"""
Simplified Medical Symptom Checker API for testing
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import openai
import os
from dotenv import load_dotenv
import json
import logging

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"],
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

# Initialize Biomedical NER (load in background to avoid blocking)
BIOMEDICAL_NER_AVAILABLE = False
biomedical_ner = None

def load_biomedical_model():
    """Load biomedical model in background"""
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

# Load model in background
import threading
threading.Thread(target=load_biomedical_model, daemon=True).start()

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
        "ai_models": {
            "biomedical_ner": "Available" if BIOMEDICAL_NER_AVAILABLE else "Loading...",
            "openai": "Configured" if OPENAI_AVAILABLE else "Not Configured"
        }
    }

@app.post("/analyze-symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptom_data: SymptomRequest):
    """
    Analyze patient symptoms using available AI models
    """
    try:
        logger.info(f"Analyzing symptoms: {symptom_data.symptoms[:50]}...")

        # Try biomedical NER first if available
        if BIOMEDICAL_NER_AVAILABLE and biomedical_ner:
            try:
                analysis = analyze_with_biomedical_ner(symptom_data)
                logger.info("✅ Analysis completed using Biomedical NER")
                return analysis
            except Exception as e:
                logger.warning(f"Biomedical NER failed: {e}, trying OpenAI...")

        # Fall back to OpenAI if available
        if OPENAI_AVAILABLE:
            try:
                analysis = await analyze_with_openai(symptom_data)
                logger.info("✅ Analysis completed using OpenAI")
                return analysis
            except Exception as e:
                logger.warning(f"OpenAI failed: {e}")

        # Basic fallback analysis
        return get_basic_fallback_analysis(symptom_data)

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return AnalysisResponse(
            condition="Analysis Error",
            severity="Medium",
            advice="We encountered an issue analyzing your symptoms. Please try again or consult with a healthcare professional.",
            confidence=0,
            recommendations=[
                "Try again in a few moments",
                "Check your internet connection", 
                "Consult with a healthcare professional if symptoms persist"
            ],
            whenToSeekHelp="If this is a medical emergency, seek immediate medical attention.",
            disclaimer="Analysis temporarily unavailable. Always consult healthcare professionals."
        )

def analyze_with_biomedical_ner(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using biomedical NER"""
    try:
        # Extract medical entities
        entities = biomedical_ner(symptom_data.symptoms)
        
        # Process entities
        symptoms = []
        body_parts = []
        severity_indicators = []
        
        for entity in entities:
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

async def analyze_with_openai(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using OpenAI"""
    try:
        prompt = create_medical_prompt(symptom_data)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant. Provide helpful, conservative medical guidance."
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

def create_medical_prompt(symptom_data: SymptomRequest) -> str:
    """Create medical analysis prompt"""
    prompt = f"""
Analyze these symptoms and provide a JSON response:

Symptoms: {symptom_data.symptoms}
"""
    if symptom_data.age:
        prompt += f"Age: {symptom_data.age}\n"
    if symptom_data.gender:
        prompt += f"Gender: {symptom_data.gender}\n"
    
    prompt += """
Respond with JSON only:
{
    "condition": "Most likely condition or assessment",
    "severity": "Low|Medium|High|Critical", 
    "advice": "Primary medical advice",
    "confidence": 85,
    "recommendations": ["rec1", "rec2", "rec3"],
    "whenToSeekHelp": "When to seek immediate help"
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
        
        return AnalysisResponse(
            condition=data.get("condition", "Symptom analysis"),
            severity=data.get("severity", "Medium"),
            advice=data.get("advice", "Please consult with a healthcare professional."),
            confidence=min(max(data.get("confidence", 75), 0), 100),
            recommendations=data.get("recommendations", ["Consult healthcare provider"]),
            whenToSeekHelp=data.get("whenToSeekHelp", "Seek medical attention if symptoms worsen."),
            disclaimer="This AI analysis is for informational purposes only. Always consult healthcare professionals."
        )
        
    except Exception as e:
        logger.error(f"Failed to parse OpenAI response: {e}")
        return get_basic_fallback_analysis(None)

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
    logger.info("🚀 Starting Medical Symptom Checker API...")
    logger.info("Server will be available at: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
