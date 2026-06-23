'use client';

import { useState } from 'react';
import { Send, Loader2, Activity } from 'lucide-react';

interface IntegrationOption {
  id: string;
  name: string;
  type: string;
}

interface TestResult {
  query: string;
  timestamp: string;
  intent: 'rag' | 'tool' | 'both';
  toolUsed?: string;
  latencyMs: number;
  confidence: number;
  response: string;
  sanitizedData?: Record<string, unknown>;
  error?: string;
  routingDetails: {
    intentClassificationMs: number;
    ragRetrievalMs: number;
    toolExecutionMs: number;
    llmGenerationMs: number;
  };
}

const EXAMPLE_QUERIES = [
  'Where is my order 1234?',
  'Track shipment ABX22',
  'Is this product available?',
  'When will order 998 arrive?',
  'Do you have this in stock?',
  "What's the status of order #5421?",
];

interface LiveTestConsoleProps {
  integrations?: IntegrationOption[];
}

export default function LiveTestConsole({ integrations = [] }: LiveTestConsoleProps) {
  const [query, setQuery] = useState('');
  const [integrationId, setIntegrationId] = useState(integrations[0]?.id ?? '');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!query.trim() || testing) return;

    setTesting(true);
    setError(null);

    try {
      const res = await fetch('/api/integrations/query-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          ...(integrationId ? { integrationId } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Test failed');
        return;
      }

      const result: TestResult = {
        query: data.query,
        timestamp: data.timestamp,
        intent: data.intent,
        toolUsed: data.toolUsed,
        latencyMs: data.latencyMs,
        confidence: data.confidence ?? 0,
        response: data.response,
        sanitizedData: data.sanitizedData,
        error: data.error,
        routingDetails: data.routingDetails,
      };

      setResults((prev) => [result, ...prev]);
      setSelectedResult(result);
    } catch (err) {
      console.error('Test failed:', err);
      setError('Network error — please try again.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-edge bg-[#1a1f35]/30">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#4f6df5]" />
          <h2 className="text-[14px] font-semibold text-fg">Live Test Console</h2>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-md bg-[#4f6df5]/10 text-[#4f6df5] font-medium">
          Live routing
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-edge">
        <div className="p-5 space-y-4">
          {integrations.length > 1 && (
            <div>
              <label className="block text-[12px] font-medium text-fg mb-2">Integration</label>
              <select
                value={integrationId}
                onChange={(e) => setIntegrationId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-edge bg-surface text-fg text-[13px] focus:outline-none focus:border-accent/60"
              >
                {integrations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-fg mb-2">Test Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTest();
                }
              }}
              placeholder="Enter a customer question to test..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-edge bg-surface text-fg text-[13px] placeholder:text-fg-muted/50 focus:outline-none focus:border-accent/60 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-fg-muted mb-2 uppercase tracking-wide">
              Examples
            </label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuery(ex)}
                  className="text-[11px] px-2.5 py-1.5 rounded-md bg-[#2a3155] text-[#8892b0] hover:text-[#edf0f7] hover:bg-[#2a3155]/80 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-400">{error}</p>
          )}

          <button
            onClick={handleTest}
            disabled={!query.trim() || testing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#4f6df5] text-white hover:bg-[#4f6df5]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            {testing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send size={18} />
                Run Test
              </>
            )}
          </button>

          <div className="pt-4 border-t border-edge">
            <label className="block text-[11px] font-medium text-fg-muted mb-2 uppercase tracking-wide">
              Recent Tests ({results.length})
            </label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedResult(result)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedResult === result
                      ? 'border-[#4f6df5] bg-[#4f6df5]/10'
                      : 'border-edge hover:border-[#4f6df5]/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[12px] text-fg font-medium truncate flex-1">
                      {result.query}
                    </span>
                    <span className="text-[10px] text-fg-muted shrink-0">
                      {result.latencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-edge/60 text-fg-muted capitalize">
                      {result.intent}
                    </span>
                    {result.toolUsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] font-mono">
                        {result.toolUsed}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          {!selectedResult ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-[48px] mb-3">🧪</div>
              <p className="text-[14px] font-medium text-fg mb-1">No test selected</p>
              <p className="text-[12px] text-fg-secondary">
                Run a test query to see intent routing and API results
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-1">Intent</div>
                  <div className="text-[13px] font-semibold text-fg capitalize">{selectedResult.intent}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-1">Total Latency</div>
                  <div className="text-[13px] font-semibold text-fg">{selectedResult.latencyMs}ms</div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-1">Tool Used</div>
                  <div className="text-[13px] font-semibold text-fg font-mono">{selectedResult.toolUsed || 'None'}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-1">Confidence</div>
                  <div className="text-[13px] font-semibold text-fg">{(selectedResult.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                <div className="text-[11px] text-fg-muted mb-3 font-medium uppercase tracking-wide">
                  Latency Breakdown
                </div>
                <div className="space-y-2">
                  {Object.entries(selectedResult.routingDetails).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[12px] text-fg-secondary">
                        {key.replace(/Ms$/, '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-[12px] text-fg font-mono">{value}ms</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedResult.sanitizedData && (
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-2 font-medium uppercase tracking-wide">
                    Sanitized Response
                  </div>
                  <pre className="text-[11px] text-fg font-mono overflow-x-auto">
                    {JSON.stringify(selectedResult.sanitizedData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                <div className="text-[11px] text-fg-muted mb-2 font-medium uppercase tracking-wide">
                  {selectedResult.error ? 'Error' : 'AI Response'}
                </div>
                <p className={`text-[12px] leading-relaxed ${selectedResult.error ? 'text-red-400' : 'text-fg'}`}>
                  {selectedResult.error || selectedResult.response}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
