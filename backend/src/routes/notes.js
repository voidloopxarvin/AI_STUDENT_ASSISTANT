// routes/notes.js - Express routes for notes processing

const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Configure Gemini AI
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadsDir = await ensureUploadsDir();
      cb(null, uploadsDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOC files are allowed.'));
    }
  }
});

// Extract text from different file types
async function extractTextFromFile(filePath, mimetype) {
  try {
    console.log(`Extracting text from ${filePath} (${mimetype})`);
    
    switch (mimetype) {
      case 'application/pdf':
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(pdfBuffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docResult = await mammoth.extractRawText({ path: filePath });
        return docResult.value;
      
      case 'text/plain':
        return await fs.readFile(filePath, 'utf8');
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Generate summary and flashcards using Gemini
async function generateNotesContent(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      // Return mock data if no API key
      return generateMockContent(text);
    }

    const prompt = `
    Please analyze the following text and provide:

    1. A comprehensive summary (2-3 paragraphs) that captures the main concepts and key points
    2. Create 8-12 flashcards with questions and answers based on the most important information

    Format your response as valid JSON only, with no additional text:
    {
      "summary": "Your detailed summary here...",
      "flashcards": [
        {
          "question": "Question text",
          "answer": "Answer text"
        }
      ]
    }

    Text to analyze:
    ${text.substring(0, 4000)}...
    `;

    console.log('Generating content with Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('AI Response:', responseText.substring(0, 200) + '...');
    
    // Clean and parse JSON response
    let cleanedResponse = responseText;
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    
    // Find JSON object
    let jsonStart = cleanedResponse.indexOf('{');
    let jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.warn('No valid JSON found in response, using fallback');
      return generateMockContent(text);
    }
    
    const jsonResponse = cleanedResponse.slice(jsonStart, jsonEnd);
    
    try {
      const parsedResponse = JSON.parse(jsonResponse);
      
      // Validate response structure
      if (!parsedResponse.summary || !Array.isArray(parsedResponse.flashcards)) {
        throw new Error('Invalid response structure');
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError);
      return generateMockContent(text);
    }
    
  } catch (error) {
    console.error('Error generating notes content:', error);
    return generateMockContent(text);
  }
}

// Generate mock content as fallback
function generateMockContent(text) {
  const sentences = text.split('.').filter(s => s.trim().length > 0);
  const words = text.split(' ').filter(w => w.length > 4);
  const uniqueWords = [...new Set(words)].slice(0, 10);
  
  const summary = `Summary of the provided content:\n\n${sentences.slice(0, 3).join('. ')}.\n\nThis content covers key concepts and important information that can be useful for study and review purposes.`;
  
  const flashcards = uniqueWords.slice(0, 8).map((word, index) => ({
    question: `What is the significance of "${word}" in this context?`,
    answer: `${word} is mentioned as an important concept in the material and relates to the main topics discussed.`
  }));
  
  return { summary, flashcards };
}

// Route: Process uploaded file
router.post('/process', upload.single('file'), async (req, res) => {
  console.log('Processing file upload...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    // Extract text from file
    const extractedText = await extractTextFromFile(filePath, mimetype);
    
    if (!extractedText || extractedText.trim().length === 0) {
      await fs.unlink(filePath); // Clean up file
      return res.status(400).json({ 
        success: false,
        error: 'No text could be extracted from the file' 
      });
    }

    console.log(`Extracted ${extractedText.length} characters from file`);

    // Generate summary and flashcards
    const notesContent = await generateNotesContent(extractedText);

    // Clean up uploaded file
    try {
      await fs.unlink(filePath);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }

    res.json({
      success: true,
      summary: notesContent.summary,
      flashcards: notesContent.flashcards || [],
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        extractedLength: extractedText.length,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process file',
      details: error.message
    });
  }
});

// Route: Process text input
router.post('/process-text', async (req, res) => {
  console.log('Processing text input...');
  
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No text provided' 
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({ 
        success: false,
        error: 'Text too long. Please limit to 50,000 characters.' 
      });
    }

    console.log(`Processing ${text.length} characters of text`);

    // Generate summary and flashcards
    const notesContent = await generateNotesContent(text);

    res.json({
      success: true,
      summary: notesContent.summary,
      flashcards: notesContent.flashcards || [],
      metadata: {
        textLength: text.length,
        wordCount: text.split(' ').length,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process text',
      details: error.message
    });
  }
});

// Route: Health check for notes service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Notes service is running',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Error handling middleware specific to this router
router.use((error, req, res, next) => {
  console.error('Notes route error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field. Use "file" as the field name.'
      });
    }
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error in notes processing',
    details: error.message
  });
});

module.exports = router;