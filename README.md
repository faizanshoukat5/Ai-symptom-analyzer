# 🏥 AI Symptom Analyzer - Professional Medical AI Platform

[![React](https://img.shields.io/badge/React-19.0+-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=flat&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat&logo=typescript)](https://typescriptlang.org/)
[![AI Models](https://img.shields.io/badge/AI%20Models-7%20Active-ff6b35?style=flat)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> **Advanced AI-powered medical symptom analysis platform combining multiple biomedical models with professional clinical assessment capabilities.**

## ✨ Features

### 🧠 **Multi-Model AI System**
- **Biomedical NER**: Extracts medical entities from symptom descriptions
- **Clinical Language Models**: BioGPT, ClinicalBERT for medical analysis
- **Smart Classification**: Rule-based symptom categorization system
- **Urgency Scoring**: 1-10 scale assessment with color-coded indicators
- **Entity Recognition**: Identifies medical terms, symptoms, and conditions

### 🎨 **Professional Frontend**
- **Modern Medical UI**: Clean, clinical design with glassmorphism effects
- **Real-time Analysis**: Live processing indicators and status updates
- **Advanced Visualizations**: Interactive result cards with comprehensive data
- **Responsive Design**: Optimized for desktop and mobile devices
- **Professional Branding**: Medical-grade appearance suitable for healthcare

### 🔒 **Privacy & Security**
- **Local Processing**: All AI models run locally on your system
- **No Data Storage**: Symptoms processed in real-time, not stored
- **HIPAA Considerations**: Designed with medical privacy standards
- **Secure API**: FastAPI backend with proper error handling

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+** with pip
- **8GB+ RAM** recommended for AI models
- **5GB+ storage** for model downloads

### 1️⃣ Clone & Install
```bash
git clone https://github.com/faizanshoukat5/ai-symptom-analyzer.git
cd ai-symptom-analyzer

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements_advanced.txt
```

### 2️⃣ Start Backend
```bash
cd backend
python main_advanced_models.py
```
🌐 Backend available at `http://localhost:8000`

### 3️⃣ Start Frontend
```bash
# In root directory
npm run dev
```
🌐 Frontend available at `http://localhost:5173`

### 4️⃣ Test Integration
```bash
python test_frontend_integration.py
```

## 📊 Example Analysis

**Input**: *"I'm experiencing severe chest pain and shortness of breath"*

**Output**:
```json
{
  "primary_analysis": "Potential cardiovascular emergency",
  "severity": "Critical",
  "urgency_score": 9,
  "confidence": 92,
  "entities_extracted": ["severe", "chest pain", "shortness of breath"],
  "ai_models_used": "BioGPT + Biomedical NER + Clinical Assessment",
  "recommendation": "🚨 SEEK IMMEDIATE MEDICAL ATTENTION"
}
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── AIResultCard_Original.tsx    # Advanced result display
│   ├── SymptomForm.tsx              # Input form component
│   └── Spinner.tsx                  # Loading indicators
├── App.tsx                          # Main application
└── main.tsx                         # Entry point
```

### Backend (FastAPI + Python)
```
backend/
├── main_advanced_models.py          # Main API server
├── smart_symptom_classifier.py      # Rule-based classification
├── enhanced_analysis_demo.py        # Combined analysis demo
├── requirements_advanced.txt        # Python dependencies
└── models/                          # AI model cache
```

## 🤖 AI Models

| Model | Purpose | Status | Memory |
|-------|---------|--------|--------|
| **Biomedical NER** | Medical entity extraction | ✅ Active | ~2GB |
| **BioGPT** | Biomedical text generation | ✅ Active | ~3GB |
| **ClinicalBERT** | Medical text understanding | ⚠️ Loading | ~1GB |
| **Disease Predictor** | Symptom-to-condition mapping | ✅ Active | ~1GB |
| **Sentiment Analyzer** | Emotional context analysis | ✅ Active | ~500MB |
| **Smart Classifier** | Rule-based categorization | ✅ Active | ~10MB |

## 🔧 Development

### Run in Development Mode
```bash
# Backend with hot reload
cd backend
uvicorn main_advanced_models:app --reload

# Frontend with hot reload
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
# Test API integration
python test_frontend_integration.py

# Test classification system
python backend/smart_symptom_classifier.py

# System health check
python health_check.py
```

## 📋 API Documentation

### Analyze Symptoms
```http
POST /analyze-symptoms
Content-Type: application/json

{
  "symptoms": "Patient description of symptoms",
  "age": 35,
  "gender": "optional"
}
```

**Response**:
```json
{
  "primary_analysis": "Clinical assessment",
  "severity": "Low|Medium|High|Critical",
  "urgency_score": 5,
  "confidence": 85,
  "advice": "Medical recommendations",
  "recommendations": ["Action item 1", "Action item 2"],
  "entities_extracted": ["symptom1", "symptom2"],
  "ai_models_used": "Model names",
  "whenToSeekHelp": "Emergency guidance"
}
```

### Health Check
```http
GET /health
```

## 🌟 Key Benefits

- **🔬 Clinical-Grade Analysis**: Multiple AI models provide comprehensive assessment
- **⚡ Real-Time Processing**: Instant results with professional accuracy
- **🎯 Intelligent Urgency Scoring**: Helps prioritize medical care needs  
- **🔍 Entity Recognition**: Extracts and categorizes medical terms
- **📊 Multi-Model Validation**: Combines different AI approaches for reliability
- **🏥 Professional Interface**: Medical-grade UI suitable for healthcare settings

## ⚠️ Medical Disclaimer

**This tool is for informational purposes only and should NEVER replace professional medical advice.**

- Always consult qualified healthcare professionals for medical concerns
- In case of emergency, contact local emergency services immediately
- This AI analysis provides preliminary insights to help guide healthcare decisions
- Not intended for diagnostic or treatment purposes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for transformer models and datasets
- **OpenAI** for GPT integration capabilities
- **FastAPI** for excellent API framework
- **React & TypeScript** for modern frontend development
- **Tailwind CSS** for beautiful styling system

## 📞 Support & Contact

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/medai-advanced/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/medai-advanced/discussions)
- 📧 **Email**: support@medai-advanced.com
- 📖 **Documentation**: [Full Documentation](docs/README.md)

---

<div align="center">

**🏥 Built with ❤️ for advancing AI in healthcare**

[Demo](https://medai-advanced-demo.vercel.app) • [Documentation](docs/) • [API Docs](http://localhost:8000/docs) • [Contributing](CONTRIBUTING.md)

</div>
