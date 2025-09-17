const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Test Gemini API connection
router.post('/test', async (req, res) => {
  try {
    const model = getGeminiModel();
    const prompt = "Say hello and confirm the AI Student Assistant API is working correctly.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Gemini API',
      details: error.message
    });
  }
});

module.exports = router;