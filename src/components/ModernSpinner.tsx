import { motion } from 'framer-motion'
import { Brain, Activity, Stethoscope, Search, Sparkles } from 'lucide-react'

export default function ModernSpinner() {
  const steps = [
    { icon: Search, text: "Analyzing symptoms...", delay: 0 },
    { icon: Brain, text: "Extracting medical entities...", delay: 0.5 },
    { icon: Activity, text: "Classifying conditions...", delay: 1 },
    { icon: Stethoscope, text: "Generating recommendations...", delay: 1.5 },
    { icon: Sparkles, text: "Finalizing analysis...", delay: 2 }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center">
        {/* Main Loading Animation */}
        <div className="relative mx-auto mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-white border-t-transparent rounded-full"
            />
          </div>
          
          {/* Pulsing Dots */}
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 bg-green-500 rounded-full"
            />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              className="w-3 h-3 bg-yellow-500 rounded-full"
            />
          </div>
          <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              className="w-2 h-2 bg-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Analysis in Progress
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Our advanced AI models are analyzing your symptoms
        </p>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.text}
                </p>
              </div>
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Models Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              AI Models Working
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Biomedical NER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Medical BERT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Clinical GPT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Ensemble AI</span>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
          />
          <span>Usually takes 5-10 seconds</span>
        </div>
      </div>
    </div>
  )
}
