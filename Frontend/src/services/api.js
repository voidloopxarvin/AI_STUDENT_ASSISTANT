// services/api.js - Complete API service for AI Student Assistant

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Don't set Content-Type for FormData
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like file downloads)
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Notes Processing methods
  async processNotes(formData) {
    try {
      const response = await fetch(`${this.baseURL}/notes/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing notes file:', error);
      throw error;
    }
  }

  async processTextNotes(text) {
    try {
      const response = await fetch(`${this.baseURL}/notes/process-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing text notes:', error);
      throw error;
    }
  }

  // Gemini AI methods
  async testGemini() {
    return this.request('/gemini/test', {
      method: 'POST',
    });
  }

  async generateContent(prompt, type = 'general') {
    return this.request('/gemini/generate', {
      method: 'POST',
      body: { prompt, type },
    });
  }

  // Study Planner methods
  async createStudyPlan(formData) {
    try {
      const response = await fetch(`${this.baseURL}/planner/create-plan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating study plan:', error);
      throw error;
    }
  }

  async getStudyProgress(planId) {
    return this.request(`/planner/progress/${planId}`);
  }

  async updateStudyProgress(planId, progressData) {
    return this.request(`/planner/progress/${planId}`, {
      method: 'PUT',
      body: progressData,
    });
  }

  async deleteStudyPlan(planId) {
    return this.request(`/planner/plan/${planId}`, {
      method: 'DELETE',
    });
  }

  // Diagram Generator methods
  async generateDiagram(prompt) {
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt is required for diagram generation');
    }

    try {
      const response = await this.request('/diagram/generate', {
        method: 'POST',
        body: { prompt: prompt.trim() },
      });

      if (!response) {
        throw new Error('No response received from diagram service');
      }

      if (response.success === false) {
        throw new Error(response.error || 'Diagram generation failed');
      }

      if (!response.mermaidCode) {
        throw new Error('No mermaid code received in response');
      }

      return response;
    } catch (error) {
      console.error('Diagram generation error:', error);
      throw error;
    }
  }

  async getDiagramTemplates() {
    try {
      return await this.request('/diagram/templates');
    } catch (error) {
      console.warn('Failed to load diagram templates from API, using fallback');
      // Return fallback templates if API fails
      return {
        templates: [
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
        ]
      };
    }
  }

  async exportDiagram(mermaidCode, format = 'svg') {
    return this.request('/diagram/export', {
      method: 'POST',
      body: { mermaidCode, format },
    });
  }

  async validateMermaidCode(code) {
    return this.request('/diagram/validate', {
      method: 'POST',
      body: { code },
    });
  }

  // Code Reviewer methods
  async reviewCode(code, language, reviewType = 'comprehensive') {
    if (!code || !code.trim()) {
      throw new Error('Code is required for review');
    }

    if (!language) {
      throw new Error('Programming language is required for review');
    }

    return this.request('/reviewer/review', {
      method: 'POST',
      body: { code: code.trim(), language, reviewType },
    });
  }

  async getSupportedLanguages() {
    try {
      return await this.request('/reviewer/languages');
    } catch (error) {
      console.warn('Failed to load supported languages from API, using fallback');
      // Return fallback languages if API fails
      return {
        languages: [
          { id: 'javascript', name: 'JavaScript', extension: '.js' },
          { id: 'python', name: 'Python', extension: '.py' },
          { id: 'java', name: 'Java', extension: '.java' },
          { id: 'react', name: 'React JSX', extension: '.jsx' },
          { id: 'typescript', name: 'TypeScript', extension: '.ts' },
          { id: 'cpp', name: 'C++', extension: '.cpp' },
          { id: 'csharp', name: 'C#', extension: '.cs' },
          { id: 'php', name: 'PHP', extension: '.php' }
        ]
      };
    }
  }

  async getSuggestedCode(code, language, issueType) {
    return this.request('/reviewer/suggest', {
      method: 'POST',
      body: { code, language, issueType },
    });
  }

  async getCodeMetrics(code, language) {
    return this.request('/reviewer/metrics', {
      method: 'POST',
      body: { code, language },
    });
  }

  // Roadmaps methods
  async getRoadmaps() {
    return this.request('/roadmaps');
  }

  async getRoadmapById(id) {
    return this.request(`/roadmaps/${id}`);
  }

  async getRoadmapsByCategory(category) {
    return this.request(`/roadmaps/category/${category}`);
  }

  async updateRoadmapProgress(roadmapId, stepId, completed = true) {
    return this.request('/roadmaps/progress', {
      method: 'POST',
      body: { roadmapId, stepId, completed },
    });
  }

  async getUserRoadmapProgress(userId) {
    return this.request(`/roadmaps/user-progress/${userId}`);
  }

  // Chat methods
  async sendChatMessage(message, sessionId, conversationHistory = []) {
    if (!message || !message.trim()) {
      throw new Error('Message cannot be empty');
    }

    return this.request('/chat/message', {
      method: 'POST',
      body: { 
        message: message.trim(), 
        sessionId, 
        conversationHistory: conversationHistory.slice(-10) // Keep last 10 messages for context
      },
    });
  }

  async getChatHistory(sessionId, limit = 50) {
    return this.request(`/chat/history/${sessionId}?limit=${limit}`);
  }

  async clearChatHistory(sessionId) {
    return this.request(`/chat/history/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async exportChatHistory(sessionId, format = 'json') {
    return this.request(`/chat/export/${sessionId}?format=${format}`);
  }

  // File Upload methods (generic)
  async uploadFile(file, endpoint = '/upload') {
    if (!file) {
      throw new Error('File is required for upload');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Utility methods
  async ping() {
    const startTime = Date.now();
    await this.request('/health');
    return Date.now() - startTime;
  }

  async getServerInfo() {
    return this.request('/info');
  }

  async getApiStatus() {
    return this.request('/status');
  }

  // Error reporting
  async reportError(error, context = {}) {
    return this.request('/error/report', {
      method: 'POST',
      body: {
        error: error.message || error,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
    });
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export class for testing or multiple instances if needed
export { ApiService };