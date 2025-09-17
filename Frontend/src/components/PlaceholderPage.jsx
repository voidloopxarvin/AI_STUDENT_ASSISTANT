import React from 'react';

const PlaceholderPage = ({ title, description, icon: Icon, comingSoon = false }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full inline-flex mb-6">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      {comingSoon && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          Coming Soon in Phase 2
        </div>
      )}
    </div>
  </div>
);

export default PlaceholderPage;