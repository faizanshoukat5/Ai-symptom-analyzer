"""
PythonAnywhere-optimized version of the Medical Symptom Checker API
This version uses only OpenAI/ChatAnywhere for analysis to avoid heavy ML dependencies
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
import httpx

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Symptom Checker API",
    description="AI-powered symptom analysis using OpenAI GPT via ChatAnywhere",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client with ChatAnywhere endpoint
try:
    from openai import OpenAI
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.chatanywhere.com.cn")
    )
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    logger.info("OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None

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
        "platform": "PythonAnywhere",
        "ai_models": {
            "openai": "Primary - " + ("Configured" if os.getenv("OPENAI_API_KEY") else "Not Configured")
        },
        "primary_model": "OpenAI GPT-3.5-turbo via ChatAnywhere"
    }

@app.post("/analyze-symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptom_data: SymptomRequest):
    """
    Analyze patient symptoms using OpenAI GPT via ChatAnywhere
    """
    try:
        logger.info(f"Analyzing symptoms: {symptom_data.symptoms[:50]}...")

        if not client:
            raise HTTPException(status_code=503, detail="AI service not available")

        # Construct the prompt for GPT
        prompt = create_medical_prompt(symptom_data)
        
        # Call OpenAI API
        response = await call_openai_api(prompt)
        
        # Parse and validate the response
        analysis = parse_gpt_response(response)
        
        logger.info("Analysis completed using OpenAI/ChatAnywhere")
        return analysis

    except Exception as e:
        logger.error(f"Error analyzing symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def create_medical_prompt(symptom_data: SymptomRequest) -> str:
    """Create a structured prompt for medical symptom analysis"""
    
    prompt = f"""
As a medical AI assistant, analyze these symptoms and provide a structured response in JSON format:

Symptoms: {symptom_data.symptoms}
Age: {symptom_data.age or 'Not provided'}
Gender: {symptom_data.gender or 'Not provided'}

Please provide your analysis in the following JSON structure:
{{
  "condition": "Most likely condition or symptom description",
  "severity": "Low/Medium/High/Critical",
  "advice": "Practical advice for managing symptoms",
  "confidence": 85,
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "whenToSeekHelp": "Specific guidance on when to seek medical attention"
}}

Guidelines:
- Be conservative and emphasize professional medical consultation
- Provide practical, actionable advice
- Consider the patient's age and gender in your assessment
- Use appropriate medical terminology but keep it understandable
- Always recommend professional medical evaluation for serious symptoms
"""
    
    return prompt

async def call_openai_api(prompt: str) -> str:
    """Call OpenAI API with the medical prompt"""
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
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
            temperature=0.3,
            top_p=0.9
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")

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
        confidence = min(max(data.get("confidence", 75), 0), 100)
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
            advice="Please consult with a healthcare professional for proper evaluation of your symptoms.",
            confidence=0,
            recommendations=["Consult with a healthcare professional", "Monitor symptoms closely"],
            whenToSeekHelp="Seek medical attention if symptoms worsen or persist.",
            disclaimer="AI analysis is temporarily unavailable. Always consult healthcare professionals for medical advice."
        )

# This is for PythonAnywhere WSGI deployment
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
