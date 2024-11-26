import React from 'react';
import { useParams } from 'react-router-dom';

const HiringCycle = () => {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hiring Cycle Details</h1>
      <p>Hiring Cycle ID: {id}</p>
    </div>
  );
};

export default HiringCycle; 