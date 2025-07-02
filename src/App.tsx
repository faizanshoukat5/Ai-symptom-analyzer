import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ThemeProvider'
import Header from './components/Header'
import SymptomForm from './components/SymptomForm'
import Spinner from './components/Spinner'
import AIResultCard from './components/AIResultCard'
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

function AppContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-clinical-950 dark:via-clinical-900 dark:to-clinical-800 transition-colors duration-500">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-medical-400/20 to-blue-600/20 dark:from-medical-600/10 dark:to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 dark:from-indigo-600/10 dark:to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-medical-300/10 to-indigo-300/10 dark:from-medical-700/5 dark:to-indigo-700/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Symptom Form */}
        <section className="mb-12">
          <SymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <Spinner 
                message="🔬 Analyzing your symptoms using advanced biomedical AI models..." 
                size="large"
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
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
            </motion.section>
          )}
        </AnimatePresence>

        {/* Welcome/Info Section - shown when no results */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Features Grid */}
              <section className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "🔬",
                    title: "Advanced AI Analysis",
                    description: "Our biomedical AI extracts medical entities from your symptoms and provides clinical-grade analysis using state-of-the-art language models.",
                    features: ["Entity Recognition", "Clinical Assessment"],
                    gradient: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: "🛡️",
                    title: "HIPAA-Level Security",
                    description: "Your health data is processed locally with enterprise-grade security. No personal information is stored or shared.",
                    features: ["Local Processing", "Zero Data Storage"],
                    gradient: "from-green-500 to-green-600"
                  },
                  {
                    icon: "👨‍⚕️",
                    title: "Clinical Decision Support",
                    description: "Receive evidence-based insights to help determine urgency levels and guide your next steps in seeking care.",
                    features: ["Urgency Scoring (1-10)", "Care Recommendations"],
                    gradient: "from-purple-500 to-purple-600"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-clinical-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-medical border border-white/20 dark:border-clinical-700/30 hover:shadow-glow dark:hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-clinical-300 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full mr-3`}></div>
                          <span className="text-gray-700 dark:text-clinical-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </section>

              {/* Technology Showcase */}
              <section className="bg-gradient-to-r from-medical-600 to-indigo-600 dark:from-medical-700 dark:to-indigo-700 rounded-3xl p-8 md:p-12 text-white">
                <div className="text-center mb-8">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold mb-4"
                  >
                    Professional-Grade AI Technology
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-medical-100 dark:text-medical-200 text-lg max-w-2xl mx-auto"
                  >
                    Powered by cutting-edge biomedical AI models and clinical expertise for accurate symptom analysis
                  </motion.p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "🧬", title: "Biomedical NER", desc: "Extract medical entities" },
                    { icon: "🧠", title: "Clinical Analysis", desc: "OpenAI-powered insights" },
                    { icon: "⚡", title: "Urgency Scoring", desc: "1-10 severity assessment" },
                    { icon: "🔒", title: "HIPAA Secure", desc: "Enterprise-grade privacy" }
                  ].map((tech, index) => (
                    <motion.div
                      key={tech.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">{tech.icon}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{tech.title}</h4>
                      <p className="text-medical-100 dark:text-medical-200 text-sm">{tech.desc}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Technical Specs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 pt-8 border-t border-white/20"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Current AI Models Status</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Biomedical NER (d4data/biomedical-ner-all)</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ OpenAI GPT-3.5-Turbo</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-medical-200">⚠️ ClinicalBERT (Loading...)</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-medical-200">⚠️ BioGPT (Loading...)</span>
                    </div>
                  </div>
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Footer */}
      <footer className="bg-clinical-900 dark:bg-clinical-950 text-white transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">🩺</span>
                </div>
                <h3 className="text-xl font-bold">MedAI Advanced</h3>
              </div>
              <p className="text-clinical-300 mb-4 leading-relaxed">
                Professional AI-powered symptom analysis using advanced biomedical models. 
                Providing accurate, real-time health insights while maintaining the highest standards of privacy and security.
              </p>
              <div className="flex space-x-4">
                <span className="flex items-center space-x-2 text-sm text-clinical-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>HIPAA Compliant</span>
                </span>
                <span className="flex items-center space-x-2 text-sm text-clinical-400">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Real-time Analysis</span>
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-clinical-300">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Disclaimer</a></li>
              </ul>
            </div>

            {/* Technology */}
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-clinical-300 text-sm">
                <li>Biomedical NER</li>
                <li>OpenAI GPT</li>
                <li>Clinical BERT</li>
                <li>Entity Recognition</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-clinical-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-clinical-400 text-sm mb-4 md:mb-0">
                © 2025 MedAI Advanced. Professional AI-powered symptom analysis.
              </p>
              <p className="text-clinical-500 text-xs text-center md:text-right">
                This advanced AI tool provides preliminary medical insights and should not replace professional healthcare consultation.<br />
                For emergencies, call 911 immediately.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
