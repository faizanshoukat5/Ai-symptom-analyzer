#!/bin/bash

# Task Manager Setup Script
echo "🚀 Setting up Task Manager Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_color $BLUE "📋 Task Manager - Full Stack Application Setup"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_color $RED "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_color $RED "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_color $GREEN "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_color $RED "❌ npm is not installed."
    exit 1
fi

print_color $GREEN "✅ npm $(npm -v) detected"

# Setup Backend
print_color $BLUE "\n🔧 Setting up Backend..."
cd backend

if [ ! -f "package.json" ]; then
    print_color $RED "❌ Backend package.json not found"
    exit 1
fi

print_color $YELLOW "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_color $RED "❌ Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_color $YELLOW "📝 Creating backend .env file..."
    cp .env.example .env
    print_color $GREEN "✅ Created .env file from .env.example"
    print_color $YELLOW "⚠️  Please edit backend/.env with your MongoDB URI and JWT secret"
else
    print_color $GREEN "✅ .env file already exists"
fi

# Setup Frontend
print_color $BLUE "\n🎨 Setting up Frontend..."
cd ../frontend

if [ ! -f "package.json" ]; then
    print_color $RED "❌ Frontend package.json not found"
    exit 1
fi

print_color $YELLOW "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_color $RED "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_color $YELLOW "📝 Creating frontend .env.local file..."
    cp .env.example .env.local
    print_color $GREEN "✅ Created .env.local file from .env.example"
else
    print_color $GREEN "✅ .env.local file already exists"
fi

# Return to root directory
cd ..

print_color $GREEN "\n🎉 Setup completed successfully!"

print_color $BLUE "\n📋 Next Steps:"
echo "1. Set up your MongoDB database:"
echo "   • Create a MongoDB Atlas account at https://www.mongodb.com/atlas"
echo "   • Create a new cluster and get your connection string"
echo "   • Update backend/.env with your MONGODB_URI"

echo ""
echo "2. Configure your environment:"
echo "   • Edit backend/.env with your MongoDB URI and JWT secret"
echo "   • The frontend is already configured to work with the backend"

echo ""
echo "3. Start the development servers:"
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm start"

echo ""
print_color $BLUE "🔗 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Documentation: http://localhost:5000/"

echo ""
print_color $BLUE "📚 Documentation:"
echo "   • README.md - Project overview and features"
echo "   • DEPLOYMENT.md - Complete deployment guide"

echo ""
print_color $YELLOW "⚡ Quick Start Commands:"
echo "   npm run dev:backend    - Start backend server"
echo "   npm run dev:frontend   - Start frontend server"
echo "   npm run dev:both       - Start both servers"

print_color $GREEN "\n✨ Happy coding!"