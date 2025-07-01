"""
Enhanced Medical Analysis with Smart Symptom Classification
Demonstrates integration of rule-based classifier with existing AI system
"""

import requests
import json
from smart_symptom_classifier import classify_medical_symptoms

def enhanced_symptom_analysis(symptoms_text: str):
    """Perform enhanced analysis combining API and rule-based classification"""
    
    print(f"🔍 Analyzing: {symptoms_text}")
    print("=" * 80)
    
    # 1. Get rule-based classification
    print("📊 RULE-BASED CLASSIFICATION:")
    rule_classification = classify_medical_symptoms(symptoms_text)
    print(f"   Primary Category: {rule_classification['primary_category']}")
    print(f"   Confidence: {rule_classification['confidence']:.1%}")
    print(f"   Urgency Level: {rule_classification['urgency_level']} ({rule_classification['urgency_score']}/10)")
    print(f"   Matched Keywords: {', '.join(rule_classification['matched_keywords'][:3])}")
    
    # 2. Get AI backend analysis
    print("\n🤖 AI BACKEND ANALYSIS:")
    try:
        api_response = requests.post(
            "http://localhost:8000/analyze-symptoms",
            json={"symptoms": symptoms_text},
            timeout=30
        )
        
        if api_response.status_code == 200:
            ai_result = api_response.json()
            print(f"   Primary Analysis: {ai_result.get('primary_analysis', 'N/A')}")
            print(f"   Severity: {ai_result.get('severity', 'N/A')}")
            print(f"   AI Confidence: {ai_result.get('confidence', 'N/A')}%")
            print(f"   AI Urgency Score: {ai_result.get('urgency_score', 'N/A')}/10")
            print(f"   Models Used: {ai_result.get('ai_models_used', 'N/A')}")
            print(f"   Entities: {', '.join(ai_result.get('entities_extracted', [])[:5])}")
        else:
            print(f"   ❌ API Error: {api_response.status_code}")
            ai_result = None
            
    except Exception as e:
        print(f"   ❌ Connection Error: {e}")
        ai_result = None
    
    # 3. Combined Analysis
    print("\n🔬 COMBINED ANALYSIS:")
    
    # Combine urgency scores
    if ai_result and ai_result.get('urgency_score'):
        combined_urgency = (rule_classification['urgency_score'] + ai_result['urgency_score']) / 2
        print(f"   Combined Urgency Score: {combined_urgency:.1f}/10")
    else:
        combined_urgency = rule_classification['urgency_score']
        print(f"   Urgency Score (rule-based): {combined_urgency}/10")
    
    # Determine final recommendation
    if combined_urgency >= 8:
        recommendation = "🚨 SEEK IMMEDIATE MEDICAL ATTENTION"
    elif combined_urgency >= 6:
        recommendation = "⚠️ Schedule medical appointment soon"
    elif combined_urgency >= 4:
        recommendation = "📋 Consider consulting healthcare provider"
    else:
        recommendation = "💡 Monitor symptoms, self-care may be appropriate"
    
    print(f"   Recommendation: {recommendation}")
    
    # Enhanced categorization
    print(f"   Category: {rule_classification['primary_category']} ({rule_classification['description']})")
    
    return {
        "rule_classification": rule_classification,
        "ai_analysis": ai_result,
        "combined_urgency": combined_urgency,
        "recommendation": recommendation
    }

# Test with various symptom scenarios
if __name__ == "__main__":
    print("🏥 ENHANCED MEDICAL SYMPTOM ANALYSIS DEMO")
    print("🤖 Combining Rule-Based Classification + AI Backend")
    print("=" * 80)
    
    test_cases = [
        "I'm having severe chest pain and can't catch my breath",
        "Mild headache that's been going on for a few hours", 
        "Sudden severe abdominal pain with vomiting blood",
        "Persistent cough with fever for 3 days",
        "Feeling very anxious and having panic attacks"
    ]
    
    for i, symptoms in enumerate(test_cases, 1):
        print(f"\n🧪 TEST CASE {i}:")
        result = enhanced_symptom_analysis(symptoms)
        print()
    
    print("=" * 80)
    print("✅ Enhanced analysis demo complete!")
    print("\n💡 Key Benefits:")
    print("   • Rule-based classification provides instant categorization")
    print("   • AI backend adds clinical intelligence and entity extraction")
    print("   • Combined urgency scoring improves accuracy")
    print("   • Multiple analysis methods increase reliability")
