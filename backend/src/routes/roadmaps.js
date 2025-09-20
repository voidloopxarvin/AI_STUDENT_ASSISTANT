const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Get all available roadmaps
router.get('/', (req, res) => {
  const roadmaps = [
    {
      id: 'fullstack',
      title: 'Full Stack Developer',
      category: 'development',
      description: 'Complete path from frontend to backend development',
      difficulty: 'Intermediate',
      duration: '8-12 months',
      students: '45.2k',
      rating: 4.8,
      color: 'from-blue-500 to-cyan-500',
      icon: 'Globe',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Database', 'DevOps'],
      totalSteps: 12,
      estimatedHours: 400,
      prerequisites: ['Basic programming knowledge', 'Computer fundamentals'],
      outcomes: ['Build full-stack applications', 'Deploy to production', 'Work with databases']
    },
    {
      id: 'ai-ml',
      title: 'AI & Machine Learning',
      category: 'data',
      description: 'Master artificial intelligence and machine learning concepts',
      difficulty: 'Advanced',
      duration: '10-15 months',
      students: '32.8k',
      rating: 4.9,
      color: 'from-purple-500 to-pink-500',
      icon: 'Brain',
      skills: ['Python', 'Statistics', 'ML Algorithms', 'Deep Learning', 'TensorFlow', 'Data Analysis'],
      totalSteps: 15,
      estimatedHours: 600,
      prerequisites: ['Python programming', 'Statistics basics', 'Linear algebra'],
outcomes: ['Build ML models', 'Deploy AI applications', 'Data analysis expertise']
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Specialist',
      category: 'security',
      description: 'Comprehensive cybersecurity and ethical hacking path',
      difficulty: 'Advanced',
      duration: '6-10 months',
      students: '28.1k',
      rating: 4.7,
      color: 'from-red-500 to-orange-500',
      icon: 'Shield',
      skills: ['Network Security', 'Penetration Testing', 'Cryptography', 'Security Analysis', 'Risk Management'],
      totalSteps: 10,
      estimatedHours: 350,
      prerequisites: ['Networking basics', 'Operating systems', 'Programming fundamentals'],
      outcomes: ['Conduct security audits', 'Implement security protocols', 'Incident response']
    },
    {
      id: 'frontend',
      title: 'Frontend Developer',
      category: 'development',
      description: 'Modern frontend development with React and advanced tools',
      difficulty: 'Beginner',
      duration: '4-6 months',
      students: '67.5k',
      rating: 4.6,
      color: 'from-green-500 to-emerald-500',
      icon: 'Code',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript', 'Testing'],
      totalSteps: 8,
      estimatedHours: 250,
      prerequisites: ['Basic computer skills', 'Web browsing knowledge'],
      outcomes: ['Build responsive websites', 'Create interactive UIs', 'Modern development workflow']
    },
    {
      id: 'mobile-dev',
      title: 'Mobile App Developer',
      category: 'mobile',
      description: 'Cross-platform mobile development with React Native',
      difficulty: 'Intermediate',
      duration: '6-8 months',
      students: '23.7k',
      rating: 4.5,
      color: 'from-indigo-500 to-purple-500',
      icon: 'Smartphone',
      skills: ['React Native', 'Mobile UI/UX', 'API Integration', 'App Store', 'Push Notifications'],
      totalSteps: 9,
      estimatedHours: 320,
      prerequisites: ['JavaScript knowledge', 'React basics', 'Mobile app concepts'],
      outcomes: ['Build mobile apps', 'Publish to app stores', 'Cross-platform development']
    },
    {
      id: 'data-science',
      title: 'Data Scientist',
      category: 'data',
      description: 'Complete data science journey from basics to advanced analytics',
      difficulty: 'Intermediate',
      duration: '8-12 months',
      students: '41.3k',
      rating: 4.8,
      color: 'from-yellow-500 to-orange-500',
      icon: 'TrendingUp',
      skills: ['Python', 'Statistics', 'Data Visualization', 'SQL', 'Machine Learning', 'Big Data'],
      totalSteps: 11,
      estimatedHours: 450,
      prerequisites: ['Statistics basics', 'Programming fundamentals', 'Mathematics'],
      outcomes: ['Analyze complex data', 'Build predictive models', 'Data-driven insights']
    }
  ];

  res.json({
    success: true,
    roadmaps: roadmaps,
    total: roadmaps.length
  });
});

// Get specific roadmap details
router.get('/:roadmapId', (req, res) => {
  const { roadmapId } = req.params;
  
  // Sample detailed roadmap data
  const roadmapDetails = {
    fullstack: {
      steps: [
        {
          id: 1,
          title: 'Web Fundamentals',
          description: 'HTML, CSS, and basic web concepts',
          duration: '2-3 weeks',
          difficulty: 'Beginner',
          topics: ['HTML5 Semantic Elements', 'CSS Grid & Flexbox', 'Responsive Design', 'Web Accessibility'],
          resources: [
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'documentation' },
            { name: 'FreeCodeCamp', url: 'https://freecodecamp.org', type: 'course' },
            { name: 'CSS Tricks', url: 'https://css-tricks.com', type: 'tutorial' }
          ],
          projects: [
            { name: 'Personal Portfolio', description: 'Create a responsive personal website' },
            { name: 'Landing Page', description: 'Build a modern landing page' }
          ],
          quiz: {
            questions: 15,
            passingScore: 80
          }
        },
        {
          id: 2,
          title: 'JavaScript Essentials',
          description: 'Core JavaScript programming concepts',
          duration: '3-4 weeks',
          difficulty: 'Beginner',
          topics: ['ES6+ Features', 'DOM Manipulation', 'Async Programming', 'Error Handling'],
          resources: [
            { name: 'JavaScript.info', url: 'https://javascript.info', type: 'tutorial' },
            { name: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net', type: 'book' },
            { name: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'book' }
          ],
          projects: [
            { name: 'To-Do App', description: 'Build a interactive todo application' },
            { name: 'Calculator', description: 'Create a functional calculator' },
            { name: 'Weather App', description: 'Weather app with API integration' }
          ],
          quiz: {
            questions: 20,
            passingScore: 75
          }
        },
        {
          id: 3,
          title: 'React Fundamentals',
          description: 'Learn React library and component-based architecture',
          duration: '4-5 weeks',
          difficulty: 'Intermediate',
          topics: ['Components & Props', 'State Management', 'Hooks', 'Context API'],
          resources: [
            { name: 'React Documentation', url: 'https://react.dev', type: 'documentation' },
            { name: 'React Tutorial', url: 'https://react.dev/tutorial', type: 'tutorial' },
            { name: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact', type: 'course' }
          ],
          projects: [
            { name: 'React Blog', description: 'Build a blog with React and routing' },
            { name: 'E-commerce Frontend', description: 'Create a shopping cart interface' }
          ],
          quiz: {
            questions: 25,
            passingScore: 80
          }
        }
        // Additional steps would be defined here
      ]
    }
    // Other roadmap details would be defined here
  };

  const details = roadmapDetails[roadmapId];
  
  if (!details) {
    return res.status(404).json({
      success: false,
      error: 'Roadmap not found'
    });
  }

  res.json({
    success: true,
    roadmapId: roadmapId,
    details: details
  });
});

// Get user progress for a roadmap
router.get('/:roadmapId/progress/:userId', (req, res) => {
  const { roadmapId, userId } = req.params;
  
  // Mock user progress data
  const mockProgress = {
    roadmapId: roadmapId,
    userId: userId,
    startedAt: '2024-01-15T00:00:00Z',
    lastActivity: '2024-02-20T10:30:00Z',
    overallProgress: 25,
    completedSteps: [1, 2],
    currentStep: 3,
    totalSteps: 12,
    hoursSpent: 45,
    estimatedTimeRemaining: '6-8 months',
    achievements: [
      { id: 'first_step', name: 'First Step', description: 'Completed your first learning step' },
      { id: 'week_streak', name: 'Week Streak', description: 'Studied for 7 consecutive days' }
    ],
    weeklyActivity: [
      { week: '2024-W07', hours: 8, stepsCompleted: 0 },
      { week: '2024-W08', hours: 12, stepsCompleted: 1 },
      { week: '2024-W09', hours: 10, stepsCompleted: 1 },
      { week: '2024-W10', hours: 15, stepsCompleted: 0 }
    ]
  };

  res.json({
    success: true,
    progress: mockProgress
  });
});

// Update user progress
router.post('/:roadmapId/progress/:userId', (req, res) => {
  const { roadmapId, userId } = req.params;
  const { stepId, completed, timeSpent } = req.body;

  // In a real app, this would update the database
  console.log(`Updating progress for user ${userId} in roadmap ${roadmapId}`);
  console.log(`Step ${stepId} completed: ${completed}, Time spent: ${timeSpent} minutes`);

  res.json({
    success: true,
    message: 'Progress updated successfully',
    updatedAt: new Date().toISOString()
  });
});

// Get personalized roadmap recommendations
router.post('/recommend', async (req, res) => {
  try {
    const { currentSkills, goals, experience, timeAvailable } = req.body;

    const model = getGeminiModel();
    
    const prompt = `
Based on the following user profile, recommend the most suitable learning roadmap(s):

CURRENT SKILLS: ${currentSkills?.join(', ') || 'None specified'}
CAREER GOALS: ${goals || 'Not specified'}
EXPERIENCE LEVEL: ${experience || 'Beginner'}
TIME AVAILABLE: ${timeAvailable || 'Not specified'} hours per week

Available roadmaps:
- Full Stack Developer (8-12 months, Intermediate)
- AI & Machine Learning (10-15 months, Advanced)  
- Cybersecurity Specialist (6-10 months, Advanced)
- Frontend Developer (4-6 months, Beginner)
- Mobile App Developer (6-8 months, Intermediate)
- Data Scientist (8-12 months, Intermediate)

Provide a JSON response with:
{
  "recommendations": [
    {
      "roadmapId": "string",
      "matchScore": number (0-100),
      "reasoning": "Why this roadmap fits",
      "estimatedCompletion": "time estimate based on available time",
      "prerequisites": ["any missing prerequisites"]
    }
  ],
  "generalAdvice": "General learning advice for this user"
}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let recommendationText = response.text().trim();

    // Clean up response
    recommendationText = recommendationText.replace(/```json/g, '').replace(/```/g, '').trim();

    let recommendations;
    try {
      recommendations = JSON.parse(recommendationText);
    } catch (parseError) {
      // Fallback recommendations
      recommendations = {
        recommendations: [
          {
            roadmapId: experience === 'Beginner' ? 'frontend' : 'fullstack',
            matchScore: 85,
            reasoning: 'Good starting point based on your experience level',
            estimatedCompletion: timeAvailable ? `${Math.ceil(300 / (timeAvailable * 4))} months` : '4-6 months',
            prerequisites: []
          }
        ],
        generalAdvice: 'Start with fundamentals and build projects to reinforce learning'
      };
    }

    res.json({
      success: true,
      recommendations: recommendations,
      basedOn: { currentSkills, goals, experience, timeAvailable }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

// Get roadmap categories
router.get('/categories/list', (req, res) => {
  const categories = [
    { id: 'all', name: 'All Roadmaps', count: 6 },
    { id: 'development', name: 'Development', count: 3 },
    { id: 'security', name: 'Security', count: 1 },
    { id: 'data', name: 'Data Science', count: 2 },
    { id: 'mobile', name: 'Mobile', count: 1 }
  ];

  res.json({
    success: true,
    categories: categories
  });
});

module.exports = router;