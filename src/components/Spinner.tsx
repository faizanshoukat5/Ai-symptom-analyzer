import React from "react";

interface SpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

const Spinner: React.FC<SpinnerProps> = ({ 
  message = "Loading...", 
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Modern Loading Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md mx-auto">
        {/* Animated Spinner with Gradient */}
        <div className="relative mb-8">
          {/* Main spinner */}
          <div className={`${sizeClasses[size]} mx-auto`}>
            <div className="relative">
              {/* Outer ring */}
              <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
              
              {/* Animated gradient ring */}
              <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin`}></div>
              
              {/* Inner glow effect */}
              <div className={`absolute top-2 left-2 ${size === 'large' ? 'w-16 h-16' : size === 'medium' ? 'w-12 h-12' : 'w-4 h-4'} bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse`}></div>
            </div>
          </div>

          {/* Floating AI Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Loading message */}
        <div className="space-y-4">
          <h3 className={`${textSizeClasses[size]} font-bold text-gray-800`}>
            {message}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Our advanced AI is carefully analyzing your symptoms to provide you with the most accurate insights.
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        </div>

        {/* Processing steps */}
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Processing symptoms</span>
            <span className="text-green-500">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Analyzing patterns</span>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span>Generating insights</span>
            <span>⏳</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-5 blur-xl pointer-events-none"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-5 blur-xl pointer-events-none"></div>
    </div>
  );
};

export default Spinner;
