import React, { useEffect, useState } from 'react';
import { Map, Clock, DollarSign, ArrowLeft, ChevronRight, CheckCircle, Star, Briefcase, Trophy, BookOpen, Target, Zap } from 'lucide-react';
import roadmapsData from '../data/roadmaps-data.json';
import Particles from '../components/Particles';

const RoadmapsPage = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roadmaps, setRoadmaps] = useState([]);

  useEffect(() => {
    setRoadmaps(roadmapsData.roadmaps);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'Advanced': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-800/20 border-gray-500/30';
    }
  };

  const filteredRoadmaps = selectedCategory === 'all' 
    ? roadmaps 
    : roadmaps.filter(roadmap => roadmap.category === selectedCategory);

  if (selectedRoadmap) {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Fixed Particles Background - Always Behind Content */}
        <div className="fixed inset-0 z-0">
          <Particles
            particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
            particleCount={80}
            particleSpread={12}
            speed={0.1}
            particleBaseSize={60}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={false}
            className="w-full h-full"
          />
        </div>

        {/* Content Container with Proper Z-Index */}
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <div className="bg-gray-900/60 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <button
                onClick={() => setSelectedRoadmap(null)}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Roadmaps
              </button>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">{selectedRoadmap.icon}</span>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {selectedRoadmap.title}
                      </h1>
                      <p className="text-lg text-gray-400 mt-2">{selectedRoadmap.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(selectedRoadmap.difficulty)}`}>
                      {selectedRoadmap.difficulty}
                    </div>
                    <div className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full border border-gray-600 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {selectedRoadmap.duration}
                    </div>
                    <div className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full border border-gray-600 text-sm">
                      <Zap className="w-4 h-4 inline mr-1" />
                      {selectedRoadmap.estimatedHours}h total
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Prerequisites */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
                    Prerequisites
                  </h3>
                  <ul className="space-y-2">
                    {selectedRoadmap.prerequisites?.map((prereq, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Info */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                    Salary Range
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white ml-2">{selectedRoadmap.salary?.entry}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Mid-level:</span>
                      <span className="text-white ml-2">{selectedRoadmap.salary?.mid}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Senior:</span>
                      <span className="text-white ml-2">{selectedRoadmap.salary?.senior}</span>
                    </div>
                  </div>
                </div>

                {/* Job Titles */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                    Job Titles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoadmap.jobTitles?.map((title, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs border border-gray-700">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-gray-400" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2">
                    {selectedRoadmap.outcomes?.map((outcome, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start">
                        <Star className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Main Content - Learning Path */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  Complete Learning Path
                </h2>

                {/* Sections */}
                <div className="space-y-8">
                  {selectedRoadmap.sections?.map((section, sectionIndex) => (
                    <div key={section.id} className="relative">
                      {/* Section Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                          {sectionIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{section.title}</h3>
                          <p className="text-gray-400 text-sm">{section.description}</p>
                          <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700 mt-2 inline-block">
                            {section.duration}
                          </span>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="ml-4 border-l-2 border-gray-700 pl-8 space-y-6 relative">
                        {section.steps?.map((step) => (
                          <div key={step.id} className="relative bg-gray-900/20 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-gray-700 transition-all">
                            {/* Step Number Circle */}
                            <div className="absolute -left-12 top-8 w-6 h-6 bg-gray-800 border-2 border-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-blue-400 font-bold">{step.id}</span>
                            </div>
                            
                            {/* Step Content */}
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                              <p className="text-gray-400 text-sm mb-4">{step.description}</p>
                              
                              {/* Topics */}
                              {step.topics && step.topics.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-300 mb-3">Key Topics:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {step.topics.map((topic, topicIndex) => (
                                      <div key={topicIndex} className="flex items-center text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                                        {topic}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Completion Message */}
                <div className="mt-12 text-center bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-gray-800/50">
                  <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                  <p className="text-gray-300">
                    Upon completing this roadmap, you'll be ready to work as a {selectedRoadmap.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed Particles Background - Always Behind Content */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#3b82f6', '#8b5cf6', '#ec4899']}
          particleCount={120}
          particleSpread={8}
          speed={0.15}
          particleBaseSize={70}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Content Container with Proper Z-Index */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gray-900/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-16 text-center">
            <div className="flex items-center justify-center mb-6">
              <Map className="w-12 h-12 text-blue-400 mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Career Roadmaps
              </h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive learning paths crafted by industry experts. Choose your destination and follow the proven route to success.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-12 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">200K+</div>
                <div className="text-gray-500 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">15+</div>
                <div className="text-gray-500 text-sm">Career Paths</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200">95%</div>
                <div className="text-gray-500 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-900/40 backdrop-blur-md border-y border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-center">
              <div className="flex space-x-4 bg-gray-800/50 rounded-full p-2">
                {['all', 'development', 'data', 'security', 'mobile'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmaps Grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {filteredRoadmaps.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <p className="text-xl text-gray-500">No roadmaps found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRoadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="group bg-gray-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => setSelectedRoadmap(roadmap)}
                >
                  {/* Card Header */}
                  <div className="bg-gray-800/40 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{roadmap.icon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(roadmap.difficulty)}`}>
                        {roadmap.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{roadmap.title}</h3>
                    <p className="text-gray-400 text-sm">{roadmap.description}</p>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Stats */}
                    <div className="flex justify-between mb-6 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {roadmap.duration}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Zap className="w-4 h-4 mr-1" />
                        {roadmap.estimatedHours}h
                      </div>
                    </div>

                    {/* Salary Range */}
                    <div className="mb-6">
                      <div className="text-xs text-gray-500 mb-2">Salary Range</div>
                      <div className="text-white font-semibold text-sm">{roadmap.salary?.entry}</div>
                      <div className="text-xs text-gray-400">to {roadmap.salary?.senior}</div>
                    </div>

                    {/* Learning Path Preview */}
                    <div className="mb-6">
                      <div className="text-xs text-gray-500 mb-3">Learning Path</div>
                      <div className="space-y-2">
                        {roadmap.sections?.slice(0, 3).map((section, index) => (
                          <div key={section.id} className="flex items-center text-sm">
                            <div className="w-4 h-4 rounded border border-gray-600 flex items-center justify-center mr-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            </div>
                            <span className="text-gray-300">{section.title}</span>
                          </div>
                        ))}
                        {roadmap.sections?.length > 3 && (
                          <div className="text-xs text-gray-500 ml-7">
                            +{roadmap.sections.length - 3} more sections
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center group">
                      View Complete Roadmap
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapsPage;