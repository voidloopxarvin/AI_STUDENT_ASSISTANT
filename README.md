# WISEMATE--AI Student Assistant

A comprehensive AI-powered learning platform that helps students with diagram generation, study planning, code review, career roadmaps, and interactive assistance.

## Features

### 🧠 Smart Diagram Generator
- **AI-Powered Creation**: Generate Mermaid diagrams from natural language descriptions
- **Multiple Templates**: Quick-start templates for flowcharts, sequence diagrams, and class diagrams
- **Real-time Preview**: Live rendering with syntax highlighting and error detection
- **Export Options**: Download diagrams as SVG, PNG, or PDF formats
- **Interactive Editor**: Manual code editing with auto-completion

### 📚 Intelligent Study Planner
- **PDF Analysis**: Upload study materials for AI-powered content analysis
- **Personalized Schedules**: Generate custom study plans based on exam dates and available time
- **Difficulty Assessment**: Adaptive planning based on subject complexity
- **Progress Tracking**: Visual progress indicators and milestone tracking
- **Pomodoro Timer**: Built-in study timer with break reminders

### 🔍 AI Code Reviewer
- **Multi-Language Support**: JavaScript, Python, Java, React JSX, and more
- **Comprehensive Analysis**: Security, performance, style, and best practices review
- **Detailed Feedback**: Line-by-line suggestions with severity ratings
- **Code Quality Metrics**: Overall scoring and improvement recommendations
- **Real-time Results**: Instant analysis with actionable insights

### 🗺️ Career Roadmaps
- **Industry-Standard Paths**: Curated learning roadmaps for various tech careers
- **Skill Prerequisites**: Clear requirements and preparation guidelines
- **Salary Information**: Market rates for entry, mid-level, and senior positions
- **Job Market Insights**: Relevant job titles and career progression paths
- **Interactive Timeline**: Step-by-step learning progression

### 💬 AI Chat Assistant
- **Contextual Help**: Intelligent responses to academic questions
- **Voice Integration**: Speech-to-text input and text-to-speech output
- **Conversation History**: Persistent chat sessions with export functionality
- **Multi-Modal Support**: Text, voice, and document-based interactions
- **Learning Support**: Homework help, concept explanations, and study guidance

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Routing**: React Router DOM
- **AI Integration**: Google Gemini API
- **Diagram Rendering**: Mermaid.js
- **Animation**: Custom particle system
- **Build Tool**: Vite
- **Styling**: Modern CSS with backdrop blur effects

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-student-assistant.git
cd ai-student-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:3001
```

## API Integration

The application integrates with various AI services:

- **Google Gemini**: Primary AI engine for chat, analysis, and content generation
- **Mermaid**: Diagram rendering and syntax validation
- **Speech APIs**: Browser-native speech recognition and synthesis

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FeatureCard.jsx
│   ├── Navbar.jsx
│   └── Particles.jsx
├── pages/              # Main application pages
│   ├── HomePage.jsx
│   ├── DiagramPage.jsx
│   ├── PlannerPage.jsx
│   ├── ReviewerPage.jsx
│   ├── RoadmapsPage.jsx
│   └── ChatPage.jsx
├── services/           # API service layer
│   └── api.js
├── data/              # Static data and configurations
│   └── roadmaps-data.json
└── styles/            # Global styles and themes
```

## Features in Detail

### Diagram Generation
- Natural language to Mermaid code conversion
- Support for flowcharts, sequence diagrams, class diagrams
- Real-time syntax validation and error handling
- Export capabilities for various formats

### Study Planning
- PDF content extraction and analysis
- Intelligent time allocation based on content difficulty
- Adaptive scheduling with exam date optimization
- Subject priority ranking and hour distribution

### Code Review
- Static code analysis across multiple programming languages
- Security vulnerability detection
- Performance optimization suggestions
- Code style and best practices enforcement

### Learning Roadmaps
- Pre-built career paths for software development, data science, cybersecurity
- Skill progression tracking with checkpoints
- Industry salary data and job market insights
- Prerequisite mapping and learning outcomes

## Design System

The application uses a minimalist black, blue, and white color scheme:
- **Primary**: Blue (#3b82f6) for actions and highlights
- **Background**: Black (#000000) for main areas
- **Text**: White (#ffffff) and gray variants for content
- **Interactive Elements**: Hover effects with subtle animations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Optimization

- Lazy loading for heavy components
- Debounced API calls to prevent rate limiting
- Memoized components for efficient re-renders
- Optimized particle system for smooth animations

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini for AI capabilities
- Mermaid.js for diagram rendering
- Tailwind CSS for utility-first styling
- React community for excellent tooling

---

