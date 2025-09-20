import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Download, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye,
  Code
} from 'lucide-react';
import { apiService } from '../services/api';

const DiagramPage = () => {
  const [prompt, setPrompt] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [renderedSvg, setRenderedSvg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const [templates, setTemplates] = useState([]);
  const [isMermaidLoaded, setIsMermaidLoaded] = useState(false);
  const renderTimeoutRef = useRef(null);

  // Sample AI prompts
  const samplePrompts = [
    "Create a flowchart for a student registration process",
    "Design a sequence diagram for login authentication", 
    "Make a class diagram for a library management system",
    "Show the workflow of submitting an assignment",
    "Create a diagram showing data flow in a web application"
  ];

  // Initialize mermaid and load templates
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        // Check if already loaded
        if (window.mermaid) {
          setIsMermaidLoaded(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
        script.id = 'mermaid-script';
        
        const scriptLoaded = new Promise((resolve, reject) => {
          script.onload = () => {
            if (window.mermaid) {
              try {
                window.mermaid.initialize({
                  startOnLoad: false,
                  theme: 'default',
                  securityLevel: 'loose',
                  fontFamily: 'Arial, sans-serif',
                  background: 'transparent',
                  themeVariables: {
                    primaryColor: '#3b82f6',
                    primaryTextColor: '#1f2937'
                  }
                });
                console.log('✅ Mermaid loaded and initialized successfully');
                setIsMermaidLoaded(true);
                resolve();
              } catch (initError) {
                console.error('Mermaid initialization error:', initError);
                reject(initError);
              }
            } else {
              reject(new Error('Mermaid failed to load'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Mermaid script'));
        });
        
        // Only append if not already present
        if (!document.getElementById('mermaid-script')) {
          document.head.appendChild(script);
        }
        await scriptLoaded;
      } catch (error) {
        console.error('Failed to load Mermaid:', error);
        setError('Failed to load diagram engine. Please refresh the page.');
      }
    };

    const initializeAll = async () => {
      try {
        await loadMermaid();
        await loadTemplates();
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError('Failed to initialize diagram components. Please refresh the page.');
      }
    };

    initializeAll();

    return () => {
      // Cleanup timeout
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  // Load diagram templates
  const loadTemplates = async () => {
    try {
      const response = await apiService.getDiagramTemplates();
      if (response && response.templates) {
        setTemplates(response.templates);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Fallback templates
      setTemplates([
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
    User->>System: Request
    System-->>User: Response`
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
    }`
        }
      ]);
    }
  };

  // Generate diagram with AI
  const generateDiagram = async () => {
    console.log('🚀 Generate button clicked');
    
    if (!prompt.trim()) {
      setError('Please enter a description for your diagram');
      return;
    }

    if (!apiService || !apiService.generateDiagram) {
      setError('API service is not properly configured');
      console.error('API service missing or generateDiagram method not found');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      console.log('📡 Calling API with prompt:', prompt);
      const response = await apiService.generateDiagram(prompt);
      
      console.log('📥 API Response:', response);
      
      if (!response) {
        throw new Error('No response received from API');
      }

      if (response.success === false) {
        throw new Error(response.error || 'API returned an error');
      }

      if (!response.mermaidCode) {
        throw new Error('No mermaid code received from API');
      }

      console.log('✅ Setting mermaid code:', response.mermaidCode);
      setMermaidCode(response.mermaidCode);
      setSuccess('Diagram generated successfully!');
      
      // Auto-render the diagram
      await renderDiagram(response.mermaidCode);
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Generation error:', err);
      
      let errorMessage = 'Failed to generate diagram. ';
      
      if (err.message) {
        errorMessage += err.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage += err.response.data.details;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render mermaid diagram - React-safe version
  const renderDiagram = async (code) => {
    if (!code || !code.trim()) {
      console.log('No code to render');
      return;
    }

    if (!isMermaidLoaded || !window.mermaid) {
      console.log('Mermaid not loaded yet, waiting...');
      setError('Diagram engine is still loading. Please wait a moment and try again.');
      return;
    }

    setIsRendering(true);
    setError('');

    try {
      // Create a unique ID for this diagram
      const diagramId = 'diagram-' + Date.now();
      
      console.log('🎨 Rendering diagram with ID:', diagramId);
      console.log('📋 Mermaid code:', code);

      try {
        // Re-initialize mermaid to ensure clean state
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Arial, sans-serif',
          background: 'transparent'
        });

        // Render the diagram and get SVG string
        const { svg } = await window.mermaid.render(diagramId, code);
        
        if (!svg) {
          throw new Error('No SVG generated from mermaid');
        }
        
        console.log('✅ SVG generated successfully');
        
        // Set the SVG content in React state (React-safe!)
        setRenderedSvg(svg);
        
      } catch (renderErr) {
        console.error('❌ Mermaid render error:', renderErr);
        throw new Error(`Mermaid rendering failed: ${renderErr.message}`);
      }
      
    } catch (err) {
      console.error('❌ Render error:', err);
      setError(`Failed to render diagram: ${err.message}`);
      setRenderedSvg(''); // Clear any existing SVG
    } finally {
      setIsRendering(false);
    }
  };

  // Handle template selection
  const loadTemplate = (template) => {
    console.log('📄 Loading template:', template.name);
    setMermaidCode(template.code);
    renderDiagram(template.code);
    setError('');
    setSuccess(`Loaded ${template.name} template`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Handle manual code changes with debouncing
  const handleCodeChange = (code) => {
    setMermaidCode(code);
    
    // Clear existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Set new timeout for debounced rendering
    renderTimeoutRef.current = setTimeout(() => {
      if (code.trim()) {
        renderDiagram(code);
      } else {
        setRenderedSvg(''); // Clear SVG if no code
      }
    }, 1000);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setSuccess('Code copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Export functionality
  const exportDiagram = async (format) => {
    if (!renderedSvg) {
      setError('No diagram to export');
      return;
    }

    try {
      setSuccess(`Exporting diagram as ${format.toUpperCase()}...`);
      
      if (format === 'svg') {
        const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        setSuccess('SVG exported successfully!');
      } else {
        // For PNG and PDF, you would need backend support
        setSuccess(`${format.toUpperCase()} export requires backend support`);
      }
      
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Export failed: ' + err.message);
      console.error('Export error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4 mr-2" />
            AI-Powered Diagram Generator
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Beautiful Diagrams
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate Mermaid diagrams using AI assistance or create them manually with our intuitive editor
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Mermaid Loading Status */}
        {!isMermaidLoaded && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <RefreshCw className="h-5 w-5 text-blue-500 mr-3 animate-spin" />
            <span className="text-blue-700">Loading diagram engine...</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input & Controls */}
          <div className="space-y-6">
            {/* AI Generation Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                AI Diagram Generator
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your diagram
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Create a flowchart for user registration process..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>

                {/* Sample Prompts */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Quick ideas:</p>
                  <div className="flex flex-wrap gap-2">
                    {samplePrompts.slice(0, 3).map((samplePrompt, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(samplePrompt)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      >
                        {samplePrompt.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateDiagram}
                  disabled={isGenerating || !isMermaidLoaded}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : !isMermaidLoaded ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Diagram
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Templates Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Templates
              </h3>
              <div className="grid gap-3">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(template)}
                    disabled={!isMermaidLoaded}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Mermaid Code
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!mermaidCode}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
              
              <textarea
                value={mermaidCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Enter your Mermaid diagram code here..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows="12"
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Diagram Preview
                </h3>
                
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${
                      activeTab === 'visual'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visual
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${
                      activeTab === 'code'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Code
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="border border-gray-200 rounded-lg p-4 min-h-96 bg-white relative overflow-auto">
                {activeTab === 'visual' ? (
                  <div className="flex items-center justify-center h-full min-h-80">
                    {isRendering ? (
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Rendering diagram...</p>
                      </div>
                    ) : renderedSvg ? (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: renderedSvg }}
                        style={{ minHeight: '300px' }}
                      />
                    ) : (
                      <div className="text-center">
                        <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Generate or enter code to see your diagram
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="text-sm text-gray-700 overflow-auto h-full whitespace-pre-wrap p-4">
                    {mermaidCode || 'No code generated yet...'}
                  </pre>
                )}
              </div>

              {/* Export Options */}
              {renderedSvg && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => exportDiagram('svg')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export SVG
                  </button>
                  <button
                    onClick={() => exportDiagram('png')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PNG
                  </button>
                  <button
                    onClick={() => exportDiagram('pdf')}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;