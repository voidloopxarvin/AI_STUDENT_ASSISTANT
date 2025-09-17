import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Code,
  Map,
  MessageCircle,
  Brain,
  Menu,
  X,
  Github,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Simple routing simulation for demo
const useRouter = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigate = (page) => setCurrentPage(page);

  return { currentPage, navigate };
};

// Hook to manage mobile menu
const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return { isOpen, toggleMenu, closeMenu };
};

// Navigation Component
const Navbar = ({ currentPage, navigate }) => {
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'diagram', label: 'Diagram', icon: Brain },
    { id: 'planner', label: 'Study Planner', icon: BookOpen },
    { id: 'reviewer', label: 'Code Review', icon: Code },
    { id: 'roadmaps', label: 'Roadmaps', icon: Map },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  ];

  const handleNavClick = (pageId) => {
    navigate(pageId);
    closeMenu();
  };

  const isActive = (pageId) => currentPage === pageId;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Student Assistant
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(id)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left ${isActive(id)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, onClick, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
  };

  return (
    <button onClick={onClick} className="group text-left w-full">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center mt-4 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </button>
  );
};

// Setup Status Component
const SetupStatus = () => {
  const steps = [
    { name: 'React + Vite Setup', completed: true },
    { name: 'Tailwind CSS', completed: true },
    { name: 'Responsive Navigation', completed: true },
    { name: 'Modern Design System', completed: true },
    { name: 'Component Structure', completed: true },
    { name: 'Gemini API Integration', completed: false },
    { name: 'Backend Setup', completed: false },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        Phase 1 Progress
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`}>
              {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
            <span className={step.completed ? 'text-green-700' : 'text-gray-500'}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Components
const HomePage = ({ navigate }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Star className="h-4 w-4 mr-2" />
          Your AI-Powered Learning Companion
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          AI Student
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}Assistant
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Revolutionize your learning journey with AI-powered tools for diagram generation,
          study planning, code review, and personalized learning roadmaps.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('diagram')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Creating Diagrams
          </button>
          <button
            onClick={() => navigate('planner')}
            className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Plan Your Studies
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          icon={Brain}
          title="Smart Diagrams"
          description="Generate beautiful Mermaid diagrams instantly with AI assistance"
          onClick={() => navigate('diagram')}
          color="blue"
        />
        <FeatureCard
          icon={BookOpen}
          title="Study Planner"
          description="Upload PDFs and get personalized study schedules for your exams"
          onClick={() => navigate('planner')}
          color="green"
        />
        <FeatureCard
          icon={Code}
          title="Code Reviewer"
          description="Get instant AI-powered code reviews and improvement suggestions"
          onClick={() => navigate('reviewer')}
          color="purple"
        />
        <FeatureCard
          icon={Map}
          title="Learning Roadmaps"
          description="Follow structured paths for AI, ML, cybersecurity, and more"
          onClick={() => navigate('roadmaps')}
          color="indigo"
        />
        <FeatureCard
          icon={MessageCircle}
          title="AI Chat Assistant"
          description="Get instant help and answers to all your academic questions"
          onClick={() => navigate('chat')}
          color="pink"
        />
        <FeatureCard
          icon={Github}
          title="Open Source"
          description="Built with modern tech stack: React, Tailwind, and Gemini AI"
          onClick={() => { }}
          color="gray"
        />
      </div>

      {/* Setup Status */}
      <div className="flex justify-center">
        <SetupStatus />
      </div>
    </div>
  </div>
);

// Placeholder Pages
const PlaceholderPage = ({ title, description, icon: Icon, comingSoon = false }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full inline-flex mb-6">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      {comingSoon && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          Coming Soon in Phase 2
        </div>
      )}
    </div>
  </div>
);

// Main App Component
const App = () => {
  const { currentPage, navigate } = useRouter();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'diagram':
        return (
          <PlaceholderPage
            title="Mermaid Diagram Generator"
            description="Create beautiful diagrams with AI assistance"
            icon={Brain}
            comingSoon={true}
          />
        );
      case 'planner':
        return (
          <PlaceholderPage
            title="Study Planner"
            description="Upload PDFs and get personalized study plans"
            icon={BookOpen}
            comingSoon={true}
          />
        );
      case 'reviewer':
        return (
          <PlaceholderPage
            title="AI Code Reviewer"
            description="Get instant code reviews and suggestions"
            icon={Code}
            comingSoon={true}
          />
        );
      case 'roadmaps':
        return (
          <PlaceholderPage
            title="Learning Roadmaps"
            description="Follow structured learning paths"
            icon={Map}
            comingSoon={true}
          />
        );
      case 'chat':
        return (
          <PlaceholderPage
            title="AI Chat Assistant"
            description="Get instant help with your studies"
            icon={MessageCircle}
            comingSoon={true}
          />
        );
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} navigate={navigate} />
      {renderPage()}
    </div>
  );
};

export default App;