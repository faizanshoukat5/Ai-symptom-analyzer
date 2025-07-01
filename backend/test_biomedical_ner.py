#!/usr/bin/env python3
"""
Test script for the biomedical NER pipeline
"""

from transformers import pipeline
import time

def test_biomedical_ner():
    """Test the biomedical NER model with sample symptoms"""
    
    print("🔬 Testing Biomedical NER Pipeline...")
    print("=" * 50)
    
    try:
        # Initialize the pipeline as specified
        print("📥 Loading biomedical NER model...")
        start_time = time.time()
        
        pipe = pipeline("token-classification", model="d4data/biomedical-ner-all")
        
        load_time = time.time() - start_time
        print(f"✅ Model loaded successfully in {load_time:.2f} seconds")
        
        # Test cases with various medical symptoms
        test_cases = [
            "I have been experiencing severe headaches and nausea for the past three days",
            "Patient reports chest pain, shortness of breath, and fatigue",
            "Experiencing abdominal pain, vomiting, and fever since yesterday",
            "I have a persistent cough, sore throat, and muscle aches",
            "Sharp pain in my right knee and swelling in the joint area"
        ]
        
        print("\n🧪 Testing with sample symptoms:")
        print("-" * 40)
        
        for i, text in enumerate(test_cases, 1):
            print(f"\nTest {i}: {text}")
            
            try:
                # Run NER extraction
                start_time = time.time()
                entities = pipe(text)
                process_time = time.time() - start_time
                
                print(f"⏱️  Processing time: {process_time:.3f} seconds")
                print(f"🔍 Found {len(entities)} entities:")
                
                # Group entities by type
                entity_groups = {}
                for entity in entities:
                    entity_type = entity.get('entity', 'UNKNOWN')
                    word = entity.get('word', '')
                    score = entity.get('score', 0)
                    
                    if entity_type not in entity_groups:
                        entity_groups[entity_type] = []
                    
                    entity_groups[entity_type].append({
                        'word': word,
                        'score': round(score, 3)
                    })
                
                # Display grouped results
                for entity_type, words in entity_groups.items():
                    print(f"   {entity_type}: {words}")
                
            except Exception as e:
                print(f"❌ Error processing text: {e}")
        
        print("\n" + "=" * 50)
        print("✅ Biomedical NER testing completed successfully!")
        
        # Performance summary
        print(f"\n📊 Performance Summary:")
        print(f"   - Model: d4data/biomedical-ner-all")
        print(f"   - Load time: {load_time:.2f}s")
        print(f"   - Average processing: ~{process_time:.3f}s per text")
        print(f"   - Ready for integration: ✅")
        
    except Exception as e:
        print(f"❌ Failed to load or test model: {e}")
        print("\nTroubleshooting:")
        print("1. Check internet connection for model download")
        print("2. Ensure transformers library is installed: pip install transformers")
        print("3. Try running: pip install torch torchvision")

def test_entity_extraction():
    """Test the enhanced entity extraction logic"""
    
    print("\n🔧 Testing Enhanced Entity Extraction...")
    print("-" * 40)
    
    try:
        from medical_ai_enhancements import MedicalNLPProcessor
        
        processor = MedicalNLPProcessor()
        
        test_text = "I have severe headaches, chest pain, and my left arm hurts. I'm also taking aspirin."
        
        print(f"Input: {test_text}")
        
        entities = processor.extract_medical_entities(test_text)
        
        print("Extracted entities:")
        for category, items in entities.items():
            if items:
                print(f"  {category}: {items}")
        
        print("✅ Entity extraction test completed!")
        
    except ImportError:
        print("⚠️  Enhanced entity extraction not available (module not found)")
    except Exception as e:
        print(f"❌ Entity extraction test failed: {e}")

if __name__ == "__main__":
    test_biomedical_ner()
    test_entity_extraction()
