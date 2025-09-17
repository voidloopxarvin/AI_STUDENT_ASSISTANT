import React from 'react';
import { Code } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const ReviewerPage = () => {
  return (
    <PlaceholderPage 
      title="AI Code Reviewer"
      description="Get instant code reviews and suggestions"
      icon={Code}
      comingSoon={true}
    />
  );
};

export default ReviewerPage;