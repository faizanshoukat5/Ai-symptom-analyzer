# PythonAnywhere Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### 1. **Prepare Your PythonAnywhere Account**
- Sign up at [PythonAnywhere.com](https://www.pythonanywhere.com)
- Choose a plan (Free tier has limitations, but works for testing)
- Note your username (you'll need it for paths)

### 2. **Upload Your Files**
#### Option A: Git Clone (Recommended)
```bash
# In PythonAnywhere Bash console
git clone https://github.com/yourusername/your-repo.git symptom-checker-backend
cd symptom-checker-backend/backend
```

#### Option B: File Upload
- Use PythonAnywhere's file manager
- Upload these files to `/home/yourusername/symptom-checker-backend/`:
  - `main_pythonanywhere.py`
  - `requirements_pa.txt`
  - `.env_pythonanywhere` (rename to `.env`)
  - `wsgi.py`

### 3. **Set Up Python Environment**
```bash
# In PythonAnywhere Bash console
cd /home/yourusername/symptom-checker-backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements_pa.txt
```

### 4. **Configure Environment Variables**
- Copy `.env_pythonanywhere` to `.env`
- Update the file with your actual API keys
- Make sure paths are correct for your username

### 5. **Set Up Web App**
1. Go to PythonAnywhere Dashboard → Web
2. Click "Add a new web app"
3. Choose "Manual configuration"
4. Select Python 3.10
5. Set the following:

**Source code:** `/home/yourusername/symptom-checker-backend`
**Working directory:** `/home/yourusername/symptom-checker-backend`
**WSGI configuration file:** `/var/www/yourusername_pythonanywhere_com_wsgi.py`

### 6. **Configure WSGI File**
Edit `/var/www/yourusername_pythonanywhere_com_wsgi.py`:
```python
import sys
import os
from dotenv import load_dotenv

# Add your project directory to Python path
project_home = '/home/yourusername/symptom-checker-backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Load environment variables
load_dotenv(os.path.join(project_home, '.env'))

# Import your FastAPI app
from main_pythonanywhere import app

# WSGI application
application = app
```

### 7. **Set Up Virtual Environment**
In the Web tab:
- **Virtualenv:** `/home/yourusername/symptom-checker-backend/venv`

### 8. **Configure Static Files (Optional)**
- **URL:** `/static/`
- **Directory:** `/home/yourusername/symptom-checker-backend/static/`

### 9. **Enable HTTPS**
- Go to Web tab → Security
- Enable "Force HTTPS"

### 10. **Test Your Deployment**
1. Click "Reload" in the Web tab
2. Visit your app at: `https://yourusername.pythonanywhere.com`
3. Test endpoints:
   - `GET /health` - Health check
   - `POST /analyze-symptoms` - Symptom analysis

## 🔧 **Files You Need:**

### `main_pythonanywhere.py`
✅ Already created - Optimized FastAPI app

### `requirements_pa.txt`
✅ Already created - Lightweight dependencies

### `.env`
✅ Template created - Add your API keys

### `wsgi.py`
✅ Already created - WSGI configuration

## 📋 **Important Notes:**

### **Free Tier Limitations:**
- CPU seconds limit (resets daily)
- 512MB disk space
- Limited outbound internet access
- 1 web app only

### **Paid Tier Benefits:**
- More CPU seconds
- More disk space
- Always-on tasks
- Multiple web apps
- SSH access

### **API Keys:**
- Make sure your ChatAnywhere API key is active
- Test API connectivity in the console first

### **CORS Configuration:**
- Update allowed origins in the code
- Set to your frontend URL: `https://ai-symptom-analyzer.web.app`

## 🐛 **Troubleshooting:**

### **Common Issues:**
1. **Import errors:** Check Python path in WSGI file
2. **Module not found:** Ensure virtual environment is activated
3. **API errors:** Verify environment variables are loaded
4. **CORS issues:** Check allowed origins configuration

### **Debugging:**
- Check error logs in PythonAnywhere Web tab
- Use `print()` statements for debugging
- Test components individually in console

## 🔄 **Update Process:**
1. Upload new files or `git pull`
2. Restart web app from Web tab
3. Clear any caches if needed

## 📊 **Monitor Your App:**
- Check CPU usage in Tasks tab
- Monitor error logs in Web tab
- Set up basic monitoring for uptime

Your backend will be accessible at:
**https://yourusername.pythonanywhere.com**

## 🎯 **Next Steps After Deployment:**
1. Test all endpoints
2. Update frontend API URL to your PythonAnywhere URL
3. Deploy updated frontend
4. Test end-to-end functionality
