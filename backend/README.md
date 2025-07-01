# Medical Symptom Checker API

A FastAPI-based backend service that provides AI-powered symptom analysis using OpenAI's GPT API.

## 🚀 Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **OpenAI Integration**: Uses GPT-4 for intelligent symptom analysis
- **CORS Support**: Configured for frontend integration
- **Input Validation**: Robust validation using Pydantic models
- **Health Monitoring**: Health check endpoints for monitoring
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Full TypeScript-style type hints

## 📋 Prerequisites

- Python 3.8+
- OpenAI API key
- Virtual environment (recommended)

## 🛠️ Setup Instructions

### 1. Environment Setup

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (should already be created)
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file and add your OpenAI API key
# Get your API key from: https://platform.openai.com/account/api-keys
```

Required environment variables in `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start the Server

```bash
# Option 1: Using the startup script
python start_server.py

# Option 2: Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Main API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Run API tests
python test_api.py

# Test specific endpoint with curl
curl -X POST "http://localhost:8000/analyze-symptoms" \
     -H "Content-Type: application/json" \
     -d '{
       "symptoms": "I have a headache and feel nauseous",
       "age": 25,
       "gender": "female"
     }'
```

## 📡 API Endpoints

### `GET /`
Health check endpoint
- **Response**: Basic service information

### `GET /health`
Detailed health check
- **Response**: Service status and configuration info

### `POST /analyze-symptoms`
Analyze patient symptoms using AI
- **Request Body**:
  ```json
  {
    "symptoms": "string (10-1000 chars, required)",
    "age": "integer (1-120, optional)",
    "gender": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "condition": "string",
    "severity": "Low|Medium|High|Critical",
    "advice": "string",
    "confidence": "integer (0-100)",
    "recommendations": ["string"],
    "whenToSeekHelp": "string",
    "disclaimer": "string"
  }
  ```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `DEBUG`: Debug mode (default: True)
- `ALLOWED_ORIGINS`: CORS allowed origins

### OpenAI Configuration
- **Model**: gpt-4o-mini (cost-effective)
- **Temperature**: 0.3 (consistent medical advice)
- **Max Tokens**: 800
- **Top P**: 0.9

## 🛡️ Security & Safety

- **Medical Disclaimer**: All responses include appropriate medical disclaimers
- **Conservative Analysis**: AI is configured to be conservative in assessments
- **Input Validation**: Strict validation of all inputs
- **Error Handling**: Comprehensive error handling to prevent crashes
- **Rate Limiting**: Consider implementing rate limiting in production

## 🔄 Development

### Project Structure
```
backend/
├── main.py              # Main FastAPI application
├── start_server.py      # Server startup script
├── test_api.py         # API testing script
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── .env               # Environment variables (create this)
└── README.md          # This file
```

### Adding New Features
1. Add new Pydantic models for request/response
2. Create new endpoint functions
3. Update tests in `test_api.py`
4. Update this README

## 🚨 Important Notes

- **Not for Production Medical Use**: This is a demonstration application
- **Educational Purpose**: For learning and development only
- **Professional Medical Advice**: Always emphasize the need for professional medical consultation
- **API Costs**: Monitor OpenAI API usage to control costs
- **Data Privacy**: No user data is stored; consider privacy implications in production

## 📞 Support

If you encounter issues:
1. Check that your OpenAI API key is correctly set
2. Ensure all dependencies are installed
3. Verify the server is running on the correct port
4. Check the server logs for error messages
5. Run the test script to diagnose issues

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement data persistence with MongoDB
- [ ] Add rate limiting and API quotas
- [ ] Enhanced error handling and logging
- [ ] Add more sophisticated medical prompts
- [ ] Implement caching for common symptoms