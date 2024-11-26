import React from 'react';

const TopBar = ({ title }) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
    </div>
  );
};

export default TopBar; 