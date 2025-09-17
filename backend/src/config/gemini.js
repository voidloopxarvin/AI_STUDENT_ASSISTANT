const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = (modelName = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiModel };