"""
Smart Symptom Classification for Medical AI
Rule-based and keyword-based symptom categorization system
"""

import re
from typing import Dict, List, Tuple

class MedicalSymptomClassifier:
    """Rule-based medical symptom classifier"""
    
    def __init__(self):
        self.symptom_categories = {
            "respiratory": {
                "keywords": ["cough", "shortness of breath", "wheezing", "chest pain", "breathing", 
                           "lungs", "asthma", "pneumonia", "bronchitis", "oxygen", "air", "respiratory"],
                "description": "Breathing and lung-related symptoms"
            },
            "cardiovascular": {
                "keywords": ["heart", "chest pain", "palpitations", "blood pressure", "cardiac",
                           "circulation", "pulse", "arrhythmia", "angina", "heart attack"],
                "description": "Heart and circulation-related symptoms"
            },
            "gastrointestinal": {
                "keywords": ["stomach", "abdominal", "nausea", "vomiting", "diarrhea", "constipation",
                           "gastro", "intestinal", "bowel", "digestive", "acid reflux", "indigestion"],
                "description": "Digestive system symptoms"
            },
            "neurological": {
                "keywords": ["headache", "migraine", "dizziness", "seizure", "memory", "confusion",
                           "numbness", "tingling", "paralysis", "stroke", "brain", "neurological"],
                "description": "Brain and nervous system symptoms"
            },
            "musculoskeletal": {
                "keywords": ["muscle", "joint", "bone", "arthritis", "back pain", "neck pain",
                           "shoulder", "knee", "hip", "fracture", "sprain", "strain", "mobility"],
                "description": "Muscles, bones, and joints symptoms"
            },
            "dermatological": {
                "keywords": ["skin", "rash", "itching", "redness", "swelling", "bruising", "lesion",
                           "acne", "eczema", "psoriasis", "dermatitis", "wound", "cut"],
                "description": "Skin-related symptoms"
            },
            "emergency": {
                "keywords": ["severe", "sudden", "acute", "emergency", "urgent", "critical", "blood",
                           "bleeding", "unconscious", "difficulty breathing", "chest pain", "stroke"],
                "description": "Emergency or urgent symptoms"
            },
            "infectious": {
                "keywords": ["fever", "infection", "viral", "bacterial", "flu", "cold", "temperature",
                           "chills", "swollen glands", "lymph nodes", "immune", "contagious"],
                "description": "Infection-related symptoms"
            },
            "psychological": {
                "keywords": ["anxiety", "depression", "stress", "panic", "mood", "mental", "emotional",
                           "sleep", "insomnia", "fatigue", "exhaustion", "psychological"],
                "description": "Mental health and psychological symptoms"
            },
            "urological": {
                "keywords": ["urinary", "bladder", "kidney", "urine", "urination", "prostate", 
                           "incontinence", "UTI", "urological", "renal"],
                "description": "Urinary system symptoms"
            }
        }
    
    def classify_symptoms(self, symptoms_text: str) -> Dict:
        """Classify symptoms using rule-based approach"""
        symptoms_lower = symptoms_text.lower()
        
        # Count keyword matches for each category
        category_scores = {}
        
        for category, data in self.symptom_categories.items():
            score = 0
            matched_keywords = []
            
            for keyword in data["keywords"]:
                if keyword.lower() in symptoms_lower:
                    score += 1
                    matched_keywords.append(keyword)
                    
                    # Give extra weight to exact matches
                    if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', symptoms_lower):
                        score += 0.5
            
            if score > 0:
                category_scores[category] = {
                    "score": score,
                    "matched_keywords": matched_keywords,
                    "description": data["description"]
                }
        
        # Sort by score
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1]["score"], reverse=True)
        
        if not sorted_categories:
            return {
                "primary_category": "general",
                "confidence": 0.5,
                "description": "General medical symptoms",
                "matched_keywords": [],
                "all_categories": {}
            }
        
        primary = sorted_categories[0]
        primary_category = primary[0]
        primary_score = primary[1]["score"]
        
        # Calculate confidence based on score and keyword matches
        max_possible_score = len(self.symptom_categories[primary_category]["keywords"])
        confidence = min(0.95, (primary_score / max_possible_score) * 0.8 + 0.3)
        
        return {
            "primary_category": primary_category,
            "confidence": confidence,
            "description": primary[1]["description"],
            "matched_keywords": primary[1]["matched_keywords"],
            "all_categories": dict(sorted_categories)
        }
    
    def get_urgency_indicators(self, symptoms_text: str) -> Dict:
        """Detect urgency indicators in symptoms"""
        urgency_keywords = {
            "high": ["severe", "acute", "sudden", "emergency", "critical", "unbearable", "excruciating"],
            "medium": ["persistent", "worsening", "concerning", "moderate", "ongoing"],
            "low": ["mild", "slight", "minor", "occasional", "intermittent"]
        }
        
        symptoms_lower = symptoms_text.lower()
        urgency_scores = {"high": 0, "medium": 0, "low": 0}
        
        for level, keywords in urgency_keywords.items():
            for keyword in keywords:
                if keyword in symptoms_lower:
                    urgency_scores[level] += 1
        
        # Determine overall urgency
        if urgency_scores["high"] > 0:
            urgency_level = "high"
            urgency_score = min(10, 7 + urgency_scores["high"])
        elif urgency_scores["medium"] > urgency_scores["low"]:
            urgency_level = "medium"
            urgency_score = 4 + min(3, urgency_scores["medium"])
        else:
            urgency_level = "low"
            urgency_score = 1 + min(3, urgency_scores["low"])
        
        return {
            "urgency_level": urgency_level,
            "urgency_score": urgency_score,
            "urgency_indicators": urgency_scores
        }

# Global classifier instance
medical_classifier = MedicalSymptomClassifier()

def classify_medical_symptoms(symptoms_text: str) -> Dict:
    """Main function to classify medical symptoms"""
    classification = medical_classifier.classify_symptoms(symptoms_text)
    urgency = medical_classifier.get_urgency_indicators(symptoms_text)
    
    return {
        **classification,
        **urgency,
        "analysis_type": "rule_based_classification"
    }

# Example usage and test
if __name__ == "__main__":
    print("🏥 Testing Medical Symptom Classification System")
    print("=" * 60)
    
    test_symptoms = [
        "I have severe chest pain and shortness of breath",
        "Persistent headache with nausea for 3 days", 
        "Mild stomach ache after eating",
        "Sudden onset of severe abdominal pain with vomiting",
        "Skin rash with itching on my arms",
        "Feeling anxious and having trouble sleeping"
    ]
    
    for i, symptoms in enumerate(test_symptoms, 1):
        print(f"\n🧪 Test {i}: {symptoms}")
        result = classify_medical_symptoms(symptoms)
        
        print(f"📊 Primary Category: {result['primary_category']}")
        print(f"📝 Description: {result['description']}")
        print(f"🎯 Confidence: {result['confidence']:.1%}")
        print(f"⚡ Urgency Level: {result['urgency_level']} (Score: {result['urgency_score']}/10)")
        print(f"🔍 Matched Keywords: {', '.join(result['matched_keywords'][:5])}")
        
        if len(result['all_categories']) > 1:
            print("📈 Other Categories:")
            for cat, data in list(result['all_categories'].items())[1:3]:
                print(f"   • {cat}: {data['score']} matches")
    
    print("\n" + "=" * 60)
    print("✅ Medical symptom classification test complete!")
