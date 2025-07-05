/**
 * Medical Symptom Checker - Utility Functions
 * Common utility functions used throughout the application
 */

/**
 * Format confidence as percentage
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) return "75%";
  
  const numConfidence = Number(confidence);
  
  // Handle cases where confidence might be > 100 (like 8500)
  if (numConfidence > 100) {
    const normalizedConfidence = Math.min(95, Math.round(numConfidence / 100));
    return `${normalizedConfidence}%`;
  }
  
  // Ensure confidence is between 0 and 100
  const validConfidence = Math.max(0, Math.min(100, Math.round(numConfidence)));
  return `${validConfidence}%`;
};

/**
 * Normalize severity levels
 */
export const normalizeSeverity = (severity) => {
  if (!severity) return "Medium";
  
  const severityMap = {
    "low": "Low",
    "mild": "Low",
    "light": "Low",
    "medium": "Medium",
    "moderate": "Medium",
    "high": "High",
    "severe": "High",
    "critical": "Critical",
    "emergency": "Critical"
  };
  
  return severityMap[severity.toLowerCase()] || severity;
};

/**
 * Get severity color class
 */
export const getSeverityColor = (severity) => {
  const colorMap = {
    "Low": "text-green-600 bg-green-50 border-green-200",
    "Medium": "text-yellow-600 bg-yellow-50 border-yellow-200",
    "High": "text-red-600 bg-red-50 border-red-200",
    "Critical": "text-red-800 bg-red-100 border-red-300"
  };
  
  return colorMap[severity] || colorMap["Medium"];
};

/**
 * Get urgency score color
 */
export const getUrgencyColor = (score) => {
  if (score <= 3) return "text-green-600";
  if (score <= 6) return "text-yellow-600";
  if (score <= 8) return "text-orange-600";
  return "text-red-600";
};

/**
 * Validate symptom input
 */
export const validateSymptoms = (symptoms, minLength = 10, maxLength = 1000) => {
  const errors = [];
  
  if (!symptoms || typeof symptoms !== 'string') {
    errors.push('Symptoms description is required');
    return { isValid: false, errors };
  }
  
  const trimmedSymptoms = symptoms.trim();
  
  if (trimmedSymptoms.length < minLength) {
    errors.push(`Please provide at least ${minLength} characters describing your symptoms`);
  }
  
  if (trimmedSymptoms.length > maxLength) {
    errors.push(`Symptoms description must be less than ${maxLength} characters`);
  }
  
  // Check for potentially harmful content
  const bannedWords = ['suicide', 'kill myself', 'end my life'];
  const lowerSymptoms = trimmedSymptoms.toLowerCase();
  const containsBannedWords = bannedWords.some(word => lowerSymptoms.includes(word));
  
  if (containsBannedWords) {
    errors.push('If you are having thoughts of self-harm, please contact emergency services immediately or call a crisis helpline');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    wordCount: trimmedSymptoms.split(/\s+/).length
  };
};

/**
 * Validate age input
 */
export const validateAge = (age, minAge = 1, maxAge = 120) => {
  if (age === null || age === undefined || age === '') {
    return { isValid: true, errors: [] }; // Age is optional
  }
  
  const numAge = Number(age);
  const errors = [];
  
  if (isNaN(numAge)) {
    errors.push('Age must be a valid number');
  } else if (numAge < minAge || numAge > maxAge) {
    errors.push(`Age must be between ${minAge} and ${maxAge}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return '';
  }
};

/**
 * Debounce function for input handling
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Clean and sanitize text input
 */
export const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Format medical entities for display
 */
export const formatEntities = (entities, maxCount = 10) => {
  if (!Array.isArray(entities)) return [];
  
  return entities
    .filter(entity => entity && typeof entity === 'string')
    .slice(0, maxCount)
    .map(entity => entity.trim())
    .filter(entity => entity.length > 0);
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Download text as file
 */
export const downloadAsFile = (content, filename, type = 'text/plain') => {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download file:', error);
    return false;
  }
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to set localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};

/**
 * Theme helpers
 */
export const theme = {
  toggle: () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.classList.toggle('dark');
    storage.set('theme', newTheme);
    
    return newTheme;
  },
  
  set: (themeName) => {
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.set('theme', themeName);
  },
  
  get: () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },
  
  getSystem: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
};

/**
 * Error handling helpers
 */
export const handleError = (error, context = '') => {
  console.error(`Error ${context}:`, error);
  
  // You can add error reporting service here
  // Example: Sentry.captureException(error);
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    context
  };
};

// Export all utilities as default object
export default {
  formatConfidence,
  normalizeSeverity,
  getSeverityColor,
  getUrgencyColor,
  validateSymptoms,
  validateAge,
  formatTimestamp,
  debounce,
  generateId,
  sanitizeInput,
  formatEntities,
  isMobile,
  copyToClipboard,
  downloadAsFile,
  storage,
  theme,
  handleError
};
