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
  const [renderedDiagram, setRenderedDiagram] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const diagramRef = useRef(null);

  // Sample diagram templates
  const diagramTemplates = [
    {
      name: 'Flowchart',
      icon: FileText,
      description: 'Process flow and decision trees',
      code: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> B
    C --> E[End]`
    },
    {
      name: 'Sequence',
      icon: Zap,
      description: 'System interactions over time',
      code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great thanks!
    A->>B: See you later!`
    },
    {
      name: 'Class Diagram',
      icon: Code,
      description: 'Object-oriented structures',
      code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`
    }
  ];

  // Sample AI prompts
  const samplePrompts = [
    "Create a flowchart for a student registration process",
    "Design a sequence diagram for login authentication",
    "Make a class diagram for a library management system",
    "Show the workflow of submitting an assignment",
    "Create a diagram showing data flow in a web application"
  ];

  // Initialize mermaid
  useEffect(() => {
    // Load Mermaid.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
    script.onload = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Generate diagram with AI
  const generateDiagram = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your diagram');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.generateDiagram(prompt);
      setMermaidCode(response.mermaidCode);
      setSuccess('Diagram generated successfully!');
      await renderDiagram(response.mermaidCode);
    } catch (err) {
      setError('Failed to generate diagram. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render mermaid diagram
  const renderDiagram = async (code) => {
    if (!code.trim() || !window.mermaid) return;

    setIsRendering(true);
    try {
      const element = diagramRef.current;
      if (element) {
        element.innerHTML = code;
        await window.mermaid.run();
        setRenderedDiagram(element.innerHTML);
      }
    } catch (err) {
      setError('Invalid Mermaid syntax. Please check your code.');
      console.error('Render error:', err);
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

  // Handle manual code changes
  const handleCodeChange = (code) => {
    setMermaidCode(code);
    // Debounced rendering
    const timeoutId = setTimeout(() => {
      renderDiagram(code);
    }, 500);
    return () => clearTimeout(timeoutId);
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
    if (!renderedDiagram) {
      setError('No diagram to export');
      return;
    }

    try {
      // This would need actual export implementation
      setSuccess(`Exporting diagram as ${format.toUpperCase()}...`);
      
      if (format === 'svg') {
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = 'diagram.svg';
          link.click();
          
          URL.revokeObjectURL(url);
        }
      }
      
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Export failed');
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
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
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
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
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
                {diagramTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(template)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <template.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 mt-0.5" />
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
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
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
              <div className="border border-gray-200 rounded-lg p-4 min-h-96 bg-gray-50">
                {activeTab === 'visual' ? (
                  <div className="flex items-center justify-center h-full">
                    {isRendering ? (
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Rendering diagram...</p>
                      </div>
                    ) : (
                      <div
                        ref={diagramRef}
                        className="w-full h-full flex items-center justify-center"
                        style={{ minHeight: '300px' }}
                      >
                        {!mermaidCode && (
                          <div className="text-center">
                            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                              Generate or enter code to see your diagram
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="text-sm text-gray-700 overflow-auto h-full whitespace-pre-wrap">
                    {mermaidCode || 'No code generated yet...'}
                  </pre>
                )}
              </div>

              {/* Export Options */}
              {mermaidCode && (
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