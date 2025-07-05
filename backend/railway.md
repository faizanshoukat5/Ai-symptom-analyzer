# Railway Configuration for Medical Symptom Checker Backend
# This file configures your Railway deployment

# Railway automatically detects Python and runs your app
# Make sure your main application file is main_simplified.py

# Environment Variables needed in Railway Dashboard:
# OPENAI_API_KEY=sk-your-actual-openai-key-here
# CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://ai-symptom-analyzer.web.app,https://ai-symptom-analyzer-production.up.railway.app
# DATABASE_URL=sqlite:///./medical_ai.db
# ENVIRONMENT=production
# DEBUG=false

# Railway Start Command (set in Railway Dashboard):
# uvicorn main_simplified:app --host=0.0.0.0 --port=$PORT

# Railway Build Command (optional, Railway auto-detects):
# pip install -r requirements.txt

# Root Directory (set in Railway Dashboard):
# backend
