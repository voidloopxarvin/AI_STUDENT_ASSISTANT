import React from 'react';
import { Code } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

// Replace the analyzeCode function in ReviewerPage.jsx with this:

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

export default ReviewerPage;