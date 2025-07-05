/**
 * Medical Symptom Checker - API Service
 * Handles all backend communication and API calls
 */

// API Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  retries: 3
};

// API endpoints
const ENDPOINTS = {
  health: '/health',
  analyzeSymptoms: '/analyze-symptoms',
  root: '/'
};

/**
 * Custom fetch with timeout and retry logic
 */
async function fetchWithTimeout(url, options = {}, timeout = API_CONFIG.timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Retry fetch with exponential backoff
 */
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok) {
        return response;
      }
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Retry on server errors (5xx) or network issues
      if (i === retries - 1) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

/**
 * API Service Class
 */
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  /**
   * Check API health status
   */
  async checkHealth() {
    try {
      const response = await fetchWithRetry(`${this.baseURL}${ENDPOINTS.health}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Unable to connect to the medical analysis service');
    }
  }

  /**
   * Analyze symptoms using AI
   */
  async analyzeSymptoms(symptoms, age = null, gender = null) {
    try {
      // Validate input
      if (!symptoms || symptoms.trim().length < 10) {
        throw new Error('Please provide a more detailed description of your symptoms (at least 10 characters)');
      }

      console.log('Sending symptoms for analysis...');

      const requestBody = {
        symptoms: symptoms.trim(),
        age: age || null,
        gender: gender || null
      };

      const response = await fetchWithRetry(`${this.baseURL}${ENDPOINTS.analyzeSymptoms}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          detail: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.detail || 'Analysis request failed');
      }

      const result = await response.json();
      console.log('Analysis completed successfully');
      
      return this.transformResponse(result);
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to the analysis service. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Transform API response to match frontend expectations
   */
  transformResponse(apiResult) {
    return {
      condition: apiResult.condition || "Symptom Analysis",
      severity: this.normalizeSeverity(apiResult.severity),
      advice: apiResult.advice || "Please consult with a healthcare professional.",
      confidence: this.normalizeConfidence(apiResult.confidence),
      recommendations: apiResult.recommendations || [],
      whenToSeekHelp: apiResult.whenToSeekHelp || "Seek medical attention if symptoms worsen.",
      disclaimer: apiResult.disclaimer || "This analysis is for informational purposes only.",
      // Enhanced fields
      aiModelsUsed: apiResult.ai_models_used || "AI Analysis",
      entitiesExtracted: apiResult.entities_extracted || [],
      urgencyScore: apiResult.urgency_score || 5,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Normalize severity values
   */
  normalizeSeverity(severity) {
    if (!severity) return "Medium";
    
    const severityMap = {
      "low": "Low",
      "mild": "Low",
      "medium": "Medium",
      "moderate": "Medium",
      "high": "High",
      "severe": "High",
      "critical": "Critical"
    };
    
    return severityMap[severity.toLowerCase()] || severity;
  }

  /**
   * Normalize confidence values (ensure 0-100 range)
   */
  normalizeConfidence(confidence) {
    if (confidence === null || confidence === undefined) return 75;
    
    const numConfidence = Number(confidence);
    
    // Handle percentage values that might be > 100 (like 8500)
    if (numConfidence > 100) {
      return Math.min(95, Math.round(numConfidence / 100));
    }
    
    // Ensure confidence is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(numConfidence)));
  }

  /**
   * Get fallback analysis when API is unavailable
   */
  getFallbackAnalysis(symptoms, age, gender) {
    return {
      condition: "Demo Analysis - Service Unavailable",
      severity: "Medium",
      advice: "The AI analysis service is currently unavailable. This is a demonstration of the interface. Please try again later or consult with a healthcare professional for actual medical advice.",
      confidence: 50,
      recommendations: [
        "Try again when the service is restored",
        "Monitor your symptoms carefully",
        "Stay hydrated and get adequate rest",
        "Consult a healthcare professional if symptoms worsen",
        "Keep a symptom diary for your doctor"
      ],
      whenToSeekHelp: "Seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or if this is a medical emergency.",
      disclaimer: "This is a demo response. Always consult healthcare professionals for actual medical advice.",
      aiModelsUsed: "Demo Mode - Service Unavailable",
      entitiesExtracted: [],
      urgencyScore: 5,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export API service instance
const apiService = new ApiService();

// Export individual methods for convenience
export const checkHealth = () => apiService.checkHealth();
export const analyzeSymptoms = (symptoms, age, gender) => apiService.analyzeSymptoms(symptoms, age, gender);
export const getFallbackAnalysis = (symptoms, age, gender) => apiService.getFallbackAnalysis(symptoms, age, gender);

export default apiService;
