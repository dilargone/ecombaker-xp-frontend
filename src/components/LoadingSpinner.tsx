import React from 'react';
import './styles/loading.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading template...</p>
    </div>
  );
};

export default LoadingSpinner;
