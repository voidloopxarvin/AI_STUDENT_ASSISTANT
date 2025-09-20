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
    throw new Error('Failed to extract text from file');
  }
};

// Generate study plan
router.post('/create-plan', upload.single('file'), async (req, res) => {
  try {
    const { examDate, studyHours, difficulty } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'File is required'
      });
    }

    if (!examDate || !studyHours) {
      return res.status(400).json({
        success: false,
        error: 'Exam date and study hours are required'
      });
    }

    // Calculate days until exam
    const examDateTime = new Date(examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDateTime - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Exam date must be in the future'
      });
    }

    // Extract text from uploaded file
    const fileContent = await extractTextFromFile(file);

    const model = getGeminiModel();
    
    // Enhanced prompt for study plan generation
    const studyPlanPrompt = `
Based on the following study material content and parameters, create a comprehensive study plan:

STUDY MATERIAL CONTENT:
${fileContent.substring(0, 2000)}... (truncated for context)

PARAMETERS:
- Days until exam: ${daysUntilExam}
- Daily study hours: ${studyHours}
- Difficulty level: ${difficulty}
- Total available study hours: ${daysUntilExam * studyHours}

Please generate a detailed study plan in JSON format with:

1. Subject breakdown with time allocation percentages
2. Weekly schedule with focus areas
3. Daily study recommendations
4. Key topics to prioritize based on content
5. Study tips and strategies
6. Revision schedule for final weeks

Return ONLY valid JSON in this format:
{
  "subjects": [
    {
      "name": "Subject Name",
      "hours": number,
      "priority": "High/Medium/Low",
      "topics": ["topic1", "topic2"],
      "color": "gradient-class"
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
  "tips": ["tip1", "tip2", "tip3"],
  "keyTopics": ["important topic 1", "important topic 2"],
  "revisionSchedule": {
    "finalWeek": ["activity1", "activity2"],
    "lastThreeDays": ["activity1", "activity2"]
  }
}
    `;

    const result = await model.generateContent(studyPlanPrompt);
    const response = await result.response;
    let planText = response.text().trim();

    // Clean up the response
    planText = planText.replace(/```json/g, '').replace(/```/g, '').trim();

    let studyPlan;
    try {
      studyPlan = JSON.parse(planText);
    } catch (parseError) {
      // Fallback to a structured plan if parsing fails
      studyPlan = generateFallbackPlan(daysUntilExam, studyHours, difficulty);
    }

    // Add calculated fields
    studyPlan.examDate = examDate;
    studyPlan.daysUntilExam = daysUntilExam;
    studyPlan.totalHours = daysUntilExam * studyHours;
    studyPlan.difficulty = difficulty;
    studyPlan.fileName = file.originalname;

    res.json({
      success: true,
      studyPlan,
      message: 'Study plan generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate study plan',
      details: error.message
    });
  }
});

// Generate fallback study plan
const generateFallbackPlan = (days, hoursPerDay, difficulty) => {
  const totalHours = days * hoursPerDay;
  
  return {
    subjects: [
      {
        name: 'Core Concepts',
        hours: Math.round(totalHours * 0.4),
        priority: 'High',
        topics: ['Fundamental theories', 'Key principles', 'Basic concepts'],
        color: 'from-red-500 to-pink-600'
      },
      {
        name: 'Practice Problems',
        hours: Math.round(totalHours * 0.35),
        priority: 'High',
        topics: ['Sample questions', 'Mock tests', 'Problem solving'],
        color: 'from-blue-500 to-cyan-600'
      },
      {
        name: 'Review & Revision',
        hours: Math.round(totalHours * 0.25),
        priority: 'Medium',
        topics: ['Summary notes', 'Quick review', 'Final preparation'],
        color: 'from-green-500 to-emerald-600'
      }
    ],
    weeklySchedule: generateWeeklySchedule(days, hoursPerDay),
    tips: [
      'Start with the most challenging topics when your mind is fresh',
      'Use active recall techniques instead of passive reading',
      'Take regular breaks using the Pomodoro technique',
      'Create summary notes for quick revision',
      'Practice with mock tests regularly',
      'Review previously studied material daily',
      'Stay consistent with your study schedule'
    ],
    keyTopics: ['Main subject areas', 'Important formulas', 'Critical concepts'],
    revisionSchedule: {
      finalWeek: ['Complete mock tests', 'Review summary notes', 'Focus on weak areas'],
      lastThreeDays: ['Light revision only', 'Relax and stay confident', 'Quick formula review']
    }
  };
};

// Generate weekly schedule helper
const generateWeeklySchedule = (days, hoursPerDay) => {
  const weeks = Math.ceil(days / 7);
  const schedule = [];
  
  for (let week = 1; week <= weeks; week++) {
    const focusArea = week <= weeks * 0.6 ? 'Learning' : 
                     week <= weeks * 0.8 ? 'Practice' : 'Revision';
    
    schedule.push({
      week: week,
      focus: focusArea,
      dailyHours: hoursPerDay,
      topics: [
        `Week ${week} - ${focusArea} Session 1`,
        `Week ${week} - ${focusArea} Session 2`,
        `Week ${week} - Review & Practice`
      ],
      goals: [
        `Complete ${focusArea.toLowerCase()} objectives`,
        'Track progress and adjust if needed'
      ]
    });
  }
  
  return schedule;
};

// Get study progress (for future use)
router.get('/progress/:planId', (req, res) => {
  // This would retrieve saved progress from database
  res.json({
    success: true,
    message: 'Progress tracking ready for implementation',
    progress: {
      completedHours: 0,
      completedTopics: [],
      currentWeek: 1
    }
  });
});

// Update study progress
router.post('/progress/:planId', (req, res) => {
  // This would save progress to database
  const { completedHours, completedTopics, currentWeek } = req.body;
  
  res.json({
    success: true,
    message: 'Progress updated successfully',
    updatedProgress: {
      completedHours,
      completedTopics,
      currentWeek
    }
  });
});

module.exports = router;