"""
WSGI configuration for PythonAnywhere deployment
Place this file in your PythonAnywhere /var/www/ directory
"""

import sys
import os
from dotenv import load_dotenv

# Add your project directory to Python path
project_home = '/home/yourusername/symptom-checker-backend'  # Update with your actual path
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Load environment variables
load_dotenv(os.path.join(project_home, '.env'))

# Import your FastAPI app
from main_pythonanywhere import app

# WSGI application
application = app
