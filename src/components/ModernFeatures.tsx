import { motion } from 'framer-motion'
import { 
  Brain, 
  Stethoscope, 
  Shield, 
  Zap, 
  Activity, 
  Heart, 
  Target, 
  Clock,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function ModernFeatures() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description: "Powered by state-of-the-art biomedical NER and clinical BERT models for accurate symptom analysis.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Stethoscope,
      title: "Clinical Accuracy",
      description: "Medical-grade analysis with confidence scoring and detailed entity extraction.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "HIPAA-compliant data handling with secure, encrypted communications.",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Get instant health insights in seconds, not minutes.",
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Activity,
      title: "Comprehensive Reports",
      description: "Detailed recommendations with urgency scoring and next steps.",
      color: "red",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "Designed with healthcare professionals and patients in mind.",
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500"
    }
  ]

  const stats = [
    { value: "99.2%", label: "Accuracy Rate", icon: Target },
    { value: "< 5s", label: "Analysis Time", icon: Clock },
    { value: "24/7", label: "Availability", icon: CheckCircle },
    { value: "1M+", label: "Analyses", icon: Sparkles }
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced AI Medical Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of healthcare with our cutting-edge AI technology
            that provides instant, accurate health insights.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Active & Ready</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience AI-Powered Healthcare?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who trust our advanced AI for accurate health analysis.
              Start your journey to better health insights today.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300">
              Try Analysis Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
