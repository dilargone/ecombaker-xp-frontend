import React from 'react';
import '../styles/template.css';

interface TemplateDProps {
  data: Record<string, any>;
}

const TemplateD: React.FC<TemplateDProps> = ({ data }) => {
  return (
    <div className="template template-d">
      <div className="template-header">
        <h1>⚡ Template D — Minimal Dark</h1>
        <p className="subtitle">A bold, minimal dark-mode layout focused on conversion</p>
      </div>

      <div className="template-content">
        <div className="hero-banner">
          <h2>{data.storeName || 'Welcome'}</h2>
          <p className="hero-sub">Your store code: <strong>{data.storeCode}</strong></p>
          <button className="btn btn-cta">Shop Now</button>
        </div>

        <div className="minimal-grid">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="minimal-item">
              <span className="minimal-label">{key}</span>
              <span className="minimal-value">{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="template-footer">
        <p>Template D • Minimal dark layout</p>
      </div>
    </div>
  );
};

export default TemplateD;
