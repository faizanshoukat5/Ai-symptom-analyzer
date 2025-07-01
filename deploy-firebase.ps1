#!/usr/bin/env powershell

# Firebase Deployment Script for Medical Symptom Checker
Write-Host "🚀 Starting Firebase deployment..." -ForegroundColor Green

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
    Write-Host "✅ Firebase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Build the frontend
Write-Host "📦 Building frontend..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Blue
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "Your app is live at: https://ai-symptom-analyzer.web.app" -ForegroundColor Cyan
    Write-Host "Backend API: https://us-central1-ai-symptom-analyzer.cloudfunctions.net/api" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
