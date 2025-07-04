"""
Medical Analysis Utilities
-------------------------
Helper functions for analyzing medical symptoms with various AI models
"""

import logging
from typing import List, Dict, Any, Optional
import json
import re
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Common medical condition categories
SYMPTOM_CATEGORIES = [
    "Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", 
    "Musculoskeletal", "Dermatological", "Urological", "Ophthalmic",
    "ENT (Ear, Nose, Throat)", "Immunological", "Endocrine", "Psychological"
]

# Common medical conditions
COMMON_CONDITIONS = [
    "Common Cold", "Influenza", "COVID-19", "Migraine", 
    "Tension Headache", "Hypertension", "Gastroenteritis",
    "Acid Reflux", "Allergic Rhinitis", "Sinusitis",
    "Urinary Tract Infection", "Asthma", "Bronchitis",
    "Pneumonia", "Arthritis", "Tendonitis", "Anxiety",
    "Depression", "Insomnia", "Conjunctivitis", "Dermatitis",
    "Rosacea", "Hypothyroidism", "Diabetes", "Anemia"
]

# Severity to numerical score mapping
SEVERITY_MAPPING = {
    "low": 2,
    "mild": 3,
    "moderate": 5,
    "medium": 5,
    "significant": 7,
    "high": 8,
    "severe": 9,
    "critical": 10,
    "life-threatening": 10
}

def extract_medical_entities(text: str) -> Dict[str, List[str]]:
    """
    Extract medical entities from text using biomedical NER model
    """
    from main_simplified import biomedical_ner, BIOMEDICAL_NER_AVAILABLE
    
    if not BIOMEDICAL_NER_AVAILABLE or not biomedical_ner:
        return {"entities": []}
    
    try:
        # Extract entities
        raw_entities = biomedical_ner(text)
        
        # Process entities
        symptoms = []
        body_parts = []
        diseases = []
        treatments = []
        severity_indicators = []
        
        # Group entities by type and deduplicate
        for entity in raw_entities:
            word = entity.get('word', '').lower()
            label = entity.get('entity', '')
            
            if word.startswith('##'):
                continue  # Skip subword tokens
            
            if 'SYMPTOM' in label:
                if word not in symptoms:
                    symptoms.append(word)
            elif 'DISEASE' in label or 'CONDITION' in label:
                if word not in diseases:
                    diseases.append(word)
            elif 'BODY' in label or 'ORGAN' in label or 'ANATOMY' in label:
                if word not in body_parts:
                    body_parts.append(word)
            elif 'TREATMENT' in label or 'PROCEDURE' in label or 'MEDICATION' in label:
                if word not in treatments:
                    treatments.append(word)
            elif word in SEVERITY_MAPPING:
                if word not in severity_indicators:
                    severity_indicators.append(word)
        
        # Create a consolidated list of entities
        all_entities = symptoms + body_parts + diseases
        
        # Filter out duplicates and very short entities
        filtered_entities = []
        for entity in all_entities:
            if len(entity) > 2 and entity not in filtered_entities:
                filtered_entities.append(entity)
        
        return {
            "entities": filtered_entities,
            "symptoms": symptoms,
            "body_parts": body_parts,
            "diseases": diseases,
            "treatments": treatments,
            "severity_indicators": severity_indicators
        }
        
    except Exception as e:
        logger.error(f"Error in extract_medical_entities: {e}")
        return {"entities": []}

def enhance_with_medical_terminology(entities: List[str]) -> List[str]:
    """
    Enhance entities with professional medical terminology
    """
    from main_simplified import MEDICAL_TERMS
    
    medical_terms = []
    
    for entity in entities:
        entity_lower = entity.lower()
        # Add medical term if available
        if entity_lower in MEDICAL_TERMS:
            medical_term = MEDICAL_TERMS[entity_lower]
            if medical_term not in medical_terms:
                medical_terms.append(f"{entity} ({medical_term})")
        else:
            # Check for partial matches
            for term, medical_term in MEDICAL_TERMS.items():
                if term in entity_lower or entity_lower in term:
                    if medical_term not in medical_terms:
                        medical_terms.append(f"{entity} ({medical_term})")
                    break
    
    return medical_terms

def classify_symptoms(text: str) -> List[str]:
    """
    Classify symptoms into medical categories
    """
    from main_simplified import medical_bert, MEDICAL_BERT_AVAILABLE
    
    if not MEDICAL_BERT_AVAILABLE or not medical_bert:
        return []
    
    try:
        # Get the top 3 most relevant categories
        result = medical_bert(text, candidate_labels=SYMPTOM_CATEGORIES, multi_label=True)
        
        # Extract the categories with scores above threshold
        relevant_categories = []
        for idx, score in enumerate(result['scores'][:5]):  # Consider top 5 scores
            if score > 0.15:  # Threshold for relevance
                relevant_categories.append(result['labels'][idx])
        
        return relevant_categories
    
    except Exception as e:
        logger.error(f"Error in classify_symptoms: {e}")
        return []

def analyze_symptom_severity(text: str) -> int:
    """
    Analyze the severity of symptoms on a scale of 1-10
    """
    from main_simplified import symptom_classifier, SYMPTOM_CLASSIFIER_AVAILABLE
    
    if not SYMPTOM_CLASSIFIER_AVAILABLE or not symptom_classifier:
        # Fallback: basic keyword matching for severity
        text_lower = text.lower()
        for term, score in SEVERITY_MAPPING.items():
            if term in text_lower:
                return score
        return 5  # Default medium severity
    
    try:
        # Check for explicit severity terms
        text_lower = text.lower()
        for term, score in SEVERITY_MAPPING.items():
            if term in text_lower:
                return score
        
        # Use the classifier to determine sentiment/intensity
        result = symptom_classifier(text)
        
        # Map classifier result to severity score
        label = result[0]['label']
        score = result[0]['score']
        
        # DistilBERT typically classifies as POSITIVE/NEGATIVE
        # We'll interpret NEGATIVE with high confidence as more severe
        if label == 'NEGATIVE' and score > 0.8:
            return 8
        elif label == 'NEGATIVE' and score > 0.6:
            return 7
        elif label == 'NEGATIVE':
            return 6
        elif label == 'POSITIVE' and score > 0.8:
            return 3
        elif label == 'POSITIVE':
            return 4
        
        return 5  # Default medium severity
        
    except Exception as e:
        logger.error(f"Error in analyze_symptom_severity: {e}")
        return 5  # Default medium severity

def create_ensemble_analysis(symptoms: str, entities: List[str], medical_terms: List[str], 
                            symptom_classes: List[str], severity_score: Optional[int] = None, 
                            age: Optional[int] = None, gender: Optional[str] = None) -> Any:
    """
    Create an analysis based on the ensemble of available models
    """
    from main_simplified import AnalysisResponse
    
    # Determine severity based on score or default to medium
    severity_mapping = {
        1: "Low",
        2: "Low",
        3: "Low",
        4: "Medium",
        5: "Medium",
        6: "Medium",
        7: "High",
        8: "High",
        9: "Critical",
        10: "Critical"
    }
    
    severity = severity_mapping.get(severity_score or 5, "Medium")
    
    # Determine potential condition
    condition = "Symptom Analysis"
    if symptom_classes and len(symptom_classes) > 0:
        primary_class = symptom_classes[0]
        condition = f"Possible {primary_class} Condition"
    
    # For more specific condition identification based on symptoms
    symptoms_lower = symptoms.lower()
    for common_condition in COMMON_CONDITIONS:
        condition_lower = common_condition.lower()
        # Check if condition keywords appear in the symptoms
        if condition_lower in symptoms_lower:
            condition = f"Possible {common_condition}"
            break
        
        # Check for specific symptom patterns
        if "head" in symptoms_lower and "ache" in symptoms_lower:
            condition = "Possible Headache or Migraine"
            break
        elif ("stomach" in symptoms_lower or "abdomen" in symptoms_lower) and "pain" in symptoms_lower:
            condition = "Possible Gastrointestinal Issue"
            break
        elif "throat" in symptoms_lower and ("sore" in symptoms_lower or "pain" in symptoms_lower):
            condition = "Possible Upper Respiratory Infection"
            break
        elif "chest" in symptoms_lower and "pain" in symptoms_lower:
            condition = "Possible Cardiovascular or Respiratory Issue"
            severity = "High"  # Chest pain should be taken seriously
            break
        elif ("rash" in symptoms_lower or "itch" in symptoms_lower) and ("skin" in symptoms_lower or "body" in symptoms_lower):
            condition = "Possible Skin Condition or Allergic Reaction"
            break
    
    # Generate appropriate recommendations based on symptom classes and severity
    recommendations = [
        "Monitor your symptoms closely",
        "Keep a record of your symptoms including timing and triggers",
        "Maintain proper hydration and rest"
    ]
    
    # Add class-specific recommendations
    if symptom_classes:
        if "Respiratory" in symptom_classes:
            recommendations.append("Consider using a humidifier to ease breathing")
        if "Gastrointestinal" in symptom_classes:
            recommendations.append("Follow a bland diet until symptoms improve")
        if "Musculoskeletal" in symptom_classes:
            recommendations.append("Apply ice to reduce inflammation and pain")
        if "Cardiovascular" in symptom_classes:
            recommendations.append("Monitor your blood pressure if possible")
            severity = max(severity, "Medium")  # Ensure cardiovascular symptoms are taken seriously
    
    # Add severity-based recommendations
    if severity in ["High", "Critical"]:
        recommendations.append("Seek prompt medical attention")
    else:
        recommendations.append("Consult with a healthcare professional if symptoms persist or worsen")
    
    # Generate advice based on the analysis
    advice = f"Based on our analysis of your symptoms"
    if age:
        advice += f" at age {age}"
    if gender:
        advice += f" as a {gender} patient"
    advice += f", you may be experiencing a {severity.lower()} severity {condition.lower()}. "
    
    if medical_terms:
        advice += f"Medical terminology relevant to your symptoms includes: {', '.join(medical_terms[:3])}. "
    
    advice += "We recommend monitoring your symptoms and consulting with a healthcare professional for proper diagnosis and treatment."
    
    # When to seek help advice varies by severity
    when_to_seek_help = "Seek medical attention if your symptoms worsen or do not improve within a few days."
    if severity == "High":
        when_to_seek_help = "Seek prompt medical attention within 24-48 hours."
    elif severity == "Critical":
        when_to_seek_help = "Seek immediate medical attention or emergency care."
    
    # Calculate confidence based on available data points
    confidence_factors = []
    if entities:
        confidence_factors.append(min(len(entities) * 5, 25))  # Up to 25% from entities
    if symptom_classes:
        confidence_factors.append(min(len(symptom_classes) * 10, 25))  # Up to 25% from classes
    if medical_terms:
        confidence_factors.append(min(len(medical_terms) * 5, 15))  # Up to 15% from terms
    
    # Base confidence of 35% plus factors
    confidence = 35 + sum(confidence_factors)
    confidence = min(confidence, 85)  # Cap at 85% without full AI analysis
    
    # Create response
    return AnalysisResponse(
        condition=condition,
        severity=severity,
        advice=advice,
        confidence=confidence,
        recommendations=recommendations,
        whenToSeekHelp=when_to_seek_help,
        disclaimer="This analysis is generated by an ensemble of AI models for informational purposes only. Always consult healthcare professionals for medical advice.",
        urgency_score=severity_score or 5,
        entities_extracted=entities,
        ai_models_used="Ensemble: Biomedical NER + Medical BERT + Symptom Classifier"
    )
