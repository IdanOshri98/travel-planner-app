// Floating button that opens the AI chat from any screen.
export default function ChatLauncher({ onClick, hidden }) {
  if (hidden) return null;
  return (
    <button type="button" className="chat-launcher" onClick={onClick} aria-label="Open AI chat">
      <span aria-hidden="true">💬</span>
      <span className="chat-launcher-label">Ask AI</span>
    </button>
  );
}
