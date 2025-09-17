import React from 'react';
import { Map } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const RoadmapsPage = () => {
  return (
    <PlaceholderPage 
      title="Learning Roadmaps"
      description="Follow structured learning paths"
      icon={Map}
      comingSoon={true}
    />
  );
};

export default RoadmapsPage;