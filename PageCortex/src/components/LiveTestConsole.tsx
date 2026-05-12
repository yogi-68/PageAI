'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

interface TestResult {
  query: string;
  timestamp: string;
  intent: 'rag' | 'tool' | 'both';
  toolUsed?: string;
  apiEndpoint?: string;
  latencyMs: number;
  confidence: number;
  response: string;
  sanitizedData?: any;
  routingDetails: {
    intentClassificationMs: number;
    ragRetrievalMs: number;
    toolExecutionMs: number;
    llmGenerationMs: number;
  };
}

const EXAMPLE_QUERIES = [
  "Where is my order 1234?",
  "Track shipment ABX22",
  "Is this product available?",
  "When will order 998 arrive?",
  "Do you have this in stock?",
  "What's the status of order #5421?",
];

export default function LiveTestConsole() {
  const [query, setQuery] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    if (!query.trim() || testing) return;

    setTesting(true);
    const startTime = Date.now();

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(r => setTimeout(r, 2000));
      
      const result: TestResult = {
        query,
        timestamp: new Date().toISOString(),
        intent: 'tool',
        toolUsed: 'getOrderStatus',
        apiEndpoint: '/orders/1234',
        latencyMs: Date.now() - startTime,
        confidence: 0.95,
        response: "Your order #1234 is currently in transit and is expected to arrive by May 15th. You can track your package using the tracking number: TRK123456789.",
        sanitizedData: {
          orderId: "1234",
          status: "shipped",
          estimatedDelivery: "2026-05-15",
          trackingNumber: "TRK123456789"
        },
        routingDetails: {
          intentClassificationMs: 145,
          ragRetrievalMs: 0,
          toolExecutionMs: 842,
          llmGenerationMs: 1013,
        },
      };

      setResults(prev => [result, ...prev]);
      setSelectedResult(result);
    } catch (error) {
      console.error('Test failed:', error);
    }

    setTesting(false);
  };

  return (
    <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-edge bg-[#1a1f35]/30">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#4f6df5]" />
          <h2 className="text-[14px] font-semibold text-fg">Live Test Console</h2>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-md bg-[#4f6df5]/10 text-[#4f6df5] font-medium">
          Beta
        </span>
      </div>

      <div className="grid grid-cols-2 gap-0 divide-x divide-edge">
        {/* Left: Query Input */}
        <div className="p-5 space-y-4">
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

          {/* Example queries */}
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

          {/* Run button */}
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

          {/* Recent tests */}
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
                    {result.toolUsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] font-mono">
                        {result.toolUsed}
                      </span>
                    )}
                    <span className="text-[10px] text-fg-muted">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="p-5">
          {!selectedResult ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-[48px] mb-3">🧪</div>
              <p className="text-[14px] font-medium text-fg mb-1">No test selected</p>
              <p className="text-[12px] text-fg-secondary">
                Run a test query to see results
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metrics */}
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

              {/* API Endpoint */}
              {selectedResult.apiEndpoint && (
                <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                  <div className="text-[11px] text-fg-muted mb-1.5">API Endpoint</div>
                  <div className="text-[12px] font-mono text-[#4f6df5]">{selectedResult.apiEndpoint}</div>
                </div>
              )}

              {/* Latency Breakdown */}
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

              {/* Sanitized Data */}
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

              {/* Final Response */}
              <div className="p-3 rounded-lg bg-[#1a1f35] border border-edge">
                <div className="text-[11px] text-fg-muted mb-2 font-medium uppercase tracking-wide">
                  AI Response
                </div>
                <p className="text-[12px] text-fg leading-relaxed">
                  {selectedResult.response}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
