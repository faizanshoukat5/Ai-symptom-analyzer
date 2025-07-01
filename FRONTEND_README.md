# MedAI Advanced - Professional Medical Symptom Analyzer

A sophisticated web application that uses advanced AI models for medical symptom analysis, featuring biomedical entity recognition, clinical assessment, and urgency scoring.

## 🚀 Features

### Frontend
- **Modern, Professional UI**: Clean, medical-focused design with glassmorphism effects
- **Real-time Analysis**: Live processing indicators and status updates
- **Advanced Result Display**: Shows clinical assessment, urgency scores, AI models used, and detected medical entities
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Professional Branding**: Medical-grade appearance suitable for healthcare contexts

### Backend  
- **Multi-Model AI System**: Uses multiple specialized AI models for comprehensive analysis
- **Biomedical Entity Recognition**: Extracts medical entities from symptom descriptions
- **Clinical Assessment**: Advanced pattern recognition for medical conditions
- **Urgency Scoring**: Calculates urgency levels (1-10 scale) based on symptoms
- **Real-time Processing**: Fast analysis with processing time tracking

## 🤖 AI Models

### Currently Active Models:
1. **Biomedical NER**: Extracts medical entities (symptoms, conditions, body parts)
2. **BioGPT**: Biomedical language model for clinical analysis
3. **Disease Predictor**: Symptom-to-condition mapping
4. **Sentiment Analyzer**: Analyzes emotional context of symptom descriptions

### Model Capabilities:
- Medical entity extraction
- Symptom pattern recognition  
- Urgency level assessment
- Clinical advice generation
- Risk factor identification
- Differential diagnosis suggestions

## 📋 What the AI Analyzes

- **Medical Entities**: Symptoms, body parts, conditions, medications
- **Symptom Patterns**: Relationships between symptoms
- **Urgency Levels**: 1-10 scale urgency assessment
- **Clinical Context**: Medical significance of symptom combinations
- **Risk Assessment**: Potential severity and recommended actions

## 🛠 Technology Stack

### Frontend:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Modern ES6+** JavaScript features

### Backend:
- **FastAPI** with Python
- **Transformers** library for AI models
- **PyTorch** for deep learning
- **Uvicorn** ASGI server
- **Sentence Transformers** for embeddings

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with pip
- 8GB+ RAM recommended for AI models

### 1. Start the Backend
```bash
cd backend
pip install -r requirements_advanced.txt
python main_advanced_models.py
```
The backend will start at `http://localhost:8000`

### 2. Start the Frontend  
```bash
npm install
npm run dev
```
The frontend will start at `http://localhost:5173` (or next available port)

### 3. Test the Integration
```bash
python test_frontend_integration.py
```

## 📊 Example Analysis Output

When you enter symptoms like "severe abdominal pain and nausea", the AI provides:

- **Clinical Assessment**: Detailed analysis of the condition
- **Severity Level**: Low/Medium/High/Critical
- **Urgency Score**: 1-10 scale
- **Confidence**: AI confidence percentage  
- **Medical Entities**: Extracted medical terms
- **Recommendations**: Actionable advice
- **AI Models Used**: Which models analyzed the symptoms

## 🔒 Privacy & Security

- **No Data Storage**: Symptoms are processed in real-time and not stored
- **Local Processing**: All AI models run locally on your system
- **HIPAA-Level Security**: Designed with medical privacy standards in mind
- **No External Dependencies**: Once loaded, works without internet connection

## ⚠️ Medical Disclaimer

This tool is for **informational purposes only** and should **never replace professional medical advice**. Always consult qualified healthcare professionals for medical concerns. In case of emergency, contact your local emergency services immediately.

## 🎯 Use Cases

- **Preliminary Symptom Assessment**: Get initial insights before medical consultation
- **Health Education**: Learn about symptom relationships and medical entities
- **Triage Support**: Understand urgency levels for symptom combinations
- **Medical AI Research**: Study biomedical NLP and clinical AI applications

## 🔧 Development

### Running in Development Mode
- Backend: `python main_advanced_models.py` 
- Frontend: `npm run dev`
- Hot reload enabled for both frontend and backend

### Building for Production
```bash
npm run build
```

### Testing API Integration
```bash
python test_frontend_integration.py
```

## 📈 System Requirements

### Minimum:
- 4GB RAM
- 2GB free disk space
- Modern web browser

### Recommended:
- 8GB+ RAM (for multiple AI models)
- 5GB+ free disk space
- Fast internet for initial model downloads
- Modern CPU (i5 equivalent or better)

## 🤝 Contributing

This is a demonstration project showcasing AI integration in healthcare applications. Feel free to use it as a learning resource or starting point for your own medical AI projects.

---

**Built with ❤️ using React, FastAPI, and advanced AI models**
