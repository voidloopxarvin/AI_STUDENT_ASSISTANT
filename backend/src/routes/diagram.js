const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Middleware to log all requests to this route
router.use((req, res, next) => {
  console.log(`📊 Diagram Route: ${req.method} ${req.path}`, {
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Generate Mermaid diagram using Gemini AI
router.post('/generate', async (req, res) => {
  console.log('🎯 Generate diagram endpoint hit');
  
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt) {
      console.log('❌ Missing prompt in request');
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (typeof prompt !== 'string' || !prompt.trim()) {
      console.log('❌ Invalid prompt format');
      return res.status(400).json({
        success: false,
        error: 'Prompt must be a non-empty string'
      });
    }

    console.log('📝 Processing prompt:', prompt);

    // Get Gemini model
    let model;
    try {
      model = getGeminiModel();
      console.log('✅ Gemini model obtained');
    } catch (modelError) {
      console.error('❌ Failed to get Gemini model:', modelError);
      return res.status(500).json({
        success: false,
        error: 'AI service is currently unavailable',
        details: modelError.message
      });
    }
    
    // Enhanced prompt for better Mermaid generation
    const enhancedPrompt = `
You are an expert at creating Mermaid.js diagrams. Generate a clean, professional Mermaid diagram based on this description: "${prompt.trim()}"

IMPORTANT RULES:
1. Return ONLY the raw Mermaid code, no markdown formatting, no explanations, no additional text
2. Do NOT wrap the code in \`\`\`mermaid or \`\`\` blocks
3. Choose the most appropriate diagram type (flowchart, sequence, class, etc.)
4. Use clear, concise labels
5. Ensure proper Mermaid syntax
6. Make the diagram visually logical and easy to understand

EXAMPLES:
For process flows: graph TD; A[Start] --> B[Process]; B --> C[End]
For sequences: sequenceDiagram; participant A; participant B; A->>B: Message; B-->>A: Response
For classes: classDiagram; class User { +name +email +login() }

Generate the appropriate Mermaid diagram code now:
    `;

    console.log('🚀 Sending request to Gemini...');

    let result;
    try {
      result = await model.generateContent(enhancedPrompt);
      console.log('✅ Gemini responded');
    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate diagram with AI',
        details: geminiError.message
      });
    }

    if (!result) {
      console.error('❌ No result from Gemini');
      return res.status(500).json({
        success: false,
        error: 'No response from AI service'
      });
    }

    let response;
    try {
      response = await result.response;
      console.log('✅ Got response object');
    } catch (responseError) {
      console.error('❌ Failed to get response:', responseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to process AI response',
        details: responseError.message
      });
    }

    if (!response) {
      console.error('❌ Empty response object');
      return res.status(500).json({
        success: false,
        error: 'Empty response from AI service'
      });
    }

    let mermaidCode;
    try {
      mermaidCode = response.text().trim();
      console.log('✅ Extracted text from response');
      console.log('📋 Raw mermaid code:', mermaidCode);
    } catch (textError) {
      console.error('❌ Failed to extract text:', textError);
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from AI response',
        details: textError.message
      });
    }

    if (!mermaidCode) {
      console.error('❌ Empty mermaid code');
      return res.status(500).json({
        success: false,
        error: 'AI generated empty response'
      });
    }

    // Clean up the response (remove any markdown formatting if present)
    mermaidCode = mermaidCode
      .replace(/```mermaid\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/^mermaid\n/gi, '')
      .trim();

    console.log('🧹 Cleaned mermaid code:', mermaidCode);

    // Basic validation - check if it looks like valid mermaid code
    if (!mermaidCode.includes('graph') && 
        !mermaidCode.includes('sequenceDiagram') && 
        !mermaidCode.includes('classDiagram') &&
        !mermaidCode.includes('flowchart') &&
        !mermaidCode.includes('gitgraph') &&
        !mermaidCode.includes('pie') &&
        !mermaidCode.includes('journey') &&
        !mermaidCode.includes('gantt') &&
        !mermaidCode.includes('erDiagram') &&
        !mermaidCode.includes('stateDiagram')) {
      
      console.log('⚠️ Generated code might not be valid Mermaid, but sending anyway');
    }

    const responseData = {
      success: true,
      mermaidCode,
      prompt: prompt.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('✅ Sending successful response');
    res.json(responseData);

  } catch (error) {
    console.error('❌ Unexpected error in diagram generation:', error);
    res.status(500).json({
      success: false,
      error: 'Unexpected error occurred while generating diagram',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Export diagram as image (requires puppeteer)
router.post('/export', async (req, res) => {
  console.log('🖼️ Export diagram endpoint hit');
  
  try {
    const { mermaidCode, format = 'png' } = req.body;

    if (!mermaidCode) {
      return res.status(400).json({
        success: false,
        error: 'Mermaid code is required'
      });
    }

    // Check if puppeteer is available
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (err) {
      console.log('⚠️ Puppeteer not available, export feature disabled');
      return res.status(501).json({
        success: false,
        error: 'Export feature is not available. Please install puppeteer to enable this feature.'
      });
    }

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: white;
        }
        .mermaid {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="mermaid">
        ${mermaidCode}
    </div>
    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
    `;

    await page.setContent(html);
    await page.waitForSelector('.mermaid svg', { timeout: 10000 });

    let buffer;
    if (format === 'png') {
      const element = await page.$('.mermaid');
      buffer = await element.screenshot({ 
        type: 'png',
        background: 'white'
      });
    } else if (format === 'pdf') {
      buffer = await page.pdf({ 
        format: 'A4',
        printBackground: true
      });
    } else {
      await browser.close();
      return res.status(400).json({
        success: false,
        error: 'Unsupported format. Use png or pdf.'
      });
    }

    await browser.close();

    res.set({
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'image/png',
      'Content-Disposition': `attachment; filename=diagram.${format}`
    });

    res.send(buffer);

  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export diagram',
      details: error.message
    });
  }
});

// Get diagram templates
router.get('/templates', (req, res) => {
  console.log('📋 Templates endpoint hit');
  
  try {
    const templates = [
      {
        id: 'flowchart',
        name: 'Flowchart',
        description: 'Process flow and decision trees',
        code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`
      },
      {
        id: 'sequence',
        name: 'Sequence Diagram',
        description: 'System interactions over time',
        code: `sequenceDiagram
    participant User
    participant System
    participant Database
    User->>System: Login Request
    System->>Database: Validate User
    Database-->>System: User Valid
    System-->>User: Login Success`
      },
      {
        id: 'class',
        name: 'Class Diagram',
        description: 'Object-oriented structures',
        code: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Admin {
        +manageUsers()
        +viewLogs()
    }
    User <|-- Admin`
      },
      {
        id: 'state',
        name: 'State Diagram',
        description: 'State transitions and workflows',
        code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Start
    Processing --> Success : Complete
    Processing --> Failed : Error
    Success --> [*]
    Failed --> Idle : Retry`
      },
      {
        id: 'er',
        name: 'Entity Relationship',
        description: 'Database relationships',
        code: `erDiagram
    User {
        int id PK
        string name
        string email UK
    }
    Order {
        int id PK
        int user_id FK
        date order_date
    }
    User ||--o{ Order : places`
      }
    ];

    res.json({
      success: true,
      templates
    });
    
  } catch (error) {
    console.error('❌ Templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit');
  res.json({
    success: true,
    message: 'Diagram service is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;