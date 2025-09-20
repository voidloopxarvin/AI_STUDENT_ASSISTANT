const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from environment variables');
  console.error('Please add GEMINI_API_KEY=your_api_key to your .env file');
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  try {
    // Available models: 'gemini-1.5-flash', 'gemini-1.5-pro'
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });
    
    console.log(`✅ Gemini model ${modelName} initialized successfully`);
    return model;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini model:', error.message);
    throw new Error(`Failed to initialize Gemini model: ${error.message}`);
  }
};

// Test function to verify API connection
const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Say 'Hello from Gemini!' to test the connection.");
    const response = await result.response;
    const text = response.text();
    console.log('✅ Gemini API connection test successful:', text);
    return true;
  } catch (error) {
    console.error('❌ Gemini API connection test failed:', error.message);
    return false;
  }
};

module.exports = { 
  getGeminiModel,
  testGeminiConnection
};