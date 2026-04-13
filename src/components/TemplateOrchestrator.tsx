import React, { useEffect, useState } from 'react';
import apiService, { TemplateData } from '@/services/apiService';
import TemplateA from './templates/TemplateA';
import TemplateB from './templates/TemplateB';
import TemplateC from './templates/TemplateC';
import TemplateD from './templates/TemplateD';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { resolveTemplateFromCode, ResolvedTemplate } from '@/config/templateMapping';
import { getCurrentDomain, getSubdomain } from '@/utils/domain';

interface TemplateConfig {
  template: ResolvedTemplate;
  data: TemplateData;
  message?: string;
}

/**
 * Orchestrator Component
 * 
 * This is the main component responsible for:
 * 1. Calls GET /api/template-code (Host header identifies the tenant)
 * 2. Maps backend templateCode → frontend template (TEMP-001→A, 002→B, 003→C, 004→D)
 * 3. Renders the matching template component
 * 4. Handles loading and error states
 */
const TemplateOrchestrator: React.FC = () => {
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplateConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const domain = getCurrentDomain();
        const subdomain = getSubdomain(domain);

        const storeConfig = await apiService.fetchStoreConfig();
        const resolvedTemplate = resolveTemplateFromCode(storeConfig.templateCode);

        setConfig({
          template: resolvedTemplate,
          data: {
            domain,
            subdomain,
            storeCode: storeConfig.storeCode,
            storeName: storeConfig.storeName,
            templateCode: storeConfig.templateCode,
          },
          message: `Tenant resolved for ${domain}`,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to resolve tenant configuration';
        setError(errorMessage);
        console.error('Template orchestrator error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplateConfig();
  }, []);

  // Show loading state while fetching config
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state if something went wrong
  if (error || !config) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>⚠️ Error Loading Template</h2>
          <p>{error || 'Unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Route to appropriate template based on backend templateCode
  const renderTemplate = () => {
    switch (config.template) {
      case 'TEMPLATE_A': return <TemplateA data={config.data} />;
      case 'TEMPLATE_B': return <TemplateB data={config.data} />;
      case 'TEMPLATE_C': return <TemplateC data={config.data} />;
      case 'TEMPLATE_D': return <TemplateD data={config.data} />;
      default: return (
        <div className="error-container">
          <div className="error-box">
            <h2>❌ Unknown Template</h2>
            <p>Backend returned unknown template: {config.template}</p>
          </div>
        </div>
      );
    }
  };

  return <ErrorBoundary>{renderTemplate()}</ErrorBoundary>;
};

export default TemplateOrchestrator;
