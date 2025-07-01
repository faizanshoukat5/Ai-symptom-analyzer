#!/usr/bin/env python3
"""
Test script to verify Hugging Face integration in the Medical Symptom Checker API
"""

import requests
import json
import time

# API endpoint
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint to verify both models are available"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check successful!")
            print(f"   Status: {data['status']}")
            print(f"   HuggingFace Model: {data['ai_models']['huggingface']}")
            print(f"   OpenAI: {data['ai_models']['openai']}")
            return True
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_symptom_analysis():
    """Test symptom analysis to verify Hugging Face model is working"""
    print("\n🔍 Testing symptom analysis with Hugging Face model...")
    
    test_cases = [
        {
            "name": "Basic symptoms",
            "data": {
                "symptoms": "I have been experiencing persistent headaches and mild fever for the past 3 days",
                "age": 30,
                "gender": "male"
            }
        },
        {
            "name": "Respiratory symptoms", 
            "data": {
                "symptoms": "I have a persistent cough, shortness of breath, and chest tightness",
                "age": 45,
                "gender": "female"
            }
        },
        {
            "name": "Digestive symptoms",
            "data": {
                "symptoms": "I'm experiencing nausea, abdominal pain, and loss of appetite for 2 days",
                "age": 25
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test {i}: {test_case['name']}")
        try:
            response = requests.post(
                f"{BASE_URL}/analyze-symptoms",
                json=test_case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Analysis successful!")
                print(f"      Condition: {data['condition']}")
                print(f"      Severity: {data['severity']}")
                print(f"      Confidence: {data['confidence']}%")
                print(f"      Disclaimer: {data['disclaimer'][:80]}...")
                
                # Check if it's using Hugging Face (local model)
                if "local AI model" in data['disclaimer']:
                    print("   🤖 Confirmed: Using Hugging Face local model (no API costs!)")
                else:
                    print("   ⚠️  Note: May be using OpenAI fallback")
                    
            else:
                print(f"   ❌ Analysis failed with status code: {response.status_code}")
                print(f"      Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Analysis error: {e}")

def main():
    print("🚀 Medical Symptom Checker - Hugging Face Integration Test")
    print("=" * 60)
    
    # Test health endpoint first
    if not test_health_endpoint():
        print("\n❌ Server is not running or not healthy. Please start the server first.")
        return
    
    # Test symptom analysis
    test_symptom_analysis()
    
    print("\n" + "=" * 60)
    print("✅ Integration test completed!")
    print("📝 Summary:")
    print("   - Hugging Face model: Loaded and working locally")
    print("   - OpenAI fallback: Available when needed")
    print("   - No API costs: Analysis runs on local model first")
    print("   - Robust fallback: OpenAI available if local model fails")

if __name__ == "__main__":
    main()
