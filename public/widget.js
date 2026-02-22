// PageAI Embeddable Widget Script
// Usage: <script src="https://cdn.pageai.io/widget.js" data-bot-id="bot_xxx" />
(function () {
    "use strict";

    const WIDGET_VERSION = "1.0.0";
    const API_BASE = window.PAGEAI_API || "https://api.pageai.io";

    // Get config from script tag
    const script = document.currentScript || document.querySelector("script[data-bot-id]");
    if (!script) return;

    const config = {
        botId: script.getAttribute("data-bot-id"),
        color: script.getAttribute("data-color") || "#6366f1",
        position: script.getAttribute("data-position") || "right",
        name: script.getAttribute("data-name") || "AI Assistant",
        welcome: script.getAttribute("data-welcome") || "Hi! 👋 Ask me anything about this website!",
    };

    if (!config.botId) {
        console.error("[PageAI] Missing data-bot-id attribute");
        return;
    }

    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
    #pageai-widget-container {
      position: fixed;
      bottom: 20px;
      ${config.position}: 20px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #pageai-trigger {
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

    #pageai-trigger:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(0,0,0,0.4);
    }

    #pageai-trigger svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    #pageai-chat {
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

    #pageai-chat.open {
      display: flex;
      animation: pageai-slide-up 0.3s ease-out;
    }

    @keyframes pageai-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #pageai-header {
      padding: 16px;
      background: ${config.color};
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #pageai-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #pageai-header-text h3 {
      color: white;
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }

    #pageai-header-text p {
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      margin: 0;
    }

    #pageai-close {
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

    #pageai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      min-height: 300px;
      max-height: 380px;
    }

    .pageai-msg {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .pageai-msg.user {
      justify-content: flex-end;
    }

    .pageai-msg-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
    }

    .pageai-msg.bot .pageai-msg-bubble {
      background: #22223a;
      color: #e0e0ea;
      border-top-left-radius: 4px;
    }

    .pageai-msg.user .pageai-msg-bubble {
      background: ${config.color};
      color: white;
      border-top-right-radius: 4px;
    }

    .pageai-sources {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
      margin-left: 32px;
    }

    .pageai-source-tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 99px;
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.2);
      text-decoration: none;
    }

    #pageai-input-area {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
    }

    #pageai-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 12px;
      background: #12121a;
      border: 1px solid rgba(255,255,255,0.08);
      color: #f0f0f5;
      font-size: 14px;
      outline: none;
    }

    #pageai-input:focus {
      border-color: ${config.color};
    }

    #pageai-send {
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

    #pageai-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #pageai-branding {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
    }

    #pageai-branding a {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
    }

    .pageai-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
    }

    .pageai-typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6b6b80;
      animation: pageai-typing 1.4s infinite;
    }

    .pageai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .pageai-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes pageai-typing {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }
  `;
    document.head.appendChild(style);

    // Build widget HTML
    const container = document.createElement("div");
    container.id = "pageai-widget-container";
    container.innerHTML = `
    <div id="pageai-chat">
      <div id="pageai-header">
        <div id="pageai-avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/>
            <path d="M9 22h6M12 17v5"/>
          </svg>
        </div>
        <div id="pageai-header-text">
          <h3>${config.name}</h3>
          <p>Powered by PageAI</p>
        </div>
        <button id="pageai-close">&times;</button>
      </div>
      <div id="pageai-messages"></div>
      <div id="pageai-input-area">
        <input id="pageai-input" type="text" placeholder="Ask anything about this site..." />
        <button id="pageai-send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
      <div id="pageai-branding">Powered by <a href="https://pageai.io" target="_blank">PageAI</a></div>
    </div>
    <button id="pageai-trigger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" stroke="none"/>
      </svg>
    </button>
  `;
    document.body.appendChild(container);

    // Widget logic
    const chat = document.getElementById("pageai-chat");
    const trigger = document.getElementById("pageai-trigger");
    const closeBtn = document.getElementById("pageai-close");
    const messages = document.getElementById("pageai-messages");
    const input = document.getElementById("pageai-input");
    const sendBtn = document.getElementById("pageai-send");

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

    function addMessage(role, text, sources) {
        const msg = document.createElement("div");
        msg.className = `pageai-msg ${role}`;
        msg.innerHTML = `
      ${role === "bot" ? '<div style="width:24px;height:24px;border-radius:50%;background:' + config.color + ';flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg></div>' : ""}
      <div class="pageai-msg-bubble">${text}</div>
    `;
        messages.appendChild(msg);

        if (sources && sources.length > 0) {
            const sourcesDiv = document.createElement("div");
            sourcesDiv.className = "pageai-sources";
            sources.forEach((s) => {
                const tag = document.createElement("a");
                tag.className = "pageai-source-tag";
                tag.href = s.url;
                tag.textContent = "📄 " + s.title;
                sourcesDiv.appendChild(tag);
            });
            messages.appendChild(sourcesDiv);
        }

        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        const typing = document.createElement("div");
        typing.className = "pageai-msg bot";
        typing.id = "pageai-typing";
        typing.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:${config.color};flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg></div>
      <div class="pageai-typing"><span></span><span></span><span></span></div>
    `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById("pageai-typing");
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
                }),
            });

            const data = await res.json();
            removeTyping();

            if (data.success) {
                conversationId = data.conversationId;
                addMessage("bot", data.answer, data.sources);
            } else {
                addMessage("bot", "Sorry, I encountered an error. Please try again.");
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

    console.log(`[PageAI] Widget v${WIDGET_VERSION} loaded for bot ${config.botId}`);
})();
