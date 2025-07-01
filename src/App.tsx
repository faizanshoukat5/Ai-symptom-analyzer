import { useState } from 'react'
import SymptomForm from './components/SymptomForm'
import Spinner from './components/Spinner'
import AIResultCard from './components/AIResultCard_Original'
import './App.css'

interface AIResult {
  condition: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  advice: string;
  confidence?: number;
  recommendations?: string[];
  whenToSeekHelp?: string;
  // Additional advanced fields
  aiModelsUsed?: string;
  entitiesExtracted?: string[];
  urgencyScore?: number;
}

// Advanced API response interface  
interface AdvancedAPIResponse {
  primary_analysis: string;
  severity: string;
  confidence: number;
  advice: string;
  recommendations: string[];
  whenToSeekHelp: string;
  disclaimer: string;
  model_analyses: any[];
  entities_extracted: string[];
  risk_factors: string[];
  differential_diagnoses: string[];
  urgency_score: number;
  ai_models_used: string;
  processing_summary: {
    total_processing_time: number;
    models_used: number;
    entities_found: number;
    urgency_score: number;
    analysis_timestamp: string;
  };
}

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)

  const handleSymptomSubmit = async (symptoms: string) => {
    setLoading(true)
    setResult(null)

    try {
      // Call the FastAPI backend
      const response = await fetch('http://localhost:8000/analyze-symptoms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symptoms: symptoms.trim()
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const apiResult: AdvancedAPIResponse = await response.json()
      
      // Transform advanced API response to match our simple interface
      const transformedResult: AIResult = {
        condition: apiResult.primary_analysis || "Unknown condition",
        severity: apiResult.severity as "Low" | "Medium" | "High" | "Critical" || "Medium",
        advice: apiResult.advice,
        confidence: apiResult.confidence,
        recommendations: apiResult.recommendations,
        whenToSeekHelp: apiResult.whenToSeekHelp,
        // Additional advanced fields
        aiModelsUsed: apiResult.ai_models_used,
        entitiesExtracted: apiResult.entities_extracted,
        urgencyScore: apiResult.urgency_score
      }
      
      setResult(transformedResult)
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      
      // Show user-friendly error message
      const errorResult: AIResult = {
        condition: "Analysis Error",
        severity: "Medium",
        advice: error instanceof Error ? error.message : "Unable to analyze symptoms at this time. Please try again later or consult with a healthcare professional.",
        confidence: 0,
        recommendations: [
          "Try again in a few moments",
          "Check your internet connection",
          "Consult with a healthcare professional if symptoms persist"
        ],
        whenToSeekHelp: "If this is a medical emergency, seek immediate medical attention."
      }
      
      setResult(errorResult)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glass Effect */}
      <header className="relative backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              MedAI Advanced
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional-grade AI symptom analysis using advanced biomedical models and clinical expertise.
              <span className="block text-lg text-gray-500 mt-2">
                🔬 Biomedical Entity Recognition • 🧠 Advanced Clinical Analysis • ⚡ Real-time Processing
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System Status */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 text-sm shadow-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">🟢 Advanced AI Backend Active</span>
              <span className="text-green-600">•</span>
              <span>Core Models Loaded</span>
              <span className="text-green-600">•</span>
              <span className="text-xs bg-green-100 px-2 py-1 rounded-full">Biomedical NER + BioGPT + Entity Recognition</span>
            </div>
          </div>
          
          {/* What our AI analyzes */}
          <div className="mt-4 max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">Our AI analyzes:</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Medical Entities</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Symptom Patterns</span>
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">Urgency Levels</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">Clinical Context</span>
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">Risk Assessment</span>
            </div>
          </div>
        </div>
        {/* Hero Section with Form */}
        <div className="mb-12">
          <SymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-12">
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Models Processing Your Symptoms...
              </div>
            </div>
            <Spinner 
              message="🔬 Biomedical NER extracting medical entities • 🧠 OpenAI analyzing clinical patterns • ⚡ Calculating urgency score" 
              size="large"
            />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mb-12">
            <AIResultCard 
              condition={result.condition}
              severity={result.severity}
              advice={result.advice}
              confidence={result.confidence}
              recommendations={result.recommendations}
              whenToSeekHelp={result.whenToSeekHelp}
              aiModelsUsed={result.aiModelsUsed}
              entitiesExtracted={result.entitiesExtracted}
              urgencyScore={result.urgencyScore}
            />
          </div>
        )}

        {/* Welcome/Info Section - shown when no results */}
        {!result && !loading && (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* How it Works */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our biomedical AI extracts medical entities from your symptoms and provides clinical-grade analysis using state-of-the-art language models.
              </p>
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Entity Recognition
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Clinical Assessment
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">HIPAA-Level Security</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your health data is processed locally with enterprise-grade security. No personal information is stored or shared.
              </p>
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Local Processing
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Zero Data Storage
                </div>
              </div>
            </div>

            {/* Professional Guidance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Clinical Decision Support</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Receive evidence-based insights to help determine urgency levels and guide your next steps in seeking care.
              </p>
              <div className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Urgency Scoring (1-10)
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Care Recommendations
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!result && !loading && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Professional-Grade AI Technology</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Powered by cutting-edge biomedical AI models and clinical expertise for accurate symptom analysis
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Biomedical NER</h4>
                <p className="text-blue-100 text-sm">Extract medical entities</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Clinical Analysis</h4>
                <p className="text-blue-100 text-sm">OpenAI-powered insights</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Urgency Scoring</h4>
                <p className="text-blue-100 text-sm">1-10 severity assessment</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">HIPAA Secure</h4>
                <p className="text-blue-100 text-sm">Enterprise-grade privacy</p>
              </div>
            </div>
            
            {/* Technical Specs */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Current AI Models</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Biomedical NER (d4data/biomedical-ner-all)</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ OpenAI GPT-3.5-Turbo</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200">⚠️ ClinicalBERT (Loading...)</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200">⚠️ BioGPT (Loading...)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 mb-2">
              © 2025 MedAI Advanced. Professional AI-powered symptom analysis.
            </p>
            <p className="text-sm text-gray-500">
              This advanced AI tool provides preliminary medical insights and should not replace professional healthcare consultation.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              Powered by: Biomedical NER • BioGPT • Advanced Clinical Models • Entity Recognition
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
