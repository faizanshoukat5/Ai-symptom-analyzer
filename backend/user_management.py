"""
User Profile and Medical History Management System
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import hashlib
import uuid
from pydantic import BaseModel
import json

Base = declarative_base()

class User(Base):
    """User profile model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    age = Column(Integer)
    gender = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    # Privacy settings
    data_retention_days = Column(Integer, default=30)
    analytics_consent = Column(Boolean, default=False)
    
    # Relationships
    symptom_reports = relationship("SymptomReport", back_populates="user")
    medical_history = relationship("MedicalHistory", back_populates="user")

class SymptomReport(Base):
    """Individual symptom analysis report"""
    __tablename__ = "symptom_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Input data
    symptom_description = Column(Text)
    reported_at = Column(DateTime, default=datetime.utcnow)
    
    # Analysis results
    ai_condition = Column(String)
    ai_severity = Column(String)
    ai_confidence = Column(Float)
    urgency_score = Column(Float)
    triage_level = Column(String)
    
    # Additional data
    analysis_data = Column(JSON)  # Store full analysis
    user_feedback = Column(String)  # User feedback on accuracy
    followed_advice = Column(Boolean)
    
    # Relationships
    user = relationship("User", back_populates="symptom_reports")

class MedicalHistory(Base):
    """User's medical history and conditions"""
    __tablename__ = "medical_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    condition_name = Column(String)
    diagnosed_date = Column(DateTime)
    is_chronic = Column(Boolean, default=False)
    medications = Column(JSON)  # List of medications
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="medical_history")

# Pydantic models for API
class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    data_retention_days: int = 30
    analytics_consent: bool = False

class MedicalHistoryItem(BaseModel):
    condition_name: str
    diagnosed_date: Optional[str] = None
    is_chronic: bool = False
    medications: List[str] = []
    notes: Optional[str] = None

class SymptomReportCreate(BaseModel):
    symptom_description: str
    age: Optional[int] = None
    gender: Optional[str] = None

class SymptomReportResponse(BaseModel):
    id: int
    reported_at: datetime
    symptom_description: str
    ai_condition: str
    ai_severity: str
    ai_confidence: float
    urgency_score: float
    triage_level: str

class UserManager:
    """Manage user profiles and data"""
    
    def __init__(self, db_session):
        self.db = db_session
    
    def create_or_get_user(self, user_data: UserProfile) -> User:
        """Create a new user or return existing anonymous user"""
        # For privacy, we use anonymous users with UUID
        user = User(
            age=user_data.age,
            gender=user_data.gender,
            data_retention_days=user_data.data_retention_days,
            analytics_consent=user_data.analytics_consent
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_user_by_uuid(self, user_uuid: str) -> Optional[User]:
        """Get user by UUID"""
        return self.db.query(User).filter(User.user_uuid == user_uuid).first()
    
    def clean_expired_data(self):
        """Remove expired user data based on retention settings"""
        expired_users = self.db.query(User).filter(
            User.last_active < datetime.utcnow() - timedelta(days=365)
        ).all()
        
        for user in expired_users:
            # Remove user data if retention period exceeded
            retention_cutoff = datetime.utcnow() - timedelta(days=user.data_retention_days)
            
            # Delete old symptom reports
            old_reports = self.db.query(SymptomReport).filter(
                SymptomReport.user_id == user.id,
                SymptomReport.reported_at < retention_cutoff
            ).all()
            
            for report in old_reports:
                self.db.delete(report)
            
            self.db.commit()

class SymptomHistoryAnalyzer:
    """Analyze user's symptom history for patterns"""
    
    def __init__(self, db_session):
        self.db = db_session
    
    def get_user_symptom_history(self, user_id: int, days: int = 30) -> List[SymptomReport]:
        """Get user's recent symptom reports"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return self.db.query(SymptomReport).filter(
            SymptomReport.user_id == user_id,
            SymptomReport.reported_at >= cutoff_date
        ).order_by(SymptomReport.reported_at.desc()).all()
    
    def analyze_symptom_patterns(self, user_id: int) -> Dict:
        """Analyze patterns in user's symptom reports"""
        reports = self.get_user_symptom_history(user_id, days=90)
        
        if not reports:
            return {"pattern_analysis": "No recent symptom history"}
        
        # Analyze patterns
        severity_trend = self._analyze_severity_trend(reports)
        common_symptoms = self._find_common_symptoms(reports)
        frequency_analysis = self._analyze_frequency(reports)
        
        return {
            "total_reports": len(reports),
            "severity_trend": severity_trend,
            "common_symptoms": common_symptoms,
            "frequency_analysis": frequency_analysis,
            "recommendations": self._generate_pattern_recommendations(
                severity_trend, common_symptoms, frequency_analysis
            )
        }
    
    def _analyze_severity_trend(self, reports: List[SymptomReport]) -> Dict:
        """Analyze if symptoms are getting better or worse"""
        if len(reports) < 2:
            return {"trend": "insufficient_data"}
        
        # Sort by date and analyze severity scores
        sorted_reports = sorted(reports, key=lambda x: x.reported_at)
        recent_scores = [r.urgency_score for r in sorted_reports[-5:]]  # Last 5 reports
        older_scores = [r.urgency_score for r in sorted_reports[:-5]]   # Earlier reports
        
        if not older_scores:
            return {"trend": "insufficient_data"}
        
        recent_avg = sum(recent_scores) / len(recent_scores)
        older_avg = sum(older_scores) / len(older_scores)
        
        if recent_avg > older_avg + 0.1:
            return {"trend": "worsening", "change": recent_avg - older_avg}
        elif recent_avg < older_avg - 0.1:
            return {"trend": "improving", "change": older_avg - recent_avg}
        else:
            return {"trend": "stable", "change": abs(recent_avg - older_avg)}
    
    def _find_common_symptoms(self, reports: List[SymptomReport]) -> List[Dict]:
        """Find commonly reported symptoms"""
        symptom_counts = {}
        
        for report in reports:
            # Extract keywords from symptom descriptions
            words = report.symptom_description.lower().split()
            medical_terms = [word for word in words if len(word) > 3]  # Simple filtering
            
            for term in medical_terms:
                symptom_counts[term] = symptom_counts.get(term, 0) + 1
        
        # Return top 5 most common terms
        sorted_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"symptom": term, "frequency": count} for term, count in sorted_symptoms[:5]]
    
    def _analyze_frequency(self, reports: List[SymptomReport]) -> Dict:
        """Analyze reporting frequency"""
        if len(reports) < 2:
            return {"frequency": "single_report"}
        
        # Calculate average days between reports
        sorted_reports = sorted(reports, key=lambda x: x.reported_at)
        intervals = []
        
        for i in range(1, len(sorted_reports)):
            diff = sorted_reports[i].reported_at - sorted_reports[i-1].reported_at
            intervals.append(diff.days)
        
        avg_interval = sum(intervals) / len(intervals)
        
        if avg_interval <= 7:
            return {"frequency": "very_frequent", "avg_days_between": avg_interval}
        elif avg_interval <= 30:
            return {"frequency": "frequent", "avg_days_between": avg_interval}
        else:
            return {"frequency": "occasional", "avg_days_between": avg_interval}
    
    def _generate_pattern_recommendations(self, severity_trend: Dict, common_symptoms: List, frequency: Dict) -> List[str]:
        """Generate recommendations based on patterns"""
        recommendations = []
        
        if severity_trend.get("trend") == "worsening":
            recommendations.append("Your symptoms appear to be worsening over time. Consider scheduling an appointment with a healthcare provider.")
        
        if frequency.get("frequency") == "very_frequent":
            recommendations.append("You're reporting symptoms very frequently. This pattern may indicate an underlying condition that needs medical attention.")
        
        if common_symptoms:
            top_symptom = common_symptoms[0]["symptom"]
            recommendations.append(f"You frequently report '{top_symptom}'. Consider discussing this recurring symptom with a healthcare provider.")
        
        return recommendations or ["Continue monitoring your symptoms and seek medical advice when needed."]

class PrivacyManager:
    """Manage user privacy and data protection"""
    
    @staticmethod
    def anonymize_user_data(user_data: Dict) -> Dict:
        """Anonymize sensitive user data"""
        # Create hash of sensitive data instead of storing directly
        if 'age' in user_data:
            # Group ages into ranges for privacy
            age = user_data['age']
            if age < 18:
                user_data['age_range'] = 'under_18'
            elif age < 30:
                user_data['age_range'] = '18_30'
            elif age < 50:
                user_data['age_range'] = '30_50'
            elif age < 70:
                user_data['age_range'] = '50_70'
            else:
                user_data['age_range'] = 'over_70'
            
            del user_data['age']  # Remove exact age
        
        return user_data
    
    @staticmethod
    def generate_data_export(user_id: int, db_session) -> Dict:
        """Generate user data export for GDPR compliance"""
        user = db_session.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        symptom_reports = db_session.query(SymptomReport).filter(
            SymptomReport.user_id == user_id
        ).all()
        
        return {
            "user_profile": {
                "user_uuid": user.user_uuid,
                "age": user.age,
                "gender": user.gender,
                "created_at": user.created_at.isoformat(),
                "data_retention_days": user.data_retention_days
            },
            "symptom_reports": [
                {
                    "reported_at": report.reported_at.isoformat(),
                    "symptom_description": report.symptom_description,
                    "ai_condition": report.ai_condition,
                    "ai_severity": report.ai_severity,
                    "ai_confidence": report.ai_confidence
                }
                for report in symptom_reports
            ]
        }
