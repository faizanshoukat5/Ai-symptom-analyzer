"""
Advanced Multi-Model Medical AI Backend
Integrates multiple state-of-the-art AI models for comprehensive medical analysis
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Ddef get_cached_model_info() -> Dict[str, bool]:
    """Get information about which models are cached"""
    models_to_check = {
        "d4data/biomedical-ner-all": "biomedical_ner",
        "emilyalsentzer/Bio_ClinicalBERT": "clinical_bert", 
        "microsoft/biogpt": "biogpt",
        "microsoft/BiomedNLP-PubMedBERT-base-uncached-abstract-fulltext": "pubmed_bert",
        "distilbert-base-uncased": "symptom_classifier",
        "facebook/bart-large-mnli": "zero_shot_classifier",
        "cardiffnlp/twitter-roberta-base-sentiment-latest": "sentiment_analyzer",
        "sentence-transformers/all-MiniLM-L6-v2": "text_embedder"
    }port asyncio
import threading
import time
import os
from dotenv import load_dotenv
import json
import logging
import numpy as np
from datetime import datetime
from pathlib import Path

# Import transformers pipeline at module level
try:
    from transformers import pipeline as transformers_pipeline
    TRANSFORMERS_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Transformers pipeline imported successfully")
except ImportError as e:
    TRANSFORMERS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ Failed to import transformers pipeline: {e}")

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Advanced Medical AI Platform",
    description="Multi-model AI-powered medical analysis platform",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
        "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", 
        "http://127.0.0.1:5175", "http://127.0.0.1:5176", "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model availability flags
MODEL_STATUS = {
    "biomedical_ner": False,
    "clinical_bert": False,
    "biogpt": False,
    "pubmed_bert": False,
    "medical_llama": False,
    "symptom_classifier": False,
    "disease_predictor": False,
    "openai": False,
    "huggingface_inference": False
}

# Model instances
MODELS = {
    "biomedical_ner": None,
    "clinical_bert": None,
    "biogpt": None,
    "pubmed_bert": None,
    "medical_llama": None,
    "symptom_classifier": None,
    "disease_predictor": None,
    "sentiment_analyzer": None,
    "text_embedder": None
}

def load_biomedical_ner():
    """Load biomedical NER model"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "d4data/biomedical-ner-all"
        if is_model_cached(model_name):
            logger.info("🔬 Loading cached Biomedical NER model...")
        else:
            logger.info("🔬 Loading Biomedical NER model (will download)...")
        
        MODELS["biomedical_ner"] = transformers_pipeline("token-classification", model=model_name)
        MODEL_STATUS["biomedical_ner"] = True
        logger.info("✅ Biomedical NER model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Biomedical NER model failed to load: {e}")
        MODEL_STATUS["biomedical_ner"] = False

def load_clinical_bert():
    """Load ClinicalBERT for medical text understanding"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "emilyalsentzer/Bio_ClinicalBERT"
        if is_model_cached(model_name):
            logger.info("🏥 Loading cached ClinicalBERT model...")
        else:
            logger.info("🏥 Loading ClinicalBERT model (will download)...")
        
        MODELS["clinical_bert"] = transformers_pipeline("fill-mask", model=model_name)
        MODEL_STATUS["clinical_bert"] = True
        logger.info("✅ ClinicalBERT model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ ClinicalBERT model failed to load: {e}")
        MODEL_STATUS["clinical_bert"] = False

def load_biogpt():
    """Load BioGPT for medical text generation"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "microsoft/biogpt"
        if is_model_cached(model_name):
            logger.info("🧬 Loading cached BioGPT model...")
        else:
            logger.info("🧬 Loading BioGPT model (will download)...")
        
        MODELS["biogpt"] = transformers_pipeline("text-generation", model=model_name)
        MODEL_STATUS["biogpt"] = True
        logger.info("✅ BioGPT model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ BioGPT model failed to load: {e}")
        MODEL_STATUS["biogpt"] = False

def load_pubmed_bert():
    """Load PubMedBERT for biomedical literature understanding"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
        if is_model_cached(model_name):
            logger.info("📚 Loading cached PubMedBERT model...")
        else:
            logger.info("📚 Loading PubMedBERT model (will download)...")
        
        # Fix for meta tensor issue - explicitly set device to CPU
        import torch
        MODELS["pubmed_bert"] = transformers_pipeline(
            "fill-mask", 
            model=model_name,
            device="cpu",
            torch_dtype=torch.float32
        )
        # Test the model to ensure it works
        test_result = MODELS["pubmed_bert"]("This is a [MASK] test.")
        MODEL_STATUS["pubmed_bert"] = True
        logger.info("✅ PubMedBERT model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ PubMedBERT model failed to load: {e}")
        MODEL_STATUS["pubmed_bert"] = False
        MODELS["pubmed_bert"] = None

def load_medical_llama():
    """Load Medical LLaMA for advanced medical reasoning"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        logger.info("🦙 Loading Medical LLaMA model...")
        # Using a medical-fine-tuned model
        MODELS["medical_llama"] = transformers_pipeline("text-generation", model="medalpaca/medalpaca-7b", device_map="auto")
        MODEL_STATUS["medical_llama"] = True
        logger.info("✅ Medical LLaMA model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Medical LLaMA model failed to load: {e}")

def load_symptom_classifier():
    """Load symptom classification model"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "distilbert-base-uncased"
        if is_model_cached(model_name):
            logger.info("🎯 Loading cached Symptom Classifier...")
        else:
            logger.info("🎯 Loading Symptom Classifier (will download)...")
        
        MODELS["symptom_classifier"] = transformers_pipeline("text-classification", model=model_name)
        MODEL_STATUS["symptom_classifier"] = True
        logger.info("✅ Symptom Classifier loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Symptom Classifier failed to load: {e}")
        MODEL_STATUS["symptom_classifier"] = False

def load_disease_predictor():
    """Load disease prediction model"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "facebook/bart-large-mnli"
        if is_model_cached(model_name):
            logger.info("🔍 Loading cached Disease Predictor...")
        else:
            logger.info("🔍 Loading Disease Predictor (will download)...")
        
        # Fix for meta tensor issue - explicitly set device to CPU
        import torch
        MODELS["disease_predictor"] = transformers_pipeline(
            "zero-shot-classification", 
            model=model_name,
            device="cpu",
            torch_dtype=torch.float32
        )
        # Test the model to ensure it works
        test_labels = ["infection", "injury"]
        test_result = MODELS["disease_predictor"]("test symptoms", test_labels)
        MODEL_STATUS["disease_predictor"] = True
        logger.info("✅ Disease Predictor loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Disease Predictor model failed to load: {e}")
        MODEL_STATUS["disease_predictor"] = False
        MODELS["disease_predictor"] = None

def load_sentiment_analyzer():
    """Load sentiment analysis for symptom urgency"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
        
        model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
        if is_model_cached(model_name):
            logger.info("😊 Loading cached Sentiment Analyzer...")
        else:
            logger.info("😊 Loading Sentiment Analyzer (will download)...")
        
        MODELS["sentiment_analyzer"] = transformers_pipeline("sentiment-analysis", model=model_name)
        MODEL_STATUS["sentiment_analyzer"] = True
        logger.info("✅ Sentiment Analyzer loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Sentiment Analyzer failed to load: {e}")
        MODEL_STATUS["sentiment_analyzer"] = False

def load_text_embedder():
    """Load text embedding model for semantic similarity"""
    global MODEL_STATUS, MODELS
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("🔤 Loading Text Embedder...")
        MODELS["text_embedder"] = SentenceTransformer('all-MiniLM-L6-v2')
        MODEL_STATUS["text_embedder"] = True
        logger.info("✅ Text Embedder loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Text Embedder failed to load: {e}")

def load_zero_shot_classifier():
    """Load BART-based zero-shot classification model for symptom categorization"""
    global MODEL_STATUS, MODELS
    try:
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("Transformers not available")
            
        model_name = "facebook/bart-large-mnli"
        if is_model_cached(model_name):
            logger.info("🎯 Loading cached Zero-Shot Classifier...")
        else:
            logger.info("🎯 Loading Zero-Shot Classifier (will download)...")
        
        MODELS["zero_shot_classifier"] = transformers_pipeline("zero-shot-classification", model=model_name)
        MODEL_STATUS["zero_shot_classifier"] = True
        logger.info("✅ Zero-Shot Classifier loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Zero-Shot Classifier failed to load: {e}")
        MODEL_STATUS["zero_shot_classifier"] = False

# Initialize OpenAI
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    MODEL_STATUS["openai"] = bool(os.getenv("OPENAI_API_KEY"))
    if MODEL_STATUS["openai"]:
        logger.info("✅ OpenAI API configured successfully")
except Exception as e:
    logger.warning(f"⚠️ OpenAI not available: {e}")

# Initialize HuggingFace Inference API
try:
    huggingface_token = os.getenv("HUGGINGFACE_TOKEN")
    if huggingface_token:
        MODEL_STATUS["huggingface_inference"] = True
        logger.info("✅ HuggingFace Inference API configured")
except Exception as e:
    logger.warning(f"⚠️ HuggingFace Inference API not available: {e}")

def is_model_cached(model_name: str) -> bool:
    """Check if a model is already cached locally"""
    try:
        cache_dir = Path.home() / ".cache" / "huggingface" / "hub"
        if not cache_dir.exists():
            return False
        
        # Look for model directories that match the model name
        model_dirs = [d for d in cache_dir.iterdir() if d.is_dir() and model_name.replace("/", "--") in d.name]
        return len(model_dirs) > 0
    except Exception as e:
        logger.warning(f"Could not check cache for {model_name}: {e}")
        return False

def get_cached_model_info() -> Dict[str, bool]:
    """Get information about which models are cached"""
    models_to_check = {
        "d4data/biomedical-ner-all": "biomedical_ner",
        "emilyalsentzer/Bio_ClinicalBERT": "clinical_bert", 
        "microsoft/biogpt": "biogpt",
        "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext": "pubmed_bert",
        "distilbert-base-uncased": "symptom_classifier",
        "facebook/bart-large-mnli": "disease_predictor",
        "cardiffnlp/twitter-roberta-base-sentiment-latest": "sentiment_analyzer",
        "sentence-transformers/all-MiniLM-L6-v2": "text_embedder"
    }
    
    cached_status = {}
    for model_path, model_key in models_to_check.items():
        cached_status[model_key] = is_model_cached(model_path)
        if cached_status[model_key]:
            logger.info(f"✅ {model_key} is already cached")
        else:
            logger.info(f"⚠️ {model_key} not in cache - will download if loaded")
    
    return cached_status

# Load all models in background threads
def load_all_models():
    """Load all AI models in parallel with cache awareness"""
    logger.info("🚀 Starting to load all AI models...")
    
    # Check cache status first
    logger.info("📋 Checking model cache status...")
    cached_info = get_cached_model_info()
    
    # Count cached vs uncached models
    cached_count = sum(1 for is_cached in cached_info.values() if is_cached)
    total_count = len(cached_info)
    logger.info(f"💾 {cached_count}/{total_count} models are already cached")
    
    model_loaders = [
        load_biomedical_ner,
        load_clinical_bert,
        load_biogpt,
        load_pubmed_bert,
        load_symptom_classifier,
        load_disease_predictor,
        load_sentiment_analyzer,
        load_text_embedder,
        load_zero_shot_classifier,
        # load_medical_llama,  # Commented out due to high memory requirements
    ]
    
    # Load cached models first, then uncached ones
    cached_loaders = []
    uncached_loaders = []
    
    loader_map = {
        load_biomedical_ner: "biomedical_ner",
        load_clinical_bert: "clinical_bert", 
        load_biogpt: "biogpt",
        load_pubmed_bert: "pubmed_bert",
        load_symptom_classifier: "symptom_classifier",
        load_disease_predictor: "disease_predictor",
        load_zero_shot_classifier: "zero_shot_classifier",
    }
    
    for loader in model_loaders:
        if loader in loader_map and cached_info.get(loader_map[loader], False):
            cached_loaders.append(loader)
        else:
            uncached_loaders.append(loader)
    
    # Load cached models first (faster)
    logger.info(f"⚡ Loading {len(cached_loaders)} cached models first...")
    threads = []
    for loader in cached_loaders:
        thread = threading.Thread(target=loader, daemon=True)
        thread.start()
        threads.append(thread)
        time.sleep(0.5)  # Shorter delay for cached models
    
    # Then load uncached models (will download)
    if uncached_loaders:
        logger.info(f"📥 Loading {len(uncached_loaders)} uncached models (will download)...")
        for loader in uncached_loaders:
            thread = threading.Thread(target=loader, daemon=True)
            thread.start()
            threads.append(thread)
            time.sleep(2)  # Longer delay for downloading models
    
    logger.info(f"🔄 Started loading {len(threads)} AI models in background...")
    return threads

# Start loading models
load_all_models()

# Pydantic models
class SymptomRequest(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=2000)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    current_medications: Optional[str] = None
    severity_self_assessment: Optional[int] = Field(None, ge=1, le=10)

class ModelAnalysis(BaseModel):
    model_name: str
    analysis: str
    confidence: float
    processing_time: float
    entities_found: Optional[List[str]] = None

class AdvancedAnalysisResponse(BaseModel):
    primary_analysis: str
    severity: str
    confidence: int
    advice: str
    recommendations: List[str]
    whenToSeekHelp: str
    disclaimer: str
    model_analyses: List[ModelAnalysis]
    entities_extracted: List[str]
    risk_factors: List[str]
    differential_diagnoses: List[str]
    urgency_score: int
    processing_summary: Dict[str, Any]
    ai_models_used: str  # New field for clear user messaging

@app.get("/")
async def root():
    """Root endpoint with system status"""
    return {
        "message": "Advanced Medical AI Platform", 
        "status": "operational",
        "version": "2.0.0",
        "models_loaded": sum(MODEL_STATUS.values()),
        "total_models": len(MODEL_STATUS)
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check with model status"""
    return {
        "status": "healthy",
        "service": "Advanced Medical AI Platform",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "models": MODEL_STATUS,
        "models_loaded": sum(MODEL_STATUS.values()),
        "total_models": len(MODEL_STATUS),
        "capabilities": [
            "Biomedical Named Entity Recognition",
            "Clinical Text Understanding",
            "Medical Text Generation",
            "Disease Classification",
            "Symptom Analysis",
            "Risk Assessment",
            "Urgency Scoring"
        ]
    }

@app.get("/models")
async def list_models():
    """List all available models and their status"""
    model_info = {}
    for model_name, status in MODEL_STATUS.items():
        model_info[model_name] = {
            "loaded": status,
            "description": get_model_description(model_name)
        }
    return model_info

@app.get("/models/status")
async def detailed_model_status():
    """Get detailed status of all models with their capabilities"""
    detailed_status = {}
    
    for model_name, is_loaded in MODEL_STATUS.items():
        detailed_status[model_name] = {
            "loaded": is_loaded,
            "description": get_model_description(model_name),
            "capabilities": get_model_capabilities(model_name),
            "status": "✅ Ready" if is_loaded else "🔄 Loading" if model_name in ["biogpt", "pubmed_bert", "disease_predictor"] else "❌ Unavailable"
        }
    
    # Add summary
    loaded_count = sum(MODEL_STATUS.values())
    total_count = len(MODEL_STATUS)
    
    return {
        "summary": {
            "models_loaded": loaded_count,
            "total_models": total_count,
            "loading_percentage": round((loaded_count / total_count) * 100, 1),
            "system_status": "Fully Operational" if loaded_count >= 4 else "Partially Operational" if loaded_count >= 2 else "Limited Operation"
        },
        "models": detailed_status,
        "analysis_capabilities": {
            "entity_extraction": MODEL_STATUS.get("biomedical_ner", False),
            "clinical_analysis": MODEL_STATUS.get("clinical_bert", False),
            "medical_text_generation": MODEL_STATUS.get("biogpt", False),
            "literature_insights": MODEL_STATUS.get("pubmed_bert", False),
            "symptom_classification": MODEL_STATUS.get("symptom_classifier", False),
            "disease_prediction": MODEL_STATUS.get("disease_predictor", False),
            "urgency_assessment": True,  # Always available
            "risk_evaluation": True,     # Always available
            "openai_analysis": MODEL_STATUS.get("openai", False)
        }
    }

def get_model_capabilities(model_name: str) -> List[str]:
    """Get specific capabilities for each model"""
    capabilities = {
        "biomedical_ner": ["Medical entity extraction", "Symptom identification", "Clinical term recognition"],
        "clinical_bert": ["Clinical text understanding", "Medical context analysis", "Diagnostic insights"],
        "biogpt": ["Medical text generation", "Clinical narrative creation", "Medical reasoning"],
        "pubmed_bert": ["Biomedical literature analysis", "Research-based insights", "Scientific context"],
        "symptom_classifier": ["Symptom categorization", "Medical text classification", "Pattern recognition"],
        "disease_predictor": ["Disease classification", "Condition prediction", "Differential diagnosis"],
        "sentiment_analyzer": ["Urgency assessment", "Emotional context", "Severity analysis"],
        "text_embedder": ["Semantic similarity", "Medical concept mapping", "Text understanding"],
        "openai": ["Advanced reasoning", "Comprehensive analysis", "Natural language generation"],
        "huggingface_inference": ["Cloud-based analysis", "Scalable inference", "Model diversity"]
    }
    return capabilities.get(model_name, ["Advanced AI analysis"])

def get_model_description(model_name: str) -> str:
    """Get description for each model"""
    descriptions = {
        "biomedical_ner": "Extracts medical entities from text",
        "clinical_bert": "Clinical text understanding and analysis",
        "biogpt": "Medical text generation and completion",
        "pubmed_bert": "Biomedical literature comprehension",
        "medical_llama": "Advanced medical reasoning and diagnosis",
        "symptom_classifier": "Classifies and categorizes symptoms",
        "disease_predictor": "Predicts potential diseases from symptoms",
        "openai": "GPT-based medical analysis",
        "huggingface_inference": "Cloud-based model inference"
    }
    return descriptions.get(model_name, "Advanced AI model")

def extract_entities_with_ner(text: str) -> List[str]:
    """Extract medical entities using biomedical NER"""
    if not MODEL_STATUS["biomedical_ner"] or not MODELS["biomedical_ner"]:
        return []
    
    try:
        start_time = time.time()
        results = MODELS["biomedical_ner"](text)
        processing_time = time.time() - start_time
        
        entities = []
        for result in results:
            if result['score'] > 0.7:  # High confidence threshold
                entities.append(result['word'])
        
        logger.info(f"🔬 NER extracted {len(entities)} entities in {processing_time:.2f}s")
        return list(set(entities))  # Remove duplicates
    except Exception as e:
        logger.error(f"NER analysis failed: {e}")
        return []

def analyze_with_clinical_bert(text: str) -> ModelAnalysis:
    """Analyze text using ClinicalBERT"""
    if not MODEL_STATUS["clinical_bert"] or not MODELS["clinical_bert"]:
        return None
    
    try:
        start_time = time.time()
        
        # Create a medical context for analysis
        masked_text = f"The patient presents with {text}. The most likely diagnosis is [MASK]."
        results = MODELS["clinical_bert"](masked_text)
        
        processing_time = time.time() - start_time
        
        if results:
            top_result = results[0]
            analysis = f"Clinical analysis suggests: {top_result['token_str']}"
            confidence = float(top_result['score'])
        else:
            analysis = "Clinical analysis completed"
            confidence = 0.5
        
        return ModelAnalysis(
            model_name="ClinicalBERT",
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"ClinicalBERT analysis failed: {e}")
        return None

def analyze_with_biogpt(text: str) -> ModelAnalysis:
    """Generate medical insights using BioGPT"""
    if not MODEL_STATUS["biogpt"] or not MODELS["biogpt"]:
        return None
    
    try:
        start_time = time.time()
        
        # Create a medical prompt for BioGPT
        prompt = f"Medical symptoms: {text}. Clinical assessment:"
        
        results = MODELS["biogpt"](prompt, max_length=150, num_return_sequences=1, temperature=0.7)
        processing_time = time.time() - start_time
        
        if results and len(results) > 0:
            generated_text = results[0]['generated_text']
            # Extract the assessment part
            analysis = generated_text.replace(prompt, "").strip()
            confidence = 0.75  # BioGPT is quite reliable for medical text
        else:
            analysis = "BioGPT medical text analysis completed"
            confidence = 0.5
        
        return ModelAnalysis(
            model_name="BioGPT",
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"BioGPT analysis failed: {e}")
        return None

def analyze_with_pubmed_bert(text: str) -> ModelAnalysis:
    """Analyze using PubMedBERT for biomedical literature insights"""
    if not MODEL_STATUS["pubmed_bert"] or not MODELS["pubmed_bert"]:
        return None
    
    try:
        start_time = time.time()
        
        # Create a medical literature context
        masked_text = f"Based on medical literature, patients with {text} often have [MASK] conditions."
        results = MODELS["pubmed_bert"](masked_text)
        
        processing_time = time.time() - start_time
        
        if results:
            top_result = results[0]
            analysis = f"Biomedical literature suggests: {top_result['token_str']}"
            confidence = float(top_result['score'])
        else:
            analysis = "PubMedBERT literature analysis completed"
            confidence = 0.5
        
        return ModelAnalysis(
            model_name="PubMedBERT",
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"PubMedBERT analysis failed: {e}")
        return None

def analyze_with_disease_predictor(text: str) -> ModelAnalysis:
    """Predict potential diseases using zero-shot classification"""
    if not MODEL_STATUS["disease_predictor"] or not MODELS["disease_predictor"]:
        return None
    
    try:
        start_time = time.time()
        
        # Common disease categories for classification
        candidate_diseases = [
            "respiratory infection", "gastrointestinal disorder", "cardiovascular issue",
            "neurological condition", "musculoskeletal problem", "dermatological condition",
            "mental health concern", "metabolic disorder", "autoimmune condition",
            "infectious disease", "allergic reaction", "stress-related symptoms"
        ]
        
        result = MODELS["disease_predictor"](text, candidate_diseases)
        processing_time = time.time() - start_time
        
        if result and 'labels' in result:
            top_prediction = result['labels'][0]
            confidence = float(result['scores'][0])
            analysis = f"Most likely category: {top_prediction}"
        else:
            analysis = "Disease prediction analysis completed"
            confidence = 0.5
        
        return ModelAnalysis(
            model_name="Disease Predictor",
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Disease prediction failed: {e}")
        return None

def analyze_urgency(text: str) -> int:
    """Analyze urgency of symptoms using sentiment and keywords"""
    try:
        urgency_score = 1  # Default low urgency
        
        # High urgency keywords
        urgent_keywords = [
            "severe", "intense", "unbearable", "emergency", "chest pain", "difficulty breathing",
            "shortness of breath", "unconscious", "bleeding", "seizure", "stroke", "heart attack",
            "suicidal", "overdose", "allergic reaction", "anaphylaxis"
        ]
        
        # Medium urgency keywords
        moderate_keywords = [
            "moderate", "concerning", "worsening", "persistent", "fever", "vomiting", "dizziness",
            "headache", "abdominal pain", "rash", "swelling"
        ]
        
        text_lower = text.lower()
        
        # Check for urgent keywords
        for keyword in urgent_keywords:
            if keyword in text_lower:
                urgency_score = max(urgency_score, 8)
        
        # Check for moderate keywords
        for keyword in moderate_keywords:
            if keyword in text_lower:
                urgency_score = max(urgency_score, 5)
        
        # Use sentiment analysis if available
        if MODEL_STATUS.get("sentiment_analyzer") and MODELS.get("sentiment_analyzer"):
            try:
                sentiment_result = MODELS["sentiment_analyzer"](text)
                if sentiment_result and len(sentiment_result) > 0:
                    sentiment = sentiment_result[0]
                    if sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.8:
                        urgency_score = max(urgency_score, 6)
            except Exception as e:
                logger.warning(f"Sentiment analysis failed: {e}")
        
        return min(urgency_score, 10)  # Cap at 10
    except Exception as e:
        logger.error(f"Urgency analysis failed: {e}")
        return 5  # Default moderate urgency

async def analyze_with_openai(symptom_data: SymptomRequest) -> ModelAnalysis:
    """Analyze symptoms using OpenAI GPT"""
    if not MODEL_STATUS["openai"]:
        return None
    
    try:
        start_time = time.time()
        
        prompt = f"""As a medical AI assistant, analyze these symptoms and provide a professional assessment:

Symptoms: {symptom_data.symptoms}
Age: {symptom_data.age or 'Not specified'}
Gender: {symptom_data.gender or 'Not specified'}
Medical History: {symptom_data.medical_history or 'None provided'}
Current Medications: {symptom_data.current_medications or 'None provided'}
Self-assessed severity (1-10): {symptom_data.severity_self_assessment or 'Not provided'}

Provide a brief, professional medical analysis focusing on:
1. Most likely conditions
2. Recommended actions
3. When to seek immediate care

Keep the response concise and professional."""

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant providing preliminary symptom analysis. Always recommend consulting healthcare professionals."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.3
        )
        
        processing_time = time.time() - start_time
        
        analysis = response.choices[0].message.content
        confidence = 0.85  # High confidence for GPT analysis
        
        return ModelAnalysis(
            model_name="OpenAI GPT-3.5",
            analysis=analysis,
            confidence=confidence,
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"OpenAI analysis failed: {e}")
        return None

@app.post("/analyze-symptoms", response_model=AdvancedAnalysisResponse)
async def analyze_symptoms_advanced(symptom_data: SymptomRequest):
    """
    Advanced multi-model symptom analysis
    """
    try:
        start_time = time.time()
        logger.info(f"🔍 Starting advanced analysis for: {symptom_data.symptoms[:50]}...")
        
        # Initialize response data
        model_analyses = []
        entities_extracted = []
        risk_factors = []
        differential_diagnoses = []
        
        # Extract entities with NER
        entities_extracted = extract_entities_with_ner(symptom_data.symptoms)
        
        # Run multiple model analyses in parallel
        analysis_tasks = []
        
        # ClinicalBERT analysis
        clinical_analysis = analyze_with_clinical_bert(symptom_data.symptoms)
        if clinical_analysis:
            model_analyses.append(clinical_analysis)
        
        # BioGPT analysis
        biogpt_analysis = analyze_with_biogpt(symptom_data.symptoms)
        if biogpt_analysis:
            model_analyses.append(biogpt_analysis)
        
        # PubMedBERT analysis
        pubmed_analysis = analyze_with_pubmed_bert(symptom_data.symptoms)
        if pubmed_analysis:
            model_analyses.append(pubmed_analysis)
        
        # Disease prediction analysis
        disease_analysis = analyze_with_disease_predictor(symptom_data.symptoms)
        if disease_analysis:
            model_analyses.append(disease_analysis)
        
        # OpenAI analysis
        openai_analysis = await analyze_with_openai(symptom_data)
        if openai_analysis:
            model_analyses.append(openai_analysis)
        
        # Calculate urgency score
        urgency_score = analyze_urgency(symptom_data.symptoms)
        
        # Determine severity based on urgency and model outputs
        if urgency_score >= 8:
            severity = "Critical"
        elif urgency_score >= 6:
            severity = "High"
        elif urgency_score >= 4:
            severity = "Medium"
        else:
            severity = "Low"
        
        # Generate primary analysis from all models
        if model_analyses:
            # Combine insights from all models
            primary_analysis = "Multi-model analysis completed"
            avg_confidence = int(np.mean([analysis.confidence for analysis in model_analyses]) * 100)
            
            # Use the most detailed analysis as primary
            detailed_analysis = max(model_analyses, key=lambda x: len(x.analysis))
            primary_analysis = detailed_analysis.analysis
        else:
            # Even without full model analyses, we can provide meaningful analysis
            if entities_extracted:
                primary_analysis = f"Based on symptom analysis, we identified {len(entities_extracted)} medical entities including: {', '.join(entities_extracted[:3])}. Further evaluation by a healthcare professional is recommended."
                avg_confidence = 70
            else:
                primary_analysis = "Symptom analysis completed. While our advanced AI models are optimizing, we recommend monitoring your symptoms and consulting a healthcare professional for a comprehensive evaluation."
                avg_confidence = 60
        
        # Generate recommendations based on analysis
        recommendations = [
            "Monitor your symptoms closely",
            "Keep a detailed symptom diary",
            "Stay hydrated and get adequate rest",
            "Avoid known triggers if identified"
        ]
        
        if urgency_score >= 7:
            recommendations.insert(0, "Consider seeking immediate medical attention")
        elif urgency_score >= 5:
            recommendations.insert(0, "Schedule an appointment with your healthcare provider")
        
        # Add entity-specific recommendations
        if entities_extracted:
            recommendations.append(f"Pay attention to these identified symptoms: {', '.join(entities_extracted[:3])}")
        
        # When to seek help based on urgency
        if urgency_score >= 8:
            when_to_seek_help = "Seek immediate emergency medical care. Do not delay."
        elif urgency_score >= 6:
            when_to_seek_help = "Contact your healthcare provider today or visit urgent care."
        elif urgency_score >= 4:
            when_to_seek_help = "Schedule an appointment with your healthcare provider within the next few days."
        else:
            when_to_seek_help = "Monitor symptoms and consult healthcare provider if they persist or worsen."
        
        # Processing summary
        total_time = time.time() - start_time
        processing_summary = {
            "total_processing_time": round(total_time, 2),
            "models_used": len(model_analyses),
            "entities_found": len(entities_extracted),
            "urgency_score": urgency_score,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        # Generate advice
        advice = f"Based on multi-model AI analysis of your symptoms, {primary_analysis.lower() if primary_analysis else 'monitoring is recommended'}. Urgency level: {urgency_score}/10."
        
        # Generate clear AI models used message
        if len(model_analyses) > 0:
            model_names = [analysis.model_name for analysis in model_analyses]
            if len(model_names) == 1:
                ai_models_used = f"✅ AI Analysis: {model_names[0]} + Medical Entity Recognition"
            elif len(model_names) == 2:
                ai_models_used = f"✅ AI Analysis: {model_names[0]} & {model_names[1]} + Medical Entity Recognition"
            else:
                ai_models_used = f"✅ AI Analysis: {len(model_names)} advanced models ({', '.join(model_names)}) + Medical Entity Recognition"
        else:
            if entities_extracted:
                ai_models_used = "✅ AI Analysis: Medical Entity Recognition + Symptom Assessment"
            else:
                ai_models_used = "⚠️ Limited AI Analysis: Basic symptom assessment (advanced models temporarily unavailable)"
        
        logger.info(f"✅ Advanced analysis completed in {total_time:.2f}s using {len(model_analyses)} models")
        
        return AdvancedAnalysisResponse(
            primary_analysis=primary_analysis,
            severity=severity,
            confidence=avg_confidence,
            advice=advice,
            recommendations=recommendations,
            whenToSeekHelp=when_to_seek_help,
            disclaimer="This multi-model AI analysis is for informational purposes only. Always consult qualified healthcare professionals for medical diagnosis and treatment.",
            model_analyses=model_analyses,
            entities_extracted=entities_extracted,
            risk_factors=risk_factors,
            differential_diagnoses=differential_diagnoses,
            urgency_score=urgency_score,
            processing_summary=processing_summary,
            ai_models_used=ai_models_used
        )
        
    except Exception as e:
        logger.error(f"Advanced analysis error: {str(e)}")
        return AdvancedAnalysisResponse(
            primary_analysis="Analysis Error",
            severity="Medium",
            confidence=0,
            advice="We encountered an issue with the advanced analysis. Please try again or consult with a healthcare professional.",
            recommendations=[
                "Try again in a few moments",
                "Check your internet connection",
                "Consult with a healthcare professional if symptoms persist"
            ],
            whenToSeekHelp="If this is a medical emergency, seek immediate medical attention.",
            disclaimer="Advanced analysis temporarily unavailable. Always consult healthcare professionals.",
            model_analyses=[],
            entities_extracted=[],
            risk_factors=[],
            differential_diagnoses=[],
            urgency_score=5,
            processing_summary={"error": str(e)},
            ai_models_used="❌ AI Analysis Unavailable: System error occurred"
        )

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Advanced Medical AI Platform...")
    logger.info("Server will be available at: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
