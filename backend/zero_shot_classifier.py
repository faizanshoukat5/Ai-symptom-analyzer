"""
Zero-Shot Classification Enhancement for Medical AI
Adds BART-based zero-shot classification capabilities
"""

from transformers import pipeline

# Initialize the zero-shot classification pipeline
def create_zero_shot_classifier():
    """Create a zero-shot classification pipeline using a smaller model"""
    try:
        # Try with a smaller, more memory-efficient model first
        pipe = pipeline("zero-shot-classification", model="microsoft/DialoGPT-medium")
        print("✅ Zero-shot classifier (DialoGPT) loaded successfully")
        return pipe
    except Exception as e1:
        try:
            # Fallback to an even smaller model
            pipe = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
            print("✅ Fallback text classifier loaded successfully")
            return pipe
        except Exception as e2:
            print(f"❌ Failed to load any classifier: {e1}")
            print(f"❌ Fallback also failed: {e2}")
            return None

# Medical symptom categories for classification
MEDICAL_CATEGORIES = [
    "respiratory symptoms",
    "cardiovascular symptoms", 
    "gastrointestinal symptoms",
    "neurological symptoms",
    "musculoskeletal symptoms",
    "dermatological symptoms",
    "psychological symptoms",
    "infectious disease symptoms",
    "urological symptoms",
    "gynecological symptoms",
    "emergency symptoms",
    "chronic pain symptoms"
]

def classify_symptoms(pipe, symptoms_text, categories=None):
    """Classify symptoms using zero-shot classification"""
    if pipe is None:
        return {"error": "Classifier not available"}
    
    if categories is None:
        categories = MEDICAL_CATEGORIES
    
    try:
        result = pipe(symptoms_text, categories)
        return {
            "classification": result["labels"][0],
            "confidence": result["scores"][0],
            "all_scores": dict(zip(result["labels"], result["scores"]))
        }
    except Exception as e:
        return {"error": f"Classification failed: {e}"}

# Example usage and test
if __name__ == "__main__":
    print("🔧 Testing Zero-Shot Classification for Medical Symptoms")
    print("=" * 60)
    
    # Create classifier
    classifier = create_zero_shot_classifier()
    
    if classifier:
        # Test with sample symptoms
        test_symptoms = [
            "I have been experiencing chest pain and shortness of breath",
            "Severe headache with nausea and vision problems", 
            "Persistent cough with fever and fatigue",
            "Stomach pain with vomiting and diarrhea"
        ]
        
        for i, symptoms in enumerate(test_symptoms, 1):
            print(f"\n🧪 Test {i}: {symptoms}")
            result = classify_symptoms(classifier, symptoms)
            
            if "error" not in result:
                print(f"📊 Primary Category: {result['classification']}")
                print(f"🎯 Confidence: {result['confidence']:.2%}")
                print("📈 Top 3 Categories:")
                for label, score in list(result['all_scores'].items())[:3]:
                    print(f"   • {label}: {score:.2%}")
            else:
                print(f"❌ Error: {result['error']}")
    
    print("\n" + "=" * 60)
    print("Zero-shot classification test complete!")
