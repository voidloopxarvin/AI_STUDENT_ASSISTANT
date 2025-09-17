import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DiagramPage from './pages/DiagramPage';
import PlannerPage from './pages/PlannerPage';
import ReviewerPage from './pages/ReviewerPage';
import RoadmapsPage from './pages/RoadmapsPage';
import ChatPage from './pages/ChatPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/diagram" element={<DiagramPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/reviewer" element={<ReviewerPage />} />
          <Route path="/roadmaps" element={<RoadmapsPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;