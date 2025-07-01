#!/usr/bin/env python3
"""
API Testing Script
Test the Medical Symptom Checker API endpoints
"""

import requests
import json
import asyncio
import sys

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_analyze_symptoms():
    """Test the symptom analysis endpoint"""
    print("\n🔍 Testing symptom analysis endpoint...")
    
    test_data = {
        "symptoms": "I have been experiencing a persistent headache for the past 2 days, along with mild nausea and sensitivity to light. The headache is throbbing and gets worse when I move around.",
        "age": 25,
        "gender": "female"
    }
    
    try:
        print(f"   Sending request with symptoms: {test_data['symptoms'][:50]}...")
        response = requests.post(
            f"{BASE_URL}/analyze-symptoms",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Symptom analysis working")
            result = response.json()
            print(f"   Condition: {result.get('condition', 'N/A')}")
            print(f"   Severity: {result.get('severity', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}%")
            print(f"   Recommendations: {len(result.get('recommendations', []))} items")
            return True
        else:
            print(f"❌ Symptom analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - API might be processing or OpenAI is slow")
        return False
    except Exception as e:
        print(f"❌ Symptom analysis error: {e}")
        return False

def test_invalid_input():
    """Test with invalid input"""
    print("\n🔍 Testing invalid input handling...")
    
    invalid_data = {
        "symptoms": "short"  # Too short
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze-symptoms",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 422:  # Validation error expected
            print("✅ Input validation working")
            return True
        else:
            print(f"❌ Input validation failed: expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Input validation test error: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Starting API Tests for Medical Symptom Checker")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        print(f"✅ Server is running at {BASE_URL}")
    except:
        print(f"❌ Server is not running at {BASE_URL}")
        print("   Please start the server first with: python start_server.py")
        sys.exit(1)
    
    # Run tests
    tests = [
        test_health_endpoint,
        test_analyze_symptoms,
        test_invalid_input
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the server logs.")

if __name__ == "__main__":
    main()