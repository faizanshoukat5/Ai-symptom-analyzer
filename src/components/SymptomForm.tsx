import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, FileText, Sparkles, AlertCircle, CheckCircle, Clock, User, Calendar, Activity } from "lucide-react";
import VoiceSymptomInput from "./VoiceSymptomInput";

interface SymptomFormProps {
  onSubmit: (symptoms: string) => void;
  loading: boolean;
}

interface SymptomTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  template: string;
  category: string;
}

const symptomTemplates: SymptomTemplate[] = [
  {
    id: "respiratory",
    name: "Respiratory Issues",
    icon: "🫁",
    description: "Breathing, cough, chest pain",
    template: "I've been experiencing [cough/shortness of breath/chest pain] for [duration]. The symptoms are [mild/moderate/severe] and occur [when/frequency]. Additional details: ",
    category: "respiratory"
  },
  {
    id: "digestive",
    name: "Digestive Problems",
    icon: "🍽️",
    description: "Stomach pain, nausea, digestion",
    template: "I have [stomach pain/nausea/diarrhea/constipation] that started [when]. The pain is [location] and feels [sharp/dull/cramping]. It's [mild/moderate/severe] and [better/worse] after eating. Additional details: ",
    category: "digestive"
  },
  {
    id: "neurological",
    name: "Neurological Symptoms",
    icon: "🧠",
    description: "Headache, dizziness, numbness",
    template: "I'm experiencing [headache/dizziness/numbness/tingling] [location] for [duration]. The intensity is [mild/moderate/severe] and [constant/intermittent]. It [improves/worsens] with [activity/rest]. Additional details: ",
    category: "neurological"
  },
  {
    id: "pain",
    name: "Pain & Discomfort",
    icon: "⚡",
    description: "Joint, muscle, or general pain",
    template: "I have [sharp/dull/throbbing/aching] pain in [location] that started [when]. The pain is [1-10 scale] and [constant/comes and goes]. It's [better/worse] with [movement/rest]. Additional details: ",
    category: "pain"
  },
  {
    id: "skin",
    name: "Skin Conditions",
    icon: "🩹",
    description: "Rash, itching, skin changes",
    template: "I have a [rash/bump/spot/discoloration] on [location] that appeared [when]. It's [size] and [color]. It [itches/hurts/is painless] and [spreading/staying same/improving]. Additional details: ",
    category: "skin"
  },
  {
    id: "general",
    name: "General Symptoms",
    icon: "🌡️",
    description: "Fever, fatigue, general wellness",
    template: "I've been feeling [tired/weak/feverish/unwell] for [duration]. My energy level is [low/moderate] and I've noticed [appetite changes/sleep issues/mood changes]. Additional details: ",
    category: "general"
  }
];

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, loading }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SymptomTemplate | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick symptom suggestions
  const quickSuggestions = [
    "Headache for 2 days",
    "Chest pain when breathing",
    "Stomach pain after eating",
    "Fever and chills",
    "Difficulty sleeping",
    "Joint pain and stiffness"
  ];

  useEffect(() => {
    const words = input.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setIsValid(input.trim().length >= 10 && words.length >= 3);
    
    // Simple urgency detection
    const urgentKeywords = ['severe', 'emergency', 'can\'t breathe', 'chest pain', 'blood', 'unconscious'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    if (hasUrgentKeywords) {
      setUrgencyLevel('high');
    } else if (input.length > 100) {
      setUrgencyLevel('medium');
    } else {
      setUrgencyLevel('low');
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!input.trim()) {
      setError("Please describe your symptoms before submitting.");
      return;
    }
    
    if (input.trim().length < 10) {
      setError("Please provide more details about your symptoms (at least 10 characters).");
      return;
    }

    if (wordCount < 3) {
      setError("Please provide more descriptive details (at least 3 words).");
      return;
    }
    
    onSubmit(input.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (error) setError("");
  };

  const handleTemplateSelect = (template: SymptomTemplate) => {
    setInput(template.template);
    setSelectedTemplate(template);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(prev => prev ? `${prev} ${suggestion}` : suggestion);
    textareaRef.current?.focus();
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    setShowVoiceInput(false);
  };

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = () => {
    switch (urgencyLevel) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-medical-500 to-medical-600 text-white px-6 py-3 rounded-2xl shadow-lg mb-4"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI-Powered Symptom Analysis</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-lg"
        >
          Describe your symptoms in detail for accurate AI analysis
        </motion.p>
      </div>

      {/* Voice Input Modal */}
      <AnimatePresence>
        {showVoiceInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Voice Input</h3>
                  <button
                    onClick={() => setShowVoiceInput(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <VoiceSymptomInput
                  onTranscriptChange={handleVoiceTranscript}
                  onSubmit={handleVoiceTranscript}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-500" />
              <span>Symptom Templates</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-medical-600 hover:text-medical-700 font-medium text-sm transition-colors"
            >
              {showTemplates ? 'Hide' : 'Show'} Templates
            </button>
          </div>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {symptomTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-medical-50 hover:to-medical-100 rounded-xl border border-gray-200 hover:border-medical-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {template.icon}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-medical-700">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="symptoms" className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-medical-500" />
              <span>Describe Your Symptoms</span>
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowVoiceInput(true)}
                className="p-2 bg-medical-500 hover:bg-medical-600 text-white rounded-xl transition-colors"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-sm text-medical-600 hover:text-medical-700 font-medium"
              >
                💡 Tips
              </button>
            </div>
          </div>

          {/* Writing Tips */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <h4 className="font-medium text-blue-900 mb-2">💡 Writing Effective Symptom Descriptions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include when symptoms started (timeline)</li>
                  <li>• Describe severity level (mild, moderate, severe)</li>
                  <li>• Mention location and what triggers/relieves symptoms</li>
                  <li>• Add any relevant medical history or medications</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <textarea
              ref={textareaRef}
              id="symptoms"
              value={input}
              onChange={handleInputChange}
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm placeholder:text-gray-400"
              placeholder="Start typing your symptoms here... Be as detailed as possible. For example: 'I've been having a persistent headache for 3 days. It's located on the right side of my head and feels like a throbbing pain, around 7/10 severity. It gets worse with bright lights and improves slightly with rest.'"
              disabled={loading}
            />
            
            {/* Character count and validation indicators */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              {urgencyLevel && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor()}`}>
                  {getUrgencyIcon()}
                  <span>{urgencyLevel === 'high' ? 'Urgent' : urgencyLevel === 'medium' ? 'Moderate' : 'Low'} Priority</span>
                </div>
              )}
              <div className={`text-sm px-2 py-1 rounded-full ${isValid ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                {wordCount} words
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Suggestions */}
        {!input && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft border border-white/20 p-6"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Quick Examples:</h3>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-gray-100 hover:bg-medical-100 text-gray-700 hover:text-medical-700 rounded-xl text-sm transition-all duration-200 border border-gray-200 hover:border-medical-300"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze My Symptoms</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 space-y-2"
        >
          <div className="flex items-center justify-center space-x-4">
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>HIPAA Compliant</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Data Secure</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Real-time Analysis</span>
            </span>
          </div>
          <p className="max-w-2xl mx-auto">
            This AI tool provides preliminary insights and should not replace professional medical consultation. 
            For emergencies, call 911 immediately.
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default SymptomForm;
