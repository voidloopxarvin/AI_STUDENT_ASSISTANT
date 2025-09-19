const express = require('express');
const { getGeminiModel } = require('../config/gemini');
const router = express.Router();

// Generate Mermaid diagram using Gemini AI
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const model = getGeminiModel();
    
    // Enhanced prompt for better Mermaid generation
    const enhancedPrompt = `
Generate a Mermaid.js diagram based on this description: "${prompt}"

Please follow these guidelines:
1. Return ONLY the Mermaid code, no explanations
2. Use appropriate diagram type (graph, flowchart, sequence, class, etc.)
3. Use clear, concise node labels
4. Include proper syntax and formatting
5. Make it visually appealing and logical

Examples of good Mermaid syntax:
- Flowchart: graph TD; A[Start] --> B[Process]; B --> C[End]
- Sequence: sequenceDiagram; A->>B: Message; B-->>A: Response
- Class: classDiagram; class User { +name +email +login() }

Generate the appropriate Mermaid diagram code:
    `;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    let mermaidCode = response.text().trim();

    // Clean up the response (remove markdown formatting if present)
    mermaidCode = mermaidCode
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .trim();

    res.json({
      success: true,
      mermaidCode,
      prompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diagram generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate diagram',
      details: error.message
    });
  }
});
// Add to existing diagram.js file

const puppeteer = require('puppeteer');

// Export diagram as image
router.post('/export', async (req, res) => {
  try {
    const { mermaidCode, format = 'png' } = req.body;

    if (!mermaidCode) {
      return res.status(400).json({
        success: false,
        error: 'Mermaid code is required'
      });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js"></script>
</head>
<body>
    <div class="mermaid">
        ${mermaidCode}
    </div>
    <script>
        mermaid.initialize({ startOnLoad: true });
    </script>
</body>
</html>
    `;

    await page.setContent(html);
    await page.waitForSelector('.mermaid svg');

    let buffer;
    if (format === 'png') {
      const element = await page.$('.mermaid');
      buffer = await element.screenshot({ type: 'png' });
    } else if (format === 'pdf') {
      buffer = await page.pdf({ format: 'A4' });
    }

    await browser.close();

    res.set({
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'image/png',
      'Content-Disposition': `attachment; filename=diagram.${format}`
    });

    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export diagram',
      details: error.message
    });
  }
});
// Get diagram templates
router.get('/templates', (req, res) => {
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
    }
  ];

  res.json({
    success: true,
    templates
  });
});

module.exports = router;