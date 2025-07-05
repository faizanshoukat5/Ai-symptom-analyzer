/**
 * Medical Symptom Checker - Main App Component
 * AI-powered symptom analysis with modern UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Component imports
import Header from './components/Header';
import SymptomForm from './components/SymptomForm';
import AIResultCard from './components/AIResultCard';
import LoadingSpinner from './components/LoadingSpinner';
import ThemeProvider from './components/ThemeProvider';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  // State management
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle symptom analysis
  const handleSymptomSubmit = async (symptoms, age, gender) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('Submitting symptoms for analysis...');
      
      const response = await fetch(`${API_BASE_URL}/analyze-symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          symptoms: symptoms,
          age: age,
          gender: gender
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      // Transform API response to match UI expectations
      const transformedResult = {
        condition: apiResult.condition || "Symptom Analysis",
        severity: apiResult.severity || "Medium",
        advice: apiResult.advice,
        confidence: apiResult.confidence,
        recommendations: apiResult.recommendations,
        whenToSeekHelp: apiResult.whenToSeekHelp,
        // Additional fields
        aiModelsUsed: apiResult.ai_models_used,
        entitiesExtracted: apiResult.entities_extracted,
        urgencyScore: apiResult.urgency_score
      };
      
      setResult(transformedResult);
      console.log('Analysis completed successfully');
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setError(error.message);
      
      // Fallback analysis for demo purposes
      const fallbackResult = {
        condition: "Symptom Analysis (Demo Mode)",
        severity: "Medium",
        advice: "Unable to connect to AI analysis service. This is a demonstration of the interface. Please consult with a healthcare professional for actual medical advice.",
        confidence: 50,
        recommendations: [
          "Try again when connection is restored",
          "Monitor your symptoms",
          "Stay hydrated and rest",
          "Consult healthcare professional if concerned"
        ],
        whenToSeekHelp: "Seek immediate medical attention if you experience severe symptoms or if this is an emergency.",
        aiModelsUsed: "Demo Mode - Connection Failed"
      };
      
      setResult(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  // Reset analysis
  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <motion.h1 
                    className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    AI Medical Symptom Checker
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Get instant AI-powered analysis of your symptoms with personalized health recommendations
                  </motion.p>
                </div>
                
                <SymptomForm onSubmit={handleSymptomSubmit} loading={loading} />
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-red-700 dark:text-red-300 text-center">
                      <strong>Connection Error:</strong> {error}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center min-h-[400px]"
              >
                <LoadingSpinner />
                <motion.p 
                  className="mt-6 text-lg text-gray-600 dark:text-gray-300 text-center max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Analyzing your symptoms using advanced AI models...
                </motion.p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
              >
                <motion.div 
                  className="mb-6 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    ← Analyze New Symptoms
                  </button>
                </motion.div>
                
                <AIResultCard {...result} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-16 py-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. 
              Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
