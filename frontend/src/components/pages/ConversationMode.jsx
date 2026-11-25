import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "@/services/ai";

const MODES = [
  {
    id: "information",
    label: "Info",
    intro: "Ask me about attractions, customs or practical tips.",
    suggestions: (d) => [`Top 3 things to see in ${d}`, "Any local customs I should know?", "How do I get around?"],
  },
  {
    id: "planning",
    label: "Planning",
    intro: "I can help with itineraries, timing and packing.",
    suggestions: (d) => [`A 3-day plan for ${d}`, "What should I pack?", "Best area to stay in?"],
  },
  {
    id: "translation",
    label: "Translate",
    intro: "Type a phrase and I'll translate it.",
    suggestions: () => ['How do I say "thank you"?', '"Where is the train station?"', '"The check, please"'],
  },
  {
    id: "conversation",
    label: "Practice",
    intro: "Let's practice the local language with simple sentences.",
    suggestions: () => ["Let's order food at a restaurant", "Help me ask for directions", "Small talk with a local"],
  },
];

const HISTORY_SENT = 12;

// Chats are kept per trip in sessionStorage, so closing and reopening the
// panel (or refreshing) doesn't wipe the conversation.
const storageKey = (chatKey) => `travel_chat_${chatKey}`;

function loadChat(chatKey) {
  try {
    const raw = sessionStorage.getItem(storageKey(chatKey));
    if (raw) return JSON.parse(raw);
  } catch {
    // unreadable or blocked storage: start fresh
  }
  return { mode: null, messages: [] };
}

function saveChat(chatKey, chat) {
  try {
    sessionStorage.setItem(storageKey(chatKey), JSON.stringify(chat));
  } catch {
    // storage full or blocked: the chat still works, it just won't persist
  }
}

// Gemini sometimes returns markdown. We don't render HTML from the model
// (that would be an XSS risk), so we strip the markdown symbols and turn
// "- item" lines into a real list.
function cleanText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[*•]\s+/gm, "- ")
    .replace(/(^|\s)\*(\S.*?\S)\*(?=\s|$)/g, "$1$2");
}

function MessageText({ text }) {
  const blocks = [];
  let list = null;

  cleanText(text).split("\n").forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      if (!list) {
        list = [];
        blocks.push({ type: "list", items: list, key: i });
      }
      list.push(trimmed.slice(2));
    } else {
      list = null;
      if (trimmed) blocks.push({ type: "p", text: trimmed, key: i });
    }
  });

  return blocks.map((b) =>
    b.type === "list" ? (
      <ul key={b.key}>{b.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
    ) : (
      <p key={b.key}>{b.text}</p>
    )
  );
}

function ConversationMode({ isOpen, onClose, destination, chatKey = "general" }) {
  const [chat, setChat] = useState(() => loadChat(chatKey));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const { mode, messages } = chat;
  const currentMode = MODES.find((m) => m.id === mode);
  const place = destination || "my destination";

  // Switching trips loads that trip's own conversation.
  useEffect(() => {
    setChat(loadChat(chatKey));
    setMessage("");
    setLoading(false);
  }, [chatKey]);

  useEffect(() => {
    saveChat(chatKey, chat);
  }, [chatKey, chat]);

  // Keep the newest message (or the typing indicator) in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode) inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, mode, onClose]);

  const addMessage = (msg) =>
    setChat((prev) => ({ ...prev, messages: [...prev.messages, { id: crypto.randomUUID(), ...msg }] }));

  const selectMode = (id) => {
    if (id === mode) return;
    const next = MODES.find((m) => m.id === id);
    setChat((prev) => ({
      mode: id,
      messages: [
        ...prev.messages,
        // "local" messages are UI notes: shown in the chat, never sent to the model.
        { id: crypto.randomUUID(), sender: "ai", local: true, text: next.intro, modeLabel: next.label },
      ],
    }));
  };

  const send = async (text) => {
    const trimmed = (text ?? message).trim();
    if (!trimmed || !mode || loading) return;

    // Build the history from the current state *before* adding the new
    // message. The server appends the new message itself.
    const history = messages
      .filter((m) => !m.local && !m.error)
      .slice(-HISTORY_SENT)
      .map(({ sender, text }) => ({ sender, text }));

    addMessage({ sender: "user", text: trimmed });
    setMessage("");
    setLoading(true);

    try {
      const reply = await sendChatMessage({ message: trimmed, mode, destination, messages: history });
      addMessage({ sender: "ai", text: reply });
    } catch (error) {
      addMessage({
        sender: "ai",
        error: true,
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setChat({ mode: null, messages: [] });

  // Suggestions show until the user has asked something in the current mode.
  const lastModeStart = messages.findLastIndex((m) => m.local);
  const askedInMode = messages.slice(lastModeStart + 1).some((m) => m.sender === "user");
  const showSuggestions = currentMode && !askedInMode && !loading;

  return (
    <aside
      className={`chat-sidebar ${isOpen ? "open" : ""}`}
      aria-label="AI travel chat"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="chat-sidebar-header">
        <div>
          <h2>AI Chat</h2>
          <p>{destination ? `Trip to ${destination}` : "General travel assistant"}</p>
        </div>
        <div className="chat-header-actions">
          {messages.length > 0 && (
            <button type="button" className="chat-clear-btn" onClick={clearChat}>
              Clear
            </button>
          )}
          <button type="button" className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>
      </div>

      <div className="chat-modes" role="tablist" aria-label="Chat mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? "active" : ""}
            onClick={() => selectMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="chat-sidebar-body" ref={bodyRef} aria-live="polite">
        {!mode && (
          <div className="chat-welcome">
            <p>
              {destination
                ? `Hi! I can help with your trip to ${destination}.`
                : "Hi! I can help you plan your next trip."}
            </p>
            <p className="chat-hint">Pick a mode above to start.</p>
          </div>
        )}

        {messages.map((msg) =>
          msg.local ? (
            <div key={msg.id} className="chat-mode-note">
              <span>{msg.modeLabel}</span> {msg.text}
            </div>
          ) : (
            <div key={msg.id} className={`chat-message ${msg.sender}${msg.error ? " error" : ""}`}>
              <MessageText text={msg.text} />
            </div>
          )
        )}

        {loading && (
          <div className="chat-message ai typing" aria-label="Assistant is typing">
            <span></span><span></span><span></span>
          </div>
        )}

        {showSuggestions && (
          <div className="chat-suggestions">
            {currentMode.suggestions(place).map((s) => (
              <button key={s} type="button" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="chat-sidebar-footer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={mode ? "Ask something about your trip..." : "Pick a mode first"}
          value={message}
          maxLength={1000}
          disabled={!mode}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Message"
        />
        <button type="submit" disabled={!mode || loading || !message.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </aside>
  );
}

export default ConversationMode;
