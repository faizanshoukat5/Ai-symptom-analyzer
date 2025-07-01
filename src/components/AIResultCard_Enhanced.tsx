import React, { useState } from "react";

interface ModelResult {
  model_name: string;
  analysis: string;
  confidence: number;
  processing_time: number;
  urgency_score: number;
  success: boolean;
  error?: string;
}

interface EnhancedAnalysisResult {
  condition: string;
  severity: string;
  advice: string;
  confidence: number;
  recommendations: string[];
  whenToSeekHelp: string;
  disclaimer: string;
  urgency_level: string;
  emergency_detected: boolean;
  ensemble_confidence: number;
  models_used: string[];
  model_results: ModelResult[];
  processing_time: number;
  risk_factors: string[];
  entities_found: string[];
  user_id?: string;
  analysis_id?: string;
  timestamp: string;
}

interface AIResultCardProps {
  result: EnhancedAnalysisResult;
}

const AIResultCard: React.FC<AIResultCardProps> = ({ result }) => {
  const [showModelDetails, setShowModelDetails] = useState(true);
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
      case "mild":
        return "text-green-600 bg-green-50 border-green-200";
      case "moderate":
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
      case "severe":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "emergency":
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel.toLowerCase()) {
      case "emergency":
        return "🚨";
      case "high":
        return "⚠️";
      case "moderate":
        return "⚡";
      case "low":
        return "ℹ️";
      default:
        return "📋";
    }
  };

  const getModelStatusIcon = (success: boolean) => {
    return success ? "✅" : "❌";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Emergency Alert */}
      {result.emergency_detected && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚨</span>
            <div>
              <h3 className="text-red-800 font-bold text-lg">EMERGENCY DETECTED</h3>
              <p className="text-red-700">Immediate medical attention required</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getSeverityColor(result.severity)}`}>
            {getUrgencyIcon(result.urgency_level)} {result.severity.toUpperCase()}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{result.condition}</h3>
          <p className="text-blue-800">{result.advice}</p>
        </div>
      </div>

      {/* AI Model Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            AI Model Analysis ({result.model_results.length} models)
          </h3>
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showModelDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {showModelDetails && (
          <div className="space-y-4">
            {result.model_results.map((model, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  model.success 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getModelStatusIcon(model.success)}</span>
                    <h4 className="font-semibold text-gray-900">{model.model_name}</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    {model.success ? (
                      <>
                        Confidence: {(model.confidence * 100).toFixed(1)}% | 
                        Time: {model.processing_time}s |
                        Urgency: {model.urgency_score}/10
                      </>
                    ) : (
                      <span className="text-red-600 font-medium">Failed</span>
                    )}
                  </div>
                </div>
                
                {model.success ? (
                  <p className="text-gray-700 leading-relaxed">{model.analysis}</p>
                ) : (
                  <div>
                    <p className="text-red-700 font-medium">Error: {model.error || "Unknown error"}</p>
                    <p className="text-gray-600 text-sm mt-1">This model failed to provide analysis</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* When to Seek Help */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">When to Seek Help</h3>
        <p className="text-yellow-800">{result.whenToSeekHelp}</p>
      </div>

      {/* Technical Information */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Technical Information</h3>
          <button
            onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            {showTechnicalInfo ? "Hide" : "Show"}
          </button>
        </div>

        {showTechnicalInfo && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Analysis ID:</span>
                <span className="ml-2 text-gray-600">{result.analysis_id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Processing Time:</span>
                <span className="ml-2 text-gray-600">{result.processing_time.toFixed(2)}s</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ensemble Confidence:</span>
                <span className="ml-2 text-gray-600">{(result.ensemble_confidence * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timestamp:</span>
                <span className="ml-2 text-gray-600">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {result.risk_factors.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Risk Factors:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.risk_factors.map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                      {factor.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.entities_found.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Entities Detected:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.entities_found.map((entity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Important Disclaimer</h3>
        <p className="text-gray-700 text-sm">{result.disclaimer}</p>
      </div>
    </div>
  );
};

export default AIResultCard;
