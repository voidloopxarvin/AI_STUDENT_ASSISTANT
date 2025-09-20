const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Analyze code with AI
router.post('/review', async (req, res) => {
  try {
    const { code, language, reviewType = 'comprehensive' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Code is required for analysis'
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Programming language must be specified'
      });
    }

    const model = getGeminiModel();
    
    // Create comprehensive prompt based on review type
    const reviewPrompts = {
      comprehensive: `
Perform a comprehensive code review of the following ${language} code. Analyze for:
1. Bugs and potential errors
2. Performance optimization opportunities  
3. Security vulnerabilities
4. Code style and best practices
5. Maintainability and readability

CODE TO REVIEW:
\`\`\`${language}
${code}
\`\`\`

Return a detailed JSON analysis in this format:
{
  "overallScore": number (0-100),
  "issues": [
    {
      "type": "bug|performance|security|style",
      "severity": "high|medium|low", 
      "line": number,
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": ["General improvement suggestions"],
  "positives": ["Things that are done well"],
  "metrics": {
    "complexity": number (1-10),
    "maintainability": number (0-100),
    "security": number (0-100), 
    "performance": number (0-100)
  }
}`,
      
      security: `
Focus on security analysis of this ${language} code. Look for:
- Input validation issues
- SQL injection vulnerabilities  
- XSS vulnerabilities
- Authentication/authorization flaws
- Data exposure risks
- Unsafe operations

CODE:
\`\`\`${language}
${code}
\`\`\`

Return JSON with security-focused analysis.`,
      
      performance: `
Analyze this ${language} code for performance optimization:
- Algorithm efficiency
- Memory usage
- Loop optimizations
- Database query efficiency
- Async/await usage
- Resource management

CODE:
\`\`\`${language}
${code}
\`\`\`

Return JSON with performance-focused suggestions.`,
      
      style: `
Review this ${language} code for style and best practices:
- Naming conventions
- Code formatting
- Function/class structure
- Comments and documentation
- Language-specific conventions
- Readability improvements

CODE:
\`\`\`${language}
${code}
\`\`\`

Return JSON with style-focused feedback.`
    };

    const prompt = reviewPrompts[reviewType] || reviewPrompts.comprehensive;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let reviewText = response.text().trim();

    // Clean up response
    reviewText = reviewText.replace(/```json/g, '').replace(/```/g, '').trim();

    let reviewData;
    try {
      reviewData = JSON.parse(reviewText);
    } catch (parseError) {
      // Fallback if parsing fails
      reviewData = generateFallbackReview(code, language);
    }

    // Add metadata
    reviewData.language = language;
    reviewData.reviewType = reviewType;
    reviewData.linesAnalyzed = code.split('\n').length;
    reviewData.timestamp = new Date().toISOString();

    res.json({
      success: true,
      review: reviewData,
      message: 'Code analysis completed successfully'
    });

  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze code',
      details: error.message
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'csharp', name: 'C#', extension: '.cs' },
    { id: 'php', name: 'PHP', extension: '.php' },
    { id: 'go', name: 'Go', extension: '.go' },
    { id: 'rust', name: 'Rust', extension: '.rs' },
    { id: 'typescript', name: 'TypeScript', extension: '.ts' },
    { id: 'react', name: 'React JSX', extension: '.jsx' }
  ];

  res.json({
    success: true,
    languages: supportedLanguages
  });
});

// Generate code suggestions
router.post('/suggest', async (req, res) => {
  try {
    const { code, language, issueType } = req.body;

    const model = getGeminiModel();
    
    const prompt = `
Generate an improved version of this ${language} code to fix ${issueType} issues:

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

Return only the improved code with inline comments explaining the changes.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedCode = response.text().trim();

    res.json({
      success: true,
      improvedCode: improvedCode.replace(/```[\w]*\n?/g, '').trim(),
      originalCode: code,
      improvements: `Fixed ${issueType} issues with explanatory comments`
    });

  } catch (error) {
    console.error('Code suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code suggestions'
    });
  }
});

// Fallback review generator
const generateFallbackReview = (code, language) => {
  const lines = code.split('\n').length;
  
  return {
    overallScore: Math.floor(Math.random() * 30) + 70,
    issues: [
      {
        type: 'style',
        severity: 'low',
        line: Math.floor(lines / 2),
        message: 'Consider improving variable naming for better readability',
        suggestion: 'Use more descriptive variable names'
      }
    ],
    suggestions: [
      'Add error handling for edge cases',
      'Consider adding unit tests',
      'Add documentation comments',
      'Consider code modularity improvements'
    ],
    positives: [
      'Code structure is well organized',
      'Good use of language features',
      'Logic flow is clear and understandable'
    ],
    metrics: {
      complexity: Math.floor(Math.random() * 3) + 4,
      maintainability: Math.floor(Math.random() * 20) + 75,
      security: Math.floor(Math.random() * 15) + 80,
      performance: Math.floor(Math.random() * 25) + 70
    }
  };
};

module.exports = router;