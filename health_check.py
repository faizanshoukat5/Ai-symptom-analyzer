#!/usr/bin/env python3
"""Quick health check for the MedAI Advanced system"""

import requests
import json

def health_check():
    """Check system health and model status"""
    
    try:
        print("🏥 MedAI Advanced - System Health Check")
        print("=" * 50)
        
        # Check backend health
        health_response = requests.get("http://localhost:8000/health", timeout=10)
        
        if health_response.status_code == 200:
            health_data = health_response.json()
            print("✅ Backend Status: HEALTHY")
            print(f"🤖 Models Loaded: {health_data.get('models_loaded', 'Unknown')}")
            print(f"📊 System Status: {health_data.get('status', 'Unknown')}")
            
            # Test a quick analysis
            print("\n🧪 Testing Quick Analysis...")
            test_response = requests.post(
                "http://localhost:8000/analyze-symptoms",
                json={"symptoms": "mild headache"},
                timeout=15
            )
            
            if test_response.status_code == 200:
                print("✅ Analysis Endpoint: WORKING")
                result = test_response.json()
                print(f"🔬 Entities Found: {len(result.get('entities_extracted', []))}")
                print(f"⚡ Urgency Score: {result.get('urgency_score', 'N/A')}")
            else:
                print("❌ Analysis Endpoint: ERROR")
                
        else:
            print("❌ Backend Status: UNHEALTHY")
            
    except requests.exceptions.RequestException as e:
        print("❌ Cannot connect to backend")
        print("Make sure to run: python backend/main_advanced_models.py")
        
    print("=" * 50)
    print("Frontend URL: http://localhost:5173 (or check npm dev output)")
    print("Backend URL: http://localhost:8000")

if __name__ == "__main__":
    health_check()
