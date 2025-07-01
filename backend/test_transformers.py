#!/usr/bin/env python3
"""Test transformers import and pipeline functionality"""

print("Testing transformers import...")

try:
    import transformers
    print(f"✅ Transformers version: {transformers.__version__}")
    
    from transformers import pipeline
    print("✅ Pipeline import successful")
    print(f"Pipeline function: {pipeline}")
    
    # Test creating a simple pipeline
    try:
        test_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        print("✅ Test pipeline created successfully")
        
        # Test the pipeline
        result = test_pipeline("This is a test")
        print(f"✅ Test pipeline result: {result}")
        
    except Exception as e:
        print(f"❌ Pipeline creation failed: {e}")
        
except ImportError as e:
    print(f"❌ Transformers import failed: {e}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

print("\nTesting specific model imports...")

# Test specific models that are failing
models_to_test = [
    ("fill-mask", "emilyalsentzer/Bio_ClinicalBERT"),
    ("text-generation", "microsoft/biogpt"),
    ("fill-mask", "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"),
    ("text-classification", "distilbert-base-uncased"),
    ("zero-shot-classification", "facebook/bart-large-mnli"),
]

for task, model_name in models_to_test:
    try:
        print(f"\nTesting {model_name}...")
        test_pipeline = pipeline(task, model=model_name)
        print(f"✅ {model_name} loaded successfully")
    except Exception as e:
        print(f"❌ {model_name} failed: {e}")
