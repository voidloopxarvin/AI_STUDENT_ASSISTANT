import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Zap,
  BookOpen,
  Brain,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  Lightbulb
} from 'lucide-react';
import { apiService } from '../services/api';
import Particles from '../components/Particles';

const NotesPage = () => {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyMode, setStudyMode] = useState(false);
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'text'

  // File upload handler
  const handleFileUpload = useCallback((uploadedFile) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(uploadedFile.type)) {
      setError('Please upload a PDF, DOC, or TXT file');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
    setError('');
    setSuccess(`${uploadedFile.name} uploaded successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Process notes (generate summary and flashcards)
  const processNotes = async () => {
    if (inputMethod === 'file' && !file) {
      setError('Please upload a file or switch to text input');
      return;
    }
    if (inputMethod === 'text' && !textInput.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSummary('');
    setFlashcards([]);

    try {
      let response;
      
      if (inputMethod === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        response = await apiService.processNotes(formData);
      } else {
        response = await apiService.processTextNotes(textInput);
      }

      setSummary(response.summary);
      setFlashcards(response.flashcards || []);
      setActiveTab('results');
      setSuccess('Notes processed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to process notes. Please try again.');
      console.error('Notes processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Flashcard handlers
  const flipCard = (index) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => 
      prev < flashcards.length - 1 ? prev + 1 : 0
    );
    setFlippedCards(new Set());
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => 
      prev > 0 ? prev - 1 : flashcards.length - 1
    );
    setFlippedCards(new Set());
  };

  const resetStudy = () => {
    setCurrentCardIndex(0);
    setFlippedCards(new Set());
  };

  // Export functions
  const exportSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportFlashcards = () => {
    const flashcardsText = flashcards.map((card, index) => 
      `Card ${index + 1}:\nQ: ${card.question}\nA: ${card.answer}\n\n`
    ).join('');
    
    const blob = new Blob([flashcardsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcards.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
          particleCount={120}
          particleSpread={10}
          speed={0.12}
          particleBaseSize={75}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-blue-900/30 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Lightbulb className="h-4 w-4 mr-2" />
              AI-Powered Notes Processing
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Notes Summarizer & Flashcards
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Upload your study materials or paste text to get AI-generated summaries and interactive flashcards
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-gray-900/50 border border-gray-600/50 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-blue-900/50 border border-blue-500/50 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-400 mr-3" />
              <span className="text-blue-300">{success}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Input
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                  activeTab === 'results'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Brain className="h-4 w-4 mr-2" />
                Results
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto">
              {/* Input Method Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setInputMethod('file')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      inputMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    onClick={() => setInputMethod('text')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      inputMethod === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Text Input
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                {inputMethod === 'file' ? (
                  // File Upload Section
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <FileText className="h-5 w-5 text-blue-400 mr-2" />
                      Upload Study Materials
                    </h3>

                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="space-y-3">
                          <CheckCircle className="h-12 w-12 text-blue-400 mx-auto" />
                          <h4 className="text-lg font-medium text-white">{file.name}</h4>
                          <p className="text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <button
                            onClick={() => setFile(null)}
                            className="text-gray-400 hover:text-gray-300 flex items-center mx-auto"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <h4 className="text-lg font-medium text-white mb-2">
                              Drop your files here
                            </h4>
                            <p className="text-gray-400 mb-4">
                              PDF, DOC, or TXT files up to 10MB
                            </p>
                            <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer inline-flex items-center">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Text Input Section
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <FileText className="h-5 w-5 text-blue-400 mr-2" />
                      Enter Your Notes
                    </h3>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your notes, lecture content, or study material here..."
                      className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                )}

                {/* Process Button */}
                <div className="mt-6">
                  <button
                    onClick={processNotes}
                    disabled={isProcessing || (inputMethod === 'file' && !file) || (inputMethod === 'text' && !textInput.trim())}
                    className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Processing Notes...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Generate Summary & Flashcards
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (summary || flashcards.length > 0) && (
            <div className="space-y-8">
              {/* Summary Section */}
              {summary && (
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-white flex items-center">
                      <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
                      Summary
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(summary)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all flex items-center text-sm"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </button>
                      <button
                        onClick={exportSummary}
                        className="px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-800/50 border border-blue-500/50 hover:border-blue-400 transition-all flex items-center text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flashcards Section */}
              {flashcards.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-white flex items-center">
                      <Brain className="h-6 w-6 text-blue-400 mr-2" />
                      Flashcards ({flashcards.length})
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setStudyMode(!studyMode)}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center text-sm ${
                          studyMode
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {studyMode ? 'Exit Study Mode' : 'Study Mode'}
                      </button>
                      <button
                        onClick={exportFlashcards}
                        className="px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-800/50 border border-blue-500/50 hover:border-blue-400 transition-all flex items-center text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>

                  {studyMode ? (
                    // Study Mode - Single Card View
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                        <button
                          onClick={resetStudy}
                          className="flex items-center hover:text-blue-400 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </button>
                      </div>
                      
                      <div className="relative h-64">
                        <div
                          className="w-full h-full bg-gray-800/50 rounded-xl border border-gray-700 cursor-pointer transition-all hover:border-blue-500/50 transform hover:scale-105 flex items-center justify-center p-6"
                          onClick={() => flipCard(currentCardIndex)}
                        >
                          {flippedCards.has(currentCardIndex) ? (
                            <div className="text-center">
                              <p className="text-lg text-white mb-2">Answer:</p>
                              <p className="text-gray-300">{flashcards[currentCardIndex].answer}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-lg text-white mb-2">Question:</p>
                              <p className="text-gray-300">{flashcards[currentCardIndex].question}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <button
                            onClick={prevCard}
                            className="absolute left-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-all pointer-events-auto"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextCard}
                            className="absolute right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-all pointer-events-auto"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">Click card to flip • Use arrows to navigate</p>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={prevCard}
                            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => flipCard(currentCardIndex)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
                          >
                            {flippedCards.has(currentCardIndex) ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Show Question
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Show Answer
                              </>
                            )}
                          </button>
                          <button
                            onClick={nextCard}
                            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Grid View - All Cards
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flashcards.map((card, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 cursor-pointer transition-all hover:border-blue-500/50 transform hover:scale-105"
                          onClick={() => flipCard(index)}
                        >
                          <div className="h-32 flex items-center justify-center">
                            {flippedCards.has(index) ? (
                              <div className="text-center">
                                <p className="text-sm text-blue-400 mb-2">Answer:</p>
                                <p className="text-gray-300 text-sm">{card.answer}</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <p className="text-sm text-blue-400 mb-2">Question:</p>
                                <p className="text-white text-sm font-medium">{card.question}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                            <span className="text-xs text-gray-500">
                              Card {index + 1} • Click to flip
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && !summary && flashcards.length === 0 && (
            <div className="text-center py-16">
              <Brain className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <p className="text-xl text-gray-400 mb-4">No results yet</p>
              <p className="text-gray-500">Upload a file or enter text to generate summaries and flashcards</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;