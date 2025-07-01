"""
Advanced API endpoints for enhanced medical symptom checker
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import asyncio
from datetime import datetime, timedelta
import json

from .medical_ai_enhancements import AdvancedSymptomAnalyzer, SymptomTriageSystem
from .user_management import UserManager, SymptomHistoryAnalyzer, get_db
from .main import app

# Initialize advanced components
advanced_analyzer = AdvancedSymptomAnalyzer()
triage_system = SymptomTriageSystem()

@app.post("/api/analyze-symptoms-advanced")
async def analyze_symptoms_advanced(
    symptom_data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Advanced symptom analysis with enhanced AI capabilities
    """
    try:
        # Perform advanced analysis
        analysis = advanced_analyzer.analyze_symptoms_advanced(
            symptom_data['symptoms'],
            symptom_data.get('age'),
            symptom_data.get('gender')
        )
        
        # Perform medical triage
        triage = triage_system.triage_symptoms(analysis)
        
        # Get user context if available
        user_context = None
        if 'user_uuid' in symptom_data:
            user_manager = UserManager(db)
            user = user_manager.get_user_by_uuid(symptom_data['user_uuid'])
            if user:
                history_analyzer = SymptomHistoryAnalyzer(db)
                user_context = history_analyzer.analyze_symptom_patterns(user.id)
        
        # Enhanced response with advanced features
        response = {
            "basic_analysis": {
                "condition": "Advanced AI Analysis",
                "severity": map_triage_to_severity(triage['triage_level']),
                "advice": generate_advanced_advice(analysis, triage),
                "confidence": int(analysis.confidence * 100)
            },
            "advanced_analysis": {
                "primary_symptoms": analysis.primary_symptoms,
                "secondary_symptoms": analysis.secondary_symptoms,
                "body_systems": analysis.body_systems,
                "urgency_score": analysis.urgency_score,
                "severity_indicators": analysis.severity_indicators,
                "duration": analysis.duration
            },
            "triage_assessment": {
                "level": triage['triage_level'],
                "priority": triage['priority'],
                "recommended_action": triage['recommended_action'],
                "color_code": triage['color_code']
            },
            "user_context": user_context,
            "recommendations": generate_detailed_recommendations(analysis, triage),
            "when_to_seek_help": generate_specific_help_criteria(triage),
            "disclaimer": "This advanced analysis is for informational purposes only."
        }
        
        # Save analysis in background
        if 'user_uuid' in symptom_data:
            background_tasks.add_task(
                save_analysis_to_history,
                symptom_data['user_uuid'],
                symptom_data['symptoms'],
                response,
                db
            )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced analysis failed: {str(e)}")

@app.get("/api/health-dashboard/{user_uuid}")
async def get_health_dashboard(user_uuid: str, db: Session = Depends(get_db)):
    """
    Get comprehensive health dashboard data for user
    """
    try:
        user_manager = UserManager(db)
        user = user_manager.get_user_by_uuid(user_uuid)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        history_analyzer = SymptomHistoryAnalyzer(db)
        
        # Get recent symptom reports
        recent_reports = history_analyzer.get_user_symptom_history(user.id, days=30)
        
        # Generate metrics
        metrics = []
        for report in recent_reports[-10:]:  # Last 10 reports
            metrics.append({
                "date": report.reported_at.strftime("%Y-%m-%d"),
                "severity": severity_to_number(report.ai_severity),
                "urgency": report.urgency_score,
                "confidence": report.ai_confidence
            })
        
        # Analyze patterns
        pattern_analysis = history_analyzer.analyze_symptom_patterns(user.id)
        
        # Generate insights
        insights = generate_health_insights(pattern_analysis, recent_reports)
        
        return {
            "metrics": metrics,
            "patterns": pattern_analysis.get("common_symptoms", []),
            "insights": insights,
            "summary": {
                "total_reports": len(recent_reports),
                "avg_severity": sum(severity_to_number(r.ai_severity) for r in recent_reports) / len(recent_reports) if recent_reports else 0,
                "trend": pattern_analysis.get("severity_trend", {}).get("trend", "stable")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard data failed: {str(e)}")

@app.post("/api/symptom-prediction")
async def predict_symptom_progression(
    prediction_data: dict,
    db: Session = Depends(get_db)
):
    """
    Predict symptom progression based on historical data
    """
    try:
        user_uuid = prediction_data.get('user_uuid')
        if not user_uuid:
            raise HTTPException(status_code=400, detail="User UUID required")
        
        user_manager = UserManager(db)
        user = user_manager.get_user_by_uuid(user_uuid)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        history_analyzer = SymptomHistoryAnalyzer(db)
        recent_reports = history_analyzer.get_user_symptom_history(user.id, days=90)
        
        if len(recent_reports) < 3:
            return {
                "prediction": "insufficient_data",
                "message": "Need at least 3 symptom reports for prediction",
                "confidence": 0
            }
        
        # Simple trend analysis (can be enhanced with ML models)
        severity_scores = [severity_to_number(r.ai_severity) for r in recent_reports]
        urgency_scores = [r.urgency_score for r in recent_reports]
        
        # Calculate trends
        severity_trend = calculate_trend(severity_scores)
        urgency_trend = calculate_trend(urgency_scores)
        
        # Generate prediction
        prediction = generate_symptom_prediction(severity_trend, urgency_trend, recent_reports)
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/emergency-assessment")
async def emergency_assessment(assessment_data: dict):
    """
    Rapid emergency assessment for critical symptoms
    """
    try:
        symptoms = assessment_data.get('symptoms', '').lower()
        
        # Emergency red flags
        emergency_keywords = [
            'chest pain', 'difficulty breathing', 'can\'t breathe',
            'severe headache', 'loss of consciousness', 'unconscious',
            'severe bleeding', 'poisoning', 'overdose',
            'severe allergic reaction', 'anaphylaxis',
            'stroke symptoms', 'heart attack', 'severe abdominal pain'
        ]
        
        # Check for emergency indicators
        emergency_score = 0
        triggered_keywords = []
        
        for keyword in emergency_keywords:
            if keyword in symptoms:
                emergency_score += 1
                triggered_keywords.append(keyword)
        
        # Additional severity indicators
        severity_indicators = ['severe', 'intense', 'excruciating', 'unbearable', 'sudden']
        for indicator in severity_indicators:
            if indicator in symptoms:
                emergency_score += 0.5
        
        # Assessment result
        if emergency_score >= 1:
            assessment_level = "EMERGENCY"
            action = "CALL 911 IMMEDIATELY"
            color = "red"
        elif emergency_score >= 0.5:
            assessment_level = "URGENT"
            action = "Seek immediate medical attention"
            color = "orange"
        else:
            assessment_level = "NON_EMERGENCY"
            action = "Continue with regular symptom checker"
            color = "green"
        
        return {
            "assessment_level": assessment_level,
            "emergency_score": emergency_score,
            "triggered_keywords": triggered_keywords,
            "recommended_action": action,
            "color_code": color,
            "emergency_numbers": {
                "emergency": "911",
                "poison_control": "1-800-222-1222",
                "crisis_text": "Text HOME to 741741"
            },
            "immediate_steps": generate_emergency_steps(assessment_level)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency assessment failed: {str(e)}")

@app.get("/api/health-tips")
async def get_personalized_health_tips(
    user_uuid: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get personalized health tips based on user history
    """
    try:
        general_tips = [
            {
                "category": "Prevention",
                "title": "Stay Hydrated",
                "description": "Drink 8-10 glasses of water daily to maintain good health",
                "icon": "💧"
            },
            {
                "category": "Wellness",
                "title": "Regular Exercise",
                "description": "30 minutes of moderate activity most days of the week",
                "icon": "🏃‍♂️"
            },
            {
                "category": "Sleep",
                "title": "Quality Sleep",
                "description": "Aim for 7-9 hours of quality sleep each night",
                "icon": "😴"
            }
        ]
        
        personalized_tips = []
        
        if user_uuid:
            user_manager = UserManager(db)
            user = user_manager.get_user_by_uuid(user_uuid)
            
            if user:
                history_analyzer = SymptomHistoryAnalyzer(db)
                pattern_analysis = history_analyzer.analyze_symptom_patterns(user.id)
                
                # Generate personalized tips based on patterns
                personalized_tips = generate_personalized_tips(pattern_analysis)
        
        return {
            "general_tips": general_tips,
            "personalized_tips": personalized_tips,
            "disclaimer": "These tips are for general wellness and should not replace medical advice"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health tips failed: {str(e)}")

@app.post("/api/symptom-feedback")
async def submit_symptom_feedback(
    feedback_data: dict,
    db: Session = Depends(get_db)
):
    """
    Submit feedback on symptom analysis accuracy
    """
    try:
        report_id = feedback_data.get('report_id')
        feedback = feedback_data.get('feedback')
        accuracy_rating = feedback_data.get('accuracy_rating')  # 1-5 scale
        
        # Update symptom report with feedback
        report = db.query(SymptomReport).filter(SymptomReport.id == report_id).first()
        
        if report:
            report.user_feedback = feedback
            report.accuracy_rating = accuracy_rating
            db.commit()
            
            return {
                "status": "success",
                "message": "Feedback recorded successfully",
                "report_id": report_id
            }
        else:
            raise HTTPException(status_code=404, detail="Report not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback submission failed: {str(e)}")

# Helper functions
def map_triage_to_severity(triage_level: str) -> str:
    """Map triage level to standard severity"""
    mapping = {
        'emergency': 'Critical',
        'urgent': 'High', 
        'semi_urgent': 'Medium',
        'routine': 'Low',
        'self_care': 'Low'
    }
    return mapping.get(triage_level, 'Medium')

def severity_to_number(severity: str) -> float:
    """Convert severity string to number"""
    mapping = {
        'Low': 1.0,
        'Medium': 2.0, 
        'High': 3.0,
        'Critical': 4.0
    }
    return mapping.get(severity, 2.0)

def calculate_trend(scores: List[float]) -> Dict:
    """Calculate trend from score list"""
    if len(scores) < 2:
        return {"trend": "insufficient_data"}
    
    recent_avg = sum(scores[-3:]) / len(scores[-3:])
    older_avg = sum(scores[:-3]) / len(scores[:-3]) if len(scores) > 3 else scores[0]
    
    if recent_avg > older_avg + 0.3:
        return {"trend": "worsening", "change": recent_avg - older_avg}
    elif recent_avg < older_avg - 0.3:
        return {"trend": "improving", "change": older_avg - recent_avg}
    else:
        return {"trend": "stable", "change": abs(recent_avg - older_avg)}

def generate_advanced_advice(analysis, triage) -> str:
    """Generate advanced medical advice"""
    base_advice = f"Based on advanced AI analysis of your symptoms affecting {', '.join(analysis.body_systems) if analysis.body_systems else 'multiple systems'}, "
    
    if triage['triage_level'] == 'emergency':
        return base_advice + "seek immediate emergency medical attention. This appears to be a critical situation requiring urgent care."
    elif triage['triage_level'] == 'urgent':
        return base_advice + "you should see a healthcare provider within 24 hours. Your symptoms warrant prompt medical evaluation."
    else:
        return base_advice + "monitor your symptoms and consider consulting with a healthcare provider for proper evaluation."

def generate_detailed_recommendations(analysis, triage) -> List[str]:
    """Generate detailed recommendations"""
    recommendations = []
    
    # System-specific recommendations
    if 'respiratory' in analysis.body_systems:
        recommendations.append("Monitor your breathing and avoid known respiratory irritants")
    if 'cardiovascular' in analysis.body_systems:
        recommendations.append("Rest and avoid strenuous activity")
    if 'neurological' in analysis.body_systems:
        recommendations.append("Ensure adequate rest and avoid bright lights if experiencing headaches")
    
    # Severity-based recommendations
    if triage['triage_level'] in ['emergency', 'urgent']:
        recommendations.append("Do not delay seeking medical attention")
        recommendations.append("Have someone accompany you to medical appointments if possible")
    
    recommendations.append("Keep a detailed record of your symptoms")
    recommendations.append("Stay hydrated and get adequate rest")
    
    return recommendations

def generate_specific_help_criteria(triage) -> str:
    """Generate specific criteria for when to seek help"""
    if triage['triage_level'] == 'emergency':
        return "Seek immediate emergency care if symptoms worsen at all, or call 911 if experiencing severe difficulty breathing, chest pain, or loss of consciousness."
    elif triage['triage_level'] == 'urgent':
        return "Seek medical attention within 24 hours, or sooner if symptoms significantly worsen or new concerning symptoms develop."
    else:
        return "Seek medical attention if symptoms persist for more than a few days, worsen significantly, or if you develop new concerning symptoms."

async def save_analysis_to_history(user_uuid: str, symptoms: str, analysis: dict, db: Session):
    """Save analysis to user history (background task)"""
    try:
        user_manager = UserManager(db)
        user = user_manager.get_user_by_uuid(user_uuid)
        
        if user:
            report = SymptomReport(
                user_id=user.id,
                symptom_description=symptoms,
                ai_condition=analysis['basic_analysis']['condition'],
                ai_severity=analysis['basic_analysis']['severity'],
                ai_confidence=analysis['basic_analysis']['confidence'] / 100,
                urgency_score=analysis['advanced_analysis']['urgency_score'],
                triage_level=analysis['triage_assessment']['level'],
                analysis_data=analysis
            )
            
            db.add(report)
            db.commit()
    except Exception as e:
        print(f"Failed to save analysis to history: {e}")

def generate_health_insights(pattern_analysis: Dict, recent_reports: List) -> List[Dict]:
    """Generate health insights from pattern analysis"""
    insights = []
    
    # Trend insights
    if pattern_analysis.get("severity_trend", {}).get("trend") == "worsening":
        insights.append({
            "type": "warning",
            "title": "Worsening Symptom Trend",
            "description": "Your symptoms appear to be getting more severe over time. Consider scheduling a medical appointment.",
            "actionRequired": True
        })
    elif pattern_analysis.get("severity_trend", {}).get("trend") == "improving":
        insights.append({
            "type": "success", 
            "title": "Improving Health Trend",
            "description": "Your symptoms show signs of improvement. Continue current care and monitoring.",
            "actionRequired": False
        })
    
    # Frequency insights  
    if pattern_analysis.get("frequency_analysis", {}).get("frequency") == "very_frequent":
        insights.append({
            "type": "warning",
            "title": "Frequent Symptom Reports",
            "description": "You're reporting symptoms very frequently. This pattern may indicate an underlying condition.",
            "actionRequired": True
        })
    
    # Pattern insights
    common_symptoms = pattern_analysis.get("common_symptoms", [])
    if common_symptoms:
        top_symptom = common_symptoms[0]["symptom"]
        insights.append({
            "type": "info",
            "title": f"Recurring Symptom: {top_symptom}",
            "description": f"You frequently report '{top_symptom}'. Consider discussing this pattern with a healthcare provider.",
            "actionRequired": False
        })
    
    return insights

def generate_symptom_prediction(severity_trend: Dict, urgency_trend: Dict, recent_reports: List) -> Dict:
    """Generate symptom progression prediction"""
    if severity_trend["trend"] == "worsening" and urgency_trend["trend"] == "worsening":
        return {
            "prediction": "deteriorating",
            "message": "Symptoms may continue to worsen. Recommend medical consultation.",
            "confidence": 0.75,
            "recommended_action": "Schedule medical appointment within 1-2 days"
        }
    elif severity_trend["trend"] == "improving" and urgency_trend["trend"] == "improving":
        return {
            "prediction": "improving", 
            "message": "Symptoms appear to be improving. Continue current care.",
            "confidence": 0.70,
            "recommended_action": "Continue monitoring and current care plan"
        }
    else:
        return {
            "prediction": "stable",
            "message": "Symptoms appear stable. Monitor for changes.",
            "confidence": 0.60,
            "recommended_action": "Continue monitoring symptoms"
        }

def generate_emergency_steps(assessment_level: str) -> List[str]:
    """Generate immediate emergency steps"""
    if assessment_level == "EMERGENCY":
        return [
            "Call 911 immediately",
            "Stay calm and follow dispatcher instructions", 
            "Do not drive yourself to hospital",
            "Have someone stay with you until help arrives",
            "Prepare list of current medications"
        ]
    elif assessment_level == "URGENT":
        return [
            "Seek immediate medical attention",
            "Go to emergency room or urgent care",
            "Have someone drive you if possible",
            "Bring list of medications and medical history",
            "Call ahead to medical facility if possible"
        ]
    else:
        return [
            "Continue with detailed symptom analysis",
            "Monitor symptoms closely",
            "Seek medical advice if symptoms worsen",
            "Keep record of symptom progression"
        ]

def generate_personalized_tips(pattern_analysis: Dict) -> List[Dict]:
    """Generate personalized health tips"""
    tips = []
    
    common_symptoms = pattern_analysis.get("common_symptoms", [])
    
    if any("headache" in symptom["symptom"].lower() for symptom in common_symptoms):
        tips.append({
            "category": "Headache Management",
            "title": "Stay Hydrated",
            "description": "Dehydration is a common headache trigger. Ensure adequate water intake.",
            "icon": "💧"
        })
    
    if any("stress" in symptom["symptom"].lower() or "anxiety" in symptom["symptom"].lower() for symptom in common_symptoms):
        tips.append({
            "category": "Stress Management", 
            "title": "Practice Relaxation",
            "description": "Try deep breathing exercises or meditation to manage stress levels.",
            "icon": "🧘‍♀️"
        })
    
    return tips
