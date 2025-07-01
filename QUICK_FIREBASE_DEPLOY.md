# 🚀 Quick Firebase Deployment Guide

## Your Project Configuration ✅

**Project ID:** `ai-symptom-analyzer`
**Firebase Config:** Already integrated with environment variables

## ⚡ Quick Deploy (3 Steps)

### Step 1: Initialize Firebase
```powershell
# Login to Firebase
firebase login

# Initialize project (select your existing project)
firebase use ai-symptom-analyzer
```

### Step 2: Set Environment Variables
```powershell
# Set your OpenAI API key
$apiKey = Read-Host "Enter your OpenAI API key"
firebase functions:config:set openai.key="$apiKey"

# Set other configs
firebase functions:config:set app.secret="ai-symptom-analyzer-secret-2025"
firebase functions:config:set app.cors_origins="https://ai-symptom-analyzer.web.app"
```

### Step 3: Deploy
```powershell
# Build and deploy everything
npm run build
firebase deploy
```

## 🎯 Your Live URLs

After deployment, your app will be available at:
- **Frontend:** https://ai-symptom-analyzer.web.app
- **API:** https://us-central1-ai-symptom-analyzer.cloudfunctions.net/api

## 🔧 Firebase Features Ready to Use

### 1. Firestore Database
Your app can now save symptom analyses to the cloud:
```typescript
import { useFirebaseSymptoms } from './hooks/useFirebaseSymptoms';

// In your component
const { saveSymptomAnalysis, fetchSymptomHistory } = useFirebaseSymptoms();

// Save analysis
await saveSymptomAnalysis({
  symptoms: ['headache', 'fever'],
  analysis: 'AI analysis result...'
});
```

### 2. Environment Variables
All Firebase config is loaded from environment variables:
- ✅ Secure API keys
- ✅ Different configs for dev/prod
- ✅ Easy to update

### 3. CORS Configuration
Backend automatically allows requests from your frontend domain.

## 📊 What's Included

- ✅ React frontend hosting
- ✅ FastAPI backend as Cloud Functions
- ✅ Firestore database for data storage
- ✅ Automatic SSL certificates
- ✅ Global CDN for fast loading
- ✅ Environment-based configuration

## 🛠️ Useful Commands

```powershell
# View logs
firebase functions:log

# Deploy only frontend
firebase deploy --only hosting

# Deploy only backend
firebase deploy --only functions

# Test locally
firebase emulators:start
```

## 🆘 Troubleshooting

**Function deployment fails?**
```powershell
cd backend
pip install -r requirements.txt
cd ..
firebase deploy --only functions
```

**CORS errors?**
```powershell
firebase functions:config:get
# Verify cors_origins is set correctly
```

**Need to update API key?**
```powershell
firebase functions:config:set openai.key="your-new-key"
firebase deploy --only functions
```

---

**Ready to deploy?** Run the commands above to get your Medical Symptom Checker live on Firebase! 🚀
