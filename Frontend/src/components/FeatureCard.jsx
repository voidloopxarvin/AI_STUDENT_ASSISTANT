import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, link, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
  };

  return (
    <Link to={link} className="group">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default FeatureCard;