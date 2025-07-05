import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff, FileText, Sparkles, User, Calendar } from 'lucide-react'

interface ModernSymptomFormProps {
  onSubmit: (symptoms: string) => void
  loading: boolean
}

export default function ModernSymptomForm({ onSubmit, loading }: ModernSymptomFormProps) {
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symptoms.trim()) {
      onSubmit(symptoms.trim())
    }
  }

  const exampleSymptoms = [
    "Headache and fever for 3 days",
    "Chest pain and shortness of breath",
    "Persistent cough with fatigue",
    "Stomach pain and nausea",
    "Joint pain and stiffness"
  ]

  const handleExampleClick = (example: string) => {
    setSymptoms(example)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Symptom Input */}
        <div className="relative">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Describe your symptoms in detail
            </div>
          </label>
          <div className="relative">
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe your symptoms, including when they started, how severe they are, and any other relevant details..."
              className="textarea placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12"
              rows={4}
              required
            />
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {symptoms.length}/1000 characters
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Optional for better analysis
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age
                </div>
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 30"
                className="input"
                min="1"
                max="120"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Gender
                </div>
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input"
              >
                <option value="">Select (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={!symptoms.trim() || loading}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing Symptoms...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Analyze Symptoms
            </div>
          )}
        </motion.button>
      </form>

      {/* Example Symptoms */}
      {!symptoms && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4" />
            Quick examples to try:
          </div>
          <div className="flex flex-wrap gap-2">
            {exampleSymptoms.map((example, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 dark:text-red-400">
            Recording voice input... (Feature coming soon)
          </span>
        </motion.div>
      )}
    </div>
  )
}
