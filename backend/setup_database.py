"""
Database setup and initialization script for SymptomAI
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from user_management import Base, User, SymptomReport, MedicalHistory

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./symptomai.db")

def create_database():
    """Create database tables"""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

def get_db_session():
    """Get database session"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def seed_sample_data():
    """Seed database with sample data for testing"""
    db = get_db_session()
    
    try:
        # Create sample user
        sample_user = User(
            age=30,
            gender="male",
            data_retention_days=30,
            analytics_consent=True
        )
        
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        
        # Create sample symptom report
        sample_report = SymptomReport(
            user_id=sample_user.id,
            symptom_description="I have been experiencing headaches and fatigue for the past few days",
            ai_condition="Possible tension headache",
            ai_severity="Medium",
            ai_confidence=0.75,
            urgency_score=0.4,
            triage_level="routine",
            analysis_data={
                "primary_symptoms": ["headache", "fatigue"],
                "body_systems": ["neurological"],
                "recommendations": ["Rest", "Stay hydrated", "Monitor symptoms"]
            }
        )
        
        db.add(sample_report)
        db.commit()
        
        print("✅ Sample data seeded successfully")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

def cleanup_old_data():
    """Clean up old user data based on retention policies"""
    from user_management import UserManager
    
    db = get_db_session()
    try:
        user_manager = UserManager(db)
        user_manager.clean_expired_data()
        print("✅ Old data cleaned up successfully")
    except Exception as e:
        print(f"❌ Error cleaning up data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Setting up SymptomAI database...")
    
    # Create tables
    create_database()
    
    # Seed sample data (optional)
    import sys
    if "--seed" in sys.argv:
        seed_sample_data()
    
    # Clean up old data (optional)
    if "--cleanup" in sys.argv:
        cleanup_old_data()
    
    print("✅ Database setup complete!")
