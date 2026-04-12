export type ResolvedTemplate = 'TEMPLATE_A' | 'TEMPLATE_B' | 'TEMPLATE_C' | 'TEMPLATE_D';

/**
 * Maps backend templateCode → frontend template component
 *
 * TEMP-001 → Template A (Classic card layout)
 * TEMP-002 → Template B (Modern grid layout)
 * TEMP-003 → Template C (Sidebar navigation layout)
 * TEMP-004 → Template D (Minimal dark layout)
 */
const templateCodeMap: Record<string, ResolvedTemplate> = {
  'TEMP-001': 'TEMPLATE_A',
  'TEMP-002': 'TEMPLATE_B',
  'TEMP-003': 'TEMPLATE_C',
  'TEMP-004': 'TEMPLATE_D',
};

export function resolveTemplateFromCode(templateCode?: string): ResolvedTemplate {
  if (!templateCode) {
    return 'TEMPLATE_A';
  }
  return templateCodeMap[templateCode.toUpperCase()] ?? 'TEMPLATE_A';
}
