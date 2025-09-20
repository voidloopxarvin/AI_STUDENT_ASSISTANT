const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Gemini API methods
  async testGemini() {
    return this.request('/gemini/test', {
      method: 'POST',
    });
  }

  // Study Planner methods
  async createStudyPlan(formData) {
    return this.request('/planner/create-plan', {
      method: 'POST',
      body: formData,
    });
  }

  async getStudyProgress(planId) {
    return this.request(`/planner/progress/${planId}`);
  }

  async updateStudyProgress(planId, progressData) {
    return this.request(`/planner/progress/${planId}`, {
      method: 'POST',
      body: progressData,
    });
  }

  // Diagram Generator methods - Fixed version
  async generateDiagram(prompt) {
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt is required');
    }

    try {
      const response = await this.request('/diagram/generate', {
        method: 'POST',
        body: { prompt: prompt.trim() },
      });

      if (!response) {
        throw new Error('No response received');
      }

      if (response.success === false) {
        throw new Error(response.error || 'Unknown error occurred');
      }

      if (!response.mermaidCode) {
        throw new Error('No mermaid code in response');
      }

      return response;
    } catch (error) {
      console.error('Generate diagram error:', error);
      throw error;
    }
  }

  async getDiagramTemplates() {
    return this.request('/diagram/templates');
  }

  async exportDiagram(mermaidCode, format = 'png') {
    return this.request('/diagram/export', {
      method: 'POST',
      body: { mermaidCode, format },
    });
  }

  // Code Reviewer methods
  async reviewCode(code, language, reviewType = 'comprehensive') {
    return this.request('/reviewer/review', {
      method: 'POST',
      body: { code, language, reviewType },
    });
  }

  async getSupportedLanguages() {
    return this.request('/reviewer/languages');
  }

  async getSuggestedCode(code, language, issueType) {
    return this.request('/reviewer/suggest', {
      method: 'POST',
      body: { code, language, issueType },
    });
  }

  // Roadmaps methods
  async getRoadmaps() {
    return this.request('/roadmaps');
  }

  // Chat methods
  async sendChatMessage(message, sessionId, conversationHistory = []) {
    return this.request('/chat/message', {
      method: 'POST',
      body: { message, sessionId, conversationHistory },
    });
  }
}

export const apiService = new ApiService();