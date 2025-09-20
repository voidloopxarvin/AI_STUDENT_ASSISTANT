import React, { useState, useCallback } from 'react';
import { 
  BookOpen, 
  Upload, 
  Calendar,
  Clock,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  Star,
  ChevronRight,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import Particles from '../components/Particles';

const PlannerPage = () => {
  const [file, setFile] = useState(null);
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState(2);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [studyTimer, setStudyTimer] = useState({ minutes: 25, seconds: 0, isRunning: false, isBreak: false });

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

  // Generate study plan - CORRECTED VERSION
  const generateStudyPlan = async () => {
    if (!file) {
      setError('Please upload a study material file');
      return;
    }
    if (!examDate) {
      setError('Please select your exam date');
      return;
    }

    const examDateTime = new Date(examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDateTime - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) {
      setError('Exam date must be in the future');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('examDate', examDate);
      formData.append('studyHours', studyHours);
      formData.append('difficulty', difficulty);

      const response = await apiService.createStudyPlan(formData);
      
      setStudyPlan(response.studyPlan);
      setActiveTab('plan');
      setSuccess('Study plan generated successfully!');
    } catch (err) {
      setError('Failed to generate study plan. Please try again.');
      console.error('Study plan generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Pomodoro timer functions
  const startTimer = () => {
    setStudyTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setStudyTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setStudyTimer({ minutes: 25, seconds: 0, isRunning: false, isBreak: false });
  };

  // Timer effect
  React.useEffect(() => {
    let interval = null;
    if (studyTimer.isRunning) {
      interval = setInterval(() => {
        setStudyTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            return { 
              ...prev, 
              isRunning: false, 
              isBreak: !prev.isBreak,
              minutes: prev.isBreak ? 25 : 5,
              seconds: 0
            };
          }
        });
      }, 1000);
    } else if (!studyTimer.isRunning && studyTimer.seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [studyTimer.isRunning, studyTimer.seconds, studyTimer.minutes]);

  return (

    <div className="min-h-screen bg-gray-900 text-white">
     {/* Particles Background */}
    <div className="absolute inset-0 z-0">
      <Particles
        particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
        particleCount={150}
        particleSpread={8}
        speed={0.15}
        particleBaseSize={80}
        moveParticlesOnHover={true}
        alphaParticles={true}
        disableRotation={false}
        className="absolute inset-0"
      />
    </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4 mr-2" />
            AI-Powered Study Planner
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Smart Study Planning
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload your study materials and get a personalized AI-generated study plan tailored to your exam schedule
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/50 border border-green-500/50 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <span className="text-green-300">{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload & Setup
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                activeTab === 'plan'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Target className="h-4 w-4 mr-2" />
              Study Plan
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                activeTab === 'timer'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Study Timer
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* File Upload Section */}
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="h-5 w-5 text-blue-400 mr-2" />
                Upload Study Materials
              </h3>

              {/* Drop Zone */}
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
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                    <h4 className="text-lg font-medium text-white">{file.name}</h4>
                    <p className="text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-300 flex items-center mx-auto"
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
                      <label className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer inline-flex items-center">
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

            {/* Configuration Section */}
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Calendar className="h-5 w-5 text-green-400 mr-2" />
                Study Configuration
              </h3>

              <div className="space-y-6">
                {/* Exam Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>

                {/* Daily Study Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Study Hours: {studyHours}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1h</span>
                    <span>4h</span>
                    <span>8h</span>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                          difficulty === level
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateStudyPlan}
                  disabled={isGenerating || !file || !examDate}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-5 w-5 mr-2 animate-pulse" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate Study Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && studyPlan && (
          <div className="space-y-8">
            {/* Study Plan Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
                <Calendar className="h-8 w-8 text-blue-300 mb-3" />
                <h4 className="text-lg font-semibold text-white mb-1">Days Left</h4>
                <p className="text-2xl font-bold text-blue-300">{studyPlan.daysUntilExam}</p>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
                <Clock className="h-8 w-8 text-green-300 mb-3" />
                <h4 className="text-lg font-semibold text-white mb-1">Total Hours</h4>
                <p className="text-2xl font-bold text-green-300">{studyPlan.totalHours}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
                <Target className="h-8 w-8 text-purple-300 mb-3" />
                <h4 className="text-lg font-semibold text-white mb-1">Daily Hours</h4>
                <p className="text-2xl font-bold text-purple-300">{studyHours}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-6 border border-orange-700">
                <TrendingUp className="h-8 w-8 text-orange-300 mb-3" />
                <h4 className="text-lg font-semibold text-white mb-1">Difficulty</h4>
                <p className="text-2xl font-bold text-orange-300 capitalize">{studyPlan.difficulty}</p>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Subject Time Allocation</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {studyPlan.subjects.map((subject, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center mb-3`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{subject.name}</h4>
                    <p className="text-gray-400 mb-2">{subject.hours} hours total</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      subject.priority === 'High' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {subject.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Weekly Schedule</h3>
              <div className="space-y-4">
                {studyPlan.weeklySchedule.map((week, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">Week {week.week}</h4>
                      <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                        Focus: {week.focus}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {week.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center text-gray-400">
                          <ChevronRight className="h-4 w-4 mr-2 text-blue-400" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Tips */}
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                AI Study Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {studyPlan.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <p className="text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400 mr-2" />
                Pomodoro Study Timer
              </h3>

              {/* Timer Display */}
              <div className="mb-8">
                <div className={`text-6xl font-bold mb-4 ${
                  studyTimer.isBreak ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {String(studyTimer.minutes).padStart(2, '0')}:
                  {String(studyTimer.seconds).padStart(2, '0')}
                </div>
                <p className="text-lg text-gray-400">
                  {studyTimer.isBreak ? 'Break Time!' : 'Focus Time'}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={studyTimer.isRunning ? pauseTimer : startTimer}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                >
                  {studyTimer.isRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </button>
              </div>

              {/* Timer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-2">Work Session</h4>
                  <p className="text-blue-400">25 minutes focused study</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-2">Break Time</h4>
                  <p className="text-green-400">5 minutes rest & refresh</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default PlannerPage;