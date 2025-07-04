import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/ThemeProvider';
import { Stethoscope } from 'lucide-react';
import SymptomFormBasic from './components/SymptomFormBasic';
import Spinner from './components/Spinner';
import AIResultCardModern from './components/AIResultCardModern';
import './App.css';

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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleSymptomSubmit = async (symptoms: string, age?: number, gender?: string) => {
    setLoading(true);
    setResult(null);

    try {
      // Call the FastAPI backend
      const response = await fetch('http://localhost:8000/analyze-symptoms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symptoms: symptoms.trim(),
          age,
          gender
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResult: AdvancedAPIResponse = await response.json();
      
      // Transform advanced API response to match our simple interface
      const transformedResult: AIResult = {
        condition: apiResult.condition || "Symptom Analysis",
        severity: apiResult.severity as "Low" | "Medium" | "High" | "Critical" || "Medium",
        advice: apiResult.advice,
        confidence: apiResult.confidence,
        recommendations: apiResult.recommendations,
        whenToSeekHelp: apiResult.whenToSeekHelp,
        // Additional advanced fields
        aiModelsUsed: apiResult.ai_models_used,
        entitiesExtracted: apiResult.entities_extracted,
        urgencyScore: apiResult.urgency_score
      };
      
      setResult(transformedResult);
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      
      // Generate a more useful demo response even when API fails
      const symptomText = symptoms.toLowerCase();
      let condition = "Symptom Analysis";
      let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
      
      // Simple keyword matching for a demo fallback
      if (symptomText.includes("head") || symptomText.includes("migraine") || symptomText.includes("headache")) {
        condition = "Possible Headache/Migraine";
      } else if (symptomText.includes("stomach") || symptomText.includes("nausea") || symptomText.includes("vomit")) {
        condition = "Possible Digestive Issue";
      } else if (symptomText.includes("throat") || symptomText.includes("cough") || symptomText.includes("fever")) {
        condition = "Possible Upper Respiratory Infection";
      } else if (symptomText.includes("back") || symptomText.includes("muscle") || symptomText.includes("joint")) {
        condition = "Possible Musculoskeletal Issue";
      }
      
      if (symptomText.includes("severe") || symptomText.includes("intense") || symptomText.includes("worst")) {
        severity = "High";
      } else if (symptomText.includes("mild") || symptomText.includes("slight") || symptomText.includes("minor")) {
        severity = "Low";
      }
      
      // Extract some sample medical entities based on the symptom text
      const extractedEntities: string[] = [];
      
      if (symptomText.includes("head")) extractedEntities.push("head");
      if (symptomText.includes("headache")) extractedEntities.push("headache");
      if (symptomText.includes("migraine")) extractedEntities.push("migraine");
      if (symptomText.includes("pain")) extractedEntities.push("pain");
      if (symptomText.includes("fever")) extractedEntities.push("fever");
      if (symptomText.includes("throat")) extractedEntities.push("throat");
      if (symptomText.includes("cough")) extractedEntities.push("cough");
      if (symptomText.includes("nausea")) extractedEntities.push("nausea");
      if (symptomText.includes("vomit")) extractedEntities.push("vomiting");
      if (symptomText.includes("stomach")) extractedEntities.push("stomach");
      if (symptomText.includes("back")) extractedEntities.push("back");
      if (symptomText.includes("joint")) extractedEntities.push("joint");
      if (symptomText.includes("muscle")) extractedEntities.push("muscle");
      
      // If no entities were found, add some default ones based on condition
      if (extractedEntities.length === 0) {
        if (condition.includes("Headache")) {
          extractedEntities.push("head", "pain");
        } else if (condition.includes("Digestive")) {
          extractedEntities.push("stomach", "abdomen");
        } else if (condition.includes("Respiratory")) {
          extractedEntities.push("throat", "respiratory");
        } else if (condition.includes("Musculoskeletal")) {
          extractedEntities.push("muscle", "joint");
        } else {
          extractedEntities.push("symptom", "discomfort");
        }
      }

      const errorResult: AIResult = {
        condition,
        severity,
        advice: "Based on your symptoms, we recommend monitoring your condition and consulting with a healthcare provider if symptoms persist or worsen. (Note: This is a demo response as API connection failed)",
        confidence: 65,
        recommendations: [
          "Monitor your symptoms closely",
          "Keep a symptom diary to track changes",
          "Stay hydrated and get adequate rest",
          "Consider over-the-counter remedies appropriate for your symptoms",
          "Consult a healthcare professional if symptoms worsen or persist"
        ],
        whenToSeekHelp: "Seek immediate medical attention if you develop severe symptoms such as difficulty breathing, severe pain, high fever, or loss of consciousness.",
        // Add the missing fields for advanced analysis
        aiModelsUsed: "Fallback Analysis (Demo Mode)",
        entitiesExtracted: extractedEntities,
        urgencyScore: severity === "High" ? 7 : severity === "Low" ? 3 : 5
      };
      
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Simple Modern Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-600 rounded-lg flex items-center justify-center shadow-md">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MedAI Analyzer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Symptom Analysis</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            AI Medical Symptom Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Describe your symptoms to receive an AI-powered analysis and recommendations.
            Remember that this is not a substitute for professional medical advice.
          </p>
        </motion.div>
        
        {/* Symptom Form */}
        <section className="mb-10">
          <SymptomFormBasic onSubmit={handleSymptomSubmit} isLoading={loading} />
        </section>
        
        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="my-10 text-center"
            >
              <Spinner 
                message="Analyzing your symptoms using advanced medical AI models..." 
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
              className="mb-10"
            >
              <AIResultCardModern 
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
        
        {/* Info Section - shown when no results */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6 my-10"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
                <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
                  <li>Describe your symptoms in detail</li>
                  <li>Our AI analyzes your description using medical models</li>
                  <li>Receive an assessment and recommendations</li>
                  <li>Use the information to make informed healthcare decisions</li>
                </ol>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Important Disclaimer</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This tool provides preliminary insights based on AI analysis of your symptoms.
                  It is not a substitute for professional medical advice, diagnosis, or treatment.
                  Always seek the advice of your physician or other qualified health provider.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 AI Medical Symptom Analyzer. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function AppModern() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
