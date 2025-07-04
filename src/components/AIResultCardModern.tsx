import { motion } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle, Clock, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useState } from 'react';

interface AIResultCardModernProps {
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

export default function AIResultCardModern({
  condition,
  severity,
  advice,
  confidence = 0.85,
  recommendations = [],
  whenToSeekHelp = "",
  aiModelsUsed = "",
  entitiesExtracted = [],
  urgencyScore = 5
}: AIResultCardModernProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Severity configuration based on level
  const severityConfig = {
    Low: {
      color: 'text-green-600',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle2,
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      progress: 'bg-green-500'
    },
    Medium: {
      color: 'text-yellow-600 dark:text-yellow-500',
      bgLight: 'bg-yellow-50',
      bgDark: 'dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertCircle,
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      progress: 'bg-yellow-500'
    },
    High: {
      color: 'text-orange-600 dark:text-orange-500',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: AlertTriangle,
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      progress: 'bg-orange-500'
    },
    Critical: {
      color: 'text-red-600 dark:text-red-500',
      bgLight: 'bg-red-50',
      bgDark: 'dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      progress: 'bg-red-500'
    }
  };

  const SeverityIcon = severityConfig[severity].icon;
  const urgencyLevel = Math.round(urgencyScore || 5);
  
  return (
    <Card className="max-w-3xl mx-auto overflow-hidden">
      {/* Header with severity */}
      <div className={`-m-6 mb-6 p-6 ${severityConfig[severity].bgLight} ${severityConfig[severity].bgDark} ${severityConfig[severity].border} border-b`}>
        <div className="flex items-center">
          <div className={`mr-4 p-2 rounded-full ${severityConfig[severity].bgLight} ${severityConfig[severity].bgDark}`}>
            <SeverityIcon className={`h-8 w-8 ${severityConfig[severity].color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{condition}</h3>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig[severity].badge}`}>
                {severity} Severity
              </span>
              {confidence && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(confidence)}% confidence
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main advice */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Professional Assessment</h4>
        <p className="text-gray-700 dark:text-gray-300">{advice}</p>
      </div>
      
      {/* Urgency Score */}
      {urgencyScore !== undefined && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgency Score</h4>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${severityConfig[severity].progress}`} 
              style={{ width: `${(urgencyLevel / 10) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recommendations</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* When to seek help */}
      {whenToSeekHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
          <div className="flex">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">When to Seek Medical Help</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{whenToSeekHelp}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced Section Toggle */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="ghost" 
          className="w-full justify-between" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            Advanced AI Analysis Details
          </span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {/* AI Models */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Models Used</h4>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 font-mono">
                {aiModelsUsed || 'Biomedical Analysis Model'}
              </div>
            </div>
            
            {/* Entities Extracted */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical Entities Extracted</h4>
              <div className="flex flex-wrap gap-2">
                {entitiesExtracted && entitiesExtracted.length > 0 ? (
                  entitiesExtracted.map((entity, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full"
                    >
                      {entity}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No specific medical entities were extracted from your description.
                  </span>
                )}
              </div>
            </div>
            
            {/* Processing Details */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Processing Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Confidence:</span> 
                  <span className="ml-1 text-gray-800 dark:text-gray-200">{Math.round(confidence || 0)}%</span>
                </div>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Urgency:</span> 
                  <span className="ml-1 text-gray-800 dark:text-gray-200">{urgencyScore || 5}/10</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
              This analysis is powered by advanced medical AI models and is intended for informational purposes only.
              Always consult with a healthcare professional for medical advice.
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
