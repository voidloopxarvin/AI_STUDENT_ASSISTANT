import React, { useEffect, useState } from 'react';
import { Map, Clock, Users, Star, ChevronRight, Trophy, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

const RoadmapsPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await apiService.getRoadmaps();
        console.log('Loaded roadmaps:', response);
        setRoadmaps(response.roadmaps || []);
      } catch (error) {
        console.error('Failed to load roadmaps:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoadmaps();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRoadmaps = selectedCategory === 'all' 
    ? roadmaps 
    : roadmaps.filter(roadmap => roadmap.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Map className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Learning Roadmaps</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Structured learning paths to master new skills and advance your career
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {['all', 'development', 'data', 'security', 'mobile'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 shadow-md'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Roadmaps Grid */}
        {filteredRoadmaps.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No roadmaps found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${roadmap.color} p-6 text-white`}>
                  <h3 className="text-xl font-bold mb-2">{roadmap.title}</h3>
                  <p className="text-blue-100">{roadmap.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {roadmap.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {roadmap.students}
                    </div>
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {roadmap.rating}
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(roadmap.difficulty)}`}>
                      {roadmap.difficulty}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills?.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {roadmap.skills?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{roadmap.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{roadmap.totalSteps} steps</span>
                    <span>{roadmap.estimatedHours}h total</span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center group">
                    Start Learning
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Join Thousands of Learners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">200K+</div>
              <div className="text-gray-600">Students Enrolled</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Completed Roadmaps</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapsPage;