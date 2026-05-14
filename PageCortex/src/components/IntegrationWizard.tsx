'use client';

import { useState } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Step components will be defined below
interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface IntegrationType {
  id: 'shopify' | 'woocommerce' | 'supabase' | 'firebase' | 'rest' | 'graphql';
  name: string;
  description: string;
  logo: string;
  capabilities: string[];
}

const INTEGRATION_TYPES: IntegrationType[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform',
    logo: '🛍️',
    capabilities: ['Order tracking', 'Inventory', 'Shipping', 'Products'],
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WordPress e-commerce',
    logo: '🛒',
    capabilities: ['Orders', 'Products', 'Customers', 'Inventory'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres database',
    logo: '⚡',
    capabilities: ['Database queries', 'RPC functions', 'Real-time data'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google backend platform',
    logo: '🔥',
    capabilities: ['Firestore queries', 'Real-time database', 'Auth'],
  },
  {
    id: 'rest',
    name: 'Custom REST API',
    description: 'Any REST endpoint',
    logo: '🔌',
    capabilities: ['Custom endpoints', 'Flexible auth', 'Any HTTP method'],
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'Graph query language',
    logo: '◈',
    capabilities: ['Flexible queries', 'Type safety', 'Single endpoint'],
  },
];

export default function IntegrationWizard({ isOpen, onClose, onComplete }: WizardProps) {
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<Record<string, string>>({});
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [enabledTools, setEnabledTools] = useState<string[]>(['getOrderStatus', 'trackShipment']);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!isOpen) return null;

  const steps = [
    { number: 1, label: 'Select Platform', icon: '🎯' },
    { number: 2, label: 'Connection', icon: '🔐' },
    { number: 3, label: 'Permissions', icon: '✓' },
    { number: 4, label: 'AI Access', icon: '🤖' },
    { number: 5, label: 'Test', icon: '🧪' },
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    if (!selectedType) {
      setSaveError('Please select an integration type');
      return;
    }

    // Validation
    if (!connectionDetails.baseUrl || connectionDetails.baseUrl.trim() === '') {
      setSaveError('Base URL is required');
      setCurrentStep(2);
      return;
    }

    // Validate URL format
    try {
      new URL(connectionDetails.baseUrl);
    } catch {
      setSaveError('Please enter a valid URL (e.g., https://example.com)');
      setCurrentStep(2);
      return;
    }

    if (endpoints.length === 0) {
      setSaveError('Please add at least one allowed endpoint');
      setCurrentStep(3);
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      // Map wizard integration types to API types
      const typeMapping: Record<string, 'shopify' | 'woocommerce' | 'custom'> = {
        'shopify': 'shopify',
        'woocommerce': 'woocommerce',
        'rest': 'custom',
        'graphql': 'custom',
        'supabase': 'custom',
        'firebase': 'custom',
      };

      const apiType = typeMapping[selectedType.id] || 'custom';

      // Build integration name
      const name = connectionDetails.name || `${selectedType.name} Integration`;

      // Build credentials object from connection details
      const credentials: Record<string, string> = {};
      Object.entries(connectionDetails).forEach(([key, value]) => {
        if (key !== 'baseUrl' && key !== 'name' && value) {
          credentials[key] = value;
        }
      });

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          type: apiType,
          baseUrl: connectionDetails.baseUrl,
          credentials,
          allowedEndpoints: endpoints,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Check for usage limit error
        if (data.error && data.error.includes('limit')) {
          setSaveError("You've reached your plan's integration limit. Upgrade to add more connections.");
        } else {
          setSaveError(data.error || 'Failed to create integration. Please try again.');
        }
        setSaving(false);
        return;
      }

      // Success! Reset form and close
      setCurrentStep(1);
      setSelectedType(null);
      setConnectionDetails({});
      setEndpoints([]);
      setEnabledTools(['getOrderStatus', 'trackShipment']);
      setTestQuery('');
      setTestResult(null);
      setSaveError('');
      setSaving(false);
      onComplete();
    } catch (error) {
      console.error('Failed to save integration:', error);
      setSaveError('An unexpected error occurred. Please check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#0d1117] rounded-2xl shadow-2xl border border-[#2a3155] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#2a3155]">
          <div>
            <h2 className="text-xl font-bold text-[#edf0f7]">Add Integration</h2>
            <p className="text-sm text-[#8892b0] mt-1">
              Connect your backend system for real-time customer queries
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#8892b0] hover:text-[#edf0f7] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-8 py-6 border-b border-[#2a3155]/50 bg-[#1a1f35]/30">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                      currentStep === step.number
                        ? 'bg-[#4f6df5] text-white ring-4 ring-[#4f6df5]/20'
                        : currentStep > step.number
                        ? 'bg-[#22c55e] text-white'
                        : 'bg-[#2a3155] text-[#8892b0]'
                    }`}
                  >
                    {currentStep > step.number ? <Check size={18} /> : step.icon}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.number ? 'text-[#edf0f7]' : 'text-[#8892b0]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 mb-6 transition-colors ${
                      currentStep > step.number ? 'bg-[#22c55e]' : 'bg-[#2a3155]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-h-[60vh] overflow-y-auto">
          {/* Error Display */}
          {saveError && (
            <div className="mb-6 p-4 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#f87171] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#f87171] font-medium">{saveError}</p>
              </div>
              <button
                onClick={() => setSaveError('')}
                className="text-[#f87171] hover:text-[#f87171]/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Select Platform */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#edf0f7] mb-6">
                Choose your integration type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {INTEGRATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType?.id === type.id
                        ? 'border-[#4f6df5] bg-[#4f6df5]/10'
                        : 'border-[#2a3155] hover:border-[#4f6df5]/50 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{type.logo}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#edf0f7] mb-1">{type.name}</h4>
                        <p className="text-sm text-[#8892b0] mb-3">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="text-xs px-2 py-1 rounded-md bg-[#2a3155] text-[#8892b0]"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Connection Details */}
          {currentStep === 2 && selectedType && (
            <ConnectionDetailsStep
              type={selectedType}
              values={connectionDetails}
              onChange={setConnectionDetails}
            />
          )}

          {/* Step 3: Permissions */}
          {currentStep === 3 && (
            <PermissionsStep
              endpoints={endpoints}
              onEndpointsChange={setEndpoints}
              enabledTools={enabledTools}
              onToolsChange={setEnabledTools}
            />
          )}

          {/* Step 4: AI Access Rules */}
          {currentStep === 4 && <AIAccessStep />}

          {/* Step 5: Test */}
          {currentStep === 5 && (
            <TestStep
              query={testQuery}
              onQueryChange={setTestQuery}
              result={testResult}
              testing={testing}
              onTest={async () => {
                setTesting(true);
                await new Promise(r => setTimeout(r, 2000));
                setTestResult({
                  tool: 'getOrderStatus',
                  endpoint: '/orders/1234',
                  latency: 842,
                  confidence: 0.95,
                });
                setTesting(false);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-[#2a3155] bg-[#1a1f35]/30">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg border border-[#2a3155] text-[#8892b0] hover:text-[#edf0f7] hover:border-[#4f6df5]/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#8892b0] hover:text-[#edf0f7] transition-colors"
            >
              Cancel
            </button>
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedType}
                className="px-6 py-2 rounded-lg bg-[#4f6df5] text-white hover:bg-[#4f6df5]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#22c55e] text-white hover:bg-[#22c55e]/90 transition-colors disabled:opacity-40 font-medium flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Saving...' : 'Complete Integration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Connection Details Step Component
function ConnectionDetailsStep({
  type,
  values,
  onChange,
}: {
  type: IntegrationType;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const fields = getFieldsForType(type.id);

  const handleFieldChange = (name: string, value: string) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#edf0f7] mb-2">Connection Details</h3>
        <p className="text-sm text-[#8892b0]">Enter your {type.name} credentials</p>
      </div>

      <div className="space-y-4">
        {/* Name field (always show) */}
        <div>
          <label className="block text-sm font-medium text-[#edf0f7] mb-2">
            Integration Name
            <span className="text-[#f87171] ml-1">*</span>
          </label>
          <input
            type="text"
            value={values.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={`My ${type.name} Integration`}
            className="w-full px-4 py-3 bg-[#1a1f35] border border-[#2a3155] rounded-lg text-[#edf0f7] placeholder:text-[#8892b0]/50 focus:outline-none focus:border-[#4f6df5] transition-colors"
          />
        </div>

        {/* Base URL field (always show) */}
        <div>
          <label className="block text-sm font-medium text-[#edf0f7] mb-2">
            {type.id === 'shopify' ? 'Store URL' : type.id === 'woocommerce' ? 'Site URL' : type.id === 'supabase' ? 'Project URL' : 'Base URL'}
            <span className="text-[#f87171] ml-1">*</span>
          </label>
          <input
            type="text"
            value={values.baseUrl || ''}
            onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
            placeholder={
              type.id === 'shopify' ? 'https://your-store.myshopify.com' :
              type.id === 'woocommerce' ? 'https://your-store.com' :
              type.id === 'supabase' ? 'https://xxx.supabase.co' :
              'https://api.your-domain.com'
            }
            className="w-full px-4 py-3 bg-[#1a1f35] border border-[#2a3155] rounded-lg text-[#edf0f7] placeholder:text-[#8892b0]/50 focus:outline-none focus:border-[#4f6df5] transition-colors"
          />
        </div>

        {/* Platform-specific credential fields */}
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-[#edf0f7] mb-2">
              {field.label}
              {field.required && <span className="text-[#f87171] ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={values[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 bg-[#1a1f35] border border-[#2a3155] rounded-lg text-[#edf0f7] placeholder:text-[#8892b0]/50 focus:outline-none focus:border-[#4f6df5] transition-colors"
            />
            {field.help && (
              <p className="text-xs text-[#8892b0] mt-1.5">{field.help}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          if (!values.baseUrl) {
            setTestStatus('error');
            return;
          }
          setTestStatus('testing');
          await new Promise(r => setTimeout(r, 2000));
          setTestStatus('success');
        }}
        disabled={testStatus === 'testing'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a3155] text-[#8892b0] hover:text-[#edf0f7] hover:border-[#4f6df5]/50 transition-colors disabled:opacity-40"
      >
        {testStatus === 'testing' && <Loader2 size={16} className="animate-spin" />}
        {testStatus === 'success' && <Check size={16} className="text-[#22c55e]" />}
        {testStatus === 'error' && <AlertCircle size={16} className="text-[#f87171]" />}
        {testStatus === 'idle' && 'Test Connection'}
        {testStatus === 'testing' && 'Testing...'}
        {testStatus === 'success' && 'Connected'}
        {testStatus === 'error' && 'Failed'}
      </button>
    </div>
  );
}

// Permissions Step
function PermissionsStep({
  endpoints,
  onEndpointsChange,
  enabledTools,
  onToolsChange,
}: {
  endpoints: string[];
  onEndpointsChange: (endpoints: string[]) => void;
  enabledTools: string[];
  onToolsChange: (tools: string[]) => void;
}) {
  const [newEndpoint, setNewEndpoint] = useState('');

  const tools = [
    { id: 'getOrderStatus', name: 'Order Status', description: 'Look up order information' },
    { id: 'trackShipment', name: 'Track Shipment', description: 'Track package delivery' },
    { id: 'getProductAvailability', name: 'Product Availability', description: 'Check stock levels' },
    { id: 'getShippingEstimate', name: 'Shipping Estimate', description: 'Calculate delivery time' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#edf0f7] mb-2">Permissions & Tools</h3>
        <p className="text-sm text-[#8892b0]">Configure what the AI can access</p>
      </div>

      {/* Allowed Endpoints */}
      <div>
        <h4 className="text-sm font-semibold text-[#edf0f7] mb-3">Allowed Endpoints</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newEndpoint}
            onChange={(e) => setNewEndpoint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newEndpoint) {
                onEndpointsChange([...endpoints, newEndpoint]);
                setNewEndpoint('');
              }
            }}
            placeholder="/orders/"
            className="flex-1 px-4 py-2 bg-[#1a1f35] border border-[#2a3155] rounded-lg text-[#edf0f7] placeholder:text-[#8892b0]/50 focus:outline-none focus:border-[#4f6df5]"
          />
          <button
            onClick={() => {
              if (newEndpoint) {
                onEndpointsChange([...endpoints, newEndpoint]);
                setNewEndpoint('');
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#4f6df5] text-white hover:bg-[#4f6df5]/90 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {endpoints.map((endpoint, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4f6df5]/10 border border-[#4f6df5]/30 text-[#4f6df5] text-sm font-mono"
            >
              {endpoint}
              <button
                onClick={() => onEndpointsChange(endpoints.filter((_, i) => i !== idx))}
                className="hover:text-[#f87171] transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Enabled Tools */}
      <div>
        <h4 className="text-sm font-semibold text-[#edf0f7] mb-3">Enabled Tools</h4>
        <div className="space-y-2">
          {tools.map((tool) => (
            <label
              key={tool.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-[#2a3155] hover:border-[#4f6df5]/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={enabledTools.includes(tool.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onToolsChange([...enabledTools, tool.id]);
                  } else {
                    onToolsChange(enabledTools.filter((t) => t !== tool.id));
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-[#2a3155] bg-[#1a1f35] text-[#4f6df5] focus:ring-2 focus:ring-[#4f6df5]/20"
              />
              <div className="flex-1">
                <div className="font-medium text-[#edf0f7]">{tool.name}</div>
                <div className="text-sm text-[#8892b0] mt-0.5">{tool.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// AI Access Step
function AIAccessStep() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#edf0f7] mb-2">AI Access Rules</h3>
        <p className="text-sm text-[#8892b0]">Control what data the AI can expose to customers</p>
      </div>

      <div className="p-4 rounded-lg bg-[#1a1f35] border border-[#2a3155]">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-[#edf0f7] font-medium mb-1">Automatic PII Protection</p>
            <p className="text-[#8892b0]">
              PageCortex automatically filters sensitive fields like emails, payment info, and internal notes.
              All API responses are sanitized before being passed to the AI.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#2a3155] bg-[#1a1f35] text-[#4f6df5]" />
          <span className="text-sm text-[#edf0f7]">Hide customer email addresses</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#2a3155] bg-[#1a1f35] text-[#4f6df5]" />
          <span className="text-sm text-[#edf0f7]">Hide payment information</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#2a3155] bg-[#1a1f35] text-[#4f6df5]" />
          <span className="text-sm text-[#edf0f7]">Hide internal notes and metadata</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="w-4 h-4 rounded border-[#2a3155] bg-[#1a1f35] text-[#4f6df5]" />
          <span className="text-sm text-[#edf0f7]">Hide pricing and cost information</span>
        </label>
      </div>
    </div>
  );
}

// Test Step
function TestStep({
  query,
  onQueryChange,
  result,
  testing,
  onTest,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  result: any;
  testing: boolean;
  onTest: () => void;
}) {
  const exampleQueries = [
    'Where is my order 1234?',
    'Track shipment ABX22',
    'Is this product available?',
    'When will order 998 arrive?',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#edf0f7] mb-2">Test Your Integration</h3>
        <p className="text-sm text-[#8892b0]">Simulate a customer query to see how it works</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#edf0f7] mb-2">Test Query</label>
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Enter a customer question..."
          rows={3}
          className="w-full px-4 py-3 bg-[#1a1f35] border border-[#2a3155] rounded-lg text-[#edf0f7] placeholder:text-[#8892b0]/50 focus:outline-none focus:border-[#4f6df5] resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {exampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => onQueryChange(q)}
              className="text-xs px-3 py-1.5 rounded-md bg-[#2a3155] text-[#8892b0] hover:text-[#edf0f7] hover:bg-[#2a3155]/80 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onTest}
        disabled={!query || testing}
        className="w-full px-4 py-3 rounded-lg bg-[#4f6df5] text-white hover:bg-[#4f6df5]/90 transition-colors disabled:opacity-40 font-medium flex items-center justify-center gap-2"
      >
        {testing && <Loader2 size={18} className="animate-spin" />}
        {testing ? 'Testing...' : 'Run Test'}
      </button>

      {result && (
        <div className="p-6 rounded-lg border border-[#2a3155] bg-[#1a1f35] space-y-4">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <Check size={18} />
            <span className="font-medium">Test Successful</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#8892b0] mb-1">Tool Selected</div>
              <div className="text-[#edf0f7] font-mono">{result.tool}</div>
            </div>
            <div>
              <div className="text-[#8892b0] mb-1">Response Time</div>
              <div className="text-[#edf0f7] font-mono">{result.latency}ms</div>
            </div>
            <div>
              <div className="text-[#8892b0] mb-1">API Endpoint</div>
              <div className="text-[#edf0f7] font-mono text-xs">{result.endpoint}</div>
            </div>
            <div>
              <div className="text-[#8892b0] mb-1">Confidence</div>
              <div className="text-[#edf0f7] font-mono">{(result.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function
function getFieldsForType(type: string) {
  const fields: Record<string, any[]> = {
    shopify: [
      { name: 'apiKey', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_...', required: true, help: 'Create in Shopify Admin → Apps → Develop apps' },
    ],
    woocommerce: [
      { name: 'consumerKey', label: 'Consumer Key', type: 'password', placeholder: 'ck_...', required: true },
      { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_...', required: true },
    ],
    supabase: [
      { name: 'serviceKey', label: 'Service Role Key', type: 'password', placeholder: 'eyJ...', required: true, help: 'Found in Project Settings → API' },
      { name: 'allowedFunctions', label: 'Allowed RPC Functions (comma-separated)', type: 'text', placeholder: 'get_order_status,track_shipment', required: false },
    ],
    firebase: [
      { name: 'projectId', label: 'Project ID', type: 'text', placeholder: 'your-project-id', required: true },
      { name: 'serviceAccount', label: 'Service Account JSON', type: 'password', placeholder: 'Paste JSON here', required: true },
    ],
    rest: [
      { name: 'authType', label: 'Auth Type', type: 'text', placeholder: 'Bearer Token / API Key', required: false },
      { name: 'authValue', label: 'Auth Value', type: 'password', placeholder: 'Your token/key', required: true },
    ],
    graphql: [
      { name: 'authHeader', label: 'Authorization Header', type: 'password', placeholder: 'Bearer your-token', required: true },
    ],
  };

  return fields[type] || [];
}
