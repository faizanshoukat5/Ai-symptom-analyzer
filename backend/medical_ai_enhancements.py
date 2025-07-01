"""
Advanced Medical AI Enhancements for Symptom Checker
"""

from typing import List, Dict, Optional
import spacy
import datetime
from dataclasses import dataclass
from transformers import pipeline
import pandas as pd

@dataclass
class SymptomAnalysis:
    """Enhanced symptom analysis structure"""
    primary_symptoms: List[str]
    secondary_symptoms: List[str]
    duration: Optional[str]
    severity_indicators: List[str]
    body_systems: List[str]
    urgency_score: float
    confidence: float

class MedicalNLPProcessor:
    """Advanced natural language processing for medical text"""
    
    def __init__(self):
        try:
            # Load medical NLP model
            self.nlp = spacy.load("en_core_sci_sm")  # Medical spaCy model
        except:
            self.nlp = spacy.load("en_core_web_sm")  # Fallback to general model
        
        # Medical entity recognition - Use the high-level pipeline helper
        self.medical_ner = pipeline("token-classification", model="d4data/biomedical-ner-all")
        
        # Symptom severity classifier
        self.severity_classifier = pipeline(
            "text-classification",
            model="michiyasunaga/BioLinkBERT-base"
        )

    def extract_medical_entities(self, text: str) -> Dict:
        """Extract medical entities from symptom description"""
        try:
            entities = self.medical_ner(text)
            
            symptoms = []
            body_parts = []
            conditions = []
            medications = []
            
            for entity in entities:
                # Handle the token classification output format
                label = entity.get('entity', entity.get('entity_group', ''))
                word = entity.get('word', '')
                
                # Clean up subword tokens (remove ## prefix)
                if word.startswith('##'):
                    word = word[2:]
                
                # Group entities by medical category
                if label in ['B-SIGN_SYMPTOM', 'I-SIGN_SYMPTOM', 'B-DISEASE_DISORDER', 'I-DISEASE_DISORDER']:
                    if word and len(word) > 2:  # Filter out short tokens
                        symptoms.append(word)
                elif label in ['B-BODY_PART', 'I-BODY_PART', 'B-ORGAN', 'I-ORGAN']:
                    if word and len(word) > 2:
                        body_parts.append(word)
                elif label in ['B-MEDICATION', 'I-MEDICATION', 'B-DRUG', 'I-DRUG']:
                    if word and len(word) > 2:
                        medications.append(word)
                    
            return {
                'symptoms': list(set(symptoms)),  # Remove duplicates
                'body_parts': list(set(body_parts)),
                'conditions': list(set(conditions)),
                'medications': list(set(medications))
            }
        except Exception as e:
            print(f"Medical NER extraction error: {e}")
            return {'symptoms': [], 'body_parts': [], 'conditions': [], 'medications': []}

    def analyze_temporal_patterns(self, text: str) -> Dict:
        """Extract temporal information about symptoms"""
        doc = self.nlp(text)
        
        time_patterns = {
            'acute': ['sudden', 'suddenly', 'immediate', 'rapid'],
            'chronic': ['weeks', 'months', 'years', 'chronic', 'persistent'],
            'progressive': ['worsening', 'getting worse', 'progressing'],
            'intermittent': ['comes and goes', 'on and off', 'intermittent']
        }
        
        temporal_info = {}
        text_lower = text.lower()
        
        for pattern_type, keywords in time_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                temporal_info[pattern_type] = True
                
        return temporal_info

class AdvancedSymptomAnalyzer:
    """Enhanced symptom analysis with medical knowledge"""
    
    def __init__(self):
        self.nlp_processor = MedicalNLPProcessor()
        self.medical_knowledge = self._load_medical_knowledge()
        
    def _load_medical_knowledge(self) -> Dict:
        """Load medical knowledge base"""
        return {
            'red_flags': [
                'chest pain', 'difficulty breathing', 'severe headache',
                'loss of consciousness', 'severe abdominal pain',
                'signs of stroke', 'severe allergic reaction'
            ],
            'body_systems': {
                'cardiovascular': ['chest', 'heart', 'circulation'],
                'respiratory': ['lungs', 'breathing', 'cough'],
                'neurological': ['brain', 'nerves', 'headache'],
                'gastrointestinal': ['stomach', 'digestion', 'nausea'],
                'musculoskeletal': ['muscles', 'bones', 'joints']
            },
            'symptom_severity': {
                'mild': ['slight', 'mild', 'minor', 'occasional'],
                'moderate': ['moderate', 'noticeable', 'frequent'],
                'severe': ['severe', 'intense', 'debilitating', 'excruciating']
            }
        }
    
    def analyze_symptoms_advanced(self, symptom_text: str, age: Optional[int] = None, gender: Optional[str] = None) -> SymptomAnalysis:
        """Perform advanced symptom analysis"""
        
        # Extract medical entities
        entities = self.nlp_processor.extract_medical_entities(symptom_text)
        
        # Analyze temporal patterns
        temporal = self.nlp_processor.analyze_temporal_patterns(symptom_text)
        
        # Calculate urgency score
        urgency_score = self._calculate_urgency_score(symptom_text, entities)
        
        # Identify body systems
        body_systems = self._identify_body_systems(entities['body_parts'] + entities['symptoms'])
        
        # Severity analysis
        severity_indicators = self._analyze_severity(symptom_text)
        
        return SymptomAnalysis(
            primary_symptoms=entities['symptoms'][:3],  # Top 3 symptoms
            secondary_symptoms=entities['symptoms'][3:],
            duration=self._extract_duration(temporal),
            severity_indicators=severity_indicators,
            body_systems=body_systems,
            urgency_score=urgency_score,
            confidence=0.85  # Base confidence
        )
    
    def _calculate_urgency_score(self, text: str, entities: Dict) -> float:
        """Calculate urgency score based on symptoms"""
        score = 0.0
        text_lower = text.lower()
        
        # Check for red flag symptoms
        for red_flag in self.medical_knowledge['red_flags']:
            if red_flag in text_lower:
                score += 0.3
        
        # Check severity indicators
        severe_words = self.medical_knowledge['symptom_severity']['severe']
        if any(word in text_lower for word in severe_words):
            score += 0.2
            
        # Duration factors
        if any(word in text_lower for word in ['sudden', 'immediate', 'rapid']):
            score += 0.2
            
        return min(score, 1.0)
    
    def _identify_body_systems(self, terms: List[str]) -> List[str]:
        """Identify affected body systems"""
        systems = []
        terms_lower = [term.lower() for term in terms]
        
        for system, keywords in self.medical_knowledge['body_systems'].items():
            if any(keyword in ' '.join(terms_lower) for keyword in keywords):
                systems.append(system)
                
        return systems
    
    def _analyze_severity(self, text: str) -> List[str]:
        """Analyze severity indicators"""
        indicators = []
        text_lower = text.lower()
        
        for severity, words in self.medical_knowledge['symptom_severity'].items():
            if any(word in text_lower for word in words):
                indicators.append(severity)
                
        return indicators
    
    def _extract_duration(self, temporal: Dict) -> Optional[str]:
        """Extract duration information"""
        if 'acute' in temporal:
            return 'acute (sudden onset)'
        elif 'chronic' in temporal:
            return 'chronic (long-term)'
        elif 'progressive' in temporal:
            return 'progressive (worsening)'
        else:
            return None

class SymptomTriageSystem:
    """Medical triage system for symptom prioritization"""
    
    TRIAGE_LEVELS = {
        'emergency': {'color': 'red', 'priority': 1, 'action': 'Seek immediate emergency care'},
        'urgent': {'color': 'orange', 'priority': 2, 'action': 'See healthcare provider within 24 hours'},
        'semi_urgent': {'color': 'yellow', 'priority': 3, 'action': 'Schedule appointment within 1-3 days'},
        'routine': {'color': 'green', 'priority': 4, 'action': 'Schedule routine appointment'},
        'self_care': {'color': 'blue', 'priority': 5, 'action': 'Monitor and self-care'}
    }
    
    def triage_symptoms(self, analysis: SymptomAnalysis) -> Dict:
        """Perform medical triage based on symptom analysis"""
        
        if analysis.urgency_score >= 0.8:
            level = 'emergency'
        elif analysis.urgency_score >= 0.6:
            level = 'urgent'
        elif analysis.urgency_score >= 0.4:
            level = 'semi_urgent'
        elif analysis.urgency_score >= 0.2:
            level = 'routine'
        else:
            level = 'self_care'
            
        return {
            'triage_level': level,
            'priority': self.TRIAGE_LEVELS[level]['priority'],
            'recommended_action': self.TRIAGE_LEVELS[level]['action'],
            'color_code': self.TRIAGE_LEVELS[level]['color'],
            'urgency_score': analysis.urgency_score
        }
