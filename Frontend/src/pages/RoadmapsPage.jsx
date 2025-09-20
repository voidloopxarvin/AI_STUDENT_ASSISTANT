import React, { useEffect, useState } from 'react';
import { Map, ArrowDown, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { apiService } from '../services/api';

const RoadmapsPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);

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
      case 'Beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (selectedRoadmap) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedRoadmap(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Roadmaps
          </button>

          {/* Roadmap Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{selectedRoadmap.title}</h1>
            <p className="text-gray-600 mb-4">{selectedRoadmap.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full border ${getDifficultyColor(selectedRoadmap.difficulty)}`}>
                {selectedRoadmap.difficulty}
              </span>
              <span className="text-gray-600">⏱️ {selectedRoadmap.duration}</span>
              <span className="text-gray-600">📚 {selectedRoadmap.estimatedHours}h total</span>
            </div>
          </div>

          {/* Learning Path */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-6">Learning Path</h2>
            
            <div className="space-y-6">
              {selectedRoadmap.skills.map((skill, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    {index < selectedRoadmap.skills.length - 1 && (
                      <div className="w-px h-12 bg-gray-300 ml-4 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-900">{skill}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Master the fundamentals of {skill.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prerequisites */}
            {selectedRoadmap.prerequisites && selectedRoadmap.prerequisites.length > 0 && (
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Prerequisites:</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {selectedRoadmap.prerequisites.map((prereq, index) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {selectedRoadmap.outcomes && selectedRoadmap.outcomes.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What You'll Learn:</h3>
                <ul className="text-green-700 text-sm space-y-1">
                  {selectedRoadmap.outcomes.map((outcome, index) => (
                    <li key={index}>✓ {outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Map className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Career Roadmaps</h1>
          </div>
          <p className="text-lg text-gray-600">
            Choose your path and see the complete learning journey
          </p>
        </div>

        {/* Roadmaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRoadmap(roadmap)}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{roadmap.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{roadmap.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(roadmap.difficulty)}`}>
                    {roadmap.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">{roadmap.duration}</span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Learning Path:</div>
                  <div className="space-y-2">
                    {roadmap.skills.slice(0, 4).map((skill, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-300 mr-2 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        </div>
                        {skill}
                      </div>
                    ))}
                    {roadmap.skills.length > 4 && (
                      <div className="text-xs text-gray-500 ml-6">
                        +{roadmap.skills.length - 4} more steps
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  View Roadmap →
                </button>
              </div>
            </div>
          ))}
        </div>

        {roadmaps.length === 0 && (
          <div className="text-center py-12">
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No roadmaps available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapsPage;