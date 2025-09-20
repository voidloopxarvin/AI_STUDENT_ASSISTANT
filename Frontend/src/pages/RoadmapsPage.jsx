import React from 'react';
import { Map } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const RoadmapsPage = () => {
  // Add this useEffect to load real data in RoadmapsPage.jsx

useEffect(() => {
  const loadRoadmaps = async () => {
    try {
      const response = await apiService.getRoadmaps();
      // Update state with real roadmap data
      console.log('Loaded roadmaps:', response.roadmaps);
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
    }
  };

  loadRoadmaps();
}, []);
}

export default RoadmapsPage;