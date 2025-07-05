import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Brain, 
  Stethoscope, 
  Clock,
  Target,
  TrendingUp,
  List,
  Phone,
  Shield,
  Sparkles,
  Download
} from 'lucide-react'

interface AIResult {
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

interface ModernAIResultCardProps {
  result: AIResult;
  onDownloadPDF?: () => void;
}

export default function ModernAIResultCard({ result, onDownloadPDF }: ModernAIResultCardProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-300 dark:border-green-700',
          icon: CheckCircle,
          gradient: 'from-green-500 to-emerald-500'
        }
      case 'medium':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          border: 'border-yellow-300 dark:border-yellow-700',
          icon: AlertTriangle,
          gradient: 'from-yellow-500 to-orange-500'
        }
      case 'high':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-300 dark:border-red-700',
          icon: XCircle,
          gradient: 'from-red-500 to-pink-500'
        }
      case 'critical':
        return {
          color: 'text-red-700 dark:text-red-300',
          bg: 'bg-red-200 dark:bg-red-900/50',
          border: 'border-red-400 dark:border-red-600',
          icon: AlertCircle,
          gradient: 'from-red-600 to-red-700'
        }
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-300 dark:border-gray-600',
          icon: AlertCircle,
          gradient: 'from-gray-500 to-gray-600'
        }
    }
  }

  const severityConfig = getSeverityConfig(result.severity)
  const SeverityIcon = severityConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${severityConfig.bg}`}>
                <SeverityIcon className={`w-6 h-6 ${severityConfig.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {result.condition}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityConfig.bg} ${severityConfig.color} ${severityConfig.border} border`}>
                    {result.severity} Severity
                  </span>
                  {result.confidence !== undefined && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.confidence}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Urgency Score */}
          {result.urgencyScore !== undefined && (
            <div className="text-center">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${result.urgencyScore * 10}, 100`}
                    className={`${severityConfig.color}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {result.urgencyScore}/10
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Urgency
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* AI Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              AI Analysis
            </h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {result.advice}
          </p>
        </div>

        {/* Medical Entities */}
        {result.entitiesExtracted && result.entitiesExtracted.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Medical Entities Detected
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.entitiesExtracted.map((entity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-700"
                >
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Recommendations
              </h4>
            </div>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {rec}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* When to Seek Help */}
        {result.whenToSeekHelp && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                When to Seek Medical Help
              </h4>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {result.whenToSeekHelp}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {result.aiModelsUsed || 'AI-Powered Analysis'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Just now
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Secure
              </span>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment.
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button 
            className="flex-1 btn btn-secondary"
            onClick={onDownloadPDF}
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button className="flex-1 btn btn-primary">
            <TrendingUp className="w-4 h-4" />
            Get Second Opinion
          </button>
        </div>
      </div>
    </motion.div>
  )
}
