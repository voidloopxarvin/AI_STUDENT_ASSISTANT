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

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
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

  // Feature methods (for Phase 2)
  async generateDiagram(prompt) {
    return this.request('/diagram/generate', {
      method: 'POST',
      body: { prompt },
    });
  }

  async createStudyPlan(pdfData, examDate) {
    return this.request('/planner/create-plan', {
      method: 'POST',
      body: { pdfData, examDate },
    });
  }

  async reviewCode(code, language) {
    return this.request('/reviewer/review', {
      method: 'POST',
      body: { code, language },
    });
  }
  // Add these methods to your existing ApiService class

async createStudyPlan(formData) {
  return this.request('/planner/create-plan', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header for FormData
    headers: {}, // This will let browser set the correct Content-Type with boundary
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
  // Add this method to your existing ApiService class

async generateDiagram(prompt) {
  return this.request('/diagram/generate', {
    method: 'POST',
    body: { prompt },
  });
}

async getDiagramTemplates() {
  return this.request('/diagram/templates');
}
// Add these methods to your existing ApiService class

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
}


export const apiService = new ApiService();