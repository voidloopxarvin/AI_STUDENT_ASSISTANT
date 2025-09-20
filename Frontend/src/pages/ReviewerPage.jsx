import React, { useState, useEffect } from 'react';
import { Code, Play, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { apiService } from '../services/api';

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
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'security': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'performance': return <Play className="w-4 h-4 text-orange-500" />;
      case 'style': return <FileText className="w-4 h-4 text-blue-500" />;
      default: return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
            <Code className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Code Reviewer</h1>
          <p className="text-lg text-gray-600">
            Get intelligent feedback on your code quality, security, and performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Code Input</h2>
            
            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Type
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="comprehensive">Comprehensive Review</option>
                <option value="security">Security Focus</option>
                <option value="performance">Performance Focus</option>
                <option value="style">Style & Best Practices</option>
              </select>
            </div>

            {/* Code Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Code
              </label>
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={`Paste your ${selectedLanguage} code here...`}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeCode}
              disabled={isAnalyzing || !inputCode.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
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
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
            
            {!reviewResults ? (
              <div className="text-center py-12">
                <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter code and click "Analyze Code" to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-800">Overall Score</span>
                    <span className="text-3xl font-bold text-indigo-600">
                      {reviewResults.overallScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${reviewResults.overallScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                {reviewResults.metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(reviewResults.metrics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 capitalize">{key}</div>
                        <div className="text-2xl font-bold text-gray-800">{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Issues */}
                {reviewResults.issues && reviewResults.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Issues Found</h3>
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
                                  <span className="text-xs text-gray-500">Line {issue.line}</span>
                                )}
                              </div>
                              <p className="text-sm mb-2">{issue.message}</p>
                              {issue.suggestion && (
                                <p className="text-xs text-gray-600">
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggestions</h3>
                    <ul className="space-y-2">
                      {reviewResults.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Positives */}
                {reviewResults.positives && reviewResults.positives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Good</h3>
                    <ul className="space-y-2">
                      {reviewResults.positives.map((positive, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{positive}</span>
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
  );
};

export default ReviewerPage;