import React from 'react';
import { BookOpen } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const PlannerPage = () => {
  return (
    <PlaceholderPage 
      title="Study Planner"
      description="Upload PDFs and get personalized study plans"
      icon={BookOpen}
      comingSoon={true}
    />
  );
};

export default PlannerPage;