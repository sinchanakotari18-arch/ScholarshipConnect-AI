import React, { useState, useEffect, useMemo, useRef } from "react";
import { searchScholarshipsWithAI, extractSearchIntents } from "./aiEngine.js";

export default function AISearchModal({
  isOpen,
  onClose,
  scholarshipsList,
  onSelectScholarship,
  userProfile
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    return searchScholarshipsWithAI(query, scholarshipsList, userProfile);
  }, [query, scholarshipsList, userProfile]);

  const detectedIntents = useMemo(() => {
    if (!query.trim()) return null;
    return extractSearchIntents(query);
  }, [query]);

  if (!isOpen) return null;

  const quickPills = [
    { label: "👩‍🎓 Women in STEM", query: "Scholarships for women in STEM or engineering" },
    { label: "🎓 Undergrads ₹1L+", query: "Undergraduate scholarships with award over 1 lakh" },
    { label: "⏳ Closing Soon", query: "Scholarships closing in the next 20 days" },
    { label: "🏛️ Govt & PSU", query: "Government and public sector scholarships" },
    { label: "🏥 Medical & Healthcare", query: "MBBS and medical student scholarships" },
    { label: "📍 Karnataka / State", query: "Scholarships for Karnataka students" }
  ];

  return (
    <div className="aiModalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="aiModalContainer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="aiModalHeader">
          <div className="aiHeaderBrand">
            <span className="aiSparkle">✦</span>
            <div>
              <h3>ScholarMatch AI™ Semantic Search</h3>
              <p>Type naturally: e.g. "female engineering student looking for ₹1,00,000+ support"</p>
            </div>
          </div>
          <button className="aiCloseBtn" onClick={onClose} aria-label="Close search modal">
            ✕
          </button>
        </div>

        {/* Input Bar */}
        <div className="aiInputWrapper">
          <span className="aiSearchIcon">⌕</span>
          <input
            ref={inputRef}
            type="text"
            className="aiSearchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your course, background, or scholarship goal..."
          />
          {query && (
            <button className="aiClearBtn" onClick={() => setQuery("")}>
              ✕
            </button>
          )}
          <span className="aiEscBadge">ESC</span>
        </div>

        {/* Detected Intents Bar */}
        {detectedIntents && (
          <div className="aiIntentsBar">
            <span className="aiIntentsLabel">AI Extracted Criteria:</span>
            {detectedIntents.education && (
              <span className="aiIntentTag">🎯 Degree: {detectedIntents.education}</span>
            )}
            {detectedIntents.course && (
              <span className="aiIntentTag">📚 Field: {detectedIntents.course}</span>
            )}
            {detectedIntents.gender && (
              <span className="aiIntentTag">👩 Focus: {detectedIntents.gender}</span>
            )}
            {detectedIntents.category && (
              <span className="aiIntentTag">🏷️ Cat: {detectedIntents.category}</span>
            )}
            {detectedIntents.state && (
              <span className="aiIntentTag">📍 State: {detectedIntents.state}</span>
            )}
            {detectedIntents.amountMin && (
              <span className="aiIntentTag">💰 Min: ₹{detectedIntents.amountMin.toLocaleString("en-IN")}</span>
            )}
            {detectedIntents.closingSoon && (
              <span className="aiIntentTag urgent">⚡ Closing Soon</span>
            )}
            {detectedIntents.lowIncome && (
              <span className="aiIntentTag">🤝 Need Based</span>
            )}
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="aiQuickPills">
          <span className="aiPillTitle">Suggestions:</span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              className="aiPillBtn"
              onClick={() => setQuery(pill.query)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="aiResultsList">
          <div className="aiResultsCount">
            Found <strong>{searchResults.length}</strong> matched scholarships
            {query && <span> for "<em>{query}</em>"</span>}
          </div>

          {searchResults.map((item) => (
            <div
              key={item.id}
              className="aiResultCard"
              onClick={() => {
                onSelectScholarship(item);
                onClose();
              }}
            >
              <div className="aiResultLeft">
                <div className="aiResultBadgeRow">
                  <span className="aiScoreBadge" style={{
                    background: item.aiScore >= 85 ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                  }}>
                    ✦ {item.aiScore}% Match
                  </span>
                  <span className="aiProviderTag">{item.provider}</span>
                  {item.tag && <span className="aiStatusTag">{item.tag}</span>}
                </div>

                <h4 className="aiResultTitle">{item.title}</h4>

                <p className="aiMatchReason">
                  <strong>AI Match:</strong> {item.aiReason}
                </p>

                <div className="aiMetaRow">
                  <span>💰 <strong>{item.amount}</strong></span>
                  <span>🎓 {item.education} ({item.course})</span>
                  <span>📍 {item.state}</span>
                  <span>⏰ Deadline: <strong>{item.deadline}</strong></span>
                </div>
              </div>

              <div className="aiResultRight">
                <button
                  className="aiViewBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScholarship(item);
                    onClose();
                  }}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="aiModalFooter">
          <span>💡 Pro Tip: Use the floating <b>✦ AI Advisor</b> to get personalized essay drafts & document checklists.</span>
        </div>
      </div>
    </div>
  );
}
