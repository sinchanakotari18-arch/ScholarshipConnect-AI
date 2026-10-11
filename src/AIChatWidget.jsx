import React, { useState, useEffect, useRef } from "react";
import { generateAIAdvisorResponse, queryGeminiAI } from "./aiEngine.js";
import { samplePrompts } from "./scholarshipsData.js";

export default function AIChatWidget({
  scholarshipsList,
  onSelectScholarship,
  userProfile,
  isFullPage = false,
  onNavigateToWallet
}) {
  const [isOpen, setIsOpen] = useState(isFullPage);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("sc_gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
  });
  const [showConfig, setShowConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("sc-ai-chat-history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "msg-welcome",
        sender: "bot",
        text: `### 👋 Namaste ${userProfile?.firstName ? userProfile.firstName : "Scholar"}! I'm **ScholarBot AI**.

I am your 24/7 personal scholarship and educational finance advisor.

**Here's what I can do for you:**
* 🎯 **Find & match scholarships** tailored to your marks, family income, and study field.
* 📝 **Draft & review your Statement of Purpose (SOP)** or scholarship application essays.
* 📁 **Provide exact document checklists** so your application is never rejected.
* ⏰ **Track upcoming deadlines** and send eligibility advice.

How can I help you today? Choose a prompt below or type your question!`,
        cards: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickReplies: [
          "Find scholarships for women in STEM",
          "Help me write an SOP",
          "What documents do I need?",
          "Check upcoming deadlines"
        ]
      }
    ];
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen || isFullPage) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isFullPage]);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sc-ai-chat-history", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  const handleSend = async (textToSend = null) => {
    const queryText = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!queryText) return;

    const userMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const activeKey = geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";

    // If a Google Gemini API Key is configured, try live LLM generation first
    if (activeKey) {
      try {
        const geminiText = await queryGeminiAI(queryText, scholarshipsList, userProfile, activeKey);
        const botMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: geminiText,
          cards: [],
          quickReplies: ["Tell me more", "Draft an SOP", "Required documents", "More scholarships"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isLiveGemini: true
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn("Live Gemini API call failed, falling back to built-in AI engine:", err);
      }
    }

    // Built-in intelligent rules & NLP AI engine fallback
    setTimeout(() => {
      const response = generateAIAdvisorResponse(queryText, scholarshipsList, userProfile);
      
      const botMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        cards: response.cards || [],
        quickReplies: response.quickReplies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleClearChat = () => {
    if (window.confirm("Clear conversation history?")) {
      const welcome = [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: "bot",
          text: `### ✦ Fresh Session Started!

How can I assist your scholarship search and application journey today?`,
          cards: [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickReplies: [
            "Find scholarships for women in STEM",
            "Help me write an SOP",
            "What documents do I need?",
            "Check upcoming deadlines"
          ]
        }
      ];
      setMessages(welcome);
      localStorage.removeItem("sc-ai-chat-history");
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied advice to clipboard!");
  };

  // Render markdown formatting into clean HTML elements
  const renderFormattedText = (rawText) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="botH4">{line.replace("### ", "")}</h4>;
      }
      // Header 2
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="botH3">{line.replace("## ", "")}</h3>;
      }
      // Blockquote
      if (line.startsWith("> ")) {
        return <blockquote key={idx} className="botQuote">{line.replace("> ", "")}</blockquote>;
      }
      // Bullet point
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const content = line.substring(2);
        return (
          <li key={idx} className="botLi">
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={idx} className="botNum">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          </p>
        );
      }
      // Horizontal Rule
      if (line.trim() === "---") {
        return <hr key={idx} className="botHr" />;
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: "6px" }} />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="botP">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>");
  };

  // Full page view rendering
  if (isFullPage) {
    return (
      <div className="fullPageChatContainer">
        <div className="fullPageChatHeader">
          <div className="fullPageChatBrand">
            <div className="aiBotAvatar big">
              <span>✦</span>
            </div>
            <div>
              <h2>ScholarBot AI™ Advisor</h2>
              <p>Intelligent Scholarship Matcher, SOP Writer & Document Assistant</p>
            </div>
          </div>
          <div className="fullPageActions">
            <button className="clearChatBtn" onClick={handleClearChat}>
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        {/* Message Window */}
        <div className="chatMessagesArea fullPageMessages">
          {messages.map((m) => (
            <div key={m.id} className={`chatBubbleWrapper ${m.sender}`}>
              <div className="bubbleSenderIcon">
                {m.sender === "bot" ? "✦" : (userProfile?.firstName?.[0] || "👤")}
              </div>
              <div className="chatBubbleContent">
                <div className="chatBubbleText">
                  {m.sender === "bot" ? renderFormattedText(m.text) : m.text}
                </div>

                {m.sender === "bot" && (
                  <button className="copyBtn" onClick={() => handleCopyText(m.text)} title="Copy text">
                    📋 Copy
                  </button>
                )}

                {/* Inline Scholarship Cards */}
                {m.cards && m.cards.length > 0 && (
                  <div className="chatCardsGrid">
                    {m.cards.map((c) => (
                      <div key={c.id} className="chatScholarCard">
                        <div className="cardTop">
                          <span className="cardProvider">{c.provider}</span>
                          <span className="cardAward">{c.amount}</span>
                        </div>
                        <h5 className="cardTitle">{c.title}</h5>
                        <p className="cardEligible">{c.eligibility}</p>
                        <div className="cardFooter">
                          <span className="cardDeadline">⏰ {c.deadline}</span>
                          <button
                            className="cardApplyBtn"
                            onClick={() => onSelectScholarship(c)}
                          >
                            View & Apply →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Pills */}
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="quickRepliesRow">
                    {m.quickReplies.map((r, i) => (
                      <button key={i} className="quickReplyBtn" onClick={() => handleSend(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                <span className="chatTimestamp">{m.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chatBubbleWrapper bot typing">
              <div className="bubbleSenderIcon">✦</div>
              <div className="chatBubbleContent typingBubble">
                <span className="typingDot"></span>
                <span className="typingDot"></span>
                <span className="typingDot"></span>
                <em>ScholarBot is searching scholarships and formulating advice...</em>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="chatInputArea fullPageInput">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chatInputForm"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scholarships, required documents, or ask to write an SOP..."
            />
            <button type="submit" className="chatSendBtn" disabled={!input.trim()}>
              Send ➔
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Floating Widget view rendering
  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          className="floatingAIBtn"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Scholarship Advisor"
        >
          <div className="aiBtnPulseRing"></div>
          <span className="aiBtnSparkle">✦</span>
          <span className="aiBtnLabel">Ask AI Advisor</span>
          <span className="aiOnlineDot"></span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className={`aiChatDrawer ${isExpanded ? "expanded" : ""}`}>
          {/* Header */}
          <div className="aiDrawerHeader">
            <div className="aiHeaderInfo">
              <div className="aiBotAvatar">
                <span>✦</span>
              </div>
              <div>
                <h4>ScholarBot AI™</h4>
                <p>
                  <span className="onlinePulse"></span> Online • AI Scholarship Advisor
                </p>
              </div>
            </div>

            <div className="aiDrawerControls">
              <button
                className="aiCtrlBtn"
                onClick={() => setShowConfig(!showConfig)}
                title="AI Settings & API Key"
              >
                ⚙️
              </button>
              <button
                className="aiCtrlBtn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "🗗" : "🗖"}
              </button>
              <button
                className="aiCtrlBtn"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                🗑️
              </button>
              <button
                className="aiCtrlBtn close"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* AI Configuration Box */}
          {showConfig && (
            <div className="aiConfigDrawer">
              <div className="aiConfigHeader">
                <h5>⚙️ AI Engine Settings</h5>
                <button type="button" onClick={() => setShowConfig(false)}>✕</button>
              </div>
              <p>Connect Google Gemini API for real-time generative responses, or leave empty to use the built-in offline engine.</p>
              <label className="aiConfigInput">
                <span>Gemini API Key:</span>
                <input
                  type="password"
                  placeholder="Paste AIzaSy... key or leave blank"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </label>
              <div className="aiConfigActions">
                <button
                  type="button"
                  className="saveKeyBtn"
                  onClick={() => {
                    localStorage.setItem("sc_gemini_api_key", apiKeyInput.trim());
                    setGeminiApiKey(apiKeyInput.trim());
                    setShowConfig(false);
                    alert("AI settings saved! " + (apiKeyInput.trim() ? "Active: Google Gemini 1.5 Flash." : "Active: Built-in AI Engine."));
                  }}
                >
                  Save Key
                </button>
                <button
                  type="button"
                  className="clearKeyBtn"
                  onClick={() => {
                    localStorage.removeItem("sc_gemini_api_key");
                    setGeminiApiKey("");
                    setApiKeyInput("");
                    setShowConfig(false);
                    alert("Switched to built-in offline AI advisor.");
                  }}
                >
                  Use Built-in Engine
                </button>
              </div>
              <small>
                Free API keys available at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a>
              </small>
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="aiDrawerPrompts">
            {samplePrompts.slice(0, 4).map((p, i) => (
              <button key={i} className="promptChip" onClick={() => handleSend(p)}>
                {p}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="chatMessagesArea">
            {messages.map((m) => (
              <div key={m.id} className={`chatBubbleWrapper ${m.sender}`}>
                <div className="bubbleSenderIcon">
                  {m.sender === "bot" ? "✦" : (userProfile?.firstName?.[0] || "👤")}
                </div>
                <div className="chatBubbleContent">
                  <div className="chatBubbleText">
                    {m.sender === "bot" ? renderFormattedText(m.text) : m.text}
                  </div>

                  {m.sender === "bot" && (
                    <button className="copyBtn" onClick={() => handleCopyText(m.text)} title="Copy text">
                      📋 Copy
                    </button>
                  )}

                  {/* Inline Scholarship Cards */}
                  {m.cards && m.cards.length > 0 && (
                    <div className="chatCardsGrid">
                      {m.cards.map((c) => (
                        <div key={c.id} className="chatScholarCard">
                          <div className="cardTop">
                            <span className="cardProvider">{c.provider}</span>
                            <span className="cardAward">{c.amount}</span>
                          </div>
                          <h5 className="cardTitle">{c.title}</h5>
                          <p className="cardEligible">{c.eligibility}</p>
                          <div className="cardFooter">
                            <span className="cardDeadline">⏰ {c.deadline}</span>
                            <button
                              className="cardApplyBtn"
                              onClick={() => {
                                onSelectScholarship(c);
                                setIsOpen(false);
                              }}
                            >
                              View & Apply →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Reply Pills */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="quickRepliesRow">
                      {m.quickReplies.map((r, i) => (
                        <button key={i} className="quickReplyBtn" onClick={() => handleSend(r)}>
                          {r}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="chatTimestamp">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatBubbleWrapper bot typing">
                <div className="bubbleSenderIcon">✦</div>
                <div className="chatBubbleContent typingBubble">
                  <span className="typingDot"></span>
                  <span className="typingDot"></span>
                  <span className="typingDot"></span>
                  <em>ScholarBot is analyzing...</em>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chatInputArea">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="chatInputForm"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ScholarBot AI..."
              />
              <button type="submit" className="chatSendBtn" disabled={!input.trim()}>
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
