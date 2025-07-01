import React, { useState } from "react";

interface ModelAnalysis {
  model_name: string;
  analysis: string;
  confidence: number;
  processing_time: number;
  entities_found?: string[];
}

interface AIResult {
  primary_analysis: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  advice: string;
  recommendations: string[];
  whenToSeekHelp: string;
  disclaimer: string;
  model_analyses: ModelAnalysis[];
  entities_extracted: string[];
  risk_factors: string[];
  differential_diagnoses: string[];
  urgency_score: number;
  ai_models_used: string; // New field for clear AI model messaging
  processing_summary: {
    total_processing_time: number;
    models_used: number;
    entities_found: number;
    urgency_score: number;
    analysis_timestamp: string;
  };
}

interface AIResultCardProps {
  result: AIResult;
}

const AIResultCard: React.FC<AIResultCardProps> = ({ result }) => {
  const [showModelAnalyses, setShowModelAnalyses] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 6) return "text-orange-600 bg-orange-50 border-orange-200";
    if (score >= 4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">🤖 Advanced AI Analysis</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(result.severity)}`}>
              Severity: {result.severity}
            </span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
              Confidence: {result.confidence}%
            </span>
          </div>
          <div className="text-sm opacity-90">
            {result.entities_extracted.length} medical entities found
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* AI Models Used - TOP PRIORITY */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-5 shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-3">🤖</span>
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              AI Models Analyzing Your Symptoms
            </span>
          </h3>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-base font-semibold text-green-800">{result.ai_models_used}</p>
          </div>
        </div>

        {/* Primary Analysis */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="text-blue-600 mr-2">🔍</span>
            Primary Analysis
          </h3>
          <p className="text-gray-800 leading-relaxed">{result.primary_analysis}</p>
        </div>

        {/* Urgency Score */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="text-red-600 mr-2">⚡</span>
            Urgency Assessment
          </h3>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(result.urgency_score)}`}>
              Score: {result.urgency_score}/10
            </span>
            <span className="text-sm text-gray-600">
              Processing time: {result.processing_summary.total_processing_time}s
            </span>
          </div>
        </div>

        {/* Advice */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="text-green-600 mr-2">💡</span>
            Medical Advice
          </h3>
          <p className="text-gray-800 leading-relaxed">{result.advice}</p>
        </div>

        {/* When to Seek Help */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="text-orange-600 mr-2">🏥</span>
            When to Seek Help
          </h3>
          <p className="text-gray-800 leading-relaxed">{result.whenToSeekHelp}</p>
        </div>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-purple-600 mr-2">📋</span>
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2 mt-1">•</span>
                  <span className="text-gray-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted Entities */}
        {result.entities_extracted && result.entities_extracted.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-indigo-600 mr-2">🏷️</span>
              Medical Entities Identified
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.entities_extracted.map((entity, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Model Analyses - Collapsible */}
        {result.model_analyses && result.model_analyses.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowModelAnalyses(!showModelAnalyses)}
              className="w-full text-left font-semibold text-gray-700 mb-3 flex items-center justify-between hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <span className="text-blue-600 mr-2">🧠</span>
                Individual Model Analyses ({result.model_analyses.length})
              </span>
              <span className={`transform transition-transform ${showModelAnalyses ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showModelAnalyses && (
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                {result.model_analyses.map((analysis, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{analysis.model_name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Confidence: {Math.round(analysis.confidence * 100)}%</span>
                        <span>•</span>
                        <span>{analysis.processing_time.toFixed(2)}s</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{analysis.analysis}</p>
                    {analysis.entities_found && analysis.entities_found.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Entities: </span>
                        {analysis.entities_found.map((entity, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                            {entity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Medical Disclaimer:</strong> {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
export default AIResultCard;
