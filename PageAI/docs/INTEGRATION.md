# PageAI Widget Integration Guide

Embed a PageAI chatbot on any website in under 2 minutes.

---

## Quick Start

After creating a bot in the [PageAI Dashboard](https://pageai-tau.vercel.app/dashboard/bots), copy the **Bot ID** from the bot settings and use one of the methods below.

---

## 1. HTML Script Tag (Easiest)

Paste this before `</body>` on any HTML page:

```html
<script
  src="https://pageai-tau.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID"
></script>
```

### Customization Attributes

| Attribute        | Default          | Description                             |
| ---------------- | ---------------- | --------------------------------------- |
| `data-bot-id`    | *(required)*     | Your bot ID from the dashboard          |
| `data-color`     | `#6366f1`        | Primary color (hex)                     |
| `data-position`  | `right`          | Widget position: `right` or `left`      |
| `data-name`      | `AI Assistant`   | Name shown in the chat header           |
| `data-welcome`   | `Hi! 👋 Ask me anything!` | Welcome message              |

**Full example:**

```html
<script
  src="https://pageai-tau.vercel.app/widget.js"
  data-bot-id="bot_abc123"
  data-color="#2563eb"
  data-position="right"
  data-name="Support Bot"
  data-welcome="Hello! How can I help you today?"
></script>
```

---

## 2. React / Next.js

```tsx
// components/PageAIChat.tsx
'use client';

import { useEffect } from 'react';

interface PageAIChatProps {
  botId: string;
  color?: string;
  position?: 'left' | 'right';
  name?: string;
  welcome?: string;
}

export default function PageAIChat({
  botId,
  color = '#6366f1',
  position = 'right',
  name = 'AI Assistant',
  welcome = 'Hi! 👋 Ask me anything!',
}: PageAIChatProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pageai-tau.vercel.app/widget.js';
    script.setAttribute('data-bot-id', botId);
    script.setAttribute('data-color', color);
    script.setAttribute('data-position', position);
    script.setAttribute('data-name', name);
    script.setAttribute('data-welcome', welcome);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      const widget = document.getElementById('pageai-widget-container');
      if (widget) widget.remove();
    };
  }, [botId, color, position, name, welcome]);

  return null;
}
```

**Usage:**

```tsx
import PageAIChat from '@/components/PageAIChat';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <PageAIChat botId="bot_abc123" color="#2563eb" />
    </>
  );
}
```

---

## 3. Vue.js

```vue
<!-- PageAIChat.vue -->
<template>
  <div></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  botId: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  position: { type: String, default: 'right' },
  name: { type: String, default: 'AI Assistant' },
  welcome: { type: String, default: 'Hi! 👋 Ask me anything!' },
});

let script;

onMounted(() => {
  script = document.createElement('script');
  script.src = 'https://pageai-tau.vercel.app/widget.js';
  script.setAttribute('data-bot-id', props.botId);
  script.setAttribute('data-color', props.color);
  script.setAttribute('data-position', props.position);
  script.setAttribute('data-name', props.name);
  script.setAttribute('data-welcome', props.welcome);
  script.async = true;
  document.body.appendChild(script);
});

onUnmounted(() => {
  if (script) document.body.removeChild(script);
  const widget = document.getElementById('pageai-widget-container');
  if (widget) widget.remove();
});
</script>
```

---

## 4. Angular

```typescript
// pageai-chat.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-pageai-chat',
  template: '',
})
export class PageAIChatComponent implements OnInit, OnDestroy {
  @Input() botId!: string;
  @Input() color = '#6366f1';
  @Input() position = 'right';
  @Input() name = 'AI Assistant';
  @Input() welcome = 'Hi! 👋 Ask me anything!';

  private script?: HTMLScriptElement;

  ngOnInit() {
    this.script = document.createElement('script');
    this.script.src = 'https://pageai-tau.vercel.app/widget.js';
    this.script.setAttribute('data-bot-id', this.botId);
    this.script.setAttribute('data-color', this.color);
    this.script.setAttribute('data-position', this.position);
    this.script.setAttribute('data-name', this.name);
    this.script.setAttribute('data-welcome', this.welcome);
    this.script.async = true;
    document.body.appendChild(this.script);
  }

  ngOnDestroy() {
    if (this.script) document.body.removeChild(this.script);
    const widget = document.getElementById('pageai-widget-container');
    if (widget) widget.remove();
  }
}
```

---

## 5. Svelte

```svelte
<!-- PageAIChat.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  export let botId;
  export let color = '#6366f1';
  export let position = 'right';
  export let name = 'AI Assistant';
  export let welcome = 'Hi! 👋 Ask me anything!';

  let script;

  onMount(() => {
    script = document.createElement('script');
    script.src = 'https://pageai-tau.vercel.app/widget.js';
    script.setAttribute('data-bot-id', botId);
    script.setAttribute('data-color', color);
    script.setAttribute('data-position', position);
    script.setAttribute('data-name', name);
    script.setAttribute('data-welcome', welcome);
    script.async = true;
    document.body.appendChild(script);
  });

  onDestroy(() => {
    if (script) document.body.removeChild(script);
    const widget = document.getElementById('pageai-widget-container');
    if (widget) widget.remove();
  });
</script>
```

---

## 6. WordPress

Add this to your theme's `footer.php` before `</body>`, or use a plugin like **Insert Headers and Footers**:

```html
<script
  src="https://pageai-tau.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID"
></script>
```

**Or** add via `functions.php`:

```php
function pageai_enqueue_widget() {
    wp_enqueue_script(
        'pageai-widget',
        'https://pageai-tau.vercel.app/widget.js',
        array(),
        null,
        true
    );
    wp_script_add_data('pageai-widget', 'data-bot-id', 'YOUR_BOT_ID');
}
add_action('wp_enqueue_scripts', 'pageai_enqueue_widget');
```

---

## 7. Shopify

Go to **Online Store → Themes → Edit code → theme.liquid** and paste before `</body>`:

```html
<script
  src="https://pageai-tau.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID"
></script>
```

---

## 8. Webflow / Squarespace / Wix

Go to **Site Settings → Custom Code → Footer Code** and paste:

```html
<script
  src="https://pageai-tau.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID"
></script>
```

---

## 9. REST API (Direct Integration)

For custom integrations, call the chat API directly:

```bash
curl -X POST https://pageai-tau.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is your return policy?",
    "botId": "YOUR_BOT_ID",
    "conversationId": null,
    "stream": false
  }'
```

**Response:**

```json
{
  "success": true,
  "answer": "Our return policy allows returns within 30 days...",
  "conversationId": "conv_abc123",
  "sources": [
    { "title": "Return Policy", "url": "https://example.com/returns", "score": 0.92 }
  ]
}
```

### Streaming (SSE)

Set `"stream": true` to receive Server-Sent Events:

```
data: {"token":"Our"}
data: {"token":" return"}
data: {"token":" policy"}
data: {"sources":[...]}
data: {"conversationId":"conv_abc123"}
data: [DONE]
```

---

## Watermark / Branding

- **Free plan**: "Powered by PageAI" watermark is always shown.
- **Starter and above**: Watermark can be removed via bot settings in the dashboard (Custom branding feature).

---

## Domain Restrictions

For security, you can restrict which domains can embed your bot:

1. Go to **Dashboard → Bots → [Your Bot] → Settings**
2. Add allowed domains (e.g., `example.com`, `*.example.com`)
3. Only these domains will be able to use the widget

If no domains are configured, the bot works on any domain.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Widget doesn't appear | Check browser console for errors. Verify `data-bot-id` is correct. |
| "Bot not found" | Ensure the bot exists and is active in the dashboard. |
| "Domain not authorized" | Add your domain to the bot's allowed domains. |
| "Rate limit exceeded" | Wait a minute. The widget has built-in rate limiting. |
| CORS errors | The widget handles CORS automatically. If using the API directly, ensure you send the `Origin` header. |

---

## Need Help?

- Dashboard: [pageai-tau.vercel.app/dashboard](https://pageai-tau.vercel.app/dashboard)
- Email: support@pageai.com
