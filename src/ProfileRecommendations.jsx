import React, { useState, useMemo } from "react";
import { scholarships } from "./scholarshipsData.js";
import { getProfileRecommendations, normalizeEducation, checkCourseStreamEligibility } from "./aiEngine.js";
import { useAuth } from "./AuthContext.jsx";

export default function ProfileRecommendations({ user, save, onSelectScholarship, setPage, onOpenChecker }) {
  const [activeFilter, setActiveFilter] = useState("top");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana Kotari";
  const studentId = user?.studentId || "SC-2026-5OAP1P";

  // Run RecommendationEngine against full database
  const allRecommended = useMemo(() => {
    return getProfileRecommendations(user, scholarships);
  }, [user]);

  // Filter into categories
  const filteredList = useMemo(() => {
    if (activeFilter === "top") return allRecommended.slice(0, 6);
    if (activeFilter === "stream") {
      return allRecommended.filter(s => 
        checkCourseStreamEligibility(s.course, user).pass
      );
    }
    if (activeFilter === "high-grant") {
      return allRecommended.filter(s => (s.amountNumeric || 0) >= 100000);
    }
    if (activeFilter === "urgent") {
      return [...allRecommended].sort((a, b) => (a.deadlineDays || 99) - (b.deadlineDays || 99)).slice(0, 6);
    }
    if (activeFilter === "eligible") {
      return allRecommended.filter(s => s.audit?.status === "eligible");
    }
    return allRecommended;
  }, [allRecommended, activeFilter, user]);

  const { toggleFavorite } = useAuth();

  const handleFavorite = async (schId) => {
    if (!user) return;
    if (toggleFavorite) {
      const res = await toggleFavorite(schId);
      showToast(res?.isFavorite ? "❤️ Saved to My Favorites!" : "Removed from favorites.");
    } else {
      const favs = user.favorites || [];
      const isFav = favs.includes(schId);
      const updatedFavs = isFav ? favs.filter(id => id !== schId) : [...favs, schId];
      if (save) save({ ...user, favorites: updatedFavs });
      showToast(isFav ? "Removed from favorites." : "❤️ Saved to My Favorites!");
    }
  };

  return (
    <div className="recommendationsPage">
      {toastMsg && <div className="recsToast">{toastMsg}</div>}

      {/* Hero Banner */}
      <div className="recsHero">
        <div className="recsHeroBadge">
          <span>🧠</span> Powered by RecommendationEngine 2.0
        </div>
        <h1>
          Profile-Based <em>Scholarship Matches</em>
        </h1>
        <p>
          Our machine-learning recommendation engine maps your exact academic stream, family income bracket,
          domicile quota, and marks to identify high-probability grant opportunities.
        </p>

        {/* Student Context Profile Strip */}
        <div className="recsProfileStrip">
          <div className="stripItem">
            <span className="stripLabel">Student</span>
            <strong>{studentName}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">Target Stream</span>
            <strong>{normalizeEducation(user).displayStream || user?.course || "Engineering / B.Tech / B.E"}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">Annual Income</span>
            <strong>{user?.annualIncome || "₹ 1,80,000 / year"}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">State Domicile</span>
            <strong>{user?.state || "Karnataka"}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">Gender</span>
            <strong>{user?.gender || "Female"}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">Category</span>
            <strong>{user?.category || "General"}</strong>
          </div>
          <div className="stripDivider" />
          <div className="stripItem">
            <span className="stripLabel">Verified Status</span>
            <span className="textSuccess">● Profile Ready</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="recsFilterTabsBar">
        {[
          { id: "top", icon: "🌟", label: "Top Profile Matches" },
          { id: "stream", icon: "🎓", label: "Academic Stream Matches" },
          { id: "eligible", icon: "✅", label: "100% Fully Eligible" },
          { id: "high-grant", icon: "💰", label: "High Value (₹1L - ₹3L+)" },
          { id: "urgent", icon: "⏰", label: "Closing Soonest" }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`recsTabBtn ${activeFilter === tab.id ? "active" : ""}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="recsGrid">
        {filteredList.map((item) => {
          const isFav = (user?.favorites || []).includes(item.id);
          return (
            <div key={item.id} className="recCard">
              <div className="recCardHeader">
                <div className="scoreBadgeWrap">
                  <span className="matchScorePill">
                    ⭐ {item.matchScore}% Match
                  </span>
                  {item.highlightBadges?.map(b => (
                    <span key={b} className={`tagPill ${b === "100% Eligible" ? "green" : b === "High Value" ? "blue" : ""}`}>
                      {b}
                    </span>
                  ))}
                </div>
                <button
                  className={`btnFavHeart ${isFav ? "active" : ""}`}
                  onClick={() => handleFavorite(item.id)}
                  title={isFav ? "Remove Favorite" : "Add to Favorites"}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>
              </div>

              <h3>{item.title}</h3>
              <p className="recProvider">Sponsored by <strong>{item.provider}</strong> • {item.course}</p>

              {/* Match Reason Banner */}
              <div className="recReasonBanner">
                <span className="reasonSparkle">💡</span>
                <p><strong>Why Recommended:</strong> {item.fitReason}</p>
              </div>

              <div className="recMetricsRow">
                <div>
                  <small>Award Amount</small>
                  <strong className="textGreen">{item.amount}</strong>
                </div>
                <div>
                  <small>Deadline</small>
                  <strong>{item.deadline}</strong>
                </div>
                <div>
                  <small>Eligibility Cutoff</small>
                  <span>{item.minMarks || "60% Marks"}</span>
                </div>
              </div>

              <div className="recCardActions">
                <button
                  className="btnCheckEligibilityDirect"
                  onClick={() => {
                    if (onOpenChecker) onOpenChecker(item.id);
                    else if (setPage) setPage("eligibility");
                  }}
                >
                  ⚡ Check Eligibility Breakdown
                </button>
                <button
                  className="btnApplyOfficialDirect"
                  onClick={() => {
                    if (item.officialUrl) {
                      window.open(item.officialUrl, "_blank", "noopener,noreferrer");
                    } else if (onSelectScholarship) {
                      onSelectScholarship(item);
                    }
                  }}
                >
                  Apply ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Shortcuts */}
      <div className="recsShortcutsBanner">
        <div className="shortcutItem">
          <span>📁</span>
          <div>
            <strong>Missing Documents?</strong>
            <p>Upload your caste and income certificates to your Document Wallet to ensure 100% verification.</p>
          </div>
          <button onClick={() => setPage && setPage("documents")}>Open Document Locker →</button>
        </div>

        <div className="shortcutItem">
          <span>🎯</span>
          <div>
            <strong>Exploring Other Degrees?</strong>
            <p>Take our AI Stream & Course Selector assessment to discover new fields with high funding.</p>
          </div>
          <button onClick={() => setPage && setPage("stream-selector")}>Open Stream Selector →</button>
        </div>
      </div>
    </div>
  );
}
