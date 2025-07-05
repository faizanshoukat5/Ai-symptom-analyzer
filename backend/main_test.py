"""
Test version of Medical Symptom Checker API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import openai
import os
from dotenv import load_dotenv
import json
import logging
import uvicorn

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model status
BIOMEDICAL_NER_AVAILABLE = False
biomedical_ner = None

def load_biomedical_model():
    """Load biomedical NER model"""
    global BIOMEDICAL_NER_AVAILABLE, biomedical_ner
    logger.info("Loading biomedical NER model...")
    try:
        from transformers import pipeline
        biomedical_ner = pipeline(
            "token-classification", 
            model="d4data/biomedical-ner-all",
            device=-1  # Use CPU
        )
        BIOMEDICAL_NER_AVAILABLE = True
        logger.info("✅ Biomedical NER model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"⚠️ Biomedical NER model failed to load: {e}")
        BIOMEDICAL_NER_AVAILABLE = False
        return False

# Pydantic models
class SymptomRequest(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=1000)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None

class AnalysisResponse(BaseModel):
    condition: str
    confidence: float
    severity: str
    recommendations: List[str]
    medical_entities: List[Dict[str, Any]]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "biomedical_ner_available": BIOMEDICAL_NER_AVAILABLE,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_symptoms(request: SymptomRequest):
    """Analyze symptoms and provide medical insights"""
    try:
        symptoms_text = request.symptoms.lower()
        
        # Extract medical entities if biomedical NER is available
        medical_entities = []
        if BIOMEDICAL_NER_AVAILABLE and biomedical_ner:
            try:
                ner_results = biomedical_ner(symptoms_text)
                for entity in ner_results:
                    if entity['score'] > 0.5:  # Only include high-confidence entities
                        medical_entities.append({
                            "entity": entity['word'],
                            "label": entity['entity'],
                            "confidence": float(entity['score'])  # Convert numpy float to Python float
                        })
            except Exception as e:
                logger.error(f"NER extraction failed: {e}")
                medical_entities = []
        
        # Simple symptom analysis
        condition = "General health concern"
        confidence = 0.7
        severity = "moderate"
        recommendations = [
            "Monitor your symptoms closely",
            "Stay hydrated and get adequate rest",
            "Consider consulting with a healthcare provider if symptoms persist"
        ]
        
        # Basic symptom mapping
        if "fever" in symptoms_text or "temperature" in symptoms_text:
            condition = "Possible viral or bacterial infection"
            confidence = 0.8
            recommendations = [
                "Monitor your temperature regularly",
                "Stay hydrated and rest",
                "Consider seeing a doctor if fever persists or worsens"
            ]
        elif "headache" in symptoms_text:
            condition = "Headache disorder"
            confidence = 0.75
            recommendations = [
                "Try to rest in a quiet, dark room",
                "Apply cold or warm compress to head",
                "Consider over-the-counter pain relief if appropriate"
            ]
        elif "chest pain" in symptoms_text:
            condition = "Chest discomfort"
            confidence = 0.85
            severity = "urgent"
            recommendations = [
                "Seek immediate medical attention",
                "Do not ignore chest pain",
                "Call emergency services if pain is severe"
            ]
        
        return AnalysisResponse(
            condition=condition,
            confidence=confidence,
            severity=severity,
            recommendations=recommendations,
            medical_entities=medical_entities
        )
    
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting up Medical Symptom Checker API...")
    load_biomedical_model()
    logger.info("Startup complete")

if __name__ == "__main__":
    uvicorn.run("main_test:app", host="0.0.0.0", port=8000, reload=False)
