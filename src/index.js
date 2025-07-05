/**
 * Medical Symptom Checker - Main Entry Point
 * React application entry point for the AI-powered symptom checker
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import the modern app component
import AppModern from './AppModern';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <AppModern />
  </React.StrictMode>
);

// Performance monitoring (optional)
if (typeof window !== 'undefined' && window.performance) {
  console.log('App startup time:', window.performance.now(), 'ms');
}

// Service Worker registration for PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
