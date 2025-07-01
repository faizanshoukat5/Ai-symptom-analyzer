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
  const [showAbout, setShowAbout] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)

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

  const resetForm = () => {
    setResult(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Navigation */}
      <header className="relative backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Bar */}
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">SymptomAI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => setShowAbout(!showAbout)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                About
              </button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => setShowFAQ(!showFAQ)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Contact
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-8 leading-tight">
              SymptomAI
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 max-w-5xl mx-auto leading-relaxed mb-8">
              Advanced AI-powered symptom analysis to help guide your healthcare decisions
            </p>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 max-w-3xl mx-auto mb-8">
              <p className="text-amber-800 text-lg font-medium flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                ⚠️ Always consult healthcare professionals for medical advice
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">AI</div>
                <div className="text-gray-600">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-gray-600">Private</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">Free</div>
                <div className="text-gray-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">About SymptomAI</h2>
              <button 
                onClick={() => setShowAbout(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>
                SymptomAI is an advanced artificial intelligence system designed to help you understand your symptoms and make informed healthcare decisions.
              </p>
              <p>
                Our AI analyzes your symptom descriptions using state-of-the-art natural language processing and medical knowledge databases to provide preliminary insights.
              </p>
              <p className="font-semibold text-red-600">
                Important: This tool is for informational purposes only and should never replace professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <button 
                onClick={() => setShowFAQ(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is SymptomAI a replacement for doctors?</h3>
                <p className="text-gray-600">No, SymptomAI is designed to provide preliminary insights only. Always consult with healthcare professionals for proper medical diagnosis and treatment.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the AI analysis?</h3>
                <p className="text-gray-600">Our AI provides educated insights based on medical knowledge, but accuracy can vary. It should be used as a starting point for healthcare discussions, not definitive diagnosis.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my health information private?</h3>
                <p className="text-gray-600">Yes, we prioritize your privacy. Your symptom descriptions are processed securely and are not stored permanently on our servers.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I seek immediate medical attention?</h3>
                <p className="text-gray-600">Seek immediate medical attention for severe symptoms, chest pain, difficulty breathing, severe allergic reactions, or any symptoms that feel life-threatening.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Symptom Form Section */}
        <div className="mb-16">
          <SymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-16">
            <Spinner 
              message="Analyzing your symptoms with AI..." 
              size="large"
            />
          </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <button
                onClick={resetForm}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>
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

        {/* How It Works Section */}
        {!result && !loading && (
          <section id="how-it-works" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How SymptomAI Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our advanced AI follows a systematic approach to analyze your symptoms
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Describe Symptoms</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Provide detailed information about your symptoms, including duration, severity, and any relevant context.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI Analysis</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Our AI processes your symptoms using advanced natural language processing and medical knowledge databases.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Get Insights</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Receive comprehensive analysis with possible conditions, recommendations, and guidance on when to seek medical help.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {!result && !loading && (
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-6">Why Choose SymptomAI?</h2>
                <p className="text-blue-100 text-xl max-w-3xl mx-auto">
                  Advanced technology meets healthcare to provide you with intelligent symptom analysis
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Instant Analysis</h4>
                  <p className="text-blue-100">Get comprehensive results in seconds, not hours</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Smart Insights</h4>
                  <p className="text-blue-100">AI-powered recommendations and actionable advice</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Care Focused</h4>
                  <p className="text-blue-100">Your health and wellbeing are our top priority</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">100% Private</h4>
                  <p className="text-blue-100">Your data is secure and never stored permanently</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {!result && !loading && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Users Say</h2>
              <p className="text-xl text-gray-600">Trusted by thousands for preliminary health insights</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah M.</div>
                    <div className="text-sm text-gray-600">Teacher</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "SymptomAI helped me understand my symptoms better before my doctor's appointment. It gave me the right questions to ask!"
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike R.</div>
                    <div className="text-sm text-gray-600">Engineer</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Quick, informative, and helped me decide when to seek medical attention. The AI analysis was surprisingly detailed."
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Anna L.</div>
                    <div className="text-sm text-gray-600">Designer</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Love how private and secure it is. Got helpful insights without sharing my data with multiple platforms."
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-300">Have questions or feedback? We'd love to hear from you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@symptomai.com</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>1-800-SYMPTOM</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Available 24/7</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Emergency Resources</h3>
              <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-red-400 mb-3">Medical Emergency?</h4>
                <p className="text-gray-300 mb-4">
                  If you're experiencing a medical emergency, please contact emergency services immediately.
                </p>
                <div className="space-y-2">
                  <div className="text-red-400 font-semibold">🚨 Emergency: 911</div>
                  <div className="text-blue-400">🏥 Poison Control: 1-800-222-1222</div>
                  <div className="text-green-400">💬 Crisis Text Line: Text HOME to 741741</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">SymptomAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced AI-powered symptom analysis for better healthcare decisions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</div>
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</div>
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">Medical Disclaimer</div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">Health Tips</div>
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">When to See a Doctor</div>
                <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">Emergency Contacts</div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 cursor-pointer transition-colors">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 mb-4">
              © 2025 SymptomAI. For informational purposes only.
            </p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              This tool provides preliminary insights and should not replace professional medical advice, diagnosis, or treatment. 
              Always consult with qualified healthcare providers for medical concerns. If you're experiencing a medical emergency, 
              contact emergency services immediately.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
