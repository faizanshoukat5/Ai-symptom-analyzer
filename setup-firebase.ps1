#!/usr/bin/env powershell

# Firebase Setup Script for Medical Symptom Checker
Write-Host "🔧 Setting up Firebase for Medical Symptom Checker..." -ForegroundColor Green

# Step 1: Check Firebase CLI
try {
    firebase --version | Out-Null
    Write-Host "✅ Firebase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Step 2: Login to Firebase
Write-Host "🔐 Logging into Firebase..." -ForegroundColor Blue
firebase login

# Step 3: Initialize Firebase project
Write-Host "📋 Please follow these steps in the Firebase initialization:" -ForegroundColor Yellow
Write-Host "1. Select: Hosting, Functions, Firestore" -ForegroundColor White
Write-Host "2. Choose 'Use an existing project' or 'Create a new project'" -ForegroundColor White
Write-Host "3. For Hosting: public directory = 'dist', single-page app = 'Yes'" -ForegroundColor White
Write-Host "4. For Functions: language = 'Python', source directory = 'backend'" -ForegroundColor White
Write-Host "5. For Firestore: use default file names" -ForegroundColor White

firebase init

# Step 4: Set environment variables
Write-Host "🔑 Setting up environment variables..." -ForegroundColor Blue
Write-Host "Please set your OpenAI API key:" -ForegroundColor Yellow
$apiKey = Read-Host "Enter your OpenAI API key"

cd backend
firebase functions:config:set openai.key="$apiKey"
firebase functions:config:set app.secret="ai-symptom-analyzer-secret-2025"
firebase functions:config:set app.cors_origins="https://ai-symptom-analyzer.web.app"

Write-Host "✅ Firebase setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run firebase:deploy' to deploy your app" -ForegroundColor White
Write-Host "2. Or run './deploy-firebase.ps1' for automated deployment" -ForegroundColor White
