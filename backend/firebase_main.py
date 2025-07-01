import functions_framework
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import your existing FastAPI app
try:
    from main import app
except ImportError:
    # Fallback if main.py import fails
    app = FastAPI(title="Medical Symptom Checker API")

# Configure CORS for Firebase hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.web.app",
        "https://*.firebaseapp.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Mangum handler for serverless deployment
handler = Mangum(app)

@functions_framework.http
def api(request):
    """Firebase Function entry point for FastAPI app."""
    return handler(request, None)
