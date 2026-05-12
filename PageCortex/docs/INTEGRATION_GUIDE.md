# PageCortex Integration Management Guide

## Overview

This guide explains how to configure and manage live API/database integrations in PageCortex for AI-powered customer support.

---

## Integration Onboarding Flow

### Accessing the Dashboard

1. Navigate to **Dashboard → Integrations**
2. Click **"Add Integration"** to launch the setup wizard

---

## Supported Integration Types

### 1. Shopify

**Use case:** E-commerce order tracking, inventory, shipping

**Required credentials:**
- Store URL: `https://your-store.myshopify.com`
- Admin API Access Token: `shpat_...`

**Setup steps:**
1. In Shopify Admin, go to **Apps → Develop apps**
2. Create a new app with **read-only** permissions for:
   - Orders
   - Products
   - Inventory
   - Shipping
3. Copy the Admin API access token
4. Paste in PageCortex wizard

**Supported tools:**
- `getOrderStatus` — Look up order by ID
- `trackShipment` — Track delivery status
- `getProductAvailability` — Check inventory
- `getShippingEstimate` — Calculate delivery time

---

### 2. WooCommerce

**Use case:** WordPress-based e-commerce

**Required credentials:**
- Site URL: `https://your-store.com`
- Consumer Key: `ck_...`
- Consumer Secret: `cs_...`

**Setup steps:**
1. In WordPress Admin, go to **WooCommerce → Settings → Advanced → REST API**
2. Click **"Add key"**
3. Set permissions to **Read** only
4. Copy key/secret and paste in wizard

---

### 3. Supabase (Recommended)

**Use case:** Postgres database queries via RPC functions

**Required credentials:**
- Project URL: `https://xxx.supabase.co`
- Service Role Key: `eyJ...` (or anon key for RLS-protected functions)
- Allowed RPC Functions: comma-separated list

**Architecture:**
```
Customer Query
    ↓
PageCortex AI
    ↓
Supabase RPC Function (read-only)
    ↓
Postgres Database View
    ↓
Response (sanitized)
```

**Best practices:**
- Use **read-only database views** (never expose raw tables)
- Use **RPC functions** to encapsulate business logic
- Enable **RLS policies** for customer data isolation
- Whitelist specific RPC function names only

**Example RPC function:**
```sql
-- In Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.get_order_status(order_id text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'orderId', id,
    'status', status,
    'estimatedDelivery', estimated_delivery_date,
    'trackingNumber', tracking_number
  )
  FROM orders_view
  WHERE id = order_id
  LIMIT 1;
$$;
```

Then in PageCortex:
- Allowed RPC Functions: `get_order_status,track_shipment`

---

### 4. Firebase

**Use case:** Firestore queries, real-time database

**Required credentials:**
- Project ID: `your-project-id`
- Service Account JSON: Full JSON credential file

---

### 5. Custom REST API

**Use case:** Any HTTP API

**Required credentials:**
- Base URL: `https://api.your-domain.com`
- Auth Type: Bearer Token / API Key / Custom Header
- Auth Value: Your token/key

---

### 6. GraphQL API

**Use case:** Graph query language endpoints

**Required credentials:**
- GraphQL Endpoint: `https://api.your-domain.com/graphql`
- Authorization Header: `Bearer your-token`

---

## Permissions & Security

### Endpoint Whitelisting

**Critical:** Only allowed endpoints can be called by the AI.

**Format:**
- `/orders/` — Matches `/orders/1234`, `/orders/5678/tracking`
- `/products/` — Matches `/products/search`, `/products/abc123`

**Blocked by default:**
- `/admin`
- `/users`
- `/payments`
- Internal routes

**Example whitelist:**
```
✅ /orders/
✅ /products/
✅ /shipments/
✅ /shipping/estimate
❌ /admin/orders
❌ /payments/charge
❌ /users/delete
```

---

### AI Access Rules

**Automatic PII protection:**
- Customer emails → hidden
- Payment info → hidden
- Internal notes → hidden
- IP addresses → hidden
- Auth tokens → hidden

**Configurable rules:**
- Hide pricing/cost data
- Hide profit margins
- Hide supplier information
- Hide internal IDs

---

## Tool Configuration

### Available Tools

1. **getOrderStatus**
   - Input: `orderId`
   - Example query: "Where is my order 1234?"
   - API endpoint: `/orders/{orderId}`

2. **trackShipment**
   - Input: `orderId` or `trackingNumber`
   - Example query: "Track shipment ABX22"
   - API endpoint: `/shipments/{trackingNumber}`

3. **getProductAvailability**
   - Input: `productId` or `productName`
   - Example query: "Is this product in stock?"
   - API endpoint: `/products/{productId}/availability`

4. **getShippingEstimate**
   - Input: `zipCode`, `productId`
   - Example query: "How long for delivery to 10001?"
   - API endpoint: `/shipping/estimate`

### Enable/Disable Tools

In the wizard, select which tools are active for each integration.

**Recommendation:**
- Start with `getOrderStatus` only
- Add more tools after testing

---

## Testing Your Integration

### Live Test Console

Located in the dashboard, the test console allows you to:

1. **Simulate customer queries**
   - Enter natural language questions
   - See how the AI routes to tools

2. **Inspect routing details**
   - Intent classification time
   - Tool selection logic
   - API latency breakdown
   - Confidence score

3. **Review sanitized responses**
   - See exactly what data the AI receives
   - Verify PII filtering
   - Check response structure

**Example test flow:**
```
Query: "Where is my order 1234?"
    ↓
Intent: tool
Tool: getOrderStatus
API: /orders/1234
Latency: 842ms
Confidence: 95%
Response: "Your order is in transit..."
```

---

## Monitoring & Logs

### Tool Execution Logs

**What's logged:**
- Tool name
- Input parameters (sanitized)
- Status (success/error/timeout/blocked)
- Latency (ms)
- Error messages
- Timestamp

**Filtering:**
- Search by tool name or error
- Filter by status
- Sort by latency or time

**Use cases:**
- Debug failed API calls
- Identify slow endpoints
- Track tool usage patterns
- Find low-confidence queries

---

### Health Metrics

Each integration card shows:
- **Connection status:** Last test result
- **Success rate:** % of successful calls
- **Average latency:** Response time
- **Last call:** Timestamp
- **Active tools:** Enabled tool count

**Color coding:**
- 🟢 Green: Healthy (>95% success)
- 🟡 Yellow: Degraded (90-95%)
- 🔴 Red: Down (<90%)

---

## Integration Management

### Enable/Disable

Toggle integrations without deleting them:
- **Enabled:** AI can call this integration
- **Disabled:** Integration is ignored

**Use case:** Temporarily disable during maintenance

---

### Editing Integrations

Click **"Edit"** on any integration card to:
- Update base URL
- Rotate credentials (leave blank to keep existing)
- Modify allowed endpoints
- Enable/disable tools

**Note:** Credentials are encrypted and never shown after initial setup.

---

### Testing Connection

Click **"Test"** to verify:
- Credentials are valid
- Base URL is reachable
- Allowed endpoints are accessible

**Status indicators:**
- ✅ Connected
- ❌ Failed (shows error)
- ⏱️ Timeout

---

### Deleting Integrations

Click **"Delete"** → Confirm

**Warning:** This cannot be undone. All historical logs for this integration remain but future calls will fail.

---

## Security Best Practices

### 1. Read-Only Access Always

**Never** grant write permissions to integration credentials.

**Shopify example:**
```
✅ Admin API scopes: read_orders, read_products
❌ Admin API scopes: write_orders, write_products
```

---

### 2. Service Accounts (Recommended)

Create dedicated service accounts for PageCortex:
- Separate from human admin accounts
- Limited scopes
- Rotatable credentials
- Auditable in your system

---

### 3. Credential Rotation

Rotate API keys regularly:
1. Generate new key in your system
2. Edit integration in PageCortex
3. Paste new key
4. Test connection
5. Revoke old key

---

### 4. Endpoint Whitelisting

**Always** specify exact endpoint prefixes.

**Bad:**
```
/ (allows everything)
```

**Good:**
```
/api/v1/orders/
/api/v1/products/public/
```

---

### 5. Monitor Logs

Review execution logs weekly:
- Check for blocked endpoint attempts
- Identify suspicious query patterns
- Verify sanitization is working

---

## Troubleshooting

### Integration Test Fails

**Symptom:** Test button shows "Failed"

**Common causes:**
1. Invalid credentials
2. Base URL typo
3. Network/firewall blocking PageCortex IPs
4. SSL certificate issues

**Solution:**
- Verify credentials in source system
- Test URL in browser
- Check firewall rules
- Ensure HTTPS is used

---

### Tool Call Fails

**Symptom:** Log shows `status: error`

**Common causes:**
1. Endpoint not whitelisted
2. Order/product ID doesn't exist
3. API rate limit hit
4. Timeout (>5s)

**Solution:**
- Add endpoint to whitelist
- Test with known-good ID
- Check rate limits in source system
- Optimize API performance

---

### AI Doesn't Use Tool

**Symptom:** AI answers without calling tool

**Common causes:**
1. Tool is disabled
2. Query doesn't match intent patterns
3. Confidence too low
4. No integrations enabled

**Solution:**
- Enable tool in integration settings
- Use test console to inspect intent classification
- Try more explicit query ("order status for 1234")

---

### High Latency

**Symptom:** Calls take >2s

**Breakdown:**
```
Total latency = Intent (150ms) + Tool API (???ms) + LLM (1000ms)
```

**If Tool API is slow:**
- Add database indexes
- Use CDN/caching
- Optimize query complexity
- Consider upgrading API infrastructure

---

## Advanced: Supabase Integration Deep Dive

### Why Supabase?

**Advantages:**
- Direct Postgres access (no middleware)
- RPC functions for business logic
- RLS for customer data isolation
- Edge Functions for complex workflows
- Built-in real-time subscriptions

---

### Architecture

```
PageCortex AI
    ↓
Supabase RPC Call (https://xxx.supabase.co/rest/v1/rpc/get_order_status)
    ↓
Postgres Function (SECURITY DEFINER)
    ↓
Database View (orders_view)
    ↓
JSON Response
```

---

### Example: Order Status RPC

**1. Create Read-Only View**
```sql
CREATE OR REPLACE VIEW orders_view AS
SELECT
  id,
  order_number,
  status,
  created_at,
  estimated_delivery_date,
  tracking_number,
  tracking_url
FROM orders
-- Exclude sensitive fields:
-- payment_intent_id, customer_email, internal_notes
;
```

**2. Create RPC Function**
```sql
CREATE OR REPLACE FUNCTION get_order_status(p_order_id text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER -- Run with elevated permissions
SET search_path = public
AS $$
  SELECT json_build_object(
    'orderId', order_number,
    'status', status,
    'createdAt', created_at,
    'estimatedDelivery', estimated_delivery_date,
    'trackingNumber', tracking_number,
    'trackingUrl', tracking_url
  )
  FROM orders_view
  WHERE order_number = p_order_id
  LIMIT 1;
$$;
```

**3. Grant Permissions**
```sql
GRANT EXECUTE ON FUNCTION get_order_status TO anon, authenticated;
```

**4. Configure in PageCortex**
- Project URL: `https://xxx.supabase.co`
- Service Role Key: (from Supabase dashboard)
- Allowed Functions: `get_order_status`

---

### RLS for Multi-Tenant

If your system has multiple clients:

```sql
CREATE POLICY "Users can only see their own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id);
```

PageCortex calls will respect RLS when using `anon` key + JWT.

---

## API Response Structure

### Recommended JSON Format

```json
{
  "orderId": "1234",
  "status": "shipped",
  "estimatedDelivery": "2026-05-15",
  "trackingNumber": "TRK123456789",
  "trackingUrl": "https://tracking.example.com/TRK123456789",
  "items": [
    {
      "name": "Product A",
      "quantity": 2,
      "price": "$29.99"
    }
  ]
}
```

**Avoid:**
- Deeply nested objects (>3 levels)
- Large arrays (>100 items)
- Binary data
- HTML/XML (use plain text)

---

## FAQ

### Q: Can I connect multiple Shopify stores?

**A:** Yes! Create separate integrations for each store with unique credentials.

---

### Q: Is my data secure?

**A:** Yes:
- All credentials encrypted with AES-256-GCM
- Never exposed to frontend
- Read-only access enforced
- Endpoint whitelisting required
- Response sanitization automatic

---

### Q: What happens if my API is down?

**A:** 
- PageCortex retries with fallback integrations
- Circuit breaker stops calling after 5 failures
- AI falls back to RAG-only responses
- Logs show detailed error messages

---

### Q: Can I use webhooks instead of API calls?

**A:** Not yet. Real-time webhooks are on the roadmap.

---

### Q: How do I limit API usage?

**A:** 
- Disable tools you don't need
- Implement rate limiting in your API
- Monitor logs for suspicious activity
- Use Supabase RPC with cached views

---

### Q: Can the AI write data (create orders, update status)?

**A:** No. PageCortex is **read-only** by design. This is a critical security guarantee.

---

## Next Steps

1. ✅ Complete integration wizard for your first data source
2. ✅ Test with example queries in Live Test Console
3. ✅ Review sanitized responses
4. ✅ Enable integration and test with real customer queries
5. ✅ Monitor logs for errors
6. ✅ Iterate on allowed endpoints and tools

---

## Support

**Issues?**
- Check execution logs for error details
- Review this guide's troubleshooting section
- Contact support: yogeshwar0402@gmail.com

**Architecture questions?**
- See `docs/ARCHITECTURE_ANALYSIS.md` for deep technical analysis
- See `docs/ENHANCEMENTS.md` for implementation details
