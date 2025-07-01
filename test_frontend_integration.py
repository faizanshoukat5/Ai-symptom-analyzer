#!/usr/bin/env python3
"""Test script to verify frontend-backend integration"""

import requests
import json

def test_api_integration():
    """Test the API endpoint that the frontend uses"""
    
    url = "http://localhost:8000/analyze-symptoms"
    test_symptoms = "I have been experiencing headaches and fatigue for the past few days"
    
    payload = {
        "symptoms": test_symptoms
    }
    
    try:
        print("🧪 Testing API integration...")
        print(f"📍 URL: {url}")
        print(f"📝 Symptoms: {test_symptoms}")
        print("=" * 60)
        
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Request Successful!")
            print("=" * 60)
            
            # Display key fields that frontend should receive
            print(f"🔍 Primary Analysis: {data.get('primary_analysis', 'N/A')}")
            print(f"📊 Severity: {data.get('severity', 'N/A')}")
            print(f"🎯 Confidence: {data.get('confidence', 'N/A')}%")
            print(f"⚡ Urgency Score: {data.get('urgency_score', 'N/A')}/10")
            print(f"🤖 AI Models Used: {data.get('ai_models_used', 'N/A')}")
            print(f"🔬 Entities Extracted: {data.get('entities_extracted', [])}")
            print(f"💡 Advice: {data.get('advice', 'N/A')[:100]}...")
            
            if data.get('recommendations'):
                print(f"📋 Recommendations ({len(data['recommendations'])} items):")
                for i, rec in enumerate(data['recommendations'][:3], 1):
                    print(f"   {i}. {rec}")
            
            print("=" * 60)
            print("✅ Frontend should be able to display all this data!")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure the backend is running on http://localhost:8000")

if __name__ == "__main__":
    test_api_integration()
