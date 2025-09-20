const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Send message to AI
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const model = getGeminiModel();
    
    const systemPrompt = `
You are an AI Study Assistant. Help students with their learning. Be helpful, clear, and educational.

Student question: ${message}
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();

    res.json({
      success: true,
      response: aiResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      details: error.message
    });
  }
});

module.exports = router;