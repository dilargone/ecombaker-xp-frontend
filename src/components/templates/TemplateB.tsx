import React from 'react';
import '../styles/template.css';

interface TemplateBProps {
  data: Record<string, any>;
}

const TemplateB: React.FC<TemplateBProps> = ({ data }) => {
  return (
    <div className="template template-b">
      <div className="template-header">
        <h1>🎨 Template B - Modern Grid Layout</h1>
        <p className="subtitle">This is Template B with a modern grid-based design</p>
      </div>

      <div className="template-content">
        <div className="grid-container">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="grid-item">
              <div className="grid-item-header">{key}</div>
              <div className="grid-item-body">
                <code>{JSON.stringify(value)}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="action-section action-horizontal">
          <button className="btn btn-accent">Primary CTA</button>
          <button className="btn btn-outline">Learn More</button>
          <button className="btn btn-outline">Contact</button>
        </div>
      </div>

      <div className="template-footer">
        <p>Template B • Responsive grid design for all devices</p>
      </div>
    </div>
  );
};

export default TemplateB;
