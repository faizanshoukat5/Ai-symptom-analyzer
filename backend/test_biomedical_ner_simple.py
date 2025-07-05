#!/usr/bin/env python3
"""
Simple test script to verify the biomedical NER model works correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main_simplified import load_biomedical_model, biomedical_ner, BIOMEDICAL_NER_AVAILABLE, extract_medical_entities

def test_biomedical_ner():
    print("🧪 Testing Biomedical NER Model Loading and Function...")
    
    # Test 1: Load the model
    print("\n1. Testing model loading...")
    load_biomedical_model()
    
    if BIOMEDICAL_NER_AVAILABLE:
        print("✅ Biomedical NER model loaded successfully")
        
        # Test 2: Test direct model usage
        print("\n2. Testing direct model usage...")
        test_text = "I have a severe headache and fever for 3 days"
        try:
            results = biomedical_ner(test_text)
            print(f"✅ Direct model call successful, found {len(results)} entities")
            
            # Show first few entities
            for i, entity in enumerate(results[:5]):
                print(f"   Entity {i+1}: {entity['word']} -> {entity['entity']} (confidence: {entity['score']:.4f})")
        except Exception as e:
            print(f"❌ Direct model call failed: {e}")
            return False
        
        # Test 3: Test extraction function
        print("\n3. Testing entity extraction function...")
        try:
            entities = extract_medical_entities(test_text)
            print(f"✅ Entity extraction successful: {entities}")
        except Exception as e:
            print(f"❌ Entity extraction failed: {e}")
            return False
            
        return True
    else:
        print("❌ Biomedical NER model failed to load")
        return False

if __name__ == "__main__":
    print("🚀 Starting Biomedical NER Test")
    success = test_biomedical_ner()
    
    if success:
        print("\n🎉 All tests passed! The biomedical NER model is working correctly.")
    else:
        print("\n💥 Some tests failed. Please check the errors above.")
        sys.exit(1)
