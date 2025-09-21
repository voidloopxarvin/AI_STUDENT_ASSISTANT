import React, { useState, useEffect } from 'react';
import { Code, Play, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { apiService } from '../services/api';
import Particles from '../components/Particles';

const ReviewerPage = () => {
  const [inputCode, setInputCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [reviewType, setReviewType] = useState('comprehensive');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [reviewResults, setReviewResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load supported languages on component mount
  useEffect(() => {
    loadSupportedLanguages();
  }, []);

  const loadSupportedLanguages = async () => {
    try {
      const response = await apiService.getSupportedLanguages();
      setSupportedLanguages(response.languages);
    } catch (err) {
      console.error('Failed to load languages:', err);
      // Fallback languages if API fails
      setSupportedLanguages([
        { id: 'javascript', name: 'JavaScript', extension: '.js' },
        { id: 'python', name: 'Python', extension: '.py' },
        { id: 'java', name: 'Java', extension: '.java' },
        { id: 'react', name: 'React JSX', extension: '.jsx' }
      ]);
    }
  };

  const analyzeCode = async () => {
    if (!inputCode.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.reviewCode(inputCode, selectedLanguage, reviewType);
      
      setReviewResults(response.review);
      setSuccess('Code analysis completed!');
    } catch (err) {
      setError('Failed to analyze code. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-gray-300 bg-gray-900/30 border-gray-400/30';
      case 'medium': return 'text-gray-300 bg-gray-800/30 border-gray-400/30';
      case 'low': return 'text-gray-300 bg-gray-800/30 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-800/30 border-gray-400/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      case 'security': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'performance': return <Play className="w-4 h-4 text-gray-400" />;
      case 'style': return <FileText className="w-4 h-4 text-blue-400" />;
      default: return <Code className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
          particleCount={150}
          particleSpread={8}
          speed={0.15}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 border border-blue-400/30 rounded-xl mb-4">
              <Code className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">AI Code Reviewer</h1>
            <p className="text-lg text-gray-400">
              Get intelligent feedback on your code quality, security, and performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Code Input</h2>
              
              {/* Language Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Review Type
                </label>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="comprehensive">Comprehensive Review</option>
                  <option value="security">Security Focus</option>
                  <option value="performance">Performance Focus</option>
                  <option value="style">Style & Best Practices</option>
                </select>
              </div>

              {/* Code Textarea */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Code
                </label>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={`Paste your ${selectedLanguage} code here...`}
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-white placeholder-gray-400"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeCode}
                disabled={isAnalyzing || !inputCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <Code className="w-5 h-5 mr-2" />
                    Analyze Code
                  </>
                )}
              </button>

              {/* Status Messages */}
              {error && (
                <div className="mt-4 p-3 bg-gray-900/50 border border-gray-500/50 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-300">{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500/50 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-blue-300">{success}</span>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Analysis Results</h2>
              
              {!reviewResults ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Enter code and click "Analyze Code" to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-white">Overall Score</span>
                      <span className="text-3xl font-bold text-blue-400">
                        {reviewResults.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${reviewResults.overallScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {reviewResults.metrics && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(reviewResults.metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-sm text-gray-400 capitalize">{key}</div>
                          <div className="text-2xl font-bold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Issues */}
                  {reviewResults.issues && reviewResults.issues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Issues Found</h3>
                      <div className="space-y-3">
                        {reviewResults.issues.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                          >
                            <div className="flex items-start space-x-3">
                              {getTypeIcon(issue.type)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium capitalize">{issue.type}</span>
                                  <span className="text-xs uppercase tracking-wide font-semibold">
                                    {issue.severity}
                                  </span>
                                  {issue.line && (
                                    <span className="text-xs text-gray-400">Line {issue.line}</span>
                                  )}
                                </div>
                                <p className="text-sm mb-2">{issue.message}</p>
                                {issue.suggestion && (
                                  <p className="text-xs text-gray-300">
                                    <strong>Suggestion:</strong> {issue.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {reviewResults.suggestions && reviewResults.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Suggestions</h3>
                      <ul className="space-y-2">
                        {reviewResults.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Positives */}
                  {reviewResults.positives && reviewResults.positives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">What's Good</h3>
                      <ul className="space-y-2">
                        {reviewResults.positives.map((positive, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{positive}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerPage;