import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Stethoscope, 
  Brain, 
  Activity, 
  Info, 
  Shield,
  Github,
  Sparkles
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '#home', icon: Activity },
    { name: 'Features', href: '#features', icon: Brain },
    { name: 'About', href: '#about', icon: Info },
    { name: 'Privacy', href: '#privacy', icon: Shield },
  ];

  const stats = [
    { label: 'AI Models', value: '7+', color: 'text-medical-500' },
    { label: 'Accuracy', value: '94%', color: 'text-green-500' },
    { label: 'Analyses', value: '10K+', color: 'text-purple-500' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative backdrop-blur-xl bg-white/80 dark:bg-clinical-900/80 shadow-medical border-b border-white/20 dark:border-clinical-700/50 sticky top-0 z-50"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-medical-600/5 via-transparent to-medical-600/5 dark:from-medical-400/10 dark:to-medical-400/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          {/* Logo and branding */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-medical-500 to-medical-600 dark:from-medical-400 dark:to-medical-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-medical-700 to-medical-800 dark:from-white dark:via-medical-300 dark:to-medical-200 bg-clip-text text-transparent">
                MedAI Advanced
              </h1>
              <p className="text-sm text-gray-600 dark:text-clinical-300 hidden sm:block">
                Professional AI Symptom Analysis
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 dark:text-clinical-200 hover:text-medical-600 dark:hover:text-medical-400 transition-colors duration-200 font-medium"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.a>
              );
            })}
          </nav>

          {/* Stats and Controls */}
          <div className="flex items-center space-x-6">
            {/* Stats (hidden on mobile) */}
            <div className="hidden xl:flex items-center space-x-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-center"
                >
                  <div className={`text-lg font-bold ${stat.color} dark:opacity-90`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-clinical-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="relative p-3 bg-gray-100 dark:bg-clinical-800 hover:bg-gray-200 dark:hover:bg-clinical-700 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            {/* External Links */}
            <div className="hidden sm:flex items-center space-x-2">
              <motion.a
                href="https://github.com/faizanshoukat5/Ai-symptom-analyzer"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 dark:bg-clinical-800 hover:bg-gray-200 dark:hover:bg-clinical-700 rounded-xl transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View on GitHub"
              >
                <Github className="w-4 h-4 text-gray-600 dark:text-clinical-300 group-hover:text-gray-900 dark:group-hover:text-white" />
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-gray-100 dark:bg-clinical-800 hover:bg-gray-200 dark:hover:bg-clinical-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-clinical-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-clinical-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Feature Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-medical-50 via-blue-50 to-indigo-50 dark:from-medical-900/20 dark:via-clinical-800/50 dark:to-indigo-900/20 rounded-2xl p-6 border border-medical-200/50 dark:border-clinical-600/30">
            <div className="text-center">
              <motion.div
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-medical-500 to-medical-600 dark:from-medical-400 dark:to-medical-500 text-white px-4 py-2 rounded-xl shadow-lg mb-3"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-sm">Advanced AI Backend Active</span>
              </motion.div>
              
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Professional-grade AI symptom analysis using advanced biomedical models
              </h2>
              <p className="text-gray-600 dark:text-clinical-300 max-w-3xl mx-auto leading-relaxed">
                Our ensemble of specialized AI models including Biomedical NER, Clinical BERT, and OpenAI GPT 
                provides comprehensive symptom analysis with clinical-grade accuracy.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {[
                  '🔬 Biomedical Entity Recognition',
                  '🧠 Advanced Clinical Analysis', 
                  '⚡ Real-time Processing',
                  '🛡️ HIPAA Compliant',
                  '📊 Confidence Scoring'
                ].map((feature, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white/80 dark:bg-clinical-800/80 text-gray-700 dark:text-clinical-200 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200 dark:border-clinical-600 shadow-sm"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 dark:bg-clinical-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-clinical-700"
          >
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-clinical-800 hover:bg-medical-50 dark:hover:bg-clinical-700 rounded-xl transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <IconComponent className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </motion.a>
                );
              })}
              
              {/* Mobile stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-clinical-700">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-lg font-bold ${stat.color} dark:opacity-90`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-clinical-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;