#!/usr/bin/env python3
"""
FastAPI Server Startup Script
Run this script to start the Medical Symptom Checker API server
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Start the FastAPI server"""
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8001"))  # Use port 8001 for advanced backend
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting Medical Symptom Checker API")
    print(f"📍 Server will run on: http://{host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🔄 Alternative docs: http://{host}:{port}/redoc")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  WARNING: OPENAI_API_KEY not found in environment variables")
        print("   Please create a .env file with your OpenAI API key")
    
    uvicorn.run(
        "main_advanced_models:app",  # Use the advanced backend
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )

if __name__ == "__main__":
    main()