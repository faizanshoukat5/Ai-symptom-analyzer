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
      
      const apiResult = await response.json()
      
      // Transform API response to match our interface
      const transformedResult: AIResult = {
        condition: apiResult.condition,
        severity: apiResult.severity,
        advice: apiResult.advice,
        confidence: apiResult.confidence,
        recommendations: apiResult.recommendations,
        whenToSeekHelp: apiResult.whenToSeekHelp
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
      <header className="relative backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 sticky top-0 z-50">
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
              SymptomAI
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered symptom analysis to help guide your healthcare decisions. 
              <span className="block text-lg text-gray-500 mt-2">
                Always consult healthcare professionals for medical advice.
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Form */}
        <div className="mb-12">
          <SymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-12">
            <Spinner 
              message="Analyzing your symptoms with AI..." 
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
            />
          </div>
        )}

        {/* Welcome/Info Section - shown when no results */}
        {!result && !loading && (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* How it Works */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI analyzes your symptoms using medical knowledge to provide insights and recommendations.
              </p>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Private & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                Your health information is processed securely and privately. No data is stored permanently.
              </p>
            </div>

            {/* Professional Guidance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Medical Guidance</h3>
              <p className="text-gray-600 leading-relaxed">
                Get preliminary insights to help you decide when to seek professional medical care.
              </p>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!result && !loading && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Why Choose SymptomAI?</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Advanced technology meets healthcare to provide you with intelligent symptom analysis
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Instant Analysis</h4>
                <p className="text-blue-100 text-sm">Get results in seconds</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Smart Insights</h4>
                <p className="text-blue-100 text-sm">AI-powered recommendations</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Care Focused</h4>
                <p className="text-blue-100 text-sm">Your health is priority</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">100% Private</h4>
                <p className="text-blue-100 text-sm">No data stored</p>
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
              © 2025 SymptomAI. For informational purposes only.
            </p>
            <p className="text-sm text-gray-500">
              This tool provides preliminary insights and should not replace professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
