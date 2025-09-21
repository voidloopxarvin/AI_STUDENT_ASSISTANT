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
import Particles from '../components/Particles';

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
                  theme: 'dark',
                  securityLevel: 'loose',
                  fontFamily: 'Arial, sans-serif',
                  background: 'transparent',
                  themeVariables: {
                    primaryColor: '#3b82f6',
                    primaryTextColor: '#f8fafc'
                  }
                });
                setIsMermaidLoaded(true);
                resolve();
              } catch (initError) {
                reject(initError);
              }
            } else {
              reject(new Error('Mermaid failed to load'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Mermaid script'));
        });
        
        if (!document.getElementById('mermaid-script')) {
          document.head.appendChild(script);
        }
        await scriptLoaded;
      } catch (error) {
        setError('Failed to load diagram engine. Please refresh the page.');
      }
    };

    const initializeAll = async () => {
      try {
        await loadMermaid();
        await loadTemplates();
      } catch (error) {
        setError('Failed to initialize diagram components. Please refresh the page.');
      }
    };

    initializeAll();

    return () => {
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
    if (!prompt.trim()) {
      setError('Please enter a description for your diagram');
      return;
    }

    if (!apiService || !apiService.generateDiagram) {
      setError('API service is not properly configured');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.generateDiagram(prompt);
      
      if (!response) {
        throw new Error('No response received from API');
      }

      if (response.success === false) {
        throw new Error(response.error || 'API returned an error');
      }

      if (!response.mermaidCode) {
        throw new Error('No mermaid code received from API');
      }

      setMermaidCode(response.mermaidCode);
      setSuccess('Diagram generated successfully!');
      
      await renderDiagram(response.mermaidCode);
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
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

  // Render mermaid diagram
  const renderDiagram = async (code) => {
    if (!code || !code.trim()) {
      return;
    }

    if (!isMermaidLoaded || !window.mermaid) {
      setError('Diagram engine is still loading. Please wait a moment and try again.');
      return;
    }

    setIsRendering(true);
    setError('');

    try {
      const diagramId = 'diagram-' + Date.now();

      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Arial, sans-serif',
          background: 'transparent'
        });

        const { svg } = await window.mermaid.render(diagramId, code);
        
        if (!svg) {
          throw new Error('No SVG generated from mermaid');
        }
        
        setRenderedSvg(svg);
        
      } catch (renderErr) {
        throw new Error(`Mermaid rendering failed: ${renderErr.message}`);
      }
      
    } catch (err) {
      setError(`Failed to render diagram: ${err.message}`);
      setRenderedSvg('');
    } finally {
      setIsRendering(false);
    }
  };

  // Handle template selection
  const loadTemplate = (template) => {
    setMermaidCode(template.code);
    renderDiagram(template.code);
    setError('');
    setSuccess(`Loaded ${template.name} template`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Handle manual code changes with debouncing
  const handleCodeChange = (code) => {
    setMermaidCode(code);
    
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    renderTimeoutRef.current = setTimeout(() => {
      if (code.trim()) {
        renderDiagram(code);
      } else {
        setRenderedSvg('');
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
        setSuccess(`${format.toUpperCase()} export requires backend support`);
      }
      
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Export failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
          particleCount={150}
          particleSpread={8}
          speed={0.15}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-blue-900/30 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered Diagram Generator
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Create Beautiful Diagrams
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Generate Mermaid diagrams using AI assistance or create them manually with our intuitive editor
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-gray-900/50 border border-gray-600/50 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-gray-300">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-blue-900/50 border border-blue-500/50 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-400 mr-3" />
              <span className="text-blue-300">{success}</span>
            </div>
          )}

          {!isMermaidLoaded && (
            <div className="mb-6 bg-blue-900/50 border border-blue-500/50 rounded-lg p-4 flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-400 mr-3 animate-spin" />
              <span className="text-blue-300">Loading diagram engine...</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Input & Controls */}
            <div className="space-y-6">
              {/* AI Generation Section */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
                  AI Diagram Generator
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe your diagram
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Create a flowchart for user registration process..."
                      className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                      rows="3"
                    />
                  </div>

                  {/* Sample Prompts */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Quick ideas:</p>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.slice(0, 3).map((samplePrompt, index) => (
                        <button
                          key={index}
                          onClick={() => setPrompt(samplePrompt)}
                          className="text-xs px-3 py-1 bg-gray-800 text-gray-300 rounded-full hover:bg-blue-900/50 hover:text-blue-300 border border-gray-700 hover:border-blue-500/50 transition-all"
                        >
                          {samplePrompt.substring(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generateDiagram}
                    disabled={isGenerating || !isMermaidLoaded}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Quick Templates
                </h3>
                <div className="grid gap-3">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => loadTemplate(template)}
                      disabled={!isMermaidLoaded}
                      className="text-left p-4 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white group-hover:text-blue-300">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Mermaid Code
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      disabled={!mermaidCode}
                      className="px-3 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all flex items-center disabled:opacity-50"
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
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-white placeholder-gray-400"
                  rows="12"
                />
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Diagram Preview
                  </h3>
                  
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('visual')}
                      className={`px-3 py-1 text-sm rounded-md transition-all flex items-center ${
                        activeTab === 'visual'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visual
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-3 py-1 text-sm rounded-md transition-all flex items-center ${
                        activeTab === 'code'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Code
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="border border-gray-700 rounded-lg p-4 min-h-96 bg-gray-800/30 relative overflow-auto">
                  {activeTab === 'visual' ? (
                    <div className="flex items-center justify-center h-full min-h-80">
                      {isRendering ? (
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-2" />
                          <p className="text-gray-400">Rendering diagram...</p>
                        </div>
                      ) : renderedSvg ? (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: renderedSvg }}
                          style={{ minHeight: '300px' }}
                        />
                      ) : (
                        <div className="text-center">
                          <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">
                            Generate or enter code to see your diagram
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-300 overflow-auto h-full whitespace-pre-wrap p-4">
                      {mermaidCode || 'No code generated yet...'}
                    </pre>
                  )}
                </div>

                {/* Export Options */}
                {renderedSvg && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => exportDiagram('svg')}
                      className="px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-800/50 border border-blue-500/50 hover:border-blue-400 transition-all flex items-center text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export SVG
                    </button>
                    <button
                      onClick={() => exportDiagram('png')}
                      className="px-4 py-2 bg-gray-900/50 text-gray-300 rounded-lg hover:bg-gray-800/50 border border-gray-500/50 hover:border-gray-400 transition-all flex items-center text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PNG
                    </button>
                    <button
                      onClick={() => exportDiagram('pdf')}
                      className="px-4 py-2 bg-gray-900/50 text-gray-300 rounded-lg hover:bg-gray-800/50 border border-gray-500/50 hover:border-gray-400 transition-all flex items-center text-sm"
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
    </div>
  );
};

export default DiagramPage;