# 🚀 Live Deployment Guide for Medical Symptom Checker

## Quick Start - Recommended Option

### **Option 1: Vercel + Railway (Easiest)**

#### Step 1: Deploy Backend to Railway
1. **Create Railway Account:** Go to [railway.app](https://railway.app) and sign up
2. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `/backend`
3. **Configure Environment Variables:**
   ```
   OPENAI_API_KEY=your-openai-key
   DATABASE_URL=postgresql://... (Railway provides this)
   CORS_ORIGINS=https://your-app.vercel.app
   PORT=8000
   ```
4. **Deploy** - Railway will automatically build and deploy

#### Step 2: Deploy Frontend to Vercel
1. **Create Vercel Account:** Go to [vercel.com](https://vercel.com) and sign up
2. **Import Project:**
   - Click "New Project"
   - Import from GitHub
   - Select your repository
3. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   VITE_ENVIRONMENT=production
   ```
5. **Deploy** - Vercel will build and deploy automatically

---

## Alternative Options

### **Option 2: Netlify + Heroku**

#### Backend (Heroku):
1. Create Heroku account and install Heroku CLI
2. In your backend folder:
   ```bash
   cd backend
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   heroku config:set OPENAI_API_KEY=your-key
   git subtree push --prefix backend heroku main
   ```

#### Frontend (Netlify):
1. Build your frontend: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Set environment variable: `VITE_API_URL=https://your-heroku-app.herokuapp.com`

### **Option 3: DigitalOcean App Platform**
1. Create DigitalOcean account
2. Use the provided `app.yaml` configuration
3. Connect your GitHub repo
4. DigitalOcean will handle both frontend and backend

### **Option 4: Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or deploy to any cloud provider that supports Docker
```

---

## Environment Variables Setup

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend-url
VITE_ENVIRONMENT=production
```

### Backend (.env)
```bash
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=your-database-connection-string
CORS_ORIGINS=https://your-frontend-domain
SECRET_KEY=your-secret-key
PORT=8000
```

---

## Domain Setup (Optional)

### Custom Domain:
1. **Buy a domain** from any registrar (Namecheap, GoDaddy, etc.)
2. **Configure DNS:**
   - Point your domain to your hosting provider
   - Add CNAME records as instructed by your host
3. **SSL Certificate** will be automatically provided by most hosts

---

## Pre-Deployment Checklist

- [ ] OpenAI API key obtained and added to environment variables
- [ ] Database connection string configured
- [ ] CORS origins updated with your frontend domain
- [ ] Frontend API URL updated to point to backend
- [ ] All dependencies listed in requirements.txt/package.json
- [ ] Environment variables set on hosting platform

---

## Cost Estimates

| Option | Frontend | Backend + DB | Total/Month |
|--------|----------|--------------|-------------|
| Vercel + Railway | Free | $5-20 | $5-20 |
| Netlify + Heroku | Free | $7-25 | $7-25 |
| DigitalOcean | - | $12-25 | $12-25 |
| AWS/GCP/Azure | $2-10 | $10-50 | $12-60 |

---

## Troubleshooting

### Common Issues:
1. **CORS Errors:** Update CORS_ORIGINS in backend environment
2. **API Connection Failed:** Check VITE_API_URL in frontend
3. **Build Failures:** Ensure all dependencies are in package.json/requirements.txt
4. **OpenAI API Errors:** Verify API key and billing status

### Support:
- Check deployment logs on your hosting platform
- Verify environment variables are set correctly
- Test API endpoints directly before frontend deployment

---

## Next Steps After Deployment

1. **Monitor Usage:** Set up logging and monitoring
2. **Set Up Analytics:** Add Google Analytics or similar
3. **Custom Domain:** Configure your own domain name
4. **SSL Certificate:** Ensure HTTPS is enabled
5. **Backup Strategy:** Set up regular database backups
6. **Performance Monitoring:** Monitor API response times

---

## **Firebase Deployment (Full-Stack Solution)**

Firebase is Google's comprehensive app development platform that provides hosting, serverless functions, and database services. Perfect for React + FastAPI applications.

### **Prerequisites**
- Google account
- Firebase CLI installed globally
- Node.js 18+ and Python 3.11+

### **Step 1: Firebase Project Setup**

1. **Create Firebase Project:**
   ```powershell
   # Login to Firebase
   firebase login
   
   # Create new project (or use Firebase Console)
   firebase projects:create medical-symptom-checker
   ```

2. **Initialize Firebase in your project:**
   ```powershell
   cd "d:\Medical Symptom Checker\symptom-checker"
   firebase init
   ```
   
   **Select these options:**
   - ✅ Hosting: Configure files for Firebase Hosting
   - ✅ Functions: Configure Cloud Functions
   - ✅ Firestore: Configure security rules and indexes
   
   **Configuration:**
   - Use existing project: `medical-symptom-checker`
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Functions language: `Python`
   - Functions source directory: `backend`

### **Step 2: Environment Variables Setup**

1. **Set Firebase environment variables:**
   ```powershell
   # Navigate to backend directory
   cd backend
   
   # Set environment variables for Firebase Functions
   firebase functions:config:set openai.key="your-openai-api-key"
   firebase functions:config:set app.secret="your-secret-key"
   firebase functions:config:set app.cors_origins="https://medical-symptom-checker.web.app"
   ```

2. **Create local environment file:**
   Create `backend\.env` with:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   SECRET_KEY=your-secret-key
   CORS_ORIGINS=https://medical-symptom-checker.web.app
   FIRESTORE_PROJECT_ID=medical-symptom-checker
   ```

### **Step 3: Deploy to Firebase**

1. **Build and deploy everything:**
   ```powershell
   # Build frontend and deploy both hosting and functions
   npm run firebase:deploy
   ```

2. **Or deploy separately:**
   ```powershell
   # Deploy only frontend
   npm run firebase:deploy:hosting
   
   # Deploy only backend functions
   npm run firebase:deploy:functions
   ```

### **Step 4: Configure Your App**

1. **Update API endpoints in your React app:**
   - The backend will be available at: `https://us-central1-medical-symptom-checker.cloudfunctions.net/api`
   - Frontend will be at: `https://medical-symptom-checker.web.app`

2. **Test your deployment:**
   ```powershell
   # Test locally first
   npm run firebase:serve
   ```

### **Firebase Services Used:**

1. **Firebase Hosting** - Frontend React app
   - Global CDN
   - SSL certificate included
   - Custom domain support

2. **Cloud Functions** - Backend FastAPI
   - Serverless Python runtime
   - Auto-scaling
   - Pay-per-use pricing

3. **Firestore Database** - Data storage
   - NoSQL document database
   - Real-time updates
   - Offline support

### **Cost Estimates (Firebase):**
- **Spark Plan (Free):**
  - Hosting: 10GB storage, 10GB/month transfer
  - Functions: 125K invocations/month
  - Firestore: 1GB storage, 50K reads/writes per day
  
- **Blaze Plan (Pay-as-you-go):**
  - After free tier limits
  - Functions: $0.40 per million invocations
  - Firestore: $0.18 per 100K operations

### **Advantages of Firebase:**
- ✅ Integrated full-stack solution
- ✅ Automatic HTTPS and SSL
- ✅ Global CDN for fast loading
- ✅ Automatic scaling
- ✅ Built-in monitoring and analytics
- ✅ Easy environment management
- ✅ One command deployment

### **Firebase Deployment Commands:**
```powershell
# Initial setup
firebase login
firebase init

# Deploy everything
npm run firebase:deploy

# Deploy only frontend
npm run firebase:deploy:hosting

# Deploy only backend
npm run firebase:deploy:functions

# Test locally
npm run firebase:serve

# View logs
firebase functions:log

# Check project info
firebase projects:list
```

---

## Firebase vs Other Options Comparison

| Feature | Firebase | Vercel + Railway | Netlify + Heroku |
|---------|----------|------------------|------------------|
| Setup Complexity | Medium | Easy | Easy |
| Full-Stack Integration | Excellent | Good | Good |
| Database Included | ✅ Firestore | ❌ Separate | ❌ Separate |
| Serverless Functions | ✅ Native | ❌ Separate | ❌ Separate |
| Free Tier | Generous | Limited | Limited |
| Scaling | Automatic | Manual | Manual |
| Monthly Cost | $0-25 | $5-30 | $7-35 |

**Recommendation:** Use Firebase if you want a fully integrated Google Cloud solution with excellent scaling and monitoring capabilities.
