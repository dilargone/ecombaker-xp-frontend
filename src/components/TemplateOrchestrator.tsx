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
 * Supports ?t=A|B|C|D override for local preview, e.g.
 *   http://localhost:5173/?t=B   → forces TemplateB
 *   http://localhost:5173/?t=D   → forces TemplateD
 * In production the backend templateCode always wins unless ?t= is present.
 */
function getQueryTemplateOverride(): ResolvedTemplate | null {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('t')?.toUpperCase();
  const map: Record<string, ResolvedTemplate> = {
    A: 'TEMPLATE_A', B: 'TEMPLATE_B', C: 'TEMPLATE_C', D: 'TEMPLATE_D',
    '1': 'TEMPLATE_A', '2': 'TEMPLATE_B', '3': 'TEMPLATE_C', '4': 'TEMPLATE_D',
  };
  return t ? (map[t] ?? null) : null;
}

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

        // URL param ?t=A/B/C/D overrides the backend templateCode for easy previewing
        const override = getQueryTemplateOverride();
        const resolvedTemplate = override ?? resolveTemplateFromCode(storeConfig.templateCode);

        setConfig({
          template: resolvedTemplate,
          data: {
            domain,
            subdomain,
            storeCode: storeConfig.storeCode ?? 'PREVIEW',
            storeName: storeConfig.storeName ?? domain,
            templateCode: storeConfig.templateCode,
          },
          message: `Tenant resolved for ${domain}`,
        });
      } catch (err) {
        // If backend is unreachable, check for ?t= override before failing
        const override = getQueryTemplateOverride();
        if (override) {
          const domain = getCurrentDomain();
          setConfig({
            template: override,
            data: {
              domain,
              subdomain: getSubdomain(domain),
              storeCode: 'PREVIEW',
              storeName: 'Preview Store',
              templateCode: `TEMP-00${['A','B','C','D'].indexOf(override.slice(-1)) + 1}`,
            },
          });
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to resolve tenant configuration';
          setError(errorMessage);
          console.error('Template orchestrator error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTemplateConfig();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !config) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>⚠️ Error Loading Template</h2>
          <p>{error || 'Unknown error occurred'}</p>
          <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            Tip: add <code>?t=A</code>, <code>?t=B</code>, <code>?t=C</code>, or <code>?t=D</code> to the URL to preview a template.
          </p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

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
