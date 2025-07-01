import React, { useState, useEffect } from 'react';

interface HealthMetric {
  date: string;
  severity: number;
  urgency: number;
  confidence: number;
}

interface SymptomPattern {
  symptom: string;
  frequency: number;
  lastReported: string;
}

interface HealthInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  actionRequired: boolean;
}

const HealthDashboard: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [symptomPatterns, setSymptomPatterns] = useState<SymptomPattern[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health-dashboard');
      const data = await response.json();
      
      setHealthMetrics(data.metrics);
      setSymptomPatterns(data.patterns);
      setHealthInsights(data.insights);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
          <p className="text-gray-600">Track your health patterns and insights over time</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{healthMetrics.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Severity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.length > 0 
                    ? (healthMetrics.reduce((acc, metric) => acc + metric.severity, 0) / healthMetrics.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Common Symptoms</p>
                <p className="text-2xl font-bold text-gray-900">{symptomPatterns.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.length > 0 
                    ? Math.round((healthMetrics.reduce((acc, metric) => acc + metric.confidence, 0) / healthMetrics.length) * 100)
                    : '0'
                  }%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Health Trends Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Trends Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Health trends visualization</p>
                <p className="text-sm">Install recharts for charts</p>
              </div>
            </div>
          </div>

          {/* Symptom Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Symptoms</h3>
            <div className="space-y-3">
              {symptomPatterns.slice(0, 5).map((pattern, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{pattern.symptom}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(pattern.frequency / Math.max(...symptomPatterns.map(p => p.frequency))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{pattern.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Insights Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
            <div className="space-y-4">
              {healthInsights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'warning' 
                      ? 'bg-orange-50 border-orange-400' 
                      : insight.type === 'success'
                      ? 'bg-green-50 border-green-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.actionRequired && (
                        <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptom Frequency Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Frequency</h3>
            <div className="space-y-4">
              {symptomPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 truncate">{pattern.symptom}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(pattern.frequency / Math.max(...symptomPatterns.map(p => p.frequency))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm text-gray-900 font-medium">{pattern.frequency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Schedule Check-up</h4>
              <p className="text-sm text-blue-100">Based on your symptom patterns, consider scheduling a routine check-up.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Monitor Symptoms</h4>
              <p className="text-sm text-blue-100">Keep tracking your symptoms to identify patterns and triggers.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Lifestyle Changes</h4>
              <p className="text-sm text-blue-100">Consider stress management and healthy lifestyle practices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
