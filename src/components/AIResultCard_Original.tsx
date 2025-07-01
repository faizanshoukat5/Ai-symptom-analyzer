import React from 'react'

interface AIResultCardProps {
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

const AIResultCard: React.FC<AIResultCardProps> = ({ 
  condition, 
  severity, 
  advice, 
  confidence = 0, 
  recommendations = [], 
  whenToSeekHelp = "Seek medical attention if symptoms worsen.",
  aiModelsUsed = "",
  entitiesExtracted = [],
  urgencyScore = 0
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Medical AI Analysis Report</h2>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/30`}>
              📋 Clinical Assessment
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getSeverityColor()}`}>
              Severity: {severity}
            </span>
            {confidence > 0 && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm border border-white/30">
                🎯 Confidence: {confidence}%
              </span>
            )}
          </div>
          <div className="text-sm opacity-90">
            ⚡ AI-Powered Analysis Complete
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Clinical Assessment */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <span className="text-blue-600 text-sm">📋</span>
            </span>
            Clinical Assessment
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed font-medium">{condition}</p>
          </div>
        </div>

        {/* Main Advice */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <span className="text-green-600 text-sm">💡</span>
            </span>
            Medical Advice & Recommendations
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">{advice}</p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Urgency Score */}
        {urgencyScore > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                <span className="text-orange-600 text-sm">⚡</span>
              </span>
              Urgency Assessment
            </h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">Urgency Score: {urgencyScore}/10</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {urgencyScore <= 3 ? "🟢 Low urgency - Monitor symptoms" : 
                     urgencyScore <= 6 ? "🟡 Moderate urgency - Consider medical consultation" : 
                     urgencyScore <= 8 ? "🟠 High urgency - Seek medical attention soon" : 
                     "🔴 Critical urgency - Seek immediate medical care"}
                  </p>
                </div>
                <div className="text-3xl">
                  {urgencyScore <= 3 ? "🟢" : urgencyScore <= 6 ? "🟡" : urgencyScore <= 8 ? "🟠" : "🔴"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Models Used */}
        {aiModelsUsed && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                <span className="text-purple-600 text-sm">🤖</span>
              </span>
              AI Models & Analysis
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <p className="text-gray-800 font-medium mb-2">Models Used:</p>
              <div className="flex flex-wrap gap-2">
                {aiModelsUsed.split(',').map((model, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {model.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medical Entities Detected */}
        {entitiesExtracted && entitiesExtracted.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-2">
                <span className="text-teal-600 text-sm">🔬</span>
              </span>
              Medical Entities Detected
            </h3>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
              <p className="text-gray-800 font-medium mb-3">Biomedical AI extracted {entitiesExtracted.length} medical entities:</p>
              <div className="flex flex-wrap gap-2">
                {entitiesExtracted.map((entity, index) => (
                  <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium border border-teal-300">
                    {entity}
                  </span>
                ))}
              </div>
              <p className="text-xs text-teal-600 mt-3">
                These entities help our AI understand the medical context of your symptoms
              </p>
            </div>
          </div>
        )}

        {/* When to Seek Help */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center mr-2">
              <span className="text-yellow-800 text-xs">⚠️</span>
            </span>
            When to Seek Medical Help
          </h3>
          <p className="text-yellow-700">{whenToSeekHelp}</p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>⚕️ Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
            Always consult with qualified healthcare professionals for medical concerns. In case of emergency, call your local emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIResultCard
