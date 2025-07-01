#!/usr/bin/env python3
"""
Setup Script for Medical Symptom Checker Backend
This script helps set up the environment and configuration
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if env_path.exists():
        print("✅ .env file already exists")
        return True
    
    if not env_example_path.exists():
        print("❌ .env.example file not found")
        return False
    
    # Copy template to .env
    with open(env_example_path, 'r') as template:
        content = template.read()
    
    with open(env_path, 'w') as env_file:
        env_file.write(content)
    
    print("✅ Created .env file from template")
    print("📝 Please edit .env file and add your OpenAI API key")
    return True

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import openai
        import dotenv
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e.name}")
        print("Run: pip install -r requirements.txt")
        return False

def validate_env_file():
    """Check if environment variables are set"""
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ .env file not found")
        return False
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    if "your_openai_api_key_here" in content:
        print("⚠️  OpenAI API key not set in .env file")
        print("   Please add your OpenAI API key to the .env file")
        return False
    
    print("✅ Environment configuration looks good")
    return True

def main():
    """Run setup checks and configuration"""
    print("🚀 Medical Symptom Checker Backend Setup")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", create_env_file),
        ("Environment Configuration", validate_env_file),
    ]
    
    all_passed = True
    
    for name, check_func in checks:
        print(f"\n🔍 Checking {name}...")
        if not check_func():
            all_passed = False
    
    print("\n" + "=" * 50)
    
    if all_passed:
        print("🎉 Setup complete! You can now start the server:")
        print("   python start_server.py")
        print("\n📚 API Documentation will be available at:")
        print("   http://localhost:8000/docs")
    else:
        print("⚠️  Setup incomplete. Please address the issues above.")
        print("\n📖 Setup Instructions:")
        print("1. Install Python 3.8+")
        print("2. Run: pip install -r requirements.txt")
        print("3. Get OpenAI API key: https://platform.openai.com/account/api-keys")
        print("4. Add API key to .env file")
        print("5. Run this setup script again")

if __name__ == "__main__":
    main()
