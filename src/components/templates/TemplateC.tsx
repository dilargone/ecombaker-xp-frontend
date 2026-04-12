import React from 'react';
import '../styles/template.css';

interface TemplateCProps {
  data: Record<string, any>;
}

const TemplateC: React.FC<TemplateCProps> = ({ data }) => {
  return (
    <div className="template template-c">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>{data.storeName || 'Store'}</h2>
          <span className="sidebar-code">{data.storeCode}</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#">🏠 Home</a>
          <a href="#">🛒 Shop</a>
          <a href="#">📦 Orders</a>
          <a href="#">👤 Account</a>
          <a href="#">📞 Support</a>
        </nav>
        <div className="sidebar-meta">
          <p>Template: <code>{data.templateCode}</code></p>
          <p>Domain: <code>{data.domain}</code></p>
        </div>
      </aside>

      <main className="sidebar-main">
        <div className="template-header">
          <h1>🗂 Template C — Sidebar Layout</h1>
          <p className="subtitle">A navigation-first layout with a persistent sidebar</p>
        </div>

        <div className="template-content">
          <div className="info-card">
            <h2>Store Details</h2>
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
            <button className="btn btn-primary">Browse Catalog</button>
            <button className="btn btn-secondary">View Orders</button>
          </div>
        </div>

        <div className="template-footer">
          <p>Template C • Sidebar navigation layout</p>
        </div>
      </main>
    </div>
  );
};

export default TemplateC;
