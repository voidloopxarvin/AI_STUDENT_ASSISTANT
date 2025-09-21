import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Brain, BookOpen, Code, Map, MessageCircle, Github } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import Particles from '../components/Particles';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/30">
              <Star className="h-4 w-4 mr-2" />
              Your AI-Powered Learning Companion
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI Student
              <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                {' '}Assistant
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your learning journey with AI-powered tools for diagram generation, 
              study planning, code review, and personalized learning roadmaps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/diagram"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Creating Diagrams
              </Link>
              <Link
                to="/planner"
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Plan Your Studies
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Brain}
              title="Smart Diagrams"
              description="Generate beautiful Mermaid diagrams instantly with AI assistance"
              link="/diagram"
              color="blue"
            />
            <FeatureCard
              icon={BookOpen}
              title="Study Planner"
              description="Upload PDFs and get personalized study schedules for your exams"
              link="/planner"
              color="blue"
            />
            <FeatureCard
              icon={Code}
              title="Code Reviewer"
              description="Get instant AI-powered code reviews and improvement suggestions"
              link="/reviewer"
              color="blue"
            />
            <FeatureCard
              icon={Map}
              title="Learning Roadmaps"
              description="Follow structured paths for AI, ML, cybersecurity, and more"
              link="/roadmaps"
              color="blue"
            />
            <FeatureCard
              icon={MessageCircle}
              title="AI Chat Assistant"
              description="Get instant help and answers to all your academic questions"
              link="/chat"
              color="blue"
            />
            <FeatureCard
              icon={Github}
              title="Open Source"
              description="Built with modern tech stack: React, Tailwind, and Gemini AI"
              link="#"
              color="gray"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;