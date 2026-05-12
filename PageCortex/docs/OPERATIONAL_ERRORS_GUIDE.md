# Operational Error System — Quick Reference

## Usage

### In API Routes

```typescript
import { formatOperationalError } from '@/lib/operational-errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... process
  } catch (error) {
    const formatted = formatOperationalError(error, 'validation');
    return NextResponse.json({ 
      error: formatted.message,
      suggestion: formatted.suggestion 
    }, { status: 400 });
  }
}
```

### In Customer-Facing Code

```typescript
import { formatCustomerError } from '@/lib/operational-errors';

// Tool execution
const result = await executeToolCall('getOrderStatus', args, integrations, botId, userId);

if (!result.success) {
  const customerMessage = formatCustomerError(result.error, 'getOrderStatus');
  // Display: "I'm having trouble reaching the order system right now."
}
```

### Usage Limit Checking

```typescript
import { checkIntegrationLimit, createUsageLimitError } from '@/lib/operational-errors';

const limitCheck = await checkIntegrationLimit(userId, currentCount);

if (!limitCheck.allowed) {
  const error = createUsageLimitError(limitCheck.plan, limitCheck.limit);
  throw error;
}
```

---

## Error Contexts

| Context | When to Use |
|---------|-------------|
| `integration_connection` | Testing API connections, SSL failures, timeouts |
| `tool_execution` | Tool calls, blocked endpoints, API errors |
| `api_call` | General API failures, 4xx/5xx errors |
| `database` | Supabase queries, DB connection issues |
| `authentication` | Login, session, unauthorized |
| `rate_limit` | 429 errors, throttling |
| `usage_limit` | Plan quotas exceeded |
| `validation` | Input validation, missing fields |
| `network` | Connectivity, offline |
| `unknown` | Catch-all |

---

## Example Transformations

### Connection Errors

```typescript
// Input: ETIMEDOUT
formatOperationalError(error, 'integration_connection')
// Output: "The connection timed out while contacting the provider."

// Input: 401 Unauthorized
// Output: "The authentication credentials are invalid or expired."

// Input: ENOTFOUND
// Output: "We couldn't reach the integration endpoint."
```

### Tool Errors (Customer-Facing)

```typescript
// Order lookup failure
formatCustomerError(error, 'getOrderStatus')
// Output: "I'm having trouble reaching the order system right now."

// Shipment tracking timeout
formatCustomerError(error, 'trackShipment')
// Output: "The shipping provider is responding slowly right now."

// Product availability check failed
formatCustomerError(error, 'getProductAvailability')
// Output: "I couldn't verify the current stock level."
```

### Database Errors

```typescript
// Input: "Postgres syntax error at line 42..."
formatOperationalError(error, 'database')
// Output: "We encountered a temporary data issue."
// Note: NEVER exposes SQL details, table names, or schema info
```

### Usage Limits

```typescript
// User hits integration limit
const error = createUsageLimitError('free', 1);
formatOperationalError(error, 'usage_limit')
// Output: "You've reached your plan's integration limit. Upgrade to add more connections."
// Suggestion: "Visit the billing page to explore higher-tier plans..."
```

---

## Best Practices

### DO ✅

1. **Use context-specific formatters**
   ```typescript
   formatOperationalError(error, 'integration_connection')  // Good
   ```

2. **Keep customer messages tool-specific**
   ```typescript
   formatCustomerError(error, 'getOrderStatus')  // Good - tool context
   ```

3. **Log original errors server-side**
   ```typescript
   console.error('Integration failed:', error);  // Keep for debugging
   const formatted = formatOperationalError(error, 'tool_execution');
   return formatted.message;  // Send to user
   ```

4. **Check for usage limits before expensive operations**
   ```typescript
   const limitCheck = await checkIntegrationLimit(userId, count);
   if (!limitCheck.allowed) throw createUsageLimitError(...);
   ```

### DON'T ❌

1. **Never expose raw errors to users**
   ```typescript
   return { error: error.message };  // BAD - might be technical
   ```

2. **Don't ignore error context**
   ```typescript
   formatOperationalError(error, 'unknown');  // BAD - loses context
   formatOperationalError(error, 'tool_execution');  // GOOD
   ```

3. **Don't make up data in error messages**
   ```typescript
   "Your order will arrive tomorrow"  // BAD - unverified
   "I couldn't verify the delivery date"  // GOOD - honest
   ```

4. **Don't use technical jargon**
   ```typescript
   "HTTP 500 Internal Server Error"  // BAD
   "The provider's system encountered an error"  // GOOD
   ```

---

## Error Response Structure

### API Routes

```typescript
// Success
{
  data: {...},
  message: "Integration created successfully"
}

// Error
{
  error: "You've reached your plan's integration limit.",
  suggestion: "Visit the billing page to upgrade.",
  code: "USAGE_LIMIT_EXCEEDED"  // Optional
}
```

### Tool Execution

```typescript
interface ToolCallResult {
  success: boolean;
  context: string;       // For LLM
  error?: string;        // Customer-friendly
  latencyMs: number;
  integrationId: string | null;
}
```

---

## Plan Limits (Current)

```typescript
const planLimits = {
  free: 1,        // 1 integration
  starter: 3,     // 3 integrations
  growth: 10,     // 10 integrations
  scale: 999,     // Unlimited
};
```

**TODO:** Replace with database lookup.

---

## Tone Guidelines

### Customer-Facing Errors

**Calm & Professional:**
- ✅ "I'm having trouble accessing..."
- ✅ "The system is responding slowly..."
- ✅ "I couldn't verify..."
- ❌ "ERROR: CRITICAL FAILURE"
- ❌ "System malfunction detected"

**Honest & Transparent:**
- ✅ "I don't have information about that"
- ✅ "The integration is temporarily unavailable"
- ❌ Making up order statuses
- ❌ Claiming capability you don't have

**Actionable When Possible:**
- ✅ "Try again in a moment"
- ✅ "Check the order number and retry"
- ✅ "Contact support if this continues"
- ❌ "Something went wrong" (no action)
- ❌ "Error occurred" (no guidance)

---

## Testing Error Messages

### Manual Testing

```typescript
// Test each error context
const contexts = [
  'integration_connection',
  'tool_execution',
  'api_call',
  'database',
  'authentication',
  'rate_limit',
  'usage_limit',
  'validation',
  'network',
];

contexts.forEach(context => {
  const error = new Error('Test error');
  const formatted = formatOperationalError(error, context);
  console.log(`${context}:`, formatted.message);
});

// Test tool-specific messages
const tools = ['getOrderStatus', 'trackShipment', 'getProductAvailability', 'getShippingEstimate'];

tools.forEach(tool => {
  const error = new Error('timeout');
  const message = formatCustomerError(error, tool);
  console.log(`${tool}:`, message);
});
```

---

## Monitoring

### Metrics to Track

1. **Error rates by context**
   - Which errors are most common?
   - Are usage limits being hit frequently?

2. **Customer-facing error rates**
   - How often do tool calls fail?
   - Which tools have highest failure rates?

3. **Error message clarity**
   - Do users contact support after seeing errors?
   - Can they self-resolve?

### Logging

```typescript
// Server-side (detailed)
console.error('[Integration Error]', {
  userId,
  integrationId,
  tool: toolName,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});

// Client-side (sanitized)
console.log('[User Error]', {
  message: formatted.message,
  actionable: formatted.actionable,
  timestamp: new Date().toISOString(),
});
```

---

## Future Enhancements

### Multilingual Support

```typescript
export function formatOperationalError(
  error: unknown,
  context: ErrorContext,
  locale: string = 'en'
): OperationalError {
  // ...
  const translations = {
    en: "The connection timed out...",
    es: "La conexión expiró...",
    fr: "La connexion a expiré...",
  };
  
  return translations[locale] || translations.en;
}
```

### Error Recovery Suggestions

```typescript
interface OperationalError {
  message: string;
  suggestion?: string;
  recoverySteps?: string[];  // NEW
  canRetry: boolean;          // NEW
  escalateToSupport: boolean; // NEW
}
```

### A/B Testing

Test different error tones:
- **Calm:** "I'm having trouble..."
- **Urgent:** "We couldn't reach..."
- **Technical:** "The API timed out..."

Track which leads to better resolution rates.

---

## Common Patterns

### API Route Error Handling

```typescript
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    const error = formatOperationalError(new Error('Unauthorized'), 'authentication');
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    const error = formatOperationalError(err, 'validation');
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    const result = await performOperation(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const error = formatOperationalError(err, 'database');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Tool Call Error Handling

```typescript
async function attemptToolCall(...) {
  const result = await proxyToolCall(integration, path, params);

  if (!result.success) {
    return {
      toolName,
      success: false,
      error: formatCustomerError(
        new Error(result.error || 'API call failed'),
        toolName
      ),
      latencyMs: result.latencyMs,
    };
  }

  return { success: true, context: buildContext(result.data) };
}
```

---

## Quick Checklist

Before deploying error-prone code:

- [ ] All errors use `formatOperationalError()` or `formatCustomerError()`
- [ ] No raw `error.message` exposed to users
- [ ] Appropriate context specified
- [ ] Database errors never expose SQL
- [ ] Stack traces logged server-side only
- [ ] Customer messages tested for tone
- [ ] Actionable suggestions provided when possible
- [ ] Usage limits checked before expensive operations

---

**Last Updated:** May 13, 2026  
**Maintainer:** PageCortex Team
