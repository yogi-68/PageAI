'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Sk } from '@/components/ui/Skeleton';
import IntegrationWizard from '@/components/IntegrationWizard';
import LiveTestConsole from '@/components/LiveTestConsole';
import { Search, Activity, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
interface Integration {
  id: string;
  name: string;
  type: 'shopify' | 'woocommerce' | 'custom';
  base_url: string;
  allowed_endpoints: string[];
  is_enabled: boolean;
  last_test_at: string | null;
  last_test_status: 'ok' | 'error' | 'timeout' | null;
  last_test_message: string | null;
  created_at: string;
}

interface ToolLog {
  id: string;
  tool_name: string;
  input_params: Record<string, unknown>;
  status: 'success' | 'error' | 'timeout' | 'blocked';
  latency_ms: number | null;
  error_message: string | null;
  created_at: string;
  bot_id: string | null;
}

interface Stats {
  [tool: string]: { total: number; successful: number; failed: number; avgLatencyMs: number };
}

// ─── Constants ────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  custom: 'Custom REST',
};

const TYPE_COLORS: Record<string, string> = {
  shopify: '#96bf48',
  woocommerce: '#7f54b3',
  custom: '#4f6df5',
};

const CREDENTIAL_FIELDS: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  shopify: [
    { key: 'apiKey', label: 'Admin API Access Token', placeholder: 'shpat_...', type: 'password' },
  ],
  woocommerce: [
    { key: 'consumerKey', label: 'Consumer Key', placeholder: 'ck_...', type: 'password' },
    { key: 'consumerSecret', label: 'Consumer Secret', placeholder: 'cs_...', type: 'password' },
  ],
  custom: [
    { key: 'authHeader', label: 'Auth Header (e.g. Authorization: Bearer TOKEN)', placeholder: 'Authorization: Bearer your_token' },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  success: '#22c55e',
  ok: '#22c55e',
  error: '#f87171',
  timeout: '#f59e0b',
  blocked: '#94a3b8',
};

const DEFAULT_ENDPOINTS: Record<string, string[]> = {
  shopify: ['/admin/api/2024-01/orders/', '/admin/api/2024-01/products/', '/admin/api/2024-01/shipping_zones.json'],
  woocommerce: ['/wp-json/wc/v3/orders/', '/wp-json/wc/v3/products/', '/wp-json/wc/v3/shipping/'],
  custom: ['/orders/', '/products/', '/shipments/', '/shipping/'],
};

// ─── Modal State ──────────────────────────────────────────
interface ModalState {
  open: boolean;
  editing: Integration | null;
}

// ─── Page ─────────────────────────────────────────────────
export default function IntegrationsPage() {
  const { user, session } = useAuth();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return fetch(url, { ...options, headers });
  }, [session?.access_token]);

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<ToolLog[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'error' | 'timeout' | 'blocked'>('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasApiAccess, setHasApiAccess] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState('free');

  // Form state
  const [form, setForm] = useState({
    name: '',
    type: 'shopify' as 'shopify' | 'woocommerce' | 'custom',
    baseUrl: '',
    credentials: {} as Record<string, string>,
    allowedEndpoints: [] as string[],
    endpointInput: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan, api_access')
        .eq('id', user.id)
        .single();
      if (profileData) {
        setHasApiAccess(profileData.api_access ?? false);
        setUserPlan(profileData.plan || 'free');
      }

      const [intRes, logRes] = await Promise.all([
        apiFetch('/api/integrations'),
        apiFetch('/api/integrations/logs?limit=30'),
      ]);
      
      if (!intRes.ok || !logRes.ok) {
        console.error('Failed to fetch integration data');
        setLoading(false);
        return;
      }
      
      const intData = await intRes.json();
      const logData = await logRes.json();
      setIntegrations(intData.integrations || []);
      setLogs(logData.logs || []);
      setStats(logData.stats || {});
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setForm({ name: '', type: 'shopify', baseUrl: '', credentials: {}, allowedEndpoints: DEFAULT_ENDPOINTS.shopify, endpointInput: '' });
    setFormError('');
    setModal({ open: true, editing: null });
  };

  const openEdit = (integration: Integration) => {
    setForm({
      name: integration.name,
      type: integration.type,
      baseUrl: integration.base_url,
      credentials: {},
      allowedEndpoints: integration.allowed_endpoints,
      endpointInput: '',
    });
    setFormError('');
    setModal({ open: true, editing: integration });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleTypeChange = (type: 'shopify' | 'woocommerce' | 'custom') => {
    setForm(f => ({ ...f, type, credentials: {}, allowedEndpoints: DEFAULT_ENDPOINTS[type] }));
  };

  const handleCredentialChange = (key: string, value: string) => {
    setForm(f => ({ ...f, credentials: { ...f.credentials, [key]: value } }));
  };

  const addEndpoint = () => {
    const ep = form.endpointInput.trim();
    if (!ep) return;
    if (!form.allowedEndpoints.includes(ep)) {
      setForm(f => ({ ...f, allowedEndpoints: [...f.allowedEndpoints, ep], endpointInput: '' }));
    }
  };

  const removeEndpoint = (ep: string) => {
    setForm(f => ({ ...f, allowedEndpoints: f.allowedEndpoints.filter(e => e !== ep) }));
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.baseUrl.trim()) { setFormError('Base URL is required'); return; }
    try { new URL(form.baseUrl); } catch { setFormError('Base URL must be a valid URL'); return; }

    setSaving(true);
    try {
      if (modal.editing) {
        const body: Record<string, unknown> = {
          id: modal.editing.id,
          name: form.name,
          baseUrl: form.baseUrl,
          allowedEndpoints: form.allowedEndpoints,
        };
        if (Object.values(form.credentials).some(v => v)) body.credentials = form.credentials;
        const res = await apiFetch('/api/integrations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Update failed'); return; }
      } else {
        const res = await apiFetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, type: form.type, baseUrl: form.baseUrl, credentials: form.credentials, allowedEndpoints: form.allowedEndpoints }),
        });
        if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Create failed'); return; }
      }
      closeModal();
      await fetchData();
    } catch { setFormError('Unexpected error. Please try again.'); }
    setSaving(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await apiFetch('/api/integrations/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ integrationId: id }) });
      await fetchData();
    } catch { /* silent */ }
    setTestingId(null);
  };

  const handleToggle = async (integration: Integration) => {
    setTogglingId(integration.id);
    try {
      await apiFetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integration.id, isEnabled: !integration.is_enabled }),
      });
      await fetchData();
    } catch { /* silent */ }
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this integration? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/integrations?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch { /* silent */ }
    setDeletingId(null);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="space-y-2"><Sk className="h-7 w-40" /><Sk className="h-4 w-80" /></div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="p-4 rounded-xl border border-edge bg-surface/40 space-y-3"><Sk className="h-3 w-24" /><Sk className="h-6 w-16" /></div>)}
      </div>
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        {[...Array(2)].map((_, i) => <div key={i} className="p-4 border-b border-edge last:border-0 space-y-2"><Sk className="h-5 w-48" /><Sk className="h-3 w-72" /></div>)}
      </div>
    </div>
  );

  const totalCalls = Object.values(stats).reduce((s, t) => s + t.total, 0);
  const successRate = totalCalls > 0
    ? Math.round((Object.values(stats).reduce((s, t) => s + t.successful, 0) / totalCalls) * 100)
    : 0;
  const avgLatency = totalCalls > 0
    ? Math.round(Object.values(stats).reduce((s, t) => s + (t.avgLatencyMs * t.total), 0) / totalCalls)
    : 0;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = logSearch === '' || 
      log.tool_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.error_message?.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logFilter === 'all' || log.status === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">

      {/* Integration Wizard */}
      <IntegrationWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={() => {
          setWizardOpen(false);
          setSuccessMessage('Integration created successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
          fetchData();
        }}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle size={18} className="text-[#22c55e]" />
          <p className="text-sm text-[#edf0f7] font-medium">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-[#22c55e] hover:text-[#22c55e]/80 transition-colors ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">API Integrations</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">Connect live data sources so the AI can answer real-time customer queries</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            disabled={!hasApiAccess}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-edge text-fg-secondary text-[13px] font-medium hover:text-fg hover:border-fg/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quick Add
          </button>
          <button
            onClick={() => setWizardOpen(true)}
            disabled={!hasApiAccess}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[16px] leading-none">+</span> Add Integration
          </button>
        </div>
      </div>

      {hasApiAccess === false && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.04] flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-fg">API integrations require Growth plan or higher</p>
              <p className="text-[12px] text-fg-secondary mt-0.5">
                Your current plan ({userPlan}) includes website and file connectors only.
                Upgrade to connect Shopify, WooCommerce, or custom REST APIs for live order and product data.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Stats Row */}
      {totalCalls > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-5 rounded-xl border border-edge bg-surface/40 hover:bg-surface/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-[#4f6df5]" />
              <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Total Calls</span>
            </div>
            <p className="text-[28px] font-bold text-fg">{totalCalls.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl border border-edge bg-surface/40 hover:bg-surface/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-[#22c55e]" />
              <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Success Rate</span>
            </div>
            <p className="text-[28px] font-bold text-fg">{successRate}%</p>
          </div>
          <div className="p-5 rounded-xl border border-edge bg-surface/40 hover:bg-surface/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#f59e0b]" />
              <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Avg Latency</span>
            </div>
            <p className="text-[28px] font-bold text-fg">{avgLatency}ms</p>
          </div>
          <div className="p-5 rounded-xl border border-edge bg-surface/40 hover:bg-surface/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-[#f87171]" />
              <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Active</span>
            </div>
            <p className="text-[28px] font-bold text-fg">{integrations.filter(i => i.is_enabled).length}</p>
          </div>
        </div>
      )}

      {/* Integration Cards */}
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
          <h2 className="text-[14px] font-semibold text-fg">Connected Integrations</h2>
          <span className="text-[12px] text-fg-muted">{integrations.length} configured</span>
        </div>

        {integrations.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-[32px] mb-2">🔌</div>
            <p className="text-[14px] font-medium text-fg">No integrations yet</p>
            <p className="text-[13px] text-fg-secondary mt-1 mb-4">Connect Shopify, WooCommerce, or any REST API to answer live customer queries.</p>
            <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
              Add your first integration
            </button>
          </div>
        ) : (
          integrations.map((integration) => (
            <div key={integration.id} className="flex items-center gap-4 px-5 py-4 border-b border-edge last:border-0">
              {/* Type badge */}
              <div
                className="flex-none w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: TYPE_COLORS[integration.type] }}
              >
                {integration.type === 'shopify' ? 'SH' : integration.type === 'woocommerce' ? 'WC' : 'API'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-fg truncate">{integration.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: TYPE_COLORS[integration.type] + '22', color: TYPE_COLORS[integration.type] }}>
                    {TYPE_LABELS[integration.type]}
                  </span>
                  {!integration.is_enabled && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#94a3b8]/10 text-[#94a3b8] font-medium">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-fg-muted truncate mt-0.5">{integration.base_url}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {integration.last_test_status && (
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: STATUS_COLORS[integration.last_test_status] }}>
                      {integration.last_test_status === 'ok' && <CheckCircle size={12} />}
                      {integration.last_test_status === 'error' && <XCircle size={12} />}
                      {integration.last_test_status === 'timeout' && <Clock size={12} />}
                      {integration.last_test_message || integration.last_test_status}
                    </span>
                  )}
                  <span className="text-[11px] text-fg-muted">{integration.allowed_endpoints.length} endpoint{integration.allowed_endpoints.length !== 1 ? 's' : ''}</span>
                  {integration.last_test_at && (
                    <span className="text-[11px] text-fg-muted">
                      Tested {new Date(integration.last_test_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-none">
                {/* Enable/disable toggle */}
                <button
                  onClick={() => handleToggle(integration)}
                  disabled={togglingId === integration.id}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${integration.is_enabled ? 'bg-accent' : 'bg-edge'} ${togglingId === integration.id ? 'opacity-50' : ''}`}
                  title={integration.is_enabled ? 'Disable' : 'Enable'}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${integration.is_enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>

                {/* Test */}
                <button
                  onClick={() => handleTest(integration.id)}
                  disabled={testingId === integration.id}
                  className="px-2.5 py-1 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-fg/30 transition-colors disabled:opacity-50"
                >
                  {testingId === integration.id ? 'Testing…' : 'Test'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(integration)}
                  className="px-2.5 py-1 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-fg/30 transition-colors"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(integration.id)}
                  disabled={deletingId === integration.id}
                  className="px-2.5 py-1 rounded-lg border border-edge text-[12px] text-red-400 hover:text-red-300 hover:border-red-400/40 transition-colors disabled:opacity-50"
                >
                  {deletingId === integration.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Test Console */}
      {integrations.some(i => i.is_enabled) && (
        <LiveTestConsole />
      )}

      {/* Tool Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-edge">
            <h2 className="text-[14px] font-semibold text-fg">Tool Performance</h2>
          </div>
          <div className="divide-y divide-edge">
            {Object.entries(stats).map(([tool, s]) => (
              <div key={tool} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-fg">{tool}</span>
                </div>
                <div className="flex items-center gap-6 text-[12px] text-fg-secondary">
                  <span>{s.total} calls</span>
                  <span style={{ color: STATUS_COLORS.success }}>{s.successful} ok</span>
                  {s.failed > 0 && <span style={{ color: STATUS_COLORS.error }}>{s.failed} failed</span>}
                  <span>{s.avgLatencyMs}ms avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
            <h2 className="text-[14px] font-semibold text-fg">Tool Execution Logs</h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="w-48 pl-9 pr-3 py-1.5 rounded-lg border border-edge bg-surface text-fg text-[12px] placeholder:text-fg-muted/50 focus:outline-none focus:border-accent/60"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as typeof logFilter)}
                className="px-3 py-1.5 rounded-lg border border-edge bg-surface text-fg text-[12px] focus:outline-none focus:border-accent/60"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="timeout">Timeout</option>
                <option value="blocked">Blocked</option>
              </select>
              
              <span className="text-[12px] text-fg-muted">
                {filteredLogs.length} of {logs.length}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-edge text-fg-muted bg-surface/30">
                  <th className="px-5 py-3 text-left font-medium">Tool</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Latency</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-fg-muted">
                      No logs found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 text-fg font-medium font-mono">{log.tool_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium" style={{ 
                          background: STATUS_COLORS[log.status] + '15', 
                          color: STATUS_COLORS[log.status] 
                        }}>
                          {log.status === 'success' && <CheckCircle size={12} />}
                          {log.status === 'error' && <XCircle size={12} />}
                          {log.status === 'timeout' && <Clock size={12} />}
                          {log.status === 'blocked' && <AlertCircle size={12} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-fg-secondary font-mono">
                        {log.latency_ms != null ? `${log.latency_ms}ms` : '—'}
                      </td>
                      <td className="px-4 py-3 text-fg-muted">
                        {new Date(log.created_at).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-4 py-3 text-fg-muted truncate max-w-[250px]">
                        {log.error_message || Object.keys(log.input_params || {}).map(k => `${k}: ${JSON.stringify((log.input_params as any)[k])}`).join(', ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl border border-edge bg-[#0d1117] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
              <h2 className="text-[16px] font-bold text-fg">{modal.editing ? 'Edit Integration' : 'Add Integration'}</h2>
              <button onClick={closeModal} className="text-fg-muted hover:text-fg text-[20px] leading-none">×</button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Integration Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My Shopify Store"
                  className="w-full px-3 py-2 rounded-lg border border-edge bg-surface text-fg text-[13px] outline-none focus:border-accent/60"
                />
              </div>

              {/* Type — only on create */}
              {!modal.editing && (
                <div>
                  <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Integration Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['shopify', 'woocommerce', 'custom'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`py-2.5 rounded-lg border text-[12px] font-medium transition-colors ${form.type === t ? 'border-accent bg-accent/10 text-accent' : 'border-edge text-fg-secondary hover:border-fg/30 hover:text-fg'}`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Base URL */}
              <div>
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
                  {form.type === 'shopify' ? 'Store URL (e.g. https://yourstore.myshopify.com)' : form.type === 'woocommerce' ? 'Site URL (e.g. https://yourstore.com)' : 'Base API URL'}
                </label>
                <input
                  value={form.baseUrl}
                  onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  placeholder={form.type === 'shopify' ? 'https://yourstore.myshopify.com' : form.type === 'woocommerce' ? 'https://yourstore.com' : 'https://api.yourstore.com'}
                  className="w-full px-3 py-2 rounded-lg border border-edge bg-surface text-fg text-[13px] outline-none focus:border-accent/60"
                />
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">
                  Credentials {modal.editing && <span className="text-fg-muted">(leave blank to keep existing)</span>}
                </label>
                <div className="space-y-2">
                  {(CREDENTIAL_FIELDS[form.type] || []).map(field => (
                    <div key={field.key}>
                      <label className="block text-[11px] text-fg-muted mb-1">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={form.credentials[field.key] || ''}
                        onChange={e => handleCredentialChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 rounded-lg border border-edge bg-surface text-fg text-[13px] outline-none focus:border-accent/60 font-mono"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-fg-muted mt-1.5">Credentials are encrypted with AES-256-GCM and never exposed to the frontend.</p>
              </div>

              {/* Allowed Endpoints */}
              <div>
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Allowed Endpoints (whitelist)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={form.endpointInput}
                    onChange={e => setForm(f => ({ ...f, endpointInput: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addEndpoint()}
                    placeholder="/orders/"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-edge bg-surface text-fg text-[12px] outline-none focus:border-accent/60 font-mono"
                  />
                  <button onClick={addEndpoint} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/30 text-[12px] font-medium hover:bg-accent/20">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.allowedEndpoints.map(ep => (
                    <span key={ep} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-mono border border-accent/20">
                      {ep}
                      <button onClick={() => removeEndpoint(ep)} className="text-accent/60 hover:text-accent ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-fg-muted mt-1.5">The AI can only call endpoints whose path starts with one of these prefixes.</p>
              </div>

              {formError && (
                <div className="px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-[12px] text-red-400">
                  {formError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-edge">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-edge text-[13px] text-fg-secondary hover:text-fg hover:border-fg/30 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : modal.editing ? 'Save Changes' : 'Create Integration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
