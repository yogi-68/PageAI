// PageCortex Embeddable Widget Script
// Usage: <script src="https://www.pagecortex.com/widget.js" data-bot-id="bot_xxx" async />
(function () {
    "use strict";

    const WIDGET_VERSION = "2.2.0";

    // Must capture script reference synchronously — document.currentScript is only valid now
    const scriptEl = document.currentScript || document.querySelector("script[data-bot-id]");
    if (!scriptEl) return;

    const scriptSrc = scriptEl.src || "";
    const scriptOrigin = scriptSrc ? new URL(scriptSrc).origin : "";
    const API_BASE = window.PAGECORTEX_API || scriptOrigin || "https://www.pagecortex.com";

    // Get config from script tag attributes
    const config = {
        botId: scriptEl.getAttribute("data-bot-id"),
        color: scriptEl.getAttribute("data-color") || "#6366f1",
        position: scriptEl.getAttribute("data-position") || "right",
        name: scriptEl.getAttribute("data-name") || "AI Assistant",
        welcome: scriptEl.getAttribute("data-welcome") || "Hi! 👋 Ask me anything about this website!",        suggestedQuestions: (function() {
            const raw = scriptEl.getAttribute("data-suggested-questions") || "";
            if (!raw.trim()) return [];
            try { return JSON.parse(raw); } catch(_) { return raw.split("|").map(s => s.trim()).filter(Boolean); }
        })()    };

    if (!config.botId) {
        console.error("[PageCortex] Missing data-bot-id attribute");
        return;
    }

    // Defer all DOM work until the page is idle so we don't block first paint
    function initWidget() {
    const style = document.createElement("style");
    style.textContent = `
    #pagecortex-widget-container {
      position: fixed;
      bottom: 20px;
      ${config.position}: 20px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #pagecortex-trigger {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${config.color};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    #pagecortex-trigger:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(0,0,0,0.4);
    }

    #pagecortex-trigger svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    #pagecortex-chat {
      display: none;
      width: 380px;
      max-height: 560px;
      border-radius: 16px;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      overflow: hidden;
      flex-direction: column;
      margin-bottom: 12px;
    }

    #pagecortex-chat.open {
      display: flex;
      animation: pagecortex-slide-up 0.3s ease-out;
    }

    @keyframes pagecortex-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #pagecortex-header {
      padding: 16px;
      background: ${config.color};
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #pagecortex-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #pagecortex-header-text h3 {
      color: white;
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }

    #pagecortex-header-text p {
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      margin: 0;
    }

    #pagecortex-close {
      margin-left: auto;
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    #pagecortex-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      min-height: 300px;
      max-height: 380px;
    }

    .pagecortex-msg {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .pagecortex-msg.user {
      justify-content: flex-end;
    }

    .pagecortex-msg-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
    }

    .pagecortex-msg.bot .pagecortex-msg-bubble {
      background: #22223a;
      color: #e0e0ea;
      border-top-left-radius: 4px;
    }

    .pagecortex-msg.user .pagecortex-msg-bubble {
      background: ${config.color};
      color: white;
      border-top-right-radius: 4px;
    }

    .pagecortex-sources {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
      margin-left: 32px;
    }

    .pagecortex-source-tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 99px;
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.2);
      text-decoration: none;
    }

    .pagecortex-suggestions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 10px;
      margin-left: 32px;
    }

    .pagecortex-suggestion-chip {
      font-size: 12px;
      padding: 5px 11px;
      border-radius: 99px;
      background: transparent;
      color: ${config.color};
      border: 1px solid ${config.color};
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      text-align: left;
      line-height: 1.4;
    }

    .pagecortex-suggestion-chip:hover {
      background: ${config.color};
      color: #fff;
    }

    #pagecortex-input-area {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
    }

    #pagecortex-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 12px;
      background: #12121a;
      border: 1px solid rgba(255,255,255,0.08);
      color: #f0f0f5;
      font-size: 14px;
      outline: none;
    }

    #pagecortex-input:focus {
      border-color: ${config.color};
    }

    #pagecortex-send {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: ${config.color};
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #pagecortex-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #pagecortex-branding {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
    }

    #pagecortex-branding a {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
    }

    .pagecortex-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
    }

    .pagecortex-typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6b6b80;
      animation: pagecortex-typing 1.4s infinite;
    }

    .pagecortex-typing span:nth-child(2) { animation-delay: 0.2s; }
    .pagecortex-typing span:nth-child(3) { animation-delay: 0.4s; }


    @keyframes pagecortex-typing {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }

    .pagecortex-cursor {
      display: inline;
      color: ${config.color};
      font-weight: 400;
      animation: pagecortex-blink 0.8s infinite;
      margin-left: 1px;
    }

    @keyframes pagecortex-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    @keyframes pagecortex-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .pagecortex-stream-text {
      white-space: pre-wrap;
    }
  `;
    document.head.appendChild(style);

    // Build widget HTML
    const container = document.createElement("div");
    container.id = "pagecortex-widget-container";
    container.innerHTML = `
    <div id="pagecortex-chat">
      <div id="pagecortex-header">
        <div id="pagecortex-avatar">
        <img src="${API_BASE}/logo.png" alt="PageCortex" width="20" height="20" style="border-radius:4px" />
        </div>
        <div id="pagecortex-header-text">
          <h3>${config.name}</h3>
          <p>Powered by PageCortex</p>
        </div>
        <button id="pagecortex-close">&times;</button>
      </div>
      <div id="pagecortex-messages"></div>
      <div id="pagecortex-input-area">
        <input id="pagecortex-input" type="text" placeholder="Ask anything about this site..." />
        <button id="pagecortex-send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
      <div id="pagecortex-branding">Powered by <a href="https://www.pagecortex.com" target="_blank">PageCortex</a></div>
    </div>
    <button id="pagecortex-trigger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" stroke="none"/>
      </svg>
    </button>
  `;
    document.body.appendChild(container);

    // Widget logic
    const chat = document.getElementById("pagecortex-chat");
    const trigger = document.getElementById("pagecortex-trigger");
    const closeBtn = document.getElementById("pagecortex-close");
    const messages = document.getElementById("pagecortex-messages");
    const input = document.getElementById("pagecortex-input");
    const sendBtn = document.getElementById("pagecortex-send");

    let isOpen = false;
    let conversationId = null;

    function toggle() {
        isOpen = !isOpen;
        chat.classList.toggle("open", isOpen);
        if (isOpen && messages.children.length === 0) {
            addMessage("bot", config.welcome);
        }
    }

    trigger.addEventListener("click", toggle);
    closeBtn.addEventListener("click", toggle);

    function addMessage(role, text) {
        // Remove any existing suggestion chips/source tags before appending a new message
        removeSuggestions();
        removeSources();
        const msg = document.createElement("div");
        msg.className = `pagecortex-msg ${role}`;
        msg.innerHTML = `
      ${role === "bot" ? '<div style="width:24px;height:24px;border-radius:50%;background:' + config.color + ';flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg></div>' : ""}
      <div class="pagecortex-msg-bubble">${text}</div>
    `;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showSuggestions(questions) {
        removeSuggestions();
        if (!questions || questions.length === 0) return;
        const div = document.createElement("div");
        div.className = "pagecortex-suggestions";
        div.id = "pagecortex-suggestions";
        questions.forEach(function(q) {
            const btn = document.createElement("button");
            btn.className = "pagecortex-suggestion-chip";
            btn.textContent = q;
            btn.addEventListener("click", function() {
                input.value = q;
                sendMessage();
            });
            div.appendChild(btn);
        });
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeSuggestions() {
        const el = document.getElementById("pagecortex-suggestions");
        if (el) el.remove();
    }

    function removeSources() {
        const el = document.getElementById("pagecortex-sources");
        if (el) el.remove();
    }

    function showSources(sources) {
        removeSources();
        if (!sources || sources.length === 0) return;
        const div = document.createElement("div");
        div.className = "pagecortex-sources";
        div.id = "pagecortex-sources";
        sources.forEach(function(s) {
            if (!s || !s.url) return;
            const link = document.createElement("a");
            link.className = "pagecortex-source-tag";
            link.href = s.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = s.title || s.url;
            div.appendChild(link);
        });
        if (div.children.length > 0) {
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    function showTyping() {
        const typing = document.createElement("div");
        typing.className = "pagecortex-msg bot";
        typing.id = "pagecortex-typing";
        typing.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:${config.color};flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg></div>
      <div class="pagecortex-typing"><span></span><span></span><span></span></div>
    `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById("pagecortex-typing");
        if (el) el.remove();
    }

    async function sendMessage() {
        const query = input.value.trim();
        if (!query) return;

        addMessage("user", query);
        input.value = "";
        sendBtn.disabled = true;
        showTyping();

        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query,
                    botId: config.botId,
                    conversationId,
                    stream: true,
                }),
            });

            removeTyping();

            // Guard: non-2xx before attempting to read body
            if (!res.ok) {
                try {
                    const errData = await res.json();
                    const msg = errData.error || errData.message || "Sorry, something went wrong. Please try again.";
                    if (errData.limitReached) {
                        addMessage("bot", "You've reached your monthly message limit. Please upgrade your plan to continue.");
                    } else {
                        addMessage("bot", msg);
                    }
                } catch {
                    addMessage("bot", `Server error (${res.status}). Please try again later.`);
                }
                sendBtn.disabled = false;
                input.focus();
                return;
            }

            // Check if streaming response
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("text/event-stream")) {
                // SSE streaming
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let botText = "";

                // Create bot message bubble for streaming with cursor
                const msg = document.createElement("div");
                msg.className = "pagecortex-msg bot";
                msg.innerHTML = `
                  <div style="width:24px;height:24px;border-radius:50%;background:${config.color};flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg></div>
                  <div class="pagecortex-msg-bubble"><span class="pagecortex-stream-text"></span><span class="pagecortex-cursor">▎</span></div>
                `;
                messages.appendChild(msg);
                const textEl = msg.querySelector(".pagecortex-stream-text");
                const cursorEl = msg.querySelector(".pagecortex-cursor");

                let buffer = "";
                // Token queue for smooth rendering
                let tokenQueue = [];
                let rendering = false;

                async function renderTokens() {
                    if (rendering) return;
                    rendering = true;
                    while (tokenQueue.length > 0) {
                        const token = tokenQueue.shift();
                        // Split token into chars and render with tiny delays for typing feel
                        for (let i = 0; i < token.length; i++) {
                            botText += token[i];
                            textEl.textContent = botText;
                            messages.scrollTop = messages.scrollHeight;
                            // Small delay between characters — gives ChatGPT typing feel
                            if (token.length > 1 && i < token.length - 1) {
                                await new Promise(r => setTimeout(r, 12));
                            }
                        }
                    }
                    rendering = false;
                }

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === 'token' && parsed.content) {
                                    // Remove the "looking up" indicator once we start getting tokens
                                    const lookupEl = msg.querySelector(".pagecortex-lookup-indicator");
                                    if (lookupEl) lookupEl.remove();
                                    tokenQueue.push(parsed.content);
                                    renderTokens();
                                } else if (parsed.type === 'tool_call') {
                                    // Show/update live data lookup indicator with tool-specific messages
                                    let lookupEl = msg.querySelector(".pagecortex-lookup-indicator");
                                    if (parsed.status === 'calling') {
                                        const toolMessages = {
                                            getOrderStatus: 'Looking up your order...',
                                            trackShipment: 'Checking shipment status...',
                                            getProductAvailability: 'Checking live inventory...',
                                            getShippingEstimate: 'Fetching shipping details...',
                                        };
                                        const message = toolMessages[parsed.toolName] || 'Fetching live data...';
                                        
                                        if (!lookupEl) {
                                            lookupEl = document.createElement("div");
                                            lookupEl.className = "pagecortex-lookup-indicator";
                                            lookupEl.style.cssText = "display:flex;align-items:center;gap:6px;font-size:12px;color:#8892b0;padding:4px 0;";
                                            lookupEl.innerHTML = `
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f6df5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:pagecortex-spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                                <span>${message}</span>
                                            `;
                                            const bubble = msg.querySelector(".pagecortex-msg-bubble");
                                            if (bubble) bubble.insertBefore(lookupEl, bubble.firstChild);
                                        }
                                    } else if (parsed.status === 'done') {
                                        if (lookupEl) {
                                            lookupEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg><span style="color:#22c55e">Information retrieved</span>`;
                                        }
                                    } else if (parsed.status === 'error') {
                                        if (lookupEl) {
                                            lookupEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 9v4m0 4h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z"/></svg><span style="color:#f59e0b">Having trouble reaching the system</span>`;
                                        }
                                    }
                                    messages.scrollTop = messages.scrollHeight;
                                } else if (parsed.type === 'done') {
                                    if (parsed.sources && parsed.sources.length > 0) {
                                        showSources(parsed.sources);
                                    }
                                    if (parsed.suggestions && parsed.suggestions.length > 0) {
                                        showSuggestions(parsed.suggestions);
                                    }
                                } else if (parsed.type === 'error') {
                                    textEl.textContent = "Sorry, I encountered an error. Please try again.";
                                } else if (parsed.conversationId) {
                                    conversationId = parsed.conversationId;
                                }
                            } catch (e) {
                                // Non-JSON data line, skip
                            }
                        }
                    }
                }

                // Wait for remaining tokens to finish rendering
                while (tokenQueue.length > 0 || rendering) {
                    await new Promise(r => setTimeout(r, 50));
                }

                // Remove cursor when done
                if (cursorEl) cursorEl.remove();

                // Guard: stream ended with empty bubble — show fallback
                if (!botText) {
                    textEl.textContent = "I couldn't generate a response. Please try rephrasing your question.";
                }
            } else {
                // Fallback: non-streaming JSON response
                const data = await res.json();
                if (data.success) {
                    conversationId = data.conversationId;
                    addMessage("bot", data.answer);
                    if (data.sources && data.sources.length > 0) showSources(data.sources);
                    if (data.suggestions && data.suggestions.length > 0) showSuggestions(data.suggestions);
                } else {
                    addMessage("bot", "Sorry, I encountered an error. Please try again.");
                }
            }
        } catch (err) {
            removeTyping();
            addMessage("bot", "Sorry, I'm having trouble connecting. Please try again later.");
        }

        sendBtn.disabled = false;
        input.focus();
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    console.log(`[PageCortex] Widget v${WIDGET_VERSION} loaded for bot ${config.botId}`);
    } // end initWidget

    // Schedule initialization after page becomes idle — avoids blocking first paint
    if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(initWidget, { timeout: 2000 });
    } else {
        // Fallback: defer until after load event
        if (document.readyState === "complete") {
            setTimeout(initWidget, 1);
        } else {
            window.addEventListener("load", function () { setTimeout(initWidget, 1); }, { once: true });
        }
    }
})();
