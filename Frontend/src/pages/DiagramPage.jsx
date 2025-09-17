import React from 'react';
import { Brain } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const DiagramPage = () => {
  return (
    <PlaceholderPage 
      title="Mermaid Diagram Generator"
      description="Create beautiful diagrams with AI assistance"
      icon={Brain}
      comingSoon={true}
    />
  );
};

export default DiagramPage;