import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Stethoscope, Brain, Shield, Sparkles, Activity, AlertCircle, CheckCircle } from 'lucide-react'
import { ThemeProvider } from './components/ThemeProvider'
import ModernSymptomForm from './components/ModernSymptomForm'
import ModernAIResultCard from './components/ModernAIResultCard'
import ModernHeader from './components/ModernHeader'
import ModernSpinner from './components/ModernSpinner'
import './styles/modern.css'

interface AIResult {
  condition: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  advice: string;
  confidence?: number;
  recommendations?: string[];
  whenToSeekHelp?: string;
  aiModelsUsed?: string;
  entitiesExtracted?: string[];
  urgencyScore?: number;
}

interface AdvancedAPIResponse {
  condition: string;
  severity: string;
  confidence: number;
  advice: string;
  recommendations: string[];
  whenToSeekHelp: string;
  disclaimer: string;
  entities_extracted?: string[];
  urgency_score?: number;
  ai_models_used?: string;
}

function AppContent() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)

  const handleSymptomSubmit = async (symptoms: string) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/analyze-symptoms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ symptoms })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AdvancedAPIResponse = await response.json()
      
      const analysis: AIResult = {
        condition: data.condition,
        severity: data.severity as "Low" | "Medium" | "High" | "Critical",
        confidence: data.confidence,
        advice: data.advice,
        recommendations: data.recommendations || [],
        whenToSeekHelp: data.whenToSeekHelp,
        aiModelsUsed: data.ai_models_used,
        entitiesExtracted: data.entities_extracted || [],
        urgencyScore: data.urgency_score
      }

      setResult(analysis)
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      setResult({
        condition: "Analysis Error",
        severity: "Medium",
        confidence: 0,
        advice: "We couldn't analyze your symptoms at this time. Please try again or consult a healthcare professional.",
        recommendations: ["Try again later", "Contact support if the issue persists", "Consult a healthcare provider"]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Header */}
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                  <Stethoscope className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Medical Analysis
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Get instant, intelligent health insights using advanced biomedical AI. 
              Our system analyzes your symptoms with clinical precision and provides 
              personalized recommendations.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Brain className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Heart className="w-4 h-4" />
                <span>Clinically Validated</span>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left Column - Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Describe Your Symptoms
                    </h2>
                  </div>
                  
                  <ModernSymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
                </div>

                {/* AI Models Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Powered by Advanced AI
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Biomedical NER</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Medical BERT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Clinical GPT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Ensemble Learning</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Results */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
              >
                <AnimatePresence mode="wait">
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ModernSpinner />
                    </motion.div>
                  )}
                  
                  {!loading && result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ModernAIResultCard result={result} />
                    </motion.div>
                  )}
                  
                  {!loading && !result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Ready for Analysis
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Describe your symptoms to receive an AI-powered health analysis
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only. 
              Always consult healthcare professionals for medical advice.
            </p>
            <p>© 2024 MedAI Advanced. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
