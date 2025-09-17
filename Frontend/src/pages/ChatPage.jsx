import React from 'react';
import { MessageCircle } from 'lucide-react';
import PlaceholderPage from '../components/PlaceholderPage';

const ChatPage = () => {
  return (
    <PlaceholderPage 
      title="AI Chat Assistant"
      description="Get instant help with your studies"
      icon={MessageCircle}
      comingSoon={true}
    />
  );
};

export default ChatPage;