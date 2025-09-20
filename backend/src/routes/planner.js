const express = require('express');
const multer = require('multer');
const { getGeminiModel } = require('../config/gemini');
const pdfParse = require('pdf-parse');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and TXT files are allowed.'));
    }
  }
});

// Extract text from uploaded file
const extractTextFromFile = async (file) => {
  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8');
    } else {
      // For DOC files, you'd need additional parsing
      return file.buffer.toString('utf-8');
    }
  } catch (error) {
    console.error('File extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
};

// Generate study plan
router.post('/create-plan', upload.single('file'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file ? req.file.originalname : 'No file');

    const { examDate, studyHours, difficulty } = req.body;
    const file = req.file;

    // Validation
    if (!file) {
      console.log('Error: No file provided');
      return res.status(400).json({
        success: false,
        error: 'File is required for study plan generation'
      });
    }

    if (!examDate) {
      console.log('Error: No exam date provided');
      return res.status(400).json({
        success: false,
        error: 'Exam date is required'
      });
    }

    if (!studyHours) {
      console.log('Error: No study hours provided');
      return res.status(400).json({
        success: false,
        error: 'Daily study hours are required'
      });
    }

    // Calculate days until exam
    const examDateTime = new Date(examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDateTime - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) {
      console.log('Error: Invalid exam date');
      return res.status(400).json({
        success: false,
        error: 'Exam date must be in the future'
      });
    }

    console.log(`Days until exam: ${daysUntilExam}, Study hours: ${studyHours}, Difficulty: ${difficulty}`);

    // Extract text from uploaded file
    let fileContent;
    try {
      fileContent = await extractTextFromFile(file);
      console.log(`Extracted ${fileContent.length} characters from file`);
    } catch (extractError) {
      console.error('File extraction failed:', extractError);
      return res.status(400).json({
        success: false,
        error: 'Failed to process the uploaded file. Please ensure it\'s a valid PDF, DOC, or TXT file.'
      });
    }

    // Get Gemini model
    let model;
    try {
      model = getGeminiModel();
      console.log('Gemini model initialized successfully');
    } catch (modelError) {
      console.error('Gemini model initialization failed:', modelError);
      return res.status(500).json({
        success: false,
        error: 'AI service is currently unavailable. Please try again later.'
      });
    }
    
    // Enhanced prompt for study plan generation
    const studyPlanPrompt = `
Based on the following study material content and parameters, create a comprehensive study plan:

STUDY MATERIAL CONTENT:
${fileContent.substring(0, 3000)}${fileContent.length > 3000 ? '...\n(Content truncated for processing)' : ''}

PARAMETERS:
- Days until exam: ${daysUntilExam}
- Daily study hours: ${studyHours}
- Difficulty level: ${difficulty}
- Total available study hours: ${daysUntilExam * studyHours}

Please generate a detailed study plan in JSON format with the following structure:

{
  "subjects": [
    {
      "name": "Subject Name",
      "hours": number,
      "priority": "High/Medium/Low",
      "topics": ["topic1", "topic2", "topic3"],
      "color": "from-red-500 to-pink-600"
    }
  ],
  "weeklySchedule": [
    {
      "week": number,
      "focus": "Learning/Practice/Revision",
      "dailyHours": number,
      "topics": ["topic1", "topic2", "topic3"],
      "goals": ["goal1", "goal2"]
    }
  ],
  "tips": ["study tip 1", "study tip 2", "study tip 3"],
  "keyTopics": ["important topic 1", "important topic 2", "important topic 3"],
  "revisionSchedule": {
    "finalWeek": ["final week activity 1", "final week activity 2"],
    "lastThreeDays": ["last day activity 1", "last day activity 2"]
  }
}

Return ONLY valid JSON, no additional text or formatting.
    `;

    let studyPlan;
    try {
      console.log('Generating study plan with Gemini...');
      const result = await model.generateContent(studyPlanPrompt);
      const response = await result.response;
      let planText = response.text().trim();
      console.log('Received response from Gemini');

      // Clean up the response
      planText = planText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try to parse the JSON
      studyPlan = JSON.parse(planText);
      console.log('Successfully parsed AI-generated study plan');
    } catch (aiError) {
      console.error('AI generation or parsing failed:', aiError);
      console.log('Falling back to structured plan generation');
      
      // Fallback to a structured plan if AI fails
      studyPlan = generateFallbackPlan(daysUntilExam, parseInt(studyHours), difficulty);
    }

    // Add calculated fields
    studyPlan.examDate = examDate;
    studyPlan.daysUntilExam = daysUntilExam;
    studyPlan.totalHours = daysUntilExam * parseInt(studyHours);
    studyPlan.difficulty = difficulty;
    studyPlan.fileName = file.originalname;
    studyPlan.createdAt = new Date().toISOString();

    console.log('Study plan generated successfully');

    res.json({
      success: true,
      studyPlan,
      message: 'Study plan generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Detailed study plan generation error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file ? req.file.originalname : 'No file'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate study plan',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate fallback study plan
const generateFallbackPlan = (days, hoursPerDay, difficulty) => {
  const totalHours = days * hoursPerDay;
  
  // Adjust time allocation based on difficulty
  const allocation = difficulty === 'easy' 
    ? { core: 0.3, practice: 0.4, revision: 0.3 }
    : difficulty === 'hard'
    ? { core: 0.5, practice: 0.35, revision: 0.15 }
    : { core: 0.4, practice: 0.35, revision: 0.25 }; // medium
  
  return {
    subjects: [
      {
        name: 'Core Concepts',
        hours: Math.round(totalHours * allocation.core),
        priority: 'High',
        topics: ['Fundamental theories', 'Key principles', 'Basic concepts', 'Important definitions'],
        color: 'from-red-500 to-pink-600'
      },
      {
        name: 'Practice Problems',
        hours: Math.round(totalHours * allocation.practice),
        priority: 'High',
        topics: ['Sample questions', 'Mock tests', 'Problem solving', 'Previous year papers'],
        color: 'from-blue-500 to-cyan-600'
      },
      {
        name: 'Review & Revision',
        hours: Math.round(totalHours * allocation.revision),
        priority: 'Medium',
        topics: ['Summary notes', 'Quick review', 'Final preparation', 'Weak area focus'],
        color: 'from-green-500 to-emerald-600'
      }
    ],
    weeklySchedule: generateWeeklySchedule(days, hoursPerDay),
    tips: [
      'Start with the most challenging topics when your mind is fresh',
      'Use active recall techniques instead of passive reading',
      'Take regular breaks using the Pomodoro technique (25min work, 5min break)',
      'Create summary notes and mind maps for quick revision',
      'Practice with mock tests regularly to identify weak areas',
      'Review previously studied material daily to reinforce learning',
      'Stay consistent with your study schedule and track progress',
      `Focus extra time on ${difficulty} difficulty concepts`
    ],
    keyTopics: ['Main subject areas from your material', 'Important formulas and equations', 'Critical concepts for exam', 'Common question patterns'],
    revisionSchedule: {
      finalWeek: [
        'Complete comprehensive mock tests',
        'Review all summary notes and flashcards',
        'Focus intensively on identified weak areas',
        'Practice time management with timed tests'
      ],
      lastThreeDays: [
        'Light revision only - avoid learning new concepts',
        'Quick review of formulas and key points',
        'Relax and maintain confidence',
        'Get adequate sleep and stay healthy'
      ]
    }
  };
};

// Generate weekly schedule helper
const generateWeeklySchedule = (days, hoursPerDay) => {
  const weeks = Math.ceil(days / 7);
  const schedule = [];
  
  for (let week = 1; week <= weeks; week++) {
    const progressRatio = week / weeks;
    let focusArea, topics, goals;
    
    if (progressRatio <= 0.6) {
      focusArea = 'Learning';
      topics = [
        `Week ${week} - New concept introduction`,
        `Week ${week} - Theory and fundamentals`,
        `Week ${week} - Basic practice problems`
      ];
      goals = [
        'Master new concepts and theories',
        'Build strong foundation understanding'
      ];
    } else if (progressRatio <= 0.8) {
      focusArea = 'Practice';
      topics = [
        `Week ${week} - Advanced problem solving`,
        `Week ${week} - Mock tests and assessments`,
        `Week ${week} - Application of concepts`
      ];
      goals = [
        'Apply learned concepts to problems',
        'Identify and work on weak areas'
      ];
    } else {
      focusArea = 'Revision';
      topics = [
        `Week ${week} - Comprehensive review`,
        `Week ${week} - Final mock tests`,
        `Week ${week} - Exam strategy preparation`
      ];
      goals = [
        'Consolidate all learning',
        'Perfect exam technique and timing'
      ];
    }
    
    schedule.push({
      week: week,
      focus: focusArea,
      dailyHours: hoursPerDay,
      topics: topics,
      goals: goals
    });
  }
  
  return schedule;
};

// Get study progress (for future use)
router.get('/progress/:planId', (req, res) => {
  const { planId } = req.params;
  
  // Mock progress data - in production, this would come from a database
  const mockProgress = {
    planId: planId,
    completedHours: 0,
    completedTopics: [],
    currentWeek: 1,
    overallProgress: 0,
    lastStudySession: null,
    streak: 0
  };
  
  res.json({
    success: true,
    message: 'Progress tracking ready for implementation',
    progress: mockProgress
  });
});

// Update study progress
router.post('/progress/:planId', (req, res) => {
  const { planId } = req.params;
  const { completedHours, completedTopics, currentWeek, studySession } = req.body;
  
  // In production, this would save to database
  console.log(`Progress update for plan ${planId}:`, {
    completedHours,
    completedTopics,
    currentWeek,
    studySession
  });
  
  res.json({
    success: true,
    message: 'Progress updated successfully',
    updatedProgress: {
      completedHours: completedHours || 0,
      completedTopics: completedTopics || [],
      currentWeek: currentWeek || 1,
      lastUpdate: new Date().toISOString()
    }
  });
});

module.exports = router;