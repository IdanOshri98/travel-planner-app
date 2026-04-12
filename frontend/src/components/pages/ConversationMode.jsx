import { useState, useEffect } from "react";
import { sendChatMessage } from "@/services/ai";

function ConversationMode({ isOpen, onClose, destination }) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false); 


  useEffect(() => {
    if (!isOpen) return;

    setMessages([
      {
      id: 1,
      sender: "ai",
      text: destination
        ? `Hi! I can help you plan your trip to ${destination}. Select a mode to get started.`
        : "Hi! I can help you plan your next trip.",
    },]);
    setMode(null);
    setMessage("");
    setLoading(false);
  }, [isOpen, destination]);


  

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !mode || !destination || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    const updatedMessages = ((prev) => [...prev, userMessage]);
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try{
      const reply = await sendChatMessage({message: trimmedMessage, mode, destination, messages: updatedMessages});
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: reply,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
       const errMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // חשוב!
      handleSendMessage();
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    let modeMessage;

    switch (selectedMode) {
      case "conversation":
        modeMessage = "Great! what would you like to talk about regarding your trip?";
        break;
      
      case "planning":
        modeMessage = "Lets go! I can help you with itinerary suggestions, packing lists, and more.";
        break;

      case "information":
        modeMessage = "Amazing! I can provide you with travel tips, local customs, and must-see attractions for your destination.";
        break;
      
      case "translation":
        modeMessage = "Yalla! just type a phrase and I'll translate it for you.";
        break;
    }
    setMessages((prev) => [...prev,
                            { id: Date.now(), sender: "user", text: `selected: ${selectedMode}` }, 
                            { id: Date.now()+1, sender: "ai", text: modeMessage }
                          ]);
  };

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : ""}`}>
      <div className="chat-sidebar-header">
        <div>
          <h2>AI Chat</h2>
          <p>{destination ? ` Trip to ${destination}` : "General travel assistant"}</p>
        </div>

        <button className="chat-close-btn" onClick={() => {
          onClose();
          setMode(null);
          setMessage("");
        }}>
          ✕
        </button>
      </div>

      <div className="chat-sidebar-body">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.sender === "user" ? "user" : "ai"}`}
          >
            {msg.text}
          </div>
        ))}

        {!mode && (
          <div className="mode-selection">
            <button onClick={() => handleModeSelection("conversation")}> Native Language Conversation </button>
            <button onClick={() => handleModeSelection("planning")}> Trip Planning </button>
            <button onClick={() => handleModeSelection("information")}> Information </button>
            <button onClick={() => handleModeSelection("translation")}> Translation </button>
          </div>
        )}       
      </div>

      <div className="chat-sidebar-footer">
        <input
          type="text"
          placeholder="Ask something about your trip..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
  
}

export default ConversationMode;