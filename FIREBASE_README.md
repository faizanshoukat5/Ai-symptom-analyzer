# 🔥 Firebase Deployment for Medical Symptom Checker

## Quick Start (5 Minutes Setup)

### **Option A: Automatic Setup**
```powershell
# Run the setup script
.\setup-firebase.ps1

# Deploy your app
.\deploy-firebase.ps1
```

### **Option B: Manual Setup**

1. **Install Firebase CLI:**
   ```powershell
   npm install -g firebase-tools
   ```

2. **Login and Initialize:**
   ```powershell
   firebase login
   firebase init
   ```

3. **Deploy:**
   ```powershell
   npm run firebase:deploy
   ```

## 📋 What You Need

### Required:
- ✅ Google account
- ✅ OpenAI API key
- ✅ Node.js 18+ installed
- ✅ Python 3.11+ installed

### Will be created automatically:
- ✅ Firebase project
- ✅ Firestore database
- ✅ Cloud Functions
- ✅ Firebase Hosting
- ✅ SSL certificate

## 🏗️ Architecture

```
Firebase Hosting (Frontend)
    ↓
Cloud Functions (Backend API)
    ↓
Firestore Database (Data Storage)
```

## 📱 URLs After Deployment

- **Frontend:** `https://ai-symptom-analyzer.web.app`
- **Backend API:** `https://us-central1-ai-symptom-analyzer.cloudfunctions.net/api`
- **Firebase Console:** `https://console.firebase.google.com/project/ai-symptom-analyzer`

## 🔧 Environment Variables

The setup script will configure these automatically:
```bash
openai.key = "your-openai-api-key"
app.secret = "ai-symptom-analyzer-secret-2025"
app.cors_origins = "https://ai-symptom-analyzer.web.app"
```

## 💰 Pricing

### Free Tier (Spark Plan):
- **Hosting:** 10GB storage + 10GB/month bandwidth
- **Functions:** 125K invocations/month + 40K GB-seconds
- **Firestore:** 1GB storage + 50K reads + 20K writes per day

**Perfect for:** Development, testing, small applications

### Pay-as-you-go (Blaze Plan):
- **Functions:** $0.40 per 1M invocations after free tier
- **Firestore:** $0.18 per 100K document operations after free tier
- **Hosting:** $0.026 per GB after free tier

**Perfect for:** Production applications with traffic

## 🚀 Deployment Commands

```powershell
# Full deployment (frontend + backend)
npm run firebase:deploy

# Frontend only
npm run firebase:deploy:hosting

# Backend only
npm run firebase:deploy:functions

# Local testing
npm run firebase:serve

# View function logs
firebase functions:log
```

## 🔍 Monitoring & Debugging

1. **Firebase Console:** Monitor usage, performance, and errors
2. **Function Logs:** `firebase functions:log`
3. **Performance Monitoring:** Automatically enabled
4. **Error Reporting:** Built-in error tracking

## 🌐 Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. SSL certificate auto-generated

## 🔄 Updates & Redeploys

```powershell
# After making changes to your code
git add .
git commit -m "Update app"

# Redeploy
npm run firebase:deploy
```

## ❗ Troubleshooting

### Common Issues:

1. **"Firebase project not found"**
   ```powershell
   firebase use --add
   # Select your project
   ```

2. **"Functions deployment failed"**
   ```powershell
   cd backend
   pip install -r requirements.txt
   cd ..
   firebase deploy --only functions
   ```

3. **"CORS errors"**
   - Check that CORS origins are set correctly in Firebase config
   - Verify API URL in frontend environment variables

4. **"OpenAI API errors"**
   ```powershell
   firebase functions:config:get
   # Verify openai.key is set
   ```

### Getting Help:
- **Firebase Console:** Real-time error monitoring
- **Function Logs:** `firebase functions:log`
- **Local Testing:** `firebase emulators:start`

## 🎯 Next Steps After Deployment

1. **Test Your App:** Visit your live URL
2. **Monitor Usage:** Check Firebase Console
3. **Set Up Analytics:** Enable Google Analytics
4. **Configure Alerts:** Set up performance monitoring
5. **Custom Domain:** Add your own domain
6. **Backup Strategy:** Configure Firestore backups

## 📊 Firebase vs Alternatives

| Feature | Firebase | Vercel+Railway | Netlify+Heroku |
|---------|----------|----------------|----------------|
| Setup Time | 5 minutes | 10 minutes | 15 minutes |
| Free Tier | Generous | Limited | Limited |
| Database | ✅ Included | ❌ Separate | ❌ Separate |
| Monitoring | ✅ Built-in | ❌ External | ❌ External |
| Scaling | ✅ Automatic | ❌ Manual | ❌ Manual |

**Why Firebase?**
- 🔥 One platform for everything
- 🚀 Automatic scaling
- 📊 Built-in analytics
- 🛡️ Google-grade security
- 💰 Generous free tier

---

**Ready to deploy?** Run `.\setup-firebase.ps1` to get started!
