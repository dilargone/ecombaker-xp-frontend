import React from 'react';
import '../styles/template.css';

interface TemplateAProps {
  data: Record<string, any>;
}

const TemplateA: React.FC<TemplateAProps> = ({ data }) => {
  return (
    <div className="template template-a">
      <div className="template-header">
        <h1>📋 Template A - Classic Layout</h1>
        <p className="subtitle">This is Template A with a clean, card-based design</p>
      </div>

      <div className="template-content">
        <div className="info-card">
          <h2>Primary Information</h2>
          <div className="data-display">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="data-item">
                <span className="label">{key}:</span>
                <span className="value">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="action-section">
          <button className="btn btn-primary">Action Button A</button>
          <button className="btn btn-secondary">Secondary Action</button>
        </div>
      </div>

      <div className="template-footer">
        <p>Template A • Optimized for desktop viewing</p>
      </div>
    </div>
  );
};

export default TemplateA;
