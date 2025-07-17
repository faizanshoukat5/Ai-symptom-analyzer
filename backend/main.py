from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import openai
import os

import json
import logging
from dotenv import load_dotenv
load_dotenv(dotenv_path="backend/.env")
print('DEBUG: OPENAI_API_KEY loaded:', os.getenv('OPENAI_API_KEY'))

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
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Hugging Face model pipeline
HF_MODEL_AVAILABLE = False  # Do not load or download any local models
pipe = None

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
            "huggingface": "Available" if HF_MODEL_AVAILABLE else "Not Available",
            "openai": "Configured" if os.getenv("OPENAI_API_KEY") else "Not Configured"
        }
    }

@app.post("/debug-hf-analysis")
async def debug_hf_analysis(symptom_data: SymptomRequest):
    """Debug endpoint to see raw Hugging Face model output"""
    try:
        if not HF_MODEL_AVAILABLE:
            return {"error": "HF model not available"}
        
        # Get raw model output
        results = pipe(symptom_data.symptoms)
        
        return {
            "input": symptom_data.symptoms,
            "raw_results": results,
            "model_available": HF_MODEL_AVAILABLE
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze-symptoms", response_model=AnalysisResponse)
async def analyze_symptoms(symptom_data: SymptomRequest):
    """
    Analyze patient symptoms using AI models (Hugging Face or OpenAI)
    
    This endpoint receives symptom descriptions and returns AI-powered analysis
    including possible conditions, severity assessment, and medical recommendations.
    """
    try:
        logger.info(f"Analyzing symptoms: {symptom_data.symptoms[:50]}...")

        # Try Hugging Face model first (no API costs)
        if HF_MODEL_AVAILABLE:
            try:
                analysis = analyze_symptoms_with_huggingface(symptom_data)
                logger.info("Analysis completed using Hugging Face model")
                return analysis
            except Exception as hf_error:
                logger.warning(f"Hugging Face analysis failed: {hf_error}, falling back to OpenAI")

        # Fall back to OpenAI if Hugging Face fails or isn't available
        if os.getenv("OPENAI_API_KEY"):
            try:
                # Construct the prompt for GPT
                prompt = create_medical_prompt(symptom_data)
                
                # Call OpenAI API
                response = await call_openai_api(prompt)
                
                # Parse and validate the response
                analysis = parse_gpt_response(response)
                
                logger.info("Analysis completed using OpenAI")
                return analysis
            except Exception as openai_error:
                logger.warning(f"OpenAI analysis failed: {openai_error}")
        
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
            model="gpt-4o-mini",  # Using cost-effective model
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

def analyze_symptoms_with_huggingface(symptom_data: SymptomRequest) -> AnalysisResponse:
    """Analyze symptoms using Hugging Face model"""
    try:
        if not HF_MODEL_AVAILABLE:
            raise Exception("Hugging Face model not available")
        
        logger.info("Using Hugging Face model for analysis")
        
        # Use the pipeline for sentiment analysis as a proxy for symptom severity
        results = pipe(symptom_data.symptoms)
        
        # The model should return sentiment analysis results
        if results:
            # Get the top prediction
            top_result = results[0] if isinstance(results, list) else results
            
            # Map the sentiment to medical assessment
            label = top_result.get('label', 'NEUTRAL')
            score = top_result.get('score', 0.5)
            
            condition = map_classification_to_condition(label, score)
            confidence = int(score * 100)
            severity = determine_severity_from_classification(label, score)
            
            return AnalysisResponse(
                condition=condition,
                severity=severity,
                advice=generate_advice_for_condition(condition, severity),
                confidence=confidence,
                recommendations=generate_recommendations(condition),
                whenToSeekHelp=generate_when_to_seek_help(severity),
                disclaimer="This analysis uses sentiment analysis as a proxy for symptom assessment. For accurate medical evaluation, consult a healthcare professional."
            )
        else:
            raise Exception("No classification results returned")
            
    except Exception as e:
        logger.error(f"Hugging Face analysis error: {str(e)}")
        # Return fallback response
        return AnalysisResponse(
            condition="Local AI Analysis - Limited Information",
            severity="Medium",
            advice="Our local AI model has provided a basic analysis. For comprehensive evaluation, please consult with a healthcare professional.",
            confidence=50,
            recommendations=[
                "Monitor your symptoms closely",
                "Keep a symptom diary",
                "Consult with a healthcare professional for detailed evaluation",
                "Seek medical attention if symptoms worsen"
            ],
            whenToSeekHelp="Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if your condition rapidly worsens.",
            disclaimer="This analysis uses a local AI model and may have limited accuracy. Always consult healthcare professionals for medical advice."
        )

def map_classification_to_condition(label: str, score: float) -> str:
    """Map sentiment classification to medical condition assessment"""
    # Since we're using sentiment analysis as a proxy for symptom severity
    if label.upper() == 'NEGATIVE':
        if score > 0.8:
            return "Symptoms indicate significant distress - medical evaluation recommended"
        else:
            return "Symptoms suggest mild to moderate concern"
    elif label.upper() == 'POSITIVE':
        return "Symptoms appear manageable but monitoring recommended"
    else:  # NEUTRAL
        return "Symptoms require further evaluation for proper assessment"

def determine_severity_from_classification(label: str, score: float) -> str:
    """Determine severity based on sentiment classification"""
    if label.upper() == 'NEGATIVE':
        if score > 0.8:
            return 'High'
        elif score > 0.6:
            return 'Medium'
        else:
            return 'Low'
    elif label.upper() == 'POSITIVE':
        return 'Low'
    else:  # NEUTRAL
        return 'Medium'

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)