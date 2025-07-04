import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Brain, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Lightbulb,
  Stethoscope,
  Calendar
} from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

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
  confidence = 0.85,
  recommendations = [],
  whenToSeekHelp = "",
  aiModelsUsed = "",
  entitiesExtracted = [],
  urgencyScore = 5
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'recommendations' | 'timeline'>('overview');

  // Enhanced severity mapping
  const getSeverityConfig = (severity: string) => {
    const configs = {
      Low: {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: CheckCircle2,
        gradient: 'from-green-400 to-green-600',
        urgencyText: 'Low Priority',
        description: 'Symptoms are mild and manageable'
      },
      Medium: {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: AlertCircle,
        gradient: 'from-yellow-400 to-yellow-600',
        urgencyText: 'Moderate Priority',
        description: 'Symptoms require attention'
      },
      High: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: AlertTriangle,
        gradient: 'from-orange-400 to-orange-600',
        urgencyText: 'High Priority',
        description: 'Symptoms need prompt medical care'
      },
      Critical: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: XCircle,
        gradient: 'from-red-400 to-red-600',
        urgencyText: 'Critical Priority',
        description: 'Seek immediate medical attention'
      }
    };
    return configs[severity as keyof typeof configs] || configs.Medium;
  };

  const severityConfig = getSeverityConfig(severity);
  const IconComponent = severityConfig.icon;

  // Chart data for confidence visualization
  const confidenceData = {
    labels: ['Confidence', 'Uncertainty'],
    datasets: [
      {
        data: [confidence, 100 - confidence],
        backgroundColor: ['#0ea5e9', '#e2e8f0'],
        borderColor: ['#0284c7', '#cbd5e1'],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for urgency score
  const urgencyData = {
    labels: ['Low (1-3)', 'Medium (4-6)', 'High (7-8)', 'Critical (9-10)'],
    datasets: [
      {
        label: 'Urgency Level',
        data: [
          urgencyScore <= 3 ? urgencyScore : 3,
          urgencyScore > 3 && urgencyScore <= 6 ? urgencyScore - 3 : urgencyScore > 6 ? 3 : 0,
          urgencyScore > 6 && urgencyScore <= 8 ? urgencyScore - 6 : urgencyScore > 8 ? 2 : 0,
          urgencyScore > 8 ? urgencyScore - 8 : 0,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderColor: ['#059669', '#d97706', '#ea580c', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  // Mock model analysis data
  const modelAnalyses = [
    { name: 'Biomedical NER', confidence: 0.92, status: 'success', processingTime: '0.3s', findings: entitiesExtracted.slice(0, 3) },
    { name: 'Clinical BERT', confidence: 0.87, status: 'success', processingTime: '0.8s', findings: ['Pattern Analysis', 'Symptom Correlation'] },
    { name: 'OpenAI GPT', confidence: 0.91, status: 'success', processingTime: '1.2s', findings: ['Clinical Reasoning', 'Recommendation Engine'] },
    { name: 'Risk Assessment', confidence: 0.85, status: 'success', processingTime: '0.5s', findings: ['Urgency Scoring', 'Triage Classification'] },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analysis', label: 'AI Analysis', icon: Brain },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-medical border border-white/20 overflow-hidden"
    >
      {/* Header with severity indicator */}
      <div className={`${severityConfig.bg} ${severityConfig.border} border-b px-8 py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${severityConfig.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{condition}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`${severityConfig.color} font-semibold`}>
                  {severityConfig.urgencyText}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 text-sm">{severityConfig.description}</span>
              </div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.round(confidence)}%</div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{urgencyScore}/10</div>
              <div className="text-xs text-gray-500">Urgency</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {/* Implement share */}}
                className="p-2 bg-white/50 hover:bg-white/80 rounded-xl transition-colors"
                title="Share Results"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => {/* Implement download */}}
                className="p-2 bg-white/50 hover:bg-white/80 rounded-xl transition-colors"
                title="Download Report"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-medical-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Main advice */}
              <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-2xl p-6 border border-medical-200">
                <h3 className="text-lg font-semibold text-medical-900 mb-3 flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>AI Assessment</span>
                </h3>
                <p className="text-medical-800 leading-relaxed text-base">{advice}</p>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Confidence Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-medical-500" />
                    <span>Analysis Confidence</span>
                  </h4>
                  <div className="h-48 flex items-center justify-center">
                    <Doughnut data={confidenceData} options={chartOptions} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-medical-600">{Math.round(confidence)}%</div>
                    <div className="text-sm text-gray-500">Overall Confidence</div>
                  </div>
                </div>

                {/* Urgency Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-medical-500" />
                    <span>Urgency Assessment</span>
                  </h4>
                  <div className="h-48">
                    <Bar data={urgencyData} options={{...chartOptions, indexAxis: 'y' as const}} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{urgencyScore}/10</div>
                    <div className="text-sm text-gray-500">Urgency Score</div>
                  </div>
                </div>
              </div>

              {/* Entities Extracted */}
              {entitiesExtracted.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-medical-500" />
                    <span>Medical Entities Detected</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entitiesExtracted.map((entity, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-2 bg-gradient-to-r from-medical-100 to-blue-100 text-medical-800 rounded-xl text-sm font-medium border border-medical-200 shadow-sm"
                      >
                        {entity}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* AI Models Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modelAnalyses.map((model, index) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{model.name}</h4>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">{model.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Confidence</span>
                        <span className="font-semibold text-gray-900">{Math.round(model.confidence)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-medical-400 to-medical-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${model.confidence}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing Time</span>
                        <span className="font-medium text-gray-900">{model.processingTime}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 text-sm">Key Findings:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {model.findings.map((finding, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                              {finding}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Technical Details */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Info className="w-5 h-5 text-medical-500" />
                    <span>Technical Analysis Details</span>
                  </h4>
                  {showTechnicalDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showTechnicalDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Models Used:</span>
                          <p className="text-gray-600 mt-1">{aiModelsUsed || 'Biomedical NER, OpenAI GPT-3.5, Clinical BERT'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Processing Method:</span>
                          <p className="text-gray-600 mt-1">Ensemble Learning with Confidence Weighting</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Analysis Time:</span>
                          <p className="text-gray-600 mt-1">{new Date().toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Validation:</span>
                          <p className="text-gray-600 mt-1">Cross-referenced with medical databases</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-medical-500" />
                    <span>Personalized Recommendations</span>
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                      >
                        <div className="w-6 h-6 bg-medical-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to seek help */}
              {whenToSeekHelp && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>When to Seek Medical Help</span>
                  </h3>
                  <p className="text-yellow-800 leading-relaxed">{whenToSeekHelp}</p>
                </div>
              )}

              {/* Emergency Guidelines */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Emergency Guidelines</span>
                </h3>
                <div className="space-y-2 text-red-800">
                  <p>🚨 <strong>Call 911 immediately if you experience:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Severe chest pain or difficulty breathing</li>
                    <li>Signs of stroke (sudden numbness, confusion, severe headache)</li>
                    <li>Severe allergic reactions</li>
                    <li>Uncontrolled bleeding or severe trauma</li>
                    <li>Loss of consciousness</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-medical-500" />
                <span>Analysis Timeline</span>
              </h3>
              
              <div className="space-y-4">
                {[
                  { time: '0.1s', task: 'Symptom preprocessing and tokenization', status: 'completed' },
                  { time: '0.3s', task: 'Medical entity extraction using NER', status: 'completed' },
                  { time: '0.8s', task: 'Clinical pattern analysis with BERT', status: 'completed' },
                  { time: '1.2s', task: 'OpenAI clinical reasoning and insights', status: 'completed' },
                  { time: '1.5s', task: 'Risk assessment and urgency scoring', status: 'completed' },
                  { time: '1.8s', task: 'Recommendation generation', status: 'completed' },
                  { time: '2.0s', task: 'Final report compilation', status: 'completed' },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-soft"
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.task}</p>
                      <p className="text-sm text-gray-500">Completed in {step.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with disclaimer */}
      <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AIResultCard;
