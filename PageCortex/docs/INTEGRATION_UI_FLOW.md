# Integration Dashboard UI Flow — Quick Setup Guide

## Issue Fixed ✅

**Problem:** The Integrations page existed but there was **no navigation link** to access it!

**Solution:** Added "Integrations" to the dashboard sidebar navigation.

---

## How to Access the Integration Dashboard

### Step 1: Navigate to the Page

1. **Open your dashboard**: Go to `http://localhost:3000/dashboard` (or your deployed URL)
2. **Look at the left sidebar** under the "Settings" section
3. **Click on "Integrations" 🔌**

The navigation now shows:
```
Settings
  🔌 Integrations  ← NEW!
  ◆ Billing
  ⚙ Settings
```

---

## Step 2: Add Your First Integration

Once on the Integrations page, you'll see:

### Option A: Quick Add (Simple Modal)
- Click **"Quick Add"** button (gray, outline style)
- Fill in basic fields for Shopify/WooCommerce/Custom API
- Good for quick testing

### Option B: Integration Wizard (Recommended)
- Click **"+ Add Integration"** button (blue, primary action)
- Opens a full 5-step wizard:

#### **Step 1: Select Platform**
Choose from:
- 🛍️ **Shopify** — E-commerce platform
- 🛒 **WooCommerce** — WordPress e-commerce
- ⚡ **Supabase** — Postgres database (recommended!)
- 🔥 **Firebase** — Google backend platform
- 🔌 **Custom REST API** — Any REST endpoint
- ◈ **GraphQL API** — Graph query language

#### **Step 2: Connection Details**
- **Integration Name**: e.g., "My Shopify Store"
- **Base URL**: e.g., `https://your-store.myshopify.com`
- **Credentials**: Platform-specific (API keys, tokens, etc.)

**Example for Shopify:**
```
Name: Main Store
Base URL: https://mystore.myshopify.com
API Token: shpat_xxxxxxxxxxxxx
```

**Example for Supabase:**
```
Name: Production DB
Project URL: https://abc123.supabase.co
Service Key: eyJhbG...
Allowed Functions: get_order_status,track_shipment
```

#### **Step 3: Permissions**
- **Allowed Endpoints**: Whitelist specific API paths
  - Add: `/orders/`, `/products/`, `/shipments/`
  - Remove unwanted endpoints
- **Enabled Tools**: Choose which AI tools can use this integration
  - ☑ getOrderStatus
  - ☑ trackShipment
  - ☑ getProductAvailability
  - ☑ getShippingEstimate

#### **Step 4: AI Access Rules**
Configure data privacy:
- ☑ Hide customer email addresses
- ☑ Hide payment information
- ☑ Hide internal notes and metadata
- ☐ Hide pricing and cost information

#### **Step 5: Test Integration**
- Enter a test query: "Where is my order 1234?"
- Click **"Run Test"**
- See real-time results:
  - Tool selected
  - API endpoint used
  - Response time
  - Confidence score
  - Final AI response

#### **Complete Setup**
- Click **"Complete Integration"**
- Success notification appears
- Integration card shows in dashboard

---

## Dashboard Features

### Integration Cards
Each integration shows:
- Platform logo/badge (Shopify, WooCommerce, Custom)
- Connection status (✓ OK, ✗ Error, ⏱ Timeout)
- **Disabled badge** if turned off
- Number of allowed endpoints
- Last test date
- Quick actions:
  - **Toggle** — Enable/disable
  - **Test** — Verify connectivity
  - **Edit** — Update settings
  - **Delete** — Remove integration

### Stats Cards (when you have activity)
- 📊 Total API Calls
- ✓ Success Rate
- ⏱ Average Latency
- 🔴 Active Integrations

### Live Test Console
- Simulate customer queries
- See tool routing in real-time
- Inspect API responses
- View latency breakdown

### Tool Execution Logs
- Search logs by tool name or error
- Filter by status (success, error, timeout, blocked)
- View timestamps and latency
- Expandable details

---

## Common Integration Setups

### Shopify Integration

```yaml
Type: Shopify
Base URL: https://your-store.myshopify.com
Credentials:
  API Key: shpat_your_admin_api_token
Allowed Endpoints:
  - /admin/api/2024-01/orders/
  - /admin/api/2024-01/products/
Enabled Tools:
  - getOrderStatus
  - trackShipment
  - getProductAvailability
```

**Where to get credentials:**
1. Go to Shopify Admin
2. Click **Apps** → **Develop apps**
3. Create new app with **read-only** permissions
4. Copy Admin API access token

---

### Supabase Integration (Recommended)

```yaml
Type: Supabase (Custom)
Base URL: https://yourproject.supabase.co
Credentials:
  Service Key: eyJhbG...
  Allowed Functions: get_order_status,track_shipment
Allowed Endpoints:
  - /rest/v1/rpc/
Enabled Tools:
  - getOrderStatus
  - trackShipment
```

**Setup:**
1. Create RPC functions in Supabase SQL Editor
2. Use read-only database views
3. Enable RLS policies for security
4. Whitelist specific function names

**Example RPC function:**
```sql
CREATE OR REPLACE FUNCTION get_order_status(order_id text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'orderId', id,
    'status', status,
    'estimatedDelivery', delivery_date
  )
  FROM orders_view
  WHERE id = order_id
  LIMIT 1;
$$;
```

---

### WooCommerce Integration

```yaml
Type: WooCommerce
Base URL: https://your-store.com
Credentials:
  Consumer Key: ck_xxxxxxxxxxxxx
  Consumer Secret: cs_xxxxxxxxxxxxx
Allowed Endpoints:
  - /wp-json/wc/v3/orders/
  - /wp-json/wc/v3/products/
Enabled Tools:
  - getOrderStatus
  - getProductAvailability
```

**Where to get credentials:**
1. WordPress Admin → **WooCommerce** → **Settings**
2. Click **Advanced** → **REST API**
3. Click **Add key**
4. Set permissions to **Read**
5. Copy Consumer Key and Consumer Secret

---

### Custom REST API

```yaml
Type: Custom REST API
Base URL: https://api.your-domain.com
Credentials:
  Auth Type: Bearer Token
  Auth Value: your_api_token_here
Allowed Endpoints:
  - /orders/
  - /products/
  - /shipments/
Enabled Tools:
  - getOrderStatus
  - trackShipment
```

---

## Testing Your Integration

### In the Wizard (Step 5)
Test queries:
- "Where is my order 1234?"
- "Track shipment ABX22"
- "Is this product available?"
- "When will order 998 arrive?"

### In the Dashboard
1. Navigate to Integrations page
2. Find your integration card
3. Click **"Test"** button
4. Check connection status updates

### With the Live Test Console
1. Scroll down to "Live Test Console" section
2. Enter a customer question
3. Click **"Run Test"**
4. Inspect:
   - Intent classification
   - Tool selection
   - API endpoint called
   - Response time
   - Sanitized data
   - Final AI response

---

## Troubleshooting

### "No integrations yet" Empty State
✅ **You're in the right place!**
- Click **"Add your first integration"** or **"+ Add Integration"**
- Follow the wizard steps

### Can't Find Integrations Link
- ✅ **Fixed!** Check sidebar under "Settings" section
- Look for 🔌 Integrations
- If still not visible, refresh page

### Test Connection Fails
**Common causes:**
1. **Invalid URL** → Check base URL format (must start with https://)
2. **Wrong credentials** → Verify API keys haven't expired
3. **Network issue** → Check firewall/proxy settings
4. **SSL certificate** → Ensure HTTPS endpoint has valid cert

**Solutions:**
- Edit integration and update credentials
- Test in Postman/curl first to verify endpoint works
- Check API provider's status page

### Integration Created But Not Appearing
✅ **Fixed!** The wizard now properly saves to the database.
- Integration should appear immediately after completion
- Success notification shows in top-right
- Dashboard refreshes automatically

### Usage Limit Exceeded
**Error:** "You've reached your plan's integration limit"

**Current limits:**
- **Free:** 1 integration
- **Starter:** 3 integrations
- **Growth:** 10 integrations
- **Scale:** Unlimited

**Solution:**
- Upgrade your plan in **Billing** section
- Or delete unused integrations

---

## Security Best Practices

### ✅ DO
- Use **read-only** API credentials
- Whitelist **specific endpoints** only
- Enable **PII protection** rules
- Rotate credentials regularly
- Test with **non-production** data first

### ❌ DON'T
- Grant write/delete permissions
- Allow `/admin` or `/users` endpoints
- Expose raw database access
- Share credentials between services
- Skip endpoint whitelisting

---

## Next Steps

After setting up your first integration:

1. **Test in Playground**
   - Go to Dashboard → Playground
   - Ask: "Where is my order 1234?"
   - Verify AI calls your integration

2. **Embed Widget**
   - Get embed code from bot settings
   - Add to your website
   - Test live customer queries

3. **Monitor Activity**
   - Check Tool Execution Logs
   - Review success rates
   - Identify slow endpoints

4. **Optimize**
   - Add more integrations for fallback
   - Fine-tune allowed endpoints
   - Adjust AI access rules

---

## Quick Reference: Navigation Path

```
Dashboard (http://localhost:3000/dashboard)
  └─ Sidebar
      └─ Settings section
          └─ 🔌 Integrations  ← Click here!
              └─ Integration Dashboard
                  └─ Click "+ Add Integration"
                      └─ Follow 5-step wizard
                          └─ Complete setup
                              └─ See integration card
```

---

## Support

**Still can't see it?**

1. **Clear browser cache** and refresh
2. **Check you're logged in** to the dashboard
3. **Verify URL**: Should be at `/dashboard/integrations`
4. **Check browser console** for errors (F12 → Console tab)

**Documentation:**
- See `docs/INTEGRATION_GUIDE.md` for detailed setup
- See `docs/ARCHITECTURE_ANALYSIS.md` for system design
- See `docs/CRITICAL_FIXES.md` for recent changes

---

**Last Updated:** May 13, 2026  
**Status:** ✅ Navigation link added — fully accessible!
