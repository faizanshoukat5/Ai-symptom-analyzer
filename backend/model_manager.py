"""
Advanced Model Manager for Medical AI Platform
Handles loading, caching, and management of multiple AI models
"""

import os
import json
import time
import threading
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import psutil

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for an AI model"""
    name: str
    model_id: str
    model_type: str  # 'pipeline', 'sentence_transformer', 'custom'
    task: str
    description: str
    memory_requirement_mb: int
    priority: int  # 1 (highest) to 10 (lowest)
    enabled: bool = True
    load_on_startup: bool = True

class ModelManager:
    """Advanced model management system"""
    
    def __init__(self):
        self.models = {}
        self.model_status = {}
        self.loading_progress = {}
        self.model_configs = self._init_model_configs()
        self.max_memory_usage_mb = 8000  # 8GB limit
        self.current_memory_usage_mb = 0
        
    def _init_model_configs(self) -> Dict[str, ModelConfig]:
        """Initialize model configurations"""
        configs = {
            "biomedical_ner": ModelConfig(
                name="biomedical_ner",
                model_id="d4data/biomedical-ner-all",
                model_type="pipeline",
                task="token-classification",
                description="Extracts medical entities (diseases, symptoms, medications) from text",
                memory_requirement_mb=500,
                priority=1
            ),
            "clinical_bert": ModelConfig(
                name="clinical_bert",
                model_id="emilyalsentzer/Bio_ClinicalBERT",
                model_type="pipeline",
                task="fill-mask",
                description="Clinical text understanding and medical context analysis",
                memory_requirement_mb=400,
                priority=2
            ),
            "pubmed_bert": ModelConfig(
                name="pubmed_bert",
                model_id="microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext",
                model_type="pipeline",
                task="fill-mask",
                description="Biomedical literature comprehension and medical knowledge",
                memory_requirement_mb=400,
                priority=3
            ),
            "disease_classifier": ModelConfig(
                name="disease_classifier",
                model_id="facebook/bart-large-mnli",
                model_type="pipeline",
                task="zero-shot-classification",
                description="Classifies symptoms into disease categories",
                memory_requirement_mb=600,
                priority=4
            ),
            "medical_text_generator": ModelConfig(
                name="medical_text_generator",
                model_id="microsoft/DialoGPT-medium",
                model_type="pipeline",
                task="text-generation",
                description="Generates medical explanations and advice",
                memory_requirement_mb=800,
                priority=5
            ),
            "symptom_severity": ModelConfig(
                name="symptom_severity",
                model_id="cardiffnlp/twitter-roberta-base-sentiment-latest",
                model_type="pipeline",
                task="sentiment-analysis",
                description="Analyzes symptom severity and urgency from text",
                memory_requirement_mb=300,
                priority=6
            ),
            "medical_qa": ModelConfig(
                name="medical_qa",
                model_id="deepset/roberta-base-squad2",
                model_type="pipeline",
                task="question-answering",
                description="Answers medical questions based on context",
                memory_requirement_mb=400,
                priority=7
            ),
            "drug_interaction": ModelConfig(
                name="drug_interaction",
                model_id="allenai/scibert_scivocab_uncased",
                model_type="pipeline",
                task="fill-mask",
                description="Analyzes potential drug interactions and side effects",
                memory_requirement_mb=350,
                priority=8
            ),
            "embedder": ModelConfig(
                name="embedder",
                model_id="all-MiniLM-L6-v2",
                model_type="sentence_transformer",
                task="embedding",
                description="Creates semantic embeddings for medical text similarity",
                memory_requirement_mb=200,
                priority=9
            ),
            "medical_summarizer": ModelConfig(
                name="medical_summarizer",
                model_id="facebook/bart-large-cnn",
                model_type="pipeline",
                task="summarization",
                description="Summarizes medical information and reports",
                memory_requirement_mb=600,
                priority=10
            )
        }
        return configs
    
    def get_available_memory_mb(self) -> int:
        """Get available system memory in MB"""
        try:
            memory = psutil.virtual_memory()
            available_mb = memory.available // (1024 * 1024)
            return available_mb
        except Exception:
            return 4000  # Default fallback
    
    def can_load_model(self, model_name: str) -> bool:
        """Check if model can be loaded based on memory constraints"""
        if model_name not in self.model_configs:
            return False
        
        config = self.model_configs[model_name]
        available_memory = self.get_available_memory_mb()
        
        # Check if we have enough memory
        memory_needed = config.memory_requirement_mb
        total_memory_after_load = self.current_memory_usage_mb + memory_needed
        
        return (available_memory > memory_needed and 
                total_memory_after_load < self.max_memory_usage_mb)
    
    def load_model(self, model_name: str) -> bool:
        """Load a specific model"""
        if model_name not in self.model_configs:
            logger.error(f"Unknown model: {model_name}")
            return False
        
        if model_name in self.models and self.model_status.get(model_name, False):
            logger.info(f"Model {model_name} already loaded")
            return True
        
        if not self.can_load_model(model_name):
            logger.warning(f"Cannot load {model_name} - insufficient memory")
            return False
        
        config = self.model_configs[model_name]
        
        try:
            logger.info(f"🔄 Loading {config.description}...")
            self.loading_progress[model_name] = 0
            
            start_time = time.time()
            
            if config.model_type == "pipeline":
                from transformers import pipeline
                self.loading_progress[model_name] = 50
                model = pipeline(config.task, model=config.model_id)
                
            elif config.model_type == "sentence_transformer":
                from sentence_transformers import SentenceTransformer
                self.loading_progress[model_name] = 50
                model = SentenceTransformer(config.model_id)
                
            else:
                logger.error(f"Unknown model type: {config.model_type}")
                return False
            
            self.models[model_name] = model
            self.model_status[model_name] = True
            self.current_memory_usage_mb += config.memory_requirement_mb
            self.loading_progress[model_name] = 100
            
            load_time = time.time() - start_time
            logger.info(f"✅ {config.name} loaded successfully in {load_time:.2f}s")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load {model_name}: {e}")
            self.model_status[model_name] = False
            self.loading_progress[model_name] = -1
            return False
    
    def unload_model(self, model_name: str) -> bool:
        """Unload a model to free memory"""
        if model_name not in self.models:
            return True
        
        try:
            del self.models[model_name]
            self.model_status[model_name] = False
            
            if model_name in self.model_configs:
                self.current_memory_usage_mb -= self.model_configs[model_name].memory_requirement_mb
                self.current_memory_usage_mb = max(0, self.current_memory_usage_mb)
            
            logger.info(f"🗑️ Unloaded {model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to unload {model_name}: {e}")
            return False
    
    def load_models_by_priority(self, max_models: Optional[int] = None) -> List[str]:
        """Load models in priority order"""
        # Sort models by priority
        sorted_models = sorted(
            self.model_configs.items(),
            key=lambda x: x[1].priority
        )
        
        loaded_models = []
        
        for model_name, config in sorted_models:
            if not config.enabled or not config.load_on_startup:
                continue
                
            if max_models and len(loaded_models) >= max_models:
                break
            
            if self.load_model(model_name):
                loaded_models.append(model_name)
            else:
                logger.warning(f"Skipping {model_name} due to memory constraints")
        
        return loaded_models
    
    def load_models_async(self, model_names: List[str] = None) -> None:
        """Load models asynchronously"""
        if model_names is None:
            model_names = list(self.model_configs.keys())
        
        def load_worker():
            for model_name in model_names:
                if self.model_configs[model_name].enabled:
                    self.load_model(model_name)
                    time.sleep(1)  # Prevent overwhelming the system
        
        thread = threading.Thread(target=load_worker, daemon=True)
        thread.start()
    
    def get_model(self, model_name: str):
        """Get a loaded model"""
        return self.models.get(model_name)
    
    def is_model_loaded(self, model_name: str) -> bool:
        """Check if a model is loaded"""
        return self.model_status.get(model_name, False)
    
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive status of all models"""
        return {
            "models": {
                name: {
                    "loaded": self.model_status.get(name, False),
                    "config": {
                        "description": config.description,
                        "priority": config.priority,
                        "memory_requirement_mb": config.memory_requirement_mb,
                        "enabled": config.enabled
                    },
                    "loading_progress": self.loading_progress.get(name, 0)
                }
                for name, config in self.model_configs.items()
            },
            "system": {
                "current_memory_usage_mb": self.current_memory_usage_mb,
                "max_memory_usage_mb": self.max_memory_usage_mb,
                "available_memory_mb": self.get_available_memory_mb(),
                "models_loaded": sum(self.model_status.values()),
                "total_models": len(self.model_configs)
            }
        }
    
    def optimize_memory(self) -> List[str]:
        """Optimize memory usage by unloading low-priority models if needed"""
        unloaded = []
        
        if self.current_memory_usage_mb > self.max_memory_usage_mb * 0.8:  # 80% threshold
            # Sort by priority (highest priority first)
            sorted_models = sorted(
                [(name, config) for name, config in self.model_configs.items() 
                 if self.is_model_loaded(name)],
                key=lambda x: x[1].priority,
                reverse=True  # Unload lowest priority first
            )
            
            for model_name, config in sorted_models:
                if self.current_memory_usage_mb <= self.max_memory_usage_mb * 0.6:  # 60% target
                    break
                
                if config.priority > 5:  # Only unload low-priority models
                    self.unload_model(model_name)
                    unloaded.append(model_name)
        
        return unloaded

# Global model manager instance
model_manager = ModelManager()
