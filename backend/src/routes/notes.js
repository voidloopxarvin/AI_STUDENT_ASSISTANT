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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
    throw error;
  }
}

// Generate summary and flashcards using Gemini
async function generateNotesContent(text) {
  try {
    const prompt = `
    Please analyze the following text and provide:

    1. A comprehensive summary (2-3 paragraphs) that captures the main concepts and key points
    2. Create 8-12 flashcards with questions and answers based on the most important information

    Format your response as JSON:
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
    ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to parse JSON response
    let jsonStart = responseText.indexOf('{');
    let jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid JSON format in AI response');
    }
    
    const jsonResponse = responseText.slice(jsonStart, jsonEnd);
    const parsedResponse = JSON.parse(jsonResponse);
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating notes content:', error);
    throw error;
  }
}

// Route: Process uploaded file
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    // Extract text from file
    const extractedText = await extractTextFromFile(filePath, mimetype);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the file' });
    }

    // Generate summary and flashcards
    const notesContent = await generateNotesContent(extractedText);

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({
      success: true,
      summary: notesContent.summary,
      flashcards: notesContent.flashcards || [],
      originalText: extractedText.substring(0, 500) + '...', // First 500 chars for reference
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to process file',
      details: error.message
    });
  }
});

// Route: Process text input
router.post('/process-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text provided' });
    }

    if (text.length > 50000) { // Limit text size
      return res.status(400).json({ error: 'Text too long. Please limit to 50,000 characters.' });
    }

    // Generate summary and flashcards
    const notesContent = await generateNotesContent(text);

    res.json({
      success: true,
      summary: notesContent.summary,
      flashcards: notesContent.flashcards || [],
    });

  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({
      error: 'Failed to process text',
      details: error.message
    });
  }
});

// Route: Health check
router.get('/health', (req, res) => {
  res.json({ status: 'Notes service is running' });
});

module.exports = router;