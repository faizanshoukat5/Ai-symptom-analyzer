/**
 * Medical Symptom Checker - Configuration
 * Central configuration for the application
 */

// Environment-based configuration
const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    retries: 3,
    endpoints: {
      health: '/health',
      analyzeSymptoms: '/analyze-symptoms',
      root: '/'
    }
  },

  // App Configuration
  app: {
    name: 'AI Medical Symptom Checker',
    version: '1.0.0',
    description: 'AI-powered medical symptom analysis and health recommendations',
    environment: process.env.NODE_ENV || 'development'
  },

  // Firebase Configuration (if using Firebase features)
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  },

  // UI Configuration
  ui: {
    // Theme settings
    theme: {
      default: 'light', // 'light' or 'dark'
      enableSystemTheme: true
    },
    
    // Animation settings
    animations: {
      enabled: true,
      duration: 300, // milliseconds
      easing: 'ease-in-out'
    },
    
    // Form validation
    validation: {
      minSymptomLength: 10,
      maxSymptomLength: 1000,
      minAge: 1,
      maxAge: 120
    },

    // Display settings
    display: {
      maxRecommendations: 5,
      maxEntities: 10,
      confidenceAsPercentage: true
    }
  },

  // Feature flags
  features: {
    voiceInput: true,
    darkMode: true,
    animations: true,
    pwaSupport: true,
    analytics: false, // Set to true if you want to enable analytics
    errorReporting: false // Set to true if you want to enable error reporting
  },

  // Analytics Configuration (if enabled)
  analytics: {
    googleAnalyticsId: process.env.REACT_APP_GA_ID,
    enablePageTracking: true,
    enableEventTracking: true
  },

  // Error Reporting (if enabled)
  errorReporting: {
    sentryDsn: process.env.REACT_APP_SENTRY_DSN,
    enableInDevelopment: false
  },

  // Security settings
  security: {
    // Content Security Policy headers (for production)
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://*.railway.app"]
    }
  }
};

// Environment-specific overrides
if (config.app.environment === 'production') {
  // Production overrides
  config.api.baseURL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com';
  config.ui.animations.enabled = true;
  config.features.analytics = true;
} else if (config.app.environment === 'development') {
  // Development overrides
  config.api.baseURL = 'http://localhost:8000';
  config.features.errorReporting = false;
}

// Validation function
export const validateConfig = () => {
  const errors = [];

  // Check required environment variables
  if (!config.api.baseURL) {
    errors.push('API base URL is not configured');
  }

  // Validate Firebase config if Firebase features are enabled
  if (config.features.analytics && !config.firebase.apiKey) {
    errors.push('Firebase configuration is incomplete');
  }

  // Validate UI settings
  if (config.ui.validation.minSymptomLength >= config.ui.validation.maxSymptomLength) {
    errors.push('Invalid symptom length validation configuration');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${config.api.baseURL}${config.api.endpoints[endpoint] || endpoint}`;
};

export const isFeatureEnabled = (feature) => {
  return config.features[feature] === true;
};

export const getThemeConfig = () => {
  return config.ui.theme;
};

export const getValidationConfig = () => {
  return config.ui.validation;
};

// Export configuration
export default config;

// Export specific sections for convenience
export const { api, app, firebase, ui, features, analytics, security } = config;
