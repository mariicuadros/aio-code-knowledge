import { json } from '../lib/private-auth.mjs';

export async function GET() {
  return json({
    status: 'ok',
    phase: 'phase_2',
    instagram: {
      connector_code: 'installed',
      production_collection_enabled: process.env.AIO_COLLECTION_ENABLED === '1',
      graph_api_version: process.env.META_GRAPH_API_VERSION || 'v22.0',
      account_configured: Boolean(process.env.IG_BUSINESS_ID && process.env.IG_LONG_TOKEN),
      vault_read_configured: Boolean(process.env.AIO_VAULT_READ_TOKEN),
      vault_write_configured: Boolean(process.env.AIO_VAULT_WRITE_TOKEN),
      dashboard_admin_configured: Boolean(process.env.AIO_DASHBOARD_ADMIN_TOKEN || process.env.AIO_INSIGHTS_ADMIN_TOKEN),
    },
    evidence_boundary: 'Configuration status only; not proof of a successful current provider request.',
  });
}
