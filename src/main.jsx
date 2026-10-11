import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import DocumentWallet from "./DocumentWallet.jsx";
import AISearchModal from "./AISearchModal.jsx";
import AIChatWidget from "./AIChatWidget.jsx";
import EducationLoan from "./EducationLoan.jsx";
import ResultsPortal from "./ResultsPortal.jsx";
import AppliedScholarships from "./AppliedScholarships.jsx";
import AwardsAchievements from "./AwardsAchievements.jsx";
import StreamSelector from "./StreamSelector.jsx";
import SettingsView from "./SettingsView.jsx";
import EligibilityChecker from "./EligibilityChecker.jsx";
import ProfileRecommendations from "./ProfileRecommendations.jsx";
import {
  StudentServicesView,
  PartnerView,
  ResourcesView,
  ArticlesView,
  ImpactView,
} from "./MorePortals.jsx";
import { scholarships } from "./scholarshipsData.js";
import { getAllScholarships } from "./scholarshipStore.js";
import { AuthProvider, useAuth, INITIAL_REGISTERED_USERS } from "./AuthContext.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import {
  searchScholarshipsWithAI,
  checkScholarshipEligibility,
  getProfileRecommendations,
  RecommendationEngine,
} from "./aiEngine.js";
import { normalizeEducation } from "./educationUtils.js";

const notices = [
  [
    "18 Sep 2026",
    "Scholarship applications for the 2026–27 academic year are now open.",
  ],
  [
    "14 Sep 2026",
    "Keep your documents verified before submitting applications.",
  ],
  ["08 Sep 2026", "New STEM scholarships have been added to the platform."],
];

const opportunities = [
  "Education Loan",
  "Student Funding Solution",
  "Expert Talk Series",
  "Career Assessment Test",
  "Online Degree",
  "Scholarship Services",
  "College Board",
  "Scholarship Bulletins",
  "Internships",
  "Fellowships",
  "STEP",
  "Student Discounts",
];

function AppContent() {
  const {
    user,
    save,
    login,
    logout,
    isAdmin,
    authModal,
    openLogin,
    openRegister,
    closeAuthModal,
    switchAuthMode,
    systemNotice,
    loginAsAdmin,
    loginAsStudent,
    toggleFavorite,
    isFavorite,
  } = useAuth();

  const [page, setPage] = useState("home"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(null),
    [checkerSchId, setCheckerSchId] = useState(null),
    [menu, setMenu] = useState(false),
    [aiSearchOpen, setAiSearchOpen] = useState(false),
    [scholarshipsInitialTab, setScholarshipsInitialTab] = useState("All Scholarships");

  const openFavorites = () => {
    setScholarshipsInitialTab("My Favorites");
    setPage("scholarships");
    window.scrollTo(0, 0);
  };

  // Dynamic scholarships state
  const [scholarshipsList, setScholarshipsList] = useState(getAllScholarships);

  useEffect(() => {
    const handleSchUpdate = () => setScholarshipsList(getAllScholarships());
    window.addEventListener("sc_scholarships_updated", handleSchUpdate);
    return () => window.removeEventListener("sc_scholarships_updated", handleSchUpdate);
  }, []);

  // Global Ctrl+K / Cmd+K listener for AI Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAiSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goDetail = (s) => {
    setSelected(s);
    setPage("detail");
    window.scrollTo(0, 0);
  };

  const openChecker = (schId = null) => {
    setCheckerSchId(schId);
    setPage("eligibility");
    window.scrollTo(0, 0);
  };

  const setAuth = (mode) => {
    if (mode === "register") openRegister();
    else if (mode) openLogin();
    else closeAuthModal();
  };

  const handleLogout = () => {
    logout();
    setMenu(false);
    setPage("home");
  };

  return (
    <>
      {systemNotice && systemNotice.active && page !== "admin" && (
        <div
          style={{
            background: systemNotice.type === "urgent" ? "#fffbeb" : "#eff6ff",
            color: systemNotice.type === "urgent" ? "#92400e" : "#1e40af",
            borderBottom: "1px solid " + (systemNotice.type === "urgent" ? "#fde68a" : "#bfdbfe"),
            padding: "8px 24px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          <span>{systemNotice.text}</span>
        </div>
      )}

      <Navbar
        page={page}
        user={user}
        isAdmin={isAdmin}
        setPage={setPage}
        menu={menu}
        setMenu={setMenu}
        logout={handleLogout}
        onLogin={() => openLogin()}
        onRegister={() => openRegister()}
        onOpenAISearch={() => setAiSearchOpen(true)}
        openChecker={openChecker}
        loginAsAdmin={loginAsAdmin}
        loginAsStudent={loginAsStudent}
        openFavorites={openFavorites}
      />

      {page === "home" && (
        <Home
          query={query}
          setQuery={setQuery}
          onSelect={goDetail}
          user={user}
          setAuth={setAuth}
          setPage={setPage}
          onOpenAISearch={() => setAiSearchOpen(true)}
          onOpenChecker={(id) => openChecker(id)}
          toggleFavorite={toggleFavorite}
          scholarshipsList={scholarshipsList}
        />
      )}

      {(page === "scholarships" || page === "favorites") && (
        <Scholarships
          user={user}
          save={save}
          onSelect={goDetail}
          onAuth={() => openLogin()}
          onOpenAISearch={() => setAiSearchOpen(true)}
          onOpenChecker={(id) => openChecker(id)}
          initialTab={page === "favorites" ? "My Favorites" : scholarshipsInitialTab}
          scholarshipsList={scholarshipsList}
          toggleFavorite={toggleFavorite}
        />
      )}

      {page === "eligibility" && (
        <EligibilityChecker
          user={user}
          initialScholarshipId={checkerSchId}
          onSelectScholarship={goDetail}
          setPage={setPage}
          onBack={() => setPage("scholarships")}
        />
      )}

      {page === "recommendations" && (
        <ProfileRecommendations
          user={user}
          save={save}
          onSelectScholarship={goDetail}
          setPage={setPage}
          onOpenChecker={(id) => openChecker(id)}
        />
      )}

      {page === "loan" && (
        <EducationLoan
          user={user}
          onAuth={() => openLogin()}
        />
      )}

      {page === "results" && (
        <ResultsPortal
          user={user}
          onAuth={() => openLogin()}
          onSelectScholarship={goDetail}
          setPage={setPage}
        />
      )}

      {page === "applied" && (
        <AppliedScholarships
          user={user}
          onSelect={goDetail}
          setPage={setPage}
        />
      )}

      {page === "awards" && (
        <AwardsAchievements
          user={user}
          setPage={setPage}
        />
      )}

      {page === "services" && (
        <StudentServicesView
          user={user}
          save={save}
          setPage={setPage}
          onSelectScholarship={goDetail}
        />
      )}

      {page === "stream-selector" && (
        <StreamSelector
          user={user}
          save={save}
          setPage={setPage}
          onSelectScholarship={goDetail}
          onBack={() => setPage("services")}
        />
      )}

      {page === "settings" && (
        <SettingsView
          user={user}
          save={save}
          setPage={setPage}
          onLogout={logout}
        />
      )}

      {page === "partner" && (
        <PartnerView setPage={setPage} />
      )}

      {page === "resources" && (
        <ResourcesView setPage={setPage} />
      )}

      {page === "articles" && (
        <ArticlesView />
      )}

      {page === "impact" && (
        <ImpactView />
      )}

      {page === "admin" && (
        <AdminDashboard
          setPage={setPage}
          onSelectScholarship={goDetail}
        />
      )}

      {page === "detail" && (
        <Detail
          item={selected}
          user={user}
          save={save}
          onBack={() => setPage("scholarships")}
          onAuth={() => openLogin()}
          onOpenChecker={(id) => openChecker(id)}
          toggleFavorite={toggleFavorite}
        />
      )}

      {page === "profile" && (
        <Profile
          user={user}
          save={save}
          onSelect={goDetail}
          setPage={setPage}
          loginAsStudent={loginAsStudent}
          openFavorites={openFavorites}
        />
      )}

      {page === "documents" && (
        <DocumentWallet
          user={user}
          save={save}
          onSelect={goDetail}
          setPage={setPage}
        />
      )}

      {page === "ai-chat" && (
        <AIChatWidget
          scholarshipsList={scholarshipsList}
          onSelectScholarship={goDetail}
          userProfile={user}
          isFullPage={true}
          onNavigateToWallet={() => setPage("documents")}
        />
      )}

      {/* Floating AI Chat Assistant across all screens */}
      {page !== "ai-chat" && page !== "admin" && (
        <AIChatWidget
          scholarshipsList={scholarshipsList}
          onSelectScholarship={goDetail}
          userProfile={user}
          isFullPage={false}
          onNavigateToWallet={() => setPage("documents")}
        />
      )}

      {/* AI Semantic Search Modal */}
      <AISearchModal
        isOpen={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
        scholarshipsList={scholarshipsList}
        onSelectScholarship={goDetail}
        userProfile={user}
      />

      {authModal.isOpen && (
        <AuthModal
          mode={authModal.mode}
          close={closeAuthModal}
          setPage={setPage}
          onLogin={async (userData) => {
            const res = await login(userData);
            if (res?.success) {
              if (res.user?.isAdmin || res.user?.role === "admin") {
                setPage("admin");
              }
              closeAuthModal();
            }
            return res;
          }}
          onDemoLogin={(role) => {
            if (role === "admin") {
              loginAsAdmin();
              setPage("admin");
              closeAuthModal();
            } else {
              loginAsStudent();
              closeAuthModal();
            }
          }}
          onSwitchLogin={() => switchAuthMode("login")}
          onSwitchRegister={() => switchAuthMode("register")}
        />
      )}
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#0f172a",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          textAlign: "center",
        }}>
          <div style={{
            background: "rgba(30, 41, 59, 0.8)",
            padding: "36px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            maxWidth: "520px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ fontSize: "42px", marginBottom: "16px" }}>⚡</div>
            <h2 style={{ fontSize: "22px", margin: "0 0 10px" }}>Application Session Restored</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
              A temporary interface issue occurred. Click below to continue seamlessly with your session.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ↻ Reload Application
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("sc-user");
                  window.location.reload();
                }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
function Navbar({
  page,
  user,
  isAdmin,
  setPage,
  menu,
  setMenu,
  logout,
  onLogin,
  onRegister,
  onOpenAISearch,
  openChecker,
  loginAsAdmin,
  loginAsStudent,
  openFavorites,
}) {
  const [mobile, setMobile] = useState(false),
    [servicesHover, setServicesHover] = useState(false),
    [moreHover, setMoreHover] = useState(false),
    ref = useRef();
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setMenu(false);
        setMoreHover(false);
        setServicesHover(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [setMenu]);

  const moreNav = [
    { label: "Become a Partner", target: "partner" },
    { label: "Resources & Guides", target: "resources" },
    { label: "Articles & News", target: "articles" },
    { label: "Impact Stories", target: "impact" },
    { label: "All Scholarships", target: "scholarships" },
    { label: "🛡️ Admin Console", target: "admin" },
  ];

  const route = (x) => {
    if (x === "Home" || x === "home") {
      setPage("home");
    } else if (x === "Education Loan" || x === "loan") {
      setPage("loan");
    } else if (x === "Student Services" || x === "Student Services ▾" || x === "services") {
      setPage("services");
    } else if (x === "Results" || x === "results") {
      setPage("results");
    } else if (x === "admin" || x === "Admin" || x === "Admin Portal") {
      setPage("admin");
    } else if (x === "Become a Partner" || x === "partner") {
      setPage("partner");
    } else if (x === "Resources" || x === "resources") {
      setPage("resources");
    } else if (x === "Articles" || x === "articles") {
      setPage("articles");
    } else if (x === "Impact" || x === "impact") {
      setPage("impact");
    } else if (x === "Scholarships" || x === "All Scholarships" || x === "scholarships") {
      setPage("scholarships");
    } else {
      setPage("home");
    }
    setMobile(false);
    setMenu(false);
    setMoreHover(false);
    setServicesHover(false);
    window.scrollTo(0, 0);
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  return (
    <header className="nav" ref={ref}>
      <button className="brand" onClick={() => route("home")}>
        <span>✦</span> ScholarshipConnect <i>AI</i>
      </button>

      <button
        className="hamburger"
        aria-label="Open navigation"
        aria-expanded={mobile}
        onClick={() => setMobile(!mobile)}
      >
        ☰
      </button>

      <nav className={mobile ? "mobileOpen" : ""}>
        {/* Home - replaced Scholarships per user request */}
        <button
          className={page === "home" ? "navActive" : ""}
          onClick={() => route("home")}
        >
          Home
        </button>

        {/* Education Loan */}
        <button
          className={page === "loan" ? "navActive" : ""}
          onClick={() => route("loan")}
        >
          Education Loan
        </button>

        {/* Student Services ▾ */}
        <div
          className="navDropdownWrapper"
          onMouseEnter={() => setServicesHover(true)}
          onMouseLeave={() => setServicesHover(false)}
        >
          <button
            className={`navDropdownTrigger ${page === "services" ? "navActive" : ""}`}
            onClick={() => route("services")}
            type="button"
          >
            Student Services <small>▾</small>
          </button>
          {servicesHover && !mobile && (
            <div className="navDropdownMenu">
              <button onClick={() => route("services")}>✨ Student Services Hub</button>
              <button onClick={() => { setPage("recommendations"); setServicesHover(false); }}>🎯 AI Recommendations</button>
              <button onClick={() => { if (openChecker) openChecker(null); else setPage("eligibility"); setServicesHover(false); }}>⚡ Eligibility Checker</button>
              <button onClick={() => { setPage("documents"); setServicesHover(false); }}>📁 Document Vault</button>
              <button onClick={() => route("scholarships")}>🎓 Scholarship Directory</button>
            </div>
          )}
        </div>

        {/* Results */}
        <button
          className={page === "results" ? "navActive" : ""}
          onClick={() => route("results")}
        >
          Results
        </button>

        {/* More ▾ dropdown for desktop, or direct items for mobile */}
        {!mobile ? (
          <div
            className="navMoreWrapper"
            onMouseEnter={() => setMoreHover(true)}
            onMouseLeave={() => setMoreHover(false)}
          >
            <button
              className={`navMoreTrigger ${["partner", "resources", "articles", "impact", "admin"].includes(page) ? "navActive" : ""}`}
              type="button"
            >
              More <small>▾</small>
            </button>
            {moreHover && (
              <div className="navMoreDropdown">
                {moreNav.map((x) => (
                  <button key={x.target} onClick={() => route(x.target)}>
                    {x.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          moreNav.map((x) => (
            <button key={x.target} onClick={() => route(x.target)}>
              {x.label}
            </button>
          ))
        )}
      </nav>

      <div className="navRight">
        <button
          className="navAISearchBtn"
          onClick={onOpenAISearch}
          title="Open AI Semantic Search (Ctrl+K)"
        >
          <span>✨</span> AI Search <kbd>Ctrl+K</kbd>
        </button>

        <button
          className={`adminNavShortcut ${page === "admin" ? "navActive navAdminHighlight" : ""}`}
          onClick={() => route("admin")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: isAdmin ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "rgba(99, 102, 241, 0.08)",
            color: isAdmin ? "#ffffff" : "#4f46e5",
            border: isAdmin ? "none" : "1px solid rgba(99, 102, 241, 0.25)",
            padding: "6px 12px",
            borderRadius: "18px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          title="Open Central Administration Console"
        >
          <span>🛡️</span> Admin Portal
        </button>

        {user ? (
          <>
            <button
              className="profileTrigger"
              aria-haspopup="menu"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" />
              ) : (
                <b>{initials}</b>
              )}
              <span>
                {user.firstName} {user.lastName}
                <small>⌄</small>
              </span>
            </button>
            {menu && (
              <div className="dropdown" role="menu">
                <p>
                  {isAdmin ? "Admin ID:" : "Student ID:"} <strong>{user.studentId}</strong>
                </p>
                <hr />
                {isAdmin ? (
                  <>
                    <button
                      role="menuitem"
                      style={{
                        background: "#eef2ff",
                        color: "#4338ca",
                        fontWeight: "700",
                        borderLeft: "3px solid #4f46e5",
                        textAlign: "left"
                      }}
                      onClick={() => {
                        setPage("admin");
                        setMenu(false);
                      }}
                    >
                      🛡️ Admin Console (Full Access)
                    </button>
                    <button
                      role="menuitem"
                      style={{
                        background: "#f0fdf4",
                        color: "#15803d",
                        fontWeight: "700",
                        borderLeft: "3px solid #16a34a",
                        textAlign: "left"
                      }}
                      onClick={async () => {
                        if (loginAsStudent) await loginAsStudent();
                        setPage("home");
                        setMenu(false);
                      }}
                    >
                      🎓 Switch to Student Profile
                    </button>
                    <hr />
                  </>
                ) : (
                  <>
                    <button
                      role="menuitem"
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: "700",
                        borderLeft: "3px solid #2563eb",
                        textAlign: "left"
                      }}
                      onClick={() => {
                        if (loginAsAdmin) loginAsAdmin();
                        setPage("admin");
                        setMenu(false);
                      }}
                    >
                      🛡️ Switch to Admin Portal
                    </button>
                    <hr />
                  </>
                )}
                {[
                  ["✦", "AI Advisor & SOP Writer"],
                  ["🎯", "Profile Recommendations"],
                  ["⚡", "Eligibility Checker"],
                  ["✨", "AI Semantic Search"],
                  ["👤", "My Profile"],
                  ["📁", "My Document Wallet"],
                  ["🎓", "Matched Scholarships"],
                  ["📄", "Applied Scholarships"],
                  ["💰", "Education Loan"],
                  ["🎯", "My Stream Selector"],
                  ["❤️", "My Favorites"],
                  ["🏆", "Awards & Achievements"],
                  ["⚙️", "Settings"],
                  ["💬", "Support"],
                ].map(([icon, label]) => (
                  <button
                    role="menuitem"
                    onClick={() => {
                      if (label === "AI Advisor & SOP Writer") setPage("ai-chat");
                      else if (label === "Profile Recommendations") setPage("recommendations");
                      else if (label === "Eligibility Checker") {
                        if (openChecker) openChecker(null);
                        else setPage("eligibility");
                      }
                      else if (label === "AI Semantic Search") onOpenAISearch();
                      else if (label === "My Profile") setPage("profile");
                      else if (label === "My Document Wallet") setPage("documents");
                      else if (label === "Education Loan") setPage("loan");
                      else if (label === "Applied Scholarships") setPage("applied");
                      else if (label === "Awards & Achievements") setPage("awards");
                      else if (label === "Matched Scholarships") setPage("scholarships");
                      else if (label === "My Favorites") {
                        if (openFavorites) openFavorites();
                        else setPage("scholarships");
                      }
                      else if (label === "My Stream Selector") setPage("stream-selector");
                      else if (label === "Settings" || label === "Support") setPage("settings");
                      setMenu(false);
                    }}
                    key={label}
                  >
                    {icon} {label}
                  </button>
                ))}
                <hr />
                <button role="menuitem" onClick={logout}>
                  🚪 Log Out
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="textBtn" onClick={onLogin}>
              Login
            </button>
            <button className="register" onClick={onRegister}>
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}
function Home({ query, setQuery, onSelect, user, setAuth, setPage, onOpenAISearch, onOpenChecker, toggleFavorite, scholarshipsList }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setSlide((x) => (x + 1) % scholarships.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);
  const s = scholarships[slide];
  const found = scholarships.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.provider.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main>
      <div className="ticker">
        <b>LATEST NEWS</b>
        <span>
          Application Closing in 3 Days &nbsp;|&nbsp; OakNorth Scholarship and Mentorship
          Programme 2026–27 &nbsp;&nbsp;&nbsp; Application Closing in 48 Hours &nbsp;|&nbsp; SBI Platinum
          Jubilee Asha Scholarship 2026
        </span>
      </div>
      <section className="hero">
        <div className="eyebrow">
          LIVE SCHOLARSHIPS
          <span>● Applications open</span>
        </div>
        <div className="carousel" style={{ "--accent": s.color }}>
          <div className="heroCopy">
            <p className="provider">{s.provider}</p>
            <h1>{s.title}</h1>
            <p className="heroDesc">{s.description}</p>
            <div className="facts">
              <div>
                <small>AWARD</small>
                <strong>{s.amount}</strong>
              </div>
              <div>
                <small>FOR</small>
                <strong>{s.eligibility}</strong>
              </div>
            </div>
            <button className="apply" onClick={() => onSelect(s)}>
              View scholarship <b>→</b>
            </button>
          </div>
          <div className="heroVisual">
            <div className="orb"></div>
            <span className="providerMark">
              {s.provider
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 3)}
            </span>
            <p>{s.tag}</p>
          </div>
          <button
            className="prev"
            onClick={() =>
              setSlide((slide + scholarships.length - 1) % scholarships.length)
            }
          >
            ‹
          </button>
          <button
            className="next"
            onClick={() => setSlide((slide + 1) % scholarships.length)}
          >
            ›
          </button>
          <div className="dots">
            {scholarships.map((_, i) => (
              <button
                className={i === slide ? "active" : ""}
                onClick={() => setSlide(i)}
                key={i}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="searchSection">
        <h2>
          Find the right opportunity for <em>your future.</em>
        </h2>

        {/* AI Semantic Search Banner */}
        <div className="homeAIBanner" onClick={onOpenAISearch}>
          <div className="homeAIBannerLeft">
            <span>✦ ScholarMatch AI™</span>
            Try natural language search: "Women in STEM", "Karnataka Undergrad", "Aid &gt; 1 Lakh"
          </div>
          <button type="button" className="homeAIBannerBtn">
            Launch AI Search ➔
          </button>
        </div>

        {/* RecommendationEngine & EligibilityChecker Quick Access Modules */}
        <div className="homeAIModulesGrid">
          <div
            className="homeAIModuleCard recs"
            onClick={() => setPage("recommendations")}
          >
            <div className="homeAIModuleIcon">🎯</div>
            <div className="homeAIModuleText">
              <span className="homeAIModuleBadge">RecommendationEngine 2.0</span>
              <h4>Profile-Based Recommendations</h4>
              <p>AI maps your exact degree stream, state domicile, marks, and family income to match top-fit schemes.</p>
              <span className="homeAIModuleLink">View Personalized Matches ➔</span>
            </div>
          </div>

          <div
            className="homeAIModuleCard checker"
            onClick={() => {
              if (onOpenChecker) onOpenChecker(null);
              else setPage("eligibility");
            }}
          >
            <div className="homeAIModuleIcon">⚡</div>
            <div className="homeAIModuleText">
              <span className="homeAIModuleBadge yellow">Instant 8-Factor Audit</span>
              <h4>Automated Eligibility Checker</h4>
              <p>Audit marks cutoffs, income ceilings, and quota rules across all scholarships in real time.</p>
              <span className="homeAIModuleLink">Check Eligibility Now ➔</span>
            </div>
          </div>
        </div>

        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenAISearch();
          }}
        >
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships, courses, providers, or ask AI..."
          />
          <button type="submit">AI Search</button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", margin: "14px auto 0", maxWidth: "700px" }}>
          {[
            "Women in STEM",
            "Undergraduate ₹1L+",
            "Closing in 15 days",
            "Medical & MBBS",
            "Engineering All-India"
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              className="promptChip"
              onClick={() => {
                setQuery(chip);
                onOpenAISearch();
              }}
            >
              ✦ {chip}
            </button>
          ))}
        </div>

        {query && (
          <div className="results">
            {found.map((s) => (
              <button key={s.id} onClick={() => onSelect(s)}>
                {s.title}
                <span>{s.provider}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      <Stats />
      <section className="opportunities">
        <div className="sectionTitle">
          <p>BEYOND SCHOLARSHIPS</p>
          <h2>More Opportunities</h2>
          <span>Everything you need to keep moving forward.</span>
        </div>
        <div className="opGrid">
          {opportunities.map((x, i) => (
            <button
              className="op"
              key={x}
              onClick={() => {
                if (x === "Education Loan") setPage("loan");
                else if (x === "Scholarship Services" || x === "Student Funding Solution") setPage("services");
                else if (x === "Scholarship Bulletins") setPage("articles");
                else if (x === "STEP" || x === "Fellowships" || x === "Internships") setPage("scholarships");
                else setPage("services");
              }}
            >
              <b>{["◈", "₹", "◌", "⌁", "▤", "✦"][i % 6]}</b>
              {x}
              <i>→</i>
            </button>
          ))}
        </div>
      </section>
      <Partners onBecomePartner={() => setPage("partner")} />
      <section className="featured">
        <div className="sectionTitle">
          <p>HANDPICKED FOR YOU</p>
          <h2>Featured Scholarships</h2>
        </div>
        <div className="cardGrid">
          {(scholarshipsList && scholarshipsList.length > 0 ? scholarshipsList : scholarships).slice(0, 3).map((s) => (
            <ScholarCard s={s} key={s.id} onSelect={onSelect} user={user} toggleFavorite={toggleFavorite} />
          ))}
        </div>
        <button className="outline" onClick={() => setPage("scholarships")}>
          Browse all scholarships →
        </button>
      </section>
      <Steps setAuth={setAuth} />
      <section className="notice">
        <div className="sectionTitle">
          <p>STAY UPDATED</p>
          <h2>
            Notice Board <em>– For Students</em>
          </h2>
        </div>
        <div className="noticeCard">
          <header>
            Recent announcements
            <span style={{ cursor: "pointer" }} onClick={() => setPage("articles")}>View all</span>
          </header>
          {notices.map((n) => (
            <article key={n[0]}>
              <i></i>
              <div>
                <small>{n[0]}</small>
                <p>{n[1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Scholars />
      <Footer setPage={setPage} onOpenAISearch={onOpenAISearch} />
    </main>
  );
}
function Stats() {
  return (
    <section className="stats">
      <div>
        <b>
          15,000<sup>+</sup>
        </b>
        <span>Scholarships</span>
      </div>
      <div>
        <b>
          14M<sup>+</sup>
        </b>
        <span>Students reached</span>
      </div>
      <div>
        <b>
          153K<sup>+</sup>
        </b>
        <span>Students helped</span>
      </div>
      <div>
        <b>
          ₹900<sup>+ Cr</sup>
        </b>
        <span>Funding opportunities</span>
      </div>
      <p>Illustrative platform milestones</p>
    </section>
  );
}
function Partners({ onBecomePartner }) {
  return (
    <section className="partners">
      <div>
        <p className="eyebrow">TRUSTED COLLABORATORS</p>
        <h2>
          Our <em>Partners</em>
        </h2>
        <div className="logos">
          {[
            "SBI Foundation",
            "LG",
            "Kotak",
            "Infosys",
            "Tata Capital",
            "DXC",
            "L’Oréal",
            "Amazon",
            "Mahindra",
          ].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </div>
      <aside>
        <p>WORK WITH US</p>
        <h3>
          Become our
          <br />
          <em>partner.</em>
        </h3>
        <span>
          Join a community committed to making quality education more accessible
          for every learner.
        </span>
        <button onClick={onBecomePartner}>Become a partner →</button>
      </aside>
    </section>
  );
}
function ScholarCard({ s, onSelect, user, toggleFavorite }) {
  const isFav = Boolean(user?.favorites?.includes(s.id) || user?.favorites?.includes(s._id));
  return (
    <article className="scholarCard" style={{ position: "relative" }}>
      {toggleFavorite && (
        <button
          className={`heart ${isFav ? "active" : ""}`}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: isFav ? "#e11d48" : "#94a3b8",
            zIndex: 3,
            transition: "transform 0.2s ease",
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(s.id);
          }}
        >
          {isFav ? "❤️" : "♡"}
        </button>
      )}
      <div className="cardLogo" style={{ background: s.color }}>
        {s.provider
          .split(" ")
          .map((x) => x[0])
          .join("")
          .slice(0, 2)}
      </div>
      <span className="deadline">Deadline · {s.deadline}</span>
      <h3>{s.title}</h3>
      <p>{s.description}</p>
      <footer>
        <b>{s.amount}</b>
        <button onClick={() => onSelect(s)}>View details →</button>
      </footer>
    </article>
  );
}
function Steps({ setAuth }) {
  return (
    <section className="steps">
      <div className="sectionTitle">
        <p>SIMPLE. GUIDED. YOURS.</p>
        <h2>
          Steps To Follow For Getting A <em>Scholarship</em>
        </h2>
      </div>
      <div className="stepGrid">
        {[
          [
            "01",
            "Create your profile",
            "Tell us about you, your education, and ambitions.",
          ],
          [
            "02",
            "Search scholarships",
            "Find opportunities matched to your goals.",
          ],
          [
            "03",
            "Apply with confidence",
            "Submit your application and track its progress.",
          ],
        ].map((x) => (
          <article key={x[0]}>
            <b>{x[0]}</b>
            <i>{x[0] === "01" ? "◉" : x[0] === "02" ? "⌕" : "✓"}</i>
            <h3>{x[1]}</h3>
            <p>{x[2]}</p>
          </article>
        ))}
      </div>
      <button className="apply" onClick={() => setAuth("register")}>
        Register now →
      </button>
    </section>
  );
}
function Scholars() {
  return (
    <section className="scholars">
      <div className="sectionTitle">
        <p>THEIR NEXT CHAPTER</p>
        <h2>Our Scholars</h2>
        <span>Stories shown are sample community profiles.</span>
      </div>
      <div className="testimonials">
        {[
          ["AS", "Aanya Singh", "Engineering student"],
          ["RK", "Rohan Kumar", "Commerce student"],
          ["PM", "Priya Menon", "Medical student"],
        ].map((x) => (
          <article key={x[1]}>
            <b>{x[0]}</b>
            <blockquote>
              “ScholarshipConnect made the process feel clear and within reach.”
            </blockquote>
            <footer>
              <strong>{x[1]}</strong>
              <span>{x[2]}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
function Scholarships({
  user,
  save,
  onSelect,
  onAuth,
  onOpenAISearch,
  onOpenChecker,
  initialTab = "All Scholarships",
  scholarshipsList,
  toggleFavorite,
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(initialTab);
  const [sort, setSort] = useState("Recommended");
  const [filters, setFilters] = useState({
    education: "",
    state: "",
    category: "",
    course: "",
    class: "",
    country: "",
    gender: "",
    religion: "",
  });

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  /*
    Individual filter sections.
    Class and Country are open by default.
    The other sections are closed by default.
  */
  const [openGroups, setOpenGroups] = useState({
    class: true,
    country: false,
    gender: false,
    religion: false,
    state: false,
    course: false,
  });
  const toggle = (k, v) => {
    setFilters({
      ...filters,
      [k]: filters[k] === v ? "" : v,
    });
  };
  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const newState = {
        class: false,
        country: false,
        gender: false,
        religion: false,
        state: false,
        course: false,
      };
      newState[key] = !prev[key];
      return newState;
    });
  };

  const activeList = scholarshipsList && scholarshipsList.length > 0 ? scholarshipsList : scholarships;

  let items = [];
  if (tab === "✦ AI Match") {
    items = searchScholarshipsWithAI(q || "undergraduate engineering merit need women", activeList, user);
  } else if (tab === "For You") {
    // RecommendationEngine Profile Matches
    const recs = getProfileRecommendations(user, activeList);
    items = recs.filter(
      (s) =>
        Object.values(s).join(" ").toLowerCase().includes(q.toLowerCase()) &&
        Object.entries(filters).every(([k, v]) => !v || s[k] === v)
    );
  } else if (tab === "My Favorites") {
    const favIds = user?.favorites || [];
    items = activeList.filter(
      (s) =>
        (favIds.includes(s.id) || favIds.includes(s._id)) &&
        Object.values(s).join(" ").toLowerCase().includes(q.toLowerCase()) &&
        Object.entries(filters).every(([k, v]) => !v || s[k] === v)
    );
  } else {
    items = activeList.filter(
      (s) =>
        Object.values(s).join(" ").toLowerCase().includes(q.toLowerCase()) &&
        Object.entries(filters).every(([k, v]) => !v || s[k] === v)
    );
  }
  if (tab === "Closing Soon")
    items = [...items].sort((a, b) => (a.deadlineDays || 99) - (b.deadlineDays || 99));
  if (tab === "New") items = items.filter((s) => s.tag === "New");
  if (sort === "Alphabetical")
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "✦ AI Match Score")
    items = searchScholarshipsWithAI(q || "merit", items, user);
  if (sort === "Award: Highest")
    items = [...items].sort(
      (a, b) =>
        (b.amountNumeric || 0) - (a.amountNumeric || 0),
    );
  const favorite = async (s) => {
    if (!user) return onAuth();
    if (toggleFavorite) {
      await toggleFavorite(s.id);
    } else {
      const favorites = user.favorites || [];
      const isFav = favorites.includes(s.id);
      save({
        ...user,
        favorites: isFav
          ? favorites.filter((x) => x !== s.id)
          : Array.from(new Set([...favorites, s.id])),
      });
    }
  };
  const clearFilters = () => {
    setFilters({
      education: "",
      state: "",
      category: "",
      course: "",
      class: "",
      country: "",
      gender: "",
      religion: "",
    });
  };
  const group = (title, key, vals) => (
    <div className="filterGroup">
      <button
        type="button"
        className="filterGroupHeader"
        onClick={() => toggleGroup(key)}
        aria-expanded={openGroups[key]}
      >
        <b>{title}</b>
        <span>{openGroups[key] ? "⌃" : "⌄"}</span>
      </button>
      {openGroups[key] && (
        <div
          className={`filterOptions ${key === "class" || key === "state" ? "scrollableOptions" : ""}`}
        >
          {vals.map((v) => (
            <label key={v}>
              <input
                type="checkbox"
                checked={filters[key] === v}
                onChange={() => toggle(key, v)}
              />
              {v}
            </label>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <main className="scholarshipsPage">
      <section className="scholarHero">
        <p>DISCOVER OPPORTUNITIES</p>
        <h1>
          Find Scholarships That Match <em>You</em>
        </h1>
        <span>
          Discover scholarships based on your education, category, location,
          academic performance and financial needs.
        </span>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenAISearch();
          }}
        >
          <span>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search scholarships, providers, courses..."
          />
          <button type="submit">AI Search</button>
        </form>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "14px" }}>
          <button
            type="button"
            className="navAISearchBtn"
            onClick={onOpenAISearch}
            title="Open AI Semantic Search"
          >
            <span>✨</span> Launch ScholarMatch AI™ Semantic Search (Ctrl+K)
          </button>
        </div>
      </section>
      <div className="quickTabs">
        {["All Scholarships", "✦ AI Match", "For You", "My Favorites", "Closing Soon", "New"].map((x) => (
          <button
            className={tab === x ? "selected" : ""}
            onClick={() => {
              if ((x === "For You" || x === "My Favorites") && !user) return onAuth();
              setTab(x);
            }}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <section className="discovery">
        {/* FILTER SIDEBAR ALWAYS VISIBLE */}
        <aside className="filters">
          <div className="filtersHeader">
            <h3>Filters</h3>
            <button onClick={clearFilters}>Clear all</button>
          </div>
          {group("Select Class", "class", [
            "Upto Class 8",
            "Class 9",
            "Class 10",
            "Class 11",
            "Class 12",
            "Graduation",
            "Post Graduation",
            "Post Graduation Diploma",
            "Phd",
            "ITI",
            "Polytechnic/Diploma",
            "Post Doctoral",
            "Vocational Course",
            "Coaching Class",
          ])}
          {group("Select Country", "country", ["India", "Study Abroad"])}
          {group("Gender", "gender", ["Female", "Male", "Third/Transgender"])}
          {group("Religion", "religion", [
            "Buddhism",
            "Christian",
            "Hindu",
            "Jain",
            "Parsi",
            "Sikh",
            "Muslim",
          ])}
          {group("State", "state", [
            "Andaman and Nicobar",
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chandigarh",
            "Chhattisgarh",
            "Dadra And Nagar Haveli",
            "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jammu And Kashmir",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Ladakh",
            "Lakshadweep",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Puducherry",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Tripura",
            "Uttar Pradesh",
            "Uttarkhand",
            "West Bengal",
            "Others",
          ])}
          {group("Course", "course", [
            "Engineering",
            "Medical",
            "Management",
            "Fellowship",
            "Talent",
            "Sports",
          ])}
        </aside>
        {/* SCHOLARSHIP RESULTS */}
        <div className="resultsArea">
          <header>
            <div>
              <h2>{tab === "My Favorites" ? "My Favourite Scholarships" : "Scholarships"}</h2>
              <span>
                {items.length} {tab === "My Favorites" ? "Favourites" : "Scholarships"} Found
              </span>
            </div>
            <label>
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Recommended</option>
                <option>✦ AI Match Score</option>
                <option>Deadline: Soonest</option>
                <option>Award: Highest</option>
                <option>Alphabetical</option>
              </select>
            </label>
          </header>
          {items.length ? (
            <div className="discoveryGrid">
              {items.map((s) => (
                <article
                  className="discoveryCard"
                  key={s.id}
                  onClick={() => onSelect(s)}
                >
                  <button
                    className={`heart ${user?.favorites?.includes(s.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      favorite(s);
                    }}
                    title={user?.favorites?.includes(s.id) ? "Remove from favourites" : "Add to favourites"}
                  >
                    {user?.favorites?.includes(s.id) ? "❤️" : "♡"}
                  </button>
                  <div className="cardLogo" style={{ background: s.color }}>
                    {s.provider.slice(0, 2)}
                  </div>
                  {s.aiScore && (
                    <div style={{ marginBottom: "6px" }}>
                      <span className="aiScoreBadge" style={{ background: s.aiScore >= 85 ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                        ✦ {s.aiScore}% Match
                      </span>
                    </div>
                  )}
                  <small>
                    {s.provider}
                    {" · "}
                    {s.featured && "✓ Verified"}
                  </small>
                  <h3>{s.title}</h3>
                  <p>
                    🎓 {s.education}  ·   📍 {s.state}
                  </p>
                  <div>
                    <span>
                      Award
                      <b>{s.amount}</b>
                    </span>
                    <span>
                      Deadline
                      <b>{s.deadline}</b>
                    </span>
                  </div>

                  <div className="cardActionRow">
                    <button
                      type="button"
                      className="quickCheckerBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenChecker) onOpenChecker(s.id);
                      }}
                      title="Run real-time Eligibility Check"
                    >
                      ⚡ Check Eligibility
                    </button>
                    {s.fitReason && (
                      <span className="miniFitBadge" title={s.fitReason}>
                        🎯 {s.fitReason.length > 25 ? s.fitReason.slice(0, 23) + "..." : s.fitReason}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyResults">
              {tab === "My Favorites" ? (
                <>
                  <h3>No favourites yet</h3>
                  <p style={{ color: "#64748b", margin: "8px 0 16px" }}>
                    Click the ❤️ icon on any scholarship to save it to your favourites list.
                  </p>
                  <button className="outline" onClick={() => setTab("All Scholarships")}>
                    Explore Scholarships
                  </button>
                </>
              ) : (
                <>
                  <h3>No scholarships match your current filters.</h3>
                  <button className="outline" onClick={clearFilters}>
                    Clear filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="collection">
        <div className="sectionTitle">
          <p>DON’T MISS OUT</p>
          <h2>Closing Soon</h2>
        </div>
        <div className="cardGrid">
          {[...scholarships].slice(0, 3).map((s) => (
            <ScholarCard key={s.id} s={s} onSelect={onSelect} user={user} toggleFavorite={favorite} />
          ))}
        </div>
      </section>
      <section className="collection pale">
        <div className="sectionTitle">
          <p>CURATED OPPORTUNITIES</p>
          <h2>Featured Scholarships</h2>
        </div>
        <div className="cardGrid">
          {scholarships
            .filter((x) => x.featured)
            .map((s) => (
              <ScholarCard key={s.id} s={s} onSelect={onSelect} user={user} toggleFavorite={favorite} />
            ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
function Detail({ item, user, save, onBack, onAuth, onOpenChecker, toggleFavorite }) {
  const [followed, setFollowed] = useState(user?.followed?.includes(item.id));
  const eligibilityResult = user ? checkScholarshipEligibility(item, user) : null;
  const follow = () => {
    if (!user) return onAuth();
    const next = {
      ...user,
      followed: followed
        ? user.followed.filter((x) => x !== item.id)
        : [...(user.followed || []), item.id],
    };
    save(next);
    setFollowed(!followed);
  };
  const scroll = (id) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  return (
    <main className="detail">
      <button className="back" onClick={onBack}>
        ← Back to scholarships
      </button>
      <section className="detailHero">
        <div className="providerLogo" style={{ background: item.color }}>
          {item.provider
            .split(" ")
            .map((x) => x[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <p>{item.provider}</p>
          <h1>{item.title}</h1>
          <span>
            Deadline: <b>{item.deadline}</b>
          </span>
        </div>
        <aside>
          {/* Apply Now */}
          <button
            className="apply"
            onClick={() =>
              window.open(item.officialUrl, "_blank", "noopener,noreferrer")
            }
          >
            Apply Now ↗
          </button>
          {/* Favourite */}
          <button
            className={`favoriteBtn ${user?.favorites?.includes(item.id) ? "favorited" : "outline"}`}
            onClick={async () => {
              if (!user) return onAuth();
              if (toggleFavorite) {
                await toggleFavorite(item.id);
              } else {
                const favorites = user.favorites || [];
                const isFav = favorites.includes(item.id);
                save({
                  ...user,
                  favorites: isFav
                    ? favorites.filter((x) => x !== item.id)
                    : Array.from(new Set([...favorites, item.id])),
                });
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: user?.favorites?.includes(item.id) ? "1.5px solid #ef4444" : "1.5px solid #cbd5e1",
              background: user?.favorites?.includes(item.id) ? "#fef2f2" : "#ffffff",
              color: user?.favorites?.includes(item.id) ? "#ef4444" : "#475569",
            }}
          >
            <span>{user?.favorites?.includes(item.id) ? "❤️" : "♡"}</span>
            <span>{user?.favorites?.includes(item.id) ? "Favourited" : "Add to Favourites"}</span>
          </button>
          {/* Follow */}
          <button
            className={followed ? "following" : "outline"}
            onClick={follow}
          >
            {followed ? (
              <>✓ Following</>
            ) : (
              <>
                <img
                  src="https://img.icons8.com/?size=100&id=qdiD1wZOvDsv&format=png&color=000000"
                  alt=""
                />
                Follow
              </>
            )}
          </button>
          {/* Info */}
          <span className="tip">
            ⓘ
            <i>
              Follow this page to receive deadline extensions, announcements,
              and result updates.
            </i>
          </span>
        </aside>
      </section>
      <nav className="detailNav">
        {[
          ["about", "About Program"],
          ["scholarships", "Scholarships"],
          ["faq", "FAQ’s"],
          ["contact", "Contact Details"],
          ["Apply Now", "Apply Now"],
        ].map((x) => (
          <button onClick={() => scroll(x[0])} key={x[0]}>
            {x[1]}
          </button>
        ))}
      </nav>
      <div className="detailBody">
        <section id="about">
          <h2>About Program</h2>
          <p>
            {item.description} ScholarshipConnect AI helps you discover this
            opportunity and prepare a strong application. Please review official
            eligibility and terms before applying.
          </p>
        </section>

        {/* Real-time AI Eligibility & Match Compatibility Widget */}
        <section className="detailEligibilityCard">
          <div className="decHeader">
            <div className="decBadge">
              <span className="decIcon">⚡</span>
              <div>
                <h3>AI Eligibility & Criteria Match</h3>
                <p>Instant multi-factor compatibility evaluation for your active profile</p>
              </div>
            </div>
            {eligibilityResult ? (
              <div className={`decScorePill ${eligibilityResult.status}`}>
                <span className="decScoreValue">{eligibilityResult.eligibilityScore}%</span>
                <span className="decStatusLabel">
                  {eligibilityResult.status === "eligible"
                    ? "✓ Fully Eligible"
                    : eligibilityResult.status === "warning"
                    ? "⚠ Conditional Fit"
                    : "✕ Criteria Mismatch"}
                </span>
              </div>
            ) : (
              <button className="decLoginPrompt" onClick={onAuth}>
                Log in to check eligibility
              </button>
            )}
          </div>

          {eligibilityResult && (
            <div className="decBody">
              <p className="decVerdict">{eligibilityResult.verdict}</p>
              <div className="decQuickChecks">
                {eligibilityResult.breakdown.slice(0, 4).map((c, idx) => (
                  <div key={idx} className={`decCheckItem ${c.status}`}>
                    <span className="decCheckIcon">{c.status === "pass" ? "✓" : c.status === "warning" || c.status === "warn" ? "⚠️" : "✕"}</span>
                    <span className="decCheckFactor">{c.factor}:</span>
                    <span className="decCheckReason">{c.notes}</span>
                  </div>
                ))}
              </div>
              <div className="decActions">
                <button
                  type="button"
                  className="decAuditBtn"
                  onClick={() => onOpenChecker && onOpenChecker(item.id)}
                >
                  🔬 View Full 8-Factor Eligibility Audit ➔
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="scholarships">
          <h2>Scholarship details</h2>
          <div className="details">
            <div>
              <small>Scholarship amount</small>
              <b>{item.amount}</b>
            </div>
            <div>
              <small>Who can apply</small>
              <b>{item.eligibility}</b>
            </div>
            <div>
              <small>Application deadline</small>
              <b>{item.deadline}</b>
            </div>
          </div>
          <button
            className="apply"
            onClick={() =>
              window.open(item.officialUrl, "_blank", "noopener,noreferrer")
            }
          >
            Apply on official website ↗
          </button>
        </section>
        <section id="faq">
          <h2>Frequently asked questions</h2>
          <details>
            <summary>How do I apply?</summary>
            <p>
              Use the official application link above. The provider determines
              the final application process.
            </p>
          </details>
          <details>
            <summary>Is there an application fee?</summary>
            <p>
              Never pay an unverified fee. Review the provider’s official
              guidance and our fraud-prevention advice.
            </p>
          </details>
        </section>
        <section id="contact">
          <h2>Contact details</h2>
          <p>
            For programme-specific questions, please use the official provider
            website linked above.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
function Profile({ user, save, onSelect, setPage, loginAsStudent, openFavorites }) {
  const isAdminUser = Boolean(
    user?.role === "admin" ||
    user?.isAdmin === true ||
    user?.email?.toLowerCase() === "admin@scholarshipconnect.org"
  );

  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [data, setData] = useState(user || {});
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [confirmMobile, setConfirmMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.aadhaar || "");
  const [aadhaarVerified, setAadhaarVerified] = useState(Boolean(user?.aadhaarVerified));
  const [aadhaarModalOpen, setAadhaarModalOpen] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar || user?.profilePhoto || "");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    if (user) {
      setData(user);
      if (user.aadhaar !== undefined) setAadhaarNumber(user.aadhaar || "");
      if (user.aadhaarVerified !== undefined) setAadhaarVerified(Boolean(user.aadhaarVerified));
      if (user.whatsapp !== undefined) setWhatsapp(user.whatsapp || "");
      setAvatarUrlInput(user.avatar || user.profilePhoto || "");
    }
  }, [user]);

  useEffect(() => {
    const handleUserUpdate = (e) => {
      if (e.detail) {
        setData((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("sc_user_updated", handleUserUpdate);
    return () => window.removeEventListener("sc_user_updated", handleUserUpdate);
  }, []);
  if (!user)
    return (
      <main className="empty">
        <h1>Please log in to view your profile.</h1>
      </main>
    );
  const handleAadhaarChange = (e) => {
    if (aadhaarVerified) return;
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarNumber(digits);
    setAadhaarError("");
  };

  const handleConfirmAadhaarOtp = () => {
    if (aadhaarOtp.trim().length !== 6) {
      setAadhaarError("Please enter the complete 6-digit verification code.");
      return;
    }
    setAadhaarVerifying(true);
    setAadhaarError("");
    setTimeout(() => {
      setAadhaarVerifying(false);
      setAadhaarVerified(true);
      setAadhaarModalOpen(false);

      const updatedUser = {
        ...user,
        ...data,
        aadhaar: aadhaarNumber,
        aadhaarVerified: true,
      };
      save(updatedUser);
      setData(updatedUser);

      try {
        const regRaw = localStorage.getItem("sc_registered_users");
        if (regRaw) {
          const regList = JSON.parse(regRaw);
          const idx = regList.findIndex(
            (u) =>
              (u.email && u.email.toLowerCase() === updatedUser.email?.toLowerCase()) ||
              (u.phone && u.phone === updatedUser.phone)
          );
          if (idx !== -1) {
            regList[idx] = { ...regList[idx], aadhaar: aadhaarNumber, aadhaarVerified: true };
            localStorage.setItem("sc_registered_users", JSON.stringify(regList));
          }
        }
      } catch (err) {
        console.error("Error updating sc_registered_users:", err);
      }

      showToast("✓ Aadhaar verified successfully with UIDAI! KYC completed.");
    }, 600);
  };

  const handleFieldChange = (key, val) => {
    const raw = {
      ...user,
      ...data,
      [key]: val,
      aadhaar: aadhaarNumber,
      aadhaarVerified: aadhaarVerified,
    };
    const normEdu = normalizeEducation(raw);
    const nextData = {
      ...raw,
      degree: raw.degree !== undefined ? raw.degree : "",
      stream: raw.stream !== undefined ? raw.stream : "",
      education: normEdu.educationStage,
      course: normEdu.displayStream,
    };
    save(nextData);
    setData(nextData);
    showToast("Profile updated successfully! ✓");
  };

  const update = () => {
    const nextPhone = (data.phone !== undefined ? data.phone : user.phone || "").trim();
    const nextEmail = (data.email !== undefined ? data.email : user.email || "").trim();
    const nextWhatsapp = sameAsMobile ? nextPhone : (whatsapp || data.whatsapp || user.whatsapp || nextPhone);

    const merged = {
      ...user,
      ...data,
    };
    const normEdu = normalizeEducation(merged);

    const updatedUser = {
      ...merged,
      firstName: (data.firstName !== undefined ? data.firstName : user.firstName || "").trim(),
      lastName: (data.lastName !== undefined ? data.lastName : user.lastName || "").trim(),
      email: nextEmail,
      phone: nextPhone,
      dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : user.dateOfBirth,
      whatsapp: nextWhatsapp,
      aadhaar: aadhaarNumber,
      aadhaarVerified: aadhaarVerified,
      avatar: avatarUrlInput || data.avatar || user.avatar || "",
      profilePhoto: avatarUrlInput || data.profilePhoto || user.profilePhoto || "",
      degree: data.degree !== undefined ? data.degree : user.degree,
      stream: data.stream !== undefined ? data.stream : user.stream,
      education: normEdu.educationStage,
      course: normEdu.displayStream,
    };
    save(updatedUser);
    setData(updatedUser);
    setEdit(false);

    try {
      const regRaw = localStorage.getItem("sc_registered_users");
      if (regRaw) {
        const regList = JSON.parse(regRaw);
        const idx = regList.findIndex(
          (u) =>
            (u.studentId && u.studentId === updatedUser.studentId) ||
            (u.email && u.email.toLowerCase() === user.email?.toLowerCase()) ||
            (u.phone && u.phone === user.phone)
        );
        if (idx !== -1) {
          regList[idx] = { ...regList[idx], ...updatedUser };
          localStorage.setItem("sc_registered_users", JSON.stringify(regList));
        }
      }
    } catch (err) {
      console.error("Error updating sc_registered_users:", err);
    }

    showToast(isAdminUser ? "Administrator profile saved successfully! ✓" : "All profile changes saved successfully! ✓");
  };
  const updateEmail = () => {
    const email = newEmail.trim();
    const confirm = confirmEmail.trim();
    if (!email || !confirm) {
      alert("Please enter and confirm your new email ID.");
      return;
    }
    if (email !== confirm) {
      alert("Email addresses do not match.");
      return;
    }
    const updatedUser = {
      ...user,
      ...data,
      email: email,
    };
    save(updatedUser);
    setData(updatedUser);
    setNewEmail("");
    setConfirmEmail("");
    setContactModal(null);
    showToast("Email address updated successfully! ✓");
  };
  const updateMobile = () => {
    const mobile = newMobile.trim();
    const confirm = confirmMobile.trim();
    if (!mobile || !confirm) {
      alert("Please enter and confirm your new mobile number.");
      return;
    }
    if (mobile !== confirm) {
      alert("Mobile numbers do not match.");
      return;
    }
    const updatedUser = {
      ...user,
      ...data,
      phone: mobile,
    };
    save(updatedUser);
    setData(updatedUser);
    setNewMobile("");
    setConfirmMobile("");
    setContactModal(null);
    showToast("Mobile number updated successfully! ✓");
  };
  return (
    <main className="profilePage">
      {/* ================= LEFT PROFILE SIDEBAR ================= */}
      <aside className="profileSide">
        <div
          className="profilePhotoWrap"
          onClick={() => setAvatarModalOpen(true)}
          title="Click to update profile photo"
        >
          {data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput ? (
            <img
              src={data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput}
              alt="Avatar"
              style={{
                width: "145px",
                height: "145px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "6px solid #19ef91",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
            />
          ) : (
            <b className="avatar big">
              {(data.firstName?.[0] || user.firstName?.[0] || "A")}
              {(data.lastName?.[0] || user.lastName?.[0] || "S")}
            </b>
          )}
          <span className="profilePhotoEditBadge">📷 Change</span>
        </div>
        <h3>
          {data.firstName !== undefined ? data.firstName : user.firstName}{" "}
          {data.lastName !== undefined ? data.lastName : user.lastName}
        </h3>
        <button className="contactCardBtn">Generate Contact Card</button>
        {aadhaarVerified ? (
          <p className="aadhaarVerified">Aadhaar Verified ✓</p>
        ) : (
          <p className="aadhaarPending">Aadhaar Pending ⚠</p>
        )}
        <hr />
        <nav className="profileNavigation">
          {[
            "My Profile",
            "Profile Recommendations",
            "Eligibility Checker",
            "My Document Wallet",
            "Matched Scholarships",
            "Applied Scholarships",
            "My Stream Selector",
            "My Favorites",
            "Awards & Achievements",
            "Support",
            "Settings",
          ].map((x) => (
            <button
              className={x === "My Profile" ? "chosen" : ""}
              key={x}
              type="button"
              onClick={() => {
                if (x === "My Profile") setPage("profile");
                else if (x === "Profile Recommendations") setPage("recommendations");
                else if (x === "Eligibility Checker") setPage("eligibility");
                else if (x === "My Document Wallet") setPage("documents");
                else if (x === "Matched Scholarships") setPage("scholarships");
                else if (x === "Applied Scholarships") setPage("applied");
                else if (x === "My Stream Selector") setPage("stream-selector");
                else if (x === "My Favorites") {
                  if (openFavorites) openFavorites();
                  else setPage("scholarships");
                }
                else if (x === "Awards & Achievements") setPage("awards");
                else if (x === "Settings" || x === "Support") setPage("settings");
                window.scrollTo(0, 0);
              }}
            >
              <span className="profileNavIcon">◌</span>
              {x}
            </button>
          ))}
        </nav>
      </aside>
      {/* ================= CENTER CONTENT ================= */}
      <section className="profileMain">
        {/* EDUCATION BANNER */}
        <section className="profileBanner">
          <div className="profileBannerContent">
            <div>
              <span>ScholarshipConnect AI</span>
              <h2>Discover More Opportunities.</h2>
              <p>
                Find scholarships, funding opportunities, and resources for your
                education journey.
              </p>
            </div>
            <div className="profileBannerVisual">🎓</div>
          </div>
        </section>
        <div className="profileBannerDots">
          <span></span>
          <span></span>
          <span className="active"></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {/* PROFILE TITLE */}
        <div className="profileHeading">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <p style={{ margin: 0 }}>{isAdminUser ? "🛡️ CENTRAL BOARD ADMINISTRATOR" : "MY PROFILE"}</p>
              {edit && (
                <span className="editIndicatorBadge">
                  ✏️ Edit Mode Active
                </span>
              )}
            </div>
            <h1>
              {data.firstName !== undefined ? data.firstName : user.firstName}{" "}
              {data.lastName !== undefined ? data.lastName : user.lastName}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {edit ? (
              <>
                <button
                  type="button"
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    fontWeight: 700,
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(22, 163, 74, 0.3)"
                  }}
                  onClick={update}
                >
                  ✓ Save Changes
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    setData(user);
                    setWhatsapp(user.whatsapp || "");
                    setEdit(false);
                    showToast("Changes cancelled.");
                  }}
                >
                  ✕ Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="outline"
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 600,
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
                  }}
                  onClick={() => setEdit(true)}
                >
                  ✎ Edit Profile
                </button>
                {isAdminUser && (
                  <>
                    <button
                      type="button"
                      className="outline"
                      style={{
                        background: "#4f46e5",
                        color: "#ffffff",
                        fontWeight: 600,
                        border: "none",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                      onClick={() => setPage("admin")}
                    >
                      🛡️ Admin Console
                    </button>
                    {loginAsStudent && (
                      <button
                        type="button"
                        className="outline"
                        style={{
                          background: "#059669",
                          color: "#ffffff",
                          fontWeight: 600,
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                        onClick={async () => {
                          if (loginAsStudent) await loginAsStudent();
                          setPage("home");
                        }}
                      >
                        🎓 Switch to Student
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ACTIVE EDITING PROMINENT BANNER */}
        {edit && (
          <div className="profileEditActiveBanner">
            <div className="profileEditBannerContent">
              <div className="profileEditBannerIcon">✏️</div>
              <div>
                <strong>Profile Edit Mode Active</strong>
                <p>
                  You can edit your contact information, personal identity details, academic records, and other information directly below. Click "Save All Changes" when finished.
                </p>
              </div>
            </div>
            <div className="profileEditBannerActions">
              <button type="button" className="bannerSaveBtn" onClick={update}>
                ✓ Save All Changes
              </button>
              <button
                type="button"
                className="bannerCancelBtn"
                onClick={() => {
                  setData(user);
                  setWhatsapp(user.whatsapp || "");
                  setEdit(false);
                  showToast("Changes cancelled.");
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {isAdminUser ? (
          <>
            {/* ================= ADMIN PROFILE SECTION ================= */}
            <article className="summary" style={{ borderLeft: "4px solid #4f46e5" }}>
              <div
                className="summaryPhoto"
                onClick={() => setAvatarModalOpen(true)}
                style={{ cursor: "pointer" }}
                title="Click to change administrator photo"
              >
                {data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput ? (
                  <img
                    src={data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput}
                    alt="Admin"
                    style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <b className="avatar" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                    {(data.firstName?.[0] || user.firstName?.[0] || "A")}
                    {(data.lastName?.[0] || user.lastName?.[0] || "D")}
                  </b>
                )}
              </div>
              <div className="summaryActions">
                <button type="button" onClick={() => setEdit(true)}>
                  ✎ <span>Edit</span>
                </button>
                <button type="button" onClick={() => setAvatarModalOpen(true)}>
                  📷 <span>Photo</span>
                </button>
              </div>
              <div className="summaryDetails">
                <div className="contactRow">
                  <strong>Admin ID</strong>
                  <div className="contactValue">
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#4f46e5" }}>
                      {user.studentId || "SC-ADMIN-001"}
                    </span>
                    <em style={{ background: "#e0e7ff", color: "#3730a3", borderRadius: "4px", padding: "2px 8px" }}>
                      Central Authority Verified
                    </em>
                  </div>
                </div>
                <div className="contactRow">
                  <strong>Official Email</strong>
                  <div className="contactValue">
                    {edit ? (
                      <input
                        type="email"
                        value={data.email !== undefined ? data.email : user.email || ""}
                        onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                        style={{ borderBottom: "1.5px solid #4f46e5", padding: "4px 8px", width: "100%", maxWidth: "300px", background: "#f8fafc" }}
                      />
                    ) : (
                      <span>{data.email || user.email}</span>
                    )}
                  </div>
                </div>
                <div className="contactRow">
                  <strong>Official Phone</strong>
                  <div className="contactValue">
                    {edit ? (
                      <input
                        type="tel"
                        value={data.phone !== undefined ? data.phone : user.phone || ""}
                        onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
                        style={{ borderBottom: "1.5px solid #4f46e5", padding: "4px 8px", width: "100%", maxWidth: "250px", background: "#f8fafc" }}
                      />
                    ) : (
                      <span>{data.phone || user.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* ADMIN SUPERVISORY DETAILS */}
            <Info
              title="Supervisory Details & Directorate Roles"
              fields={[
                ["First Name", "firstName"],
                ["Last Name", "lastName"],
                ["Designation / Role Title", "roleTitle"],
                ["Department", "department"],
                ["Institution / Authority", "institution"],
                ["Date of Birth / Tenure Start", "dateOfBirth"],
              ]}
              data={{
                ...data,
                roleTitle: data.roleTitle !== undefined ? data.roleTitle : (user.roleTitle || "Super Administrator"),
                department: data.department !== undefined ? data.department : (user.department || "Directorate of Higher Education Scholarships"),
                institution: data.institution !== undefined ? data.institution : (user.institution || "National Scholarship Evaluation Board"),
              }}
              setData={setData}
              edit={edit}
              locked={[]}
            />

            {/* ADMIN EXECUTIVE BIO */}
            <section className="info" style={{ marginTop: "20px" }}>
              <h2>Executive Bio & Directorate Note</h2>
              <div style={{ padding: "10px 0" }}>
                {edit ? (
                  <textarea
                    rows={4}
                    value={data.bio !== undefined ? data.bio : (user.bio || "")}
                    onChange={(e) => setData((p) => ({ ...p, bio: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1.5px solid #4f46e5",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter supervisory qualifications, notes, and directorate bio..."
                  />
                ) : (
                  <p style={{ color: "#374151", lineHeight: "1.6", fontSize: "15px" }}>
                    {data.bio !== undefined ? data.bio : (user.bio || "Senior Director supervising merit-cum-means awards, DBT distributions, and student verification across pan-India scholarship pipelines.")}
                  </p>
                )}
              </div>
            </section>

            {/* SAVE BAR */}
            <div className="profileSaveBar">
              <button type="button" className="apply save" style={{ background: "#4f46e5" }} onClick={update}>
                Save Administrator Profile Changes
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ================= STUDENT PROFILE SECTION ================= */}
            <article className={`summary ${edit ? "summaryEditing" : ""}`}>
              {/* PHOTO & QUICK ACTIONS */}
              <div className="summaryPhotoCol">
                <div
                  className="summaryPhoto"
                  onClick={() => setAvatarModalOpen(true)}
                  title="Click to change profile photo"
                >
                  {data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput ? (
                    <img
                      src={data.avatar || data.profilePhoto || user.avatar || user.profilePhoto || avatarUrlInput}
                      alt="Profile"
                      className="summaryAvatarImg"
                    />
                  ) : (
                    <b className="avatar">
                      {(data.firstName?.[0] || user.firstName?.[0] || "A")}
                      {(data.lastName?.[0] || user.lastName?.[0] || "S")}
                    </b>
                  )}
                  <div className="summaryPhotoOverlay">
                    <span>📷 Change</span>
                  </div>
                </div>
                <div className="summaryUserMeta">
                  <span className="summaryStudentId">
                    {user.studentId || "SC-2026-IND9021"}
                  </span>
                  <span className="summaryRoleBadge">
                    🎓 Verified Student
                  </span>
                </div>
                <div className="summaryActions">
                  {edit ? (
                    <button
                      type="button"
                      className="summaryActionBtn saveBtn"
                      onClick={update}
                    >
                      <span>✓</span> <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="summaryActionBtn editBtn"
                      onClick={() => setEdit(true)}
                    >
                      <span>✎</span> <span>Edit Details</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="summaryActionBtn photoBtn"
                    onClick={() => setAvatarModalOpen(true)}
                  >
                    <span>📷</span> <span>Change Photo</span>
                  </button>
                  <button
                    type="button"
                    className="summaryActionBtn downloadBtn"
                    onClick={() => {
                      const exportObj = { ...user, ...data };
                      const str = JSON.stringify(exportObj, null, 2);
                      const blob = new Blob([str], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${exportObj.firstName || "student"}_profile.json`;
                      a.click();
                      showToast("Profile data exported successfully! ✓");
                    }}
                  >
                    <span>↓</span> <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* CONTACT INFORMATION */}
              <div className="summaryDetails">
                <div className="summaryDetailsHeader">
                  <h3>
                    <span>📬</span> Contact Information
                  </h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {edit && (
                      <span className="editIndicatorBadge">
                        ✏️ Editable Mode
                      </span>
                    )}
                    <button
                      type="button"
                      className="summaryHeaderEditToggle"
                      onClick={() => {
                        if (edit) update();
                        else setEdit(true);
                      }}
                    >
                      {edit ? "✓ Save Contacts" : "✎ Edit Contacts"}
                    </button>
                  </div>
                </div>

                {/* EMAIL ROW */}
                <div className="contactRow">
                  <strong>E-mail ID</strong>
                  <div className={`contactValue ${edit ? "activeInput" : ""}`}>
                    {edit ? (
                      <input
                        type="email"
                        value={data.email !== undefined ? data.email : (user.email || "")}
                        placeholder="Enter email address"
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({ ...prev, email: val }));
                        }}
                      />
                    ) : (
                      <span
                        className="contactText"
                        onClick={() => setEdit(true)}
                        title="Click to edit email"
                      >
                        {data.email || user.email}
                      </span>
                    )}
                    <div className="contactBadges">
                      <span className="verifiedChip">✓ Verified</span>
                      <button
                        type="button"
                        className="changeBtn"
                        onClick={() => setContactModal("email")}
                        title="Change email with verification dialog"
                      >
                        Change ✎
                      </button>
                    </div>
                  </div>
                </div>

                {/* PHONE ROW */}
                <div className="contactRow">
                  <strong>Mobile No.</strong>
                  <div className={`contactValue ${edit ? "activeInput" : ""}`}>
                    {edit ? (
                      <input
                        type="tel"
                        value={data.phone !== undefined ? data.phone : (user.phone || "")}
                        placeholder="Enter mobile number"
                        onChange={(e) => {
                          const val = e.target.value;
                          setData((prev) => ({ ...prev, phone: val }));
                          if (sameAsMobile) {
                            setWhatsapp(val);
                          }
                        }}
                      />
                    ) : (
                      <span
                        className="contactText"
                        onClick={() => setEdit(true)}
                        title="Click to edit mobile"
                      >
                        {data.phone || user.phone}
                      </span>
                    )}
                    <div className="contactBadges">
                      <span className="verifiedChip">✓ Verified</span>
                      <button
                        type="button"
                        className="changeBtn"
                        onClick={() => setContactModal("mobile")}
                        title="Change mobile with verification dialog"
                      >
                        Change ✎
                      </button>
                    </div>
                  </div>
                </div>

                {/* WHATSAPP ROW */}
                <div className="contactRow">
                  <strong>WhatsApp</strong>
                  <div className={`contactValue ${edit ? "activeInput" : ""}`}>
                    {edit ? (
                      <input
                        type="tel"
                        value={sameAsMobile ? (data.phone || user.phone || "") : (whatsapp !== undefined ? whatsapp : (data.whatsapp || user.whatsapp || ""))}
                        placeholder="Enter WhatsApp mobile number"
                        disabled={sameAsMobile}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWhatsapp(val);
                          setData((prev) => ({ ...prev, whatsapp: val }));
                        }}
                      />
                    ) : (
                      <span
                        className="contactText"
                        onClick={() => setEdit(true)}
                        title="Click to edit WhatsApp"
                      >
                        {sameAsMobile
                          ? (data.phone || user.phone)
                          : (whatsapp || data.whatsapp || user.whatsapp || data.phone || user.phone)}
                      </span>
                    )}
                    <div className="contactBadges">
                      {sameAsMobile ? (
                        <span className="verifiedChip" style={{ background: "#e0e7ff", color: "#3730a3" }}>
                          Linked to Mobile
                        </span>
                      ) : (
                        <span className="verifiedChip" style={{ background: "#f0fdf4", color: "#166534" }}>
                          WhatsApp Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SAME AS MOBILE CHECKBOX */}
                <label className="sameMobileContainer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSameAsMobile(checked);
                      if (checked) {
                        const mob = data.phone || user.phone || "";
                        setWhatsapp(mob);
                        setData((prev) => ({ ...prev, whatsapp: mob }));
                      }
                    }}
                  />
                  <span>Same as Mobile Number for scholarship alerts & notifications</span>
                </label>
              </div>
            </article>

            {/* PERSONAL INFORMATION (FULLY EDITABLE) */}
            <Info
              title="Personal Information"
              subtitle="Your basic identity details used across all merit and state scholarship applications"
              fields={[
                ["First Name", "firstName"],
                ["Last Name", "lastName"],
                ["Date of Birth", "dateOfBirth"],
                ["Gender", "gender"],
                ["State", "state"],
                ["District", "district"],
                ["Religion", "religion"],
                ["Category", "category"],
              ]}
              data={data}
              setData={setData}
              edit={edit}
              setEdit={setEdit}
              onSave={update}
              locked={[]}
            />

            {/* KYC */}
            <section className="kycSection">
              <h2>
                KYC <span>(Aadhaar Card Details)</span>
              </h2>
              <div className="kycCard">
                <div className="aadhaarField">
                  <div className="aadhaarLabel">
                    Aadhaar Number
                    {aadhaarVerified && (
                      <span className="verified">✓ verified</span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="aadhaarInput"
                    value={
                      aadhaarVerified
                        ? (aadhaarNumber ? `•••• •••• ${aadhaarNumber.slice(-4)}` : "")
                        : aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
                    }
                    placeholder="Enter 12-digit Aadhaar Number"
                    disabled={aadhaarVerified}
                    inputMode="numeric"
                    maxLength={14}
                    onChange={handleAadhaarChange}
                  />
                  <div
                    className={`aadhaarHelper ${
                      aadhaarVerified
                        ? "verified"
                        : aadhaarNumber.length === 12
                        ? "ready"
                        : ""
                    }`}
                  >
                    {aadhaarVerified ? (
                      <>
                        <span>✓ Verified via UIDAI / DigiLocker</span>
                        <button
                          type="button"
                          className="aadhaarReverifyBtn"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Do you want to re-enter and re-verify your Aadhaar number?"
                              )
                            ) {
                              setAadhaarVerified(false);
                              const updated = {
                                ...user,
                                ...data,
                                aadhaarVerified: false,
                              };
                              save(updated);
                              setData(updated);
                            }
                          }}
                        >
                          Change / Re-verify ✎
                        </button>
                      </>
                    ) : aadhaarNumber.length === 12 ? (
                      <span>✓ 12-digit number ready. Click "Verify" to validate via OTP.</span>
                    ) : (
                      <span>{aadhaarNumber.length} / 12 digits entered</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className={`verifyButton ${
                    aadhaarVerified ? "verifiedButton" : ""
                  }`}
                  disabled={aadhaarVerified || aadhaarNumber.length !== 12}
                  onClick={() => {
                    if (aadhaarNumber.length === 12 && !aadhaarVerified) {
                      setAadhaarModalOpen(true);
                      setAadhaarOtp("");
                      setAadhaarError("");
                    }
                  }}
                >
                  {aadhaarVerified ? "✓ Verified" : "Verify"}
                </button>
              </div>
            </section>

            {/* EDUCATIONAL INFORMATION (FULLY EDITABLE) */}
            <Info
              title="Educational Information"
              subtitle="Current enrollment, institution, and academic performance"
              fields={[
                ["Present Class/Degree", "degree"],
                ["Course / Subject / Stream", "stream"],
                ["Institution / College / School", "institution"],
                ["GPA / Percentage / Marks", "gpa"],
              ]}
              data={data}
              setData={setData}
              edit={edit}
              setEdit={setEdit}
              onSave={update}
              locked={[]}
            />

            {/* OTHER INFORMATION (FULLY EDITABLE) */}
            <Info
              title="Other Information"
              subtitle="Socio-economic background, special categories, and study abroad preferences"
              fields={[
                ["Annual Family Income", "income"],
                ["Person with Disability", "disability"],
                ["Looking for scholarship to study abroad?", "abroad"],
              ]}
              data={data}
              setData={setData}
              edit={edit}
              setEdit={setEdit}
              onSave={update}
              locked={[]}
            />

            {/* SAVE BAR */}
            <div className="profileSaveBar">
              {edit ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="apply save" style={{ background: "#16a34a" }} onClick={update}>
                    ✓ Save All Profile Changes
                  </button>
                  <button
                    type="button"
                    className="outline"
                    onClick={() => {
                      setData(user);
                      setWhatsapp(user.whatsapp || "");
                      setEdit(false);
                      showToast("Changes cancelled.");
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              ) : (
                <button type="button" className="apply save" onClick={() => setEdit(true)}>
                  ✎ Edit Profile Details
                </button>
              )}
            </div>
          </>
        )}
        {/* DELETE ACCOUNT */}
        <section className="delete">
          <div>
            <h3>Delete My Account</h3>
            <p>Deleting your account is permanent and cannot be undone.</p>
          </div>
          <button onClick={() => setConfirm(true)}>Delete account</button>
        </section>
        {/* DELETE CONFIRMATION */}
        {confirm && (
          <div className="modal">
            <div>
              <h2>Are you sure you wish to leave us?</h2>
              <p>This will permanently delete your local profile data.</p>
              <button onClick={() => setConfirm(false)}>Cancel</button>
              <button
                className="danger"
                onClick={() => {
                  localStorage.removeItem("sc-user");
                  location.reload();
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </section>
      {contactModal && (
        <div
          className="contactModalOverlay"
          onClick={() => setContactModal(null)}
        >
          <div className="contactModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="contactModalClose"
              type="button"
              onClick={() => setContactModal(null)}
              aria-label="Close"
            >
              ×
            </button>
            {contactModal === "email" ? (
              <>
                <div className="contactModalIcon">✉</div>
                <h2>Update Email ID</h2>
                <p className="contactModalSubtitle">
                  Update the email address linked to your account.
                </p>
                <label className="contactModalLabel">Current Email ID</label>
                <input
                  className="contactModalInput"
                  value={user.email}
                  disabled
                />
                <label className="contactModalLabel">New Email ID</label>
                <input
                  className="contactModalInput"
                  type="email"
                  placeholder="Enter new email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <label className="contactModalLabel">
                  Confirm New Email ID
                </label>
                <input
                  className="contactModalInput"
                  type="email"
                  placeholder="Re-enter new email address"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
                <button
                  className="contactModalSubmit"
                  type="button"
                  onClick={updateEmail}
                >
                  Update Email ID
                </button>
              </>
            ) : (
              <>
                <div className="contactModalIcon">☎</div>
                <h2>Update Mobile Number</h2>
                <p className="contactModalSubtitle">
                  Update the mobile number linked to your account.
                </p>
                <label className="contactModalLabel">
                  Current Mobile Number
                </label>
                <input
                  className="contactModalInput"
                  value={user.phone}
                  disabled
                />
                <label className="contactModalLabel">New Mobile Number</label>
                <input
                  className="contactModalInput"
                  type="tel"
                  placeholder="Enter new mobile number"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                />
                <label className="contactModalLabel">
                  Confirm Mobile Number
                </label>
                <input
                  className="contactModalInput"
                  type="tel"
                  placeholder="Re-enter mobile number"
                  value={confirmMobile}
                  onChange={(e) => setConfirmMobile(e.target.value)}
                />
                <button
                  className="contactModalSubmit"
                  type="button"
                  onClick={updateMobile}
                >
                  Update Mobile Number
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* AADHAAR OTP MODAL */}
      {aadhaarModalOpen && (
        <div
          className="contactModalOverlay"
          onClick={() => setAadhaarModalOpen(false)}
        >
          <div
            className="contactModal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440 }}
          >
            <button
              className="contactModalClose"
              type="button"
              onClick={() => setAadhaarModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div
              className="contactModalIcon"
              style={{
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
              }}
            >
              🔒
            </div>
            <h2>Verify Aadhaar Number</h2>
            <p className="contactModalSubtitle">
              UIDAI / DigiLocker Verification for{" "}
              <b>XXXX XXXX {aadhaarNumber.slice(-4)}</b>
            </p>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: "#166534",
                lineHeight: 1.5,
              }}
            >
              <span>
                📲 A 6-digit One-Time Password (OTP) has been dispatched to your
                Aadhaar-linked mobile number.
              </span>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  Demo OTP: <b>683921</b>
                </span>
                <button
                  type="button"
                  onClick={() => setAadhaarOtp("683921")}
                  style={{
                    background: "#166534",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 9px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Auto-fill OTP
                </button>
              </div>
            </div>

            {aadhaarError && (
              <div
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                ⚠️ {aadhaarError}
              </div>
            )}

            <label className="contactModalLabel">
              Enter 6-digit Aadhaar OTP
            </label>
            <input
              className="contactModalInput"
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="e.g. 683921"
              value={aadhaarOtp}
              onChange={(e) =>
                setAadhaarOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              style={{
                letterSpacing: 6,
                fontSize: 22,
                textAlign: "center",
                fontWeight: 700,
              }}
              autoFocus
            />

            <button
              className="contactModalSubmit"
              type="button"
              disabled={aadhaarVerifying || aadhaarOtp.trim().length !== 6}
              onClick={handleConfirmAadhaarOtp}
              style={{ background: "#15952d", marginTop: 14 }}
            >
              {aadhaarVerifying
                ? "Verifying with UIDAI gateway..."
                : "Verify & Complete KYC ✓"}
            </button>
          </div>
        </div>
      )}

      {/* AVATAR CHANGE MODAL WITH LIVE CAMERA CAPTURE & FILE UPLOAD */}
      <ProfilePhotoModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentPhoto={avatarUrlInput || user.avatar || user.profilePhoto || ""}
        userName={`${data.firstName || user.firstName || ""} ${data.lastName || user.lastName || ""}`}
        onSavePhoto={(newPhotoUrl) => {
          setAvatarUrlInput(newPhotoUrl);
          const updated = {
            ...user,
            ...data,
            avatar: newPhotoUrl,
            profilePhoto: newPhotoUrl,
          };
          save(updated);
          setData(updated);
          setAvatarModalOpen(false);

          try {
            const regRaw = localStorage.getItem("sc_registered_users");
            if (regRaw) {
              const regList = JSON.parse(regRaw);
              const idx = regList.findIndex(
                (u) =>
                  (u.studentId && u.studentId === updated.studentId) ||
                  (u.email && u.email.toLowerCase() === user.email?.toLowerCase()) ||
                  (u.phone && u.phone === user.phone)
              );
              if (idx !== -1) {
                regList[idx] = { ...regList[idx], avatar: newPhotoUrl, profilePhoto: newPhotoUrl };
                localStorage.setItem("sc_registered_users", JSON.stringify(regList));
              }
            }
          } catch (err) {
            console.error("Error updating sc_registered_users:", err);
          }

          showToast("Profile photo updated successfully! ✓");
        }}
      />

      {/* TOAST CONFIRMATION */}
      {toastMsg && (
        <div className="profileToast">
          <span>{toastMsg}</span>
        </div>
      )}
      {/* ================= RIGHT SIDEBAR ================= */}
      <aside className="profileFeatured">
        <div className="featuredHeader">Featured Scholarships</div>
        {scholarships.slice(0, 3).map((s) => (
          <button
            onClick={() => onSelect(s)}
            key={s.id}
            className="featuredScholarship"
          >
            <b style={{ background: s.color }}>{s.provider[0]}</b>
            <span>
              <strong>{s.title}</strong>
              <small>Deadline: {s.deadline}</small>
            </span>
          </button>
        ))}
      </aside>
    </main>
  );
}

function ProfilePhotoModal({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
  userName = "Student",
}) {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'camera' | 'url'
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhoto || "");
  const [urlInput, setUrlInput] = useState(currentPhoto?.startsWith("http") ? currentPhoto : "");
  const [dragOver, setDragOver] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [captured, setCaptured] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPhoto(currentPhoto || "");
      setUrlInput(currentPhoto?.startsWith("http") ? currentPhoto : "");
      setCameraError("");
      setCaptured(false);
      setUploadFileName("");
      if (activeTab === "camera") {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === "camera" && isOpen && !captured) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab]);

  // Ensure video element receives the stream whenever mounted
  useEffect(() => {
    if (activeTab === "camera" && !captured && cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab, captured, cameraActive]);

  const startCamera = async () => {
    setCameraError("");
    setCaptured(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by your browser or environment. You can upload an image file instead.");
        return;
      }
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access was blocked. Please permit camera permission in your browser address bar.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device was found on this computer. You can upload an image file instead.");
      } else if (err.name === "NotReadableError") {
        setCameraError("Camera is currently being used by another application.");
      } else {
        setCameraError("Unable to access camera: " + (err.message || "Unknown error"));
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;
    const size = Math.min(videoW, videoH);
    const startX = (videoW - size) / 2;
    const startY = (videoH - size) / 2;
    const targetSize = Math.min(size, 600);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror horizontal flip for natural selfie look
      ctx.translate(targetSize, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, startX, startY, size, size, 0, 0, targetSize, targetSize);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setSelectedPhoto(dataUrl);
      setCaptured(true);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCaptured(false);
    startCamera();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image file size should be less than 10MB.");
      return;
    }
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const presets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  ];

  if (!isOpen) return null;

  return (
    <div
      className="contactModalOverlay"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="contactModal profilePhotoModal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "540px", width: "95vw" }}
      >
        <button
          className="contactModalClose"
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* MODAL HEADER */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="contactModalIcon" style={{ margin: "0 auto 8px" }}>📷</div>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a" }}>Update Profile Photo</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Upload from your computer files, take a live photo with camera, or pick a preset avatar.
          </p>
        </div>

        {/* LIVE CIRCULAR PREVIEW */}
        <div className="photoModalPreviewWrap">
          <div className="photoModalPreviewRing">
            {selectedPhoto ? (
              <img src={selectedPhoto} alt="Selected Avatar" className="photoModalPreviewImg" />
            ) : (
              <div className="photoModalPreviewInitials">
                {userName.trim().charAt(0) || "S"}
              </div>
            )}
          </div>
          <div className="photoModalPreviewBadge">
            {selectedPhoto ? "✓ Ready to apply" : "Default Initials"}
          </div>

          {selectedPhoto && (
            <button
              type="button"
              className="photoRemoveBtn"
              onClick={() => {
                setSelectedPhoto("");
                setUrlInput("");
                setUploadFileName("");
                setCaptured(false);
              }}
              title="Remove photo and revert to initials"
            >
              ✕ Remove Photo (Use Initials)
            </button>
          )}
        </div>

        {/* TAB BUTTONS */}
        <div className="photoModalTabs">
          <button
            type="button"
            className={`photoModalTabBtn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            📁 Upload File
          </button>
          <button
            type="button"
            className={`photoModalTabBtn ${activeTab === "camera" ? "active" : ""}`}
            onClick={() => setActiveTab("camera")}
          >
            📸 Take Photo
          </button>
          <button
            type="button"
            className={`photoModalTabBtn ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            🌐 Presets / URL
          </button>
        </div>

        {/* TAB 1: UPLOAD FILE */}
        {activeTab === "upload" && (
          <div className="photoModalBody">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <div
              className={`photoDropzone ${dragOver ? "dragOver" : ""} ${uploadFileName ? "hasFile" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadFileName && selectedPhoto ? (
                <div className="photoSelectedFileInfo">
                  <img src={selectedPhoto} alt="Selected file" className="photoFileThumb" />
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>
                      {uploadFileName}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                      ✓ File loaded & ready to save
                    </span>
                  </div>
                  <button
                    type="button"
                    className="photoReuploadBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <>
                  <div className="photoDropzoneIcon">📁</div>
                  <strong style={{ color: "#1e293b", fontSize: "15px", display: "block", marginBottom: "4px" }}>
                    Click to browse photo or drag & drop here
                  </strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Supports JPG, PNG, WebP or GIF (Up to 10MB)
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA ACCESS */}
        {activeTab === "camera" && (
          <div className="photoModalBody">
            {cameraError ? (
              <div className="photoCameraError">
                <p>⚠️ {cameraError}</p>
                <div style={{ marginTop: "10px", display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="photoCameraRetryBtn"
                    onClick={startCamera}
                  >
                    🔄 Retry Camera Access
                  </button>
                  <button
                    type="button"
                    className="photoCameraRetryBtn"
                    style={{ background: "#475569" }}
                    onClick={() => setActiveTab("upload")}
                  >
                    📁 Upload File Instead
                  </button>
                </div>
              </div>
            ) : captured ? (
              <div className="photoCapturedPreview">
                <div className="photoCapturedBadge">
                  ✓ Photo captured & ready to apply!
                </div>
                <p style={{ margin: "6px 0 12px", fontSize: "12.5px", color: "#475569" }}>
                  Your selfie is ready and previewed above. Click <strong>✓ Save Profile Photo</strong> below to apply, or retake if needed.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="photoCameraActionBtn retake"
                    onClick={handleRetake}
                  >
                    🔄 Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="photoCameraFeedWrap">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="photoCameraVideo"
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="photoCameraOverlayGuideline">
                  <div className="photoCameraTargetCircle" />
                  <span className="photoCameraLiveTag">🔴 LIVE CAMERA</span>
                </div>
                <div className="photoCameraCaptureBar">
                  <button
                    type="button"
                    className="photoCameraShutterBtn"
                    onClick={handleCapture}
                    disabled={!cameraActive}
                  >
                    📸 Capture Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMAGE URL & PRESETS */}
        {activeTab === "url" && (
          <div className="photoModalBody">
            <label className="contactModalLabel" style={{ marginTop: 0 }}>
              Photo Image URL
            </label>
            <input
              type="url"
              className="contactModalInput"
              placeholder="https://example.com/avatar.jpg"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setSelectedPhoto(e.target.value);
              }}
            />

            <div style={{ marginTop: "14px", textAlign: "left" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                Or Select a Preset Avatar:
              </span>
              <div className="photoPresetGrid">
                {presets.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preset ${i + 1}`}
                    onClick={() => {
                      setSelectedPhoto(url);
                      setUrlInput(url);
                    }}
                    className={`photoPresetThumb ${selectedPhoto === url ? "active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER SAVE BUTTON */}
        <div className="photoModalFooter">
          <button
            type="button"
            className="contactModalSubmit"
            style={{ background: "#2563eb", flex: 1, margin: 0 }}
            onClick={() => {
              stopCamera();
              onSavePhoto(selectedPhoto);
            }}
          >
            ✓ Save Profile Photo
          </button>
          <button
            type="button"
            className="outline"
            style={{
              padding: "0 18px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
const districtsByState = {
  "Karnataka": [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Dakshina Kannada (Mangaluru)",
    "Udupi",
    "Belagavi",
    "Dharwad (Hubballi-Dharwad)",
    "Shivamogga",
    "Tumakuru",
    "Hassan",
    "Mandya",
    "Ballari",
    "Kalaburagi",
    "Davanagere",
    "Chikkamagaluru",
    "Uttara Kannada (Karwar)",
    "Raichur",
    "Bidar",
    "Vijayapura (Bijapur)",
    "Bagalkot",
    "Chitradurga",
    "Kolar",
    "Chikkaballapur",
    "Ramanagara",
    "Kodagu (Madikeri)",
    "Koppal",
    "Gadag",
    "Haveri",
    "Yadgir",
    "Chamarajanagar",
    "Vijayanagara",
  ],
  "Maharashtra": [
    "Mumbai City",
    "Mumbai Suburban",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Chhatrapati Sambhaji Nagar (Aurangabad)",
    "Solapur",
    "Kolhapur",
    "Amravati",
    "Nanded",
    "Satara",
    "Sangli",
    "Ahmednagar",
    "Jalgaon",
    "Akola",
    "Latur",
    "Dhule",
    "Palghar",
    "Raigad",
    "Ratnagiri",
    "Sindhudurg",
    "Chandrapur",
    "Yavatmal",
    "Wardha",
    "Bhandara",
    "Gondia",
    "Gadchiroli",
    "Washim",
    "Buldhana",
    "Hingoli",
    "Parbhani",
    "Jalna",
    "Beed",
    "Dharashiv (Osmanabad)",
  ],
  "Delhi": [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Erode",
    "Vellore",
    "Kanchipuram",
    "Chengalpattu",
    "Thanjavur",
    "Dindigul",
    "Cuddalore",
    "Kanyakumari",
    "Namakkal",
    "Karur",
    "Krishnagiri",
    "Dharmapuri",
    "Virudhunagar",
    "Theni",
    "Thoothukudi",
    "Nagapattinam",
    "Villupuram",
    "Tiruvannamalai",
    "Nilgiris",
    "Ranipet",
    "Tirupathur",
    "Kallakurichi",
    "Tenkasi",
    "Mayiladuthurai",
  ],
  "Telangana": [
    "Hyderabad",
    "Ranga Reddy",
    "Medchal-Malkajgiri",
    "Warangal",
    "Hanamkonda",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
    "Nalgonda",
    "Mahabubnagar",
    "Sangareddy",
    "Siddipet",
    "Adilabad",
    "Mancherial",
    "Nirmal",
    "Bhadradri Kothagudem",
    "Jagtial",
    "Peddapalli",
    "Kamareddy",
    "Suryapet",
    "Vikarabad",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "NTR (Vijayawada)",
    "Guntur",
    "Tirupati",
    "Kurnool",
    "Sri Potti Sriramulu Nellore",
    "Ananthapuramu",
    "Kakinada",
    "East Godavari (Rajahmundry)",
    "West Godavari (Bhimavaram)",
    "YSR Kadapa",
    "Chittoor",
    "Srikakulam",
    "Vizianagaram",
    "Prakasam (Ongole)",
    "Eluru",
    "Anakapalli",
    "Nandyal",
    "Bapatla",
    "Palnadu",
  ],
  "Kerala": [
    "Thiruvananthapuram",
    "Ernakulam (Kochi)",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kannur",
    "Alappuzha",
    "Kottayam",
    "Palakkad",
    "Malappuram",
    "Kasaragod",
    "Pathanamthitta",
    "Idukki",
    "Wayanad",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur Nagar",
    "Varanasi",
    "Agra",
    "Prayagraj (Allahabad)",
    "Gautam Buddha Nagar (Noida)",
    "Ghaziabad",
    "Meerut",
    "Bareilly",
    "Aligarh",
    "Moradabad",
    "Gorakhpur",
    "Saharanpur",
    "Jhansi",
    "Mathura",
    "Ayodhya (Faizabad)",
    "Firozabad",
    "Muzaffarnagar",
    "Budaun",
    "Shahjahanpur",
    "Etawah",
  ],
  "Gujarat": [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Junagadh",
    "Anand",
    "Navsari",
    "Morbi",
    "Bharuch",
    "Mehsana",
    "Kutch",
    "Palanpur (Banaskantha)",
    "Valsad",
    "Porbandar",
    "Amreli",
    "Surendranagar",
    "Patan",
  ],
  "Rajasthan": [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Bhilwara",
    "Alwar",
    "Sikar",
    "Bharatpur",
    "Pali",
    "Sri Ganganagar",
    "Barmer",
    "Jhunjhunu",
    "Chittorgarh",
    "Nagaur",
    "Tonk",
    "Jhalawar",
  ],
  "West Bengal": [
    "Kolkata",
    "North 24 Parganas",
    "South 24 Parganas",
    "Howrah",
    "Hooghly",
    "Darjeeling",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Paschim Bardhaman",
    "Nadia",
    "Murshidabad",
    "Malda",
    "Jalpaiguri",
    "Birbhum",
    "Bankura",
    "Purulia",
    "Cooch Behar",
    "Alipurduar",
    "Kalimpong",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
    "Katni",
    "Singrauli",
    "Burhanpur",
    "Khandwa",
    "Bhind",
    "Chhindwara",
    "Guna",
    "Shivpuri",
    "Vidisha",
    "Damoh",
  ],
  "Bihar": [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
    "Darbhanga",
    "Bihar Sharif (Nalanda)",
    "Arrah (Bhojpur)",
    "Begusarai",
    "Katihar",
    "Munger",
    "Chhapra (Saran)",
    "Samastipur",
    "Saharsa",
    "Sasaram (Rohtas)",
    "Hajipur (Vaishali)",
    "Dehri",
    "Bettiah (West Champaran)",
    "Motihari (East Champaran)",
    "Siwan",
  ],
  "Punjab": [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "SAS Nagar (Mohali)",
    "Hoshiarpur",
    "Pathankot",
    "Moga",
    "Batala",
    "Abohar",
    "Malerkotla",
    "Khanna",
    "Muktsar",
    "Barnala",
    "Firozpur",
    "Kapurthala",
    "Faridkot",
    "Sangrur",
    "Fazilka",
  ],
  "Haryana": [
    "Gurugram",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Yamunanagar",
    "Rohtak",
    "Hisar",
    "Karnal",
    "Sonipat",
    "Panchkula",
    "Sirsa",
    "Bhiwani",
    "Bahadurgarh",
    "Jind",
    "Thanesar (Kurukshetra)",
    "Kaithal",
    "Rewari",
    "Palwal",
  ],
  "Odisha": [
    "Khordha (Bhubaneswar)",
    "Cuttack",
    "Ganjam (Berhampur)",
    "Sundargarh (Rourkela)",
    "Puri",
    "Sambalpur",
    "Balasore",
    "Bhadrak",
    "Baripada (Mayurbhanj)",
    "Jharsuguda",
    "Jajpur",
    "Angul",
    "Bargarh",
    "Kendujhar",
    "Rayagada",
  ],
  "Assam": [
    "Kamrup Metropolitan (Guwahati)",
    "Cachar (Silchar)",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tinsukia",
    "Sonitpur (Tezpur)",
    "Barpeta",
    "Dhubri",
    "Bongaigaon",
    "Goalpara",
    "Sivasagar",
    "Golaghat",
    "Karimganj",
    "Hailakandi",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Anantnag",
    "Baramulla",
    "Udhampur",
    "Kathua",
    "Pulwama",
    "Kupwara",
    "Budgam",
    "Rajouri",
    "Poonch",
    "Bandipora",
    "Ganderbal",
    "Kulgam",
    "Shopian",
    "Samba",
    "Reasi",
    "Ramban",
    "Doda",
    "Kishtwar",
  ],
  "Uttarakhand": [
    "Dehradun",
    "Haridwar",
    "Nainital (Haldwani)",
    "Udham Singh Nagar (Rudrapur)",
    "Almora",
    "Pauri Garhwal",
    "Tehri Garhwal",
    "Pithoragarh",
    "Chamoli",
    "Uttarkashi",
    "Bageshwar",
    "Champawat",
    "Rudraprayag",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Kangra (Dharamshala)",
    "Mandi",
    "Solan",
    "Sirmaur (Nahan)",
    "Una",
    "Chamba",
    "Hamirpur",
    "Kullu",
    "Bilaspur",
    "Kinnaur",
    "Lahaul and Spiti",
  ],
  "Goa": ["North Goa", "South Goa"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Tripura": ["West Tripura (Agartala)", "Gomati", "South Tripura", "North Tripura", "Dhalai", "Unakoti", "Khowai", "Sipahijala"],
  "Meghalaya": ["East Khasi Hills (Shillong)", "West Garo Hills (Tura)", "Ri-Bhoi", "West Khasi Hills", "Jaintia Hills"],
  "Manipur": ["Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon"],
  "Arunachal Pradesh": ["Papum Pare (Itanagar)", "Changlang", "West Kameng", "East Siang"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip"],
  "Sikkim": ["East Sikkim (Gangtok)", "West Sikkim (Geyzing)", "North Sikkim (Mangan)", "South Sikkim (Namchi)"],
  "Ladakh": ["Leh", "Kargil"],
  "Andaman and Nicobar Islands": ["South Andaman (Port Blair)", "North and Middle Andaman", "Nicobar"],
};

const defaultDistricts = [
  "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Dakshina Kannada (Mangaluru)", "Belagavi",
  "Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik",
  "New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi",
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Hyderabad", "Ranga Reddy", "Warangal", "Karimnagar",
  "Visakhapatnam", "NTR (Vijayawada)", "Guntur", "Tirupati",
  "Thiruvananthapuram", "Ernakulam (Kochi)", "Kozhikode", "Thrissur",
  "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Jaipur", "Jodhpur", "Udaipur", "Kota",
  "Lucknow", "Kanpur Nagar", "Varanasi", "Noida",
  "Bhopal", "Indore", "Gwalior", "Jabalpur",
  "Patna", "Gaya", "Muzaffarpur",
  "Ludhiana", "Amritsar", "Chandigarh",
  "Gurugram", "Faridabad", "Panipat",
  "Khordha (Bhubaneswar)", "Cuttack",
  "Kamrup Metropolitan (Guwahati)", "Dibrugarh",
  "Dehradun", "Haridwar", "Shimla", "Srinagar", "Jammu", "North Goa", "South Goa",
  "Other District",
];

const toDateInputValue = (str) => {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const parts = str.split(/[-/ ]/);
  if (parts.length === 3 && parts[2]?.length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
};

function Info({
  title,
  subtitle,
  fields,
  data,
  setData,
  edit,
  setEdit,
  onSave,
  locked = [],
}) {
  const dropdownFields = [
    "gender",
    "state",
    "district",
    "religion",
    "category",
    "degree",
    "stream",
    "income",
    "disability",
    "abroad",
  ];
  const options = {
    gender: ["Male", "Female", "Other", "Prefer not to say"],
    state: [
      "Andaman and Nicobar Islands",
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chandigarh",
      "Chhattisgarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Ladakh",
      "Lakshadweep",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Puducherry",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Other",
    ],
    religion: [
      "Hindu",
      "Muslim",
      "Christian",
      "Sikh",
      "Buddhist",
      "Jain",
      "Parsi",
      "Other",
      "Prefer not to say",
    ],
    category: [
      "General",
      "OBC-NC (Non-Creamy Layer)",
      "OBC-C (Creamy Layer)",
      "SC (Scheduled Caste)",
      "ST (Scheduled Tribe)",
      "EWS (Economically Weaker Section)",
      "Other Reservations",
    ],
    degree: [
      "Class 10",
      "Class 11",
      "Class 12",
      "Undergraduate / Bachelor's (B.Tech / B.E)",
      "Undergraduate (MBBS / BDS / Medical)",
      "Undergraduate (B.Sc / B.C.A)",
      "Undergraduate (B.Com / B.B.A / B.A)",
      "Postgraduate / Master's (M.Tech / M.E / M.S)",
      "Postgraduate (MBA / PGDM)",
      "Postgraduate (M.Sc / M.Com / M.A / MCA)",
      "Diploma / Polytechnic",
      "Ph.D. / Doctoral Research",
      "Other",
    ],
    stream: [
      "Computer Science & Engineering / AI / IT",
      "Mechanical / Civil / Electrical Engineering",
      "Electronics & Communication Engineering",
      "Medical Sciences / MBBS / Dental / Nursing",
      "Pure Sciences (Physics, Chemistry, Maths, Biology)",
      "Commerce / Accountancy / Finance",
      "Management / Business Administration",
      "Arts / Humanities / Social Sciences",
      "Law / Legal Studies",
      "Agriculture & Allied Sciences",
      "Architecture & Design",
      "Other",
    ],
    income: [
      "Less than ₹1,00,000",
      "₹1,00,001 - ₹2,50,000",
      "₹2,50,001 - ₹4,50,000",
      "₹4,50,001 - ₹6,00,000",
      "₹6,00,001 - ₹8,00,000",
      "Above ₹8,00,000",
    ],
    disability: [
      "No",
      "Yes - Locomotor / Orthopedic (≥ 40%)",
      "Yes - Visual Impairment (≥ 40%)",
      "Yes - Hearing Impairment (≥ 40%)",
      "Yes - Speech & Language Disability (≥ 40%)",
      "Yes - Multiple Disabilities (≥ 40%)",
    ],
    abroad: [
      "No",
      "Yes - USA / Canada",
      "Yes - United Kingdom",
      "Yes - Europe (Germany, France, Ireland)",
      "Yes - Australia / New Zealand",
      "Yes - Asia (Singapore, Japan, etc.)",
      "Yes - Any Available Country",
    ],
  };

  return (
    <section className="info">
      <div className="infoSectionHeader">
        <div className="infoSectionHeaderLeft">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {setEdit && (
          <div>
            {edit ? (
              <button
                type="button"
                className="sectionSaveBtn"
                onClick={onSave}
              >
                ✓ Save Section
              </button>
            ) : (
              <button
                type="button"
                className="sectionEditBtn"
                onClick={() => setEdit(true)}
              >
                ✎ Edit Details
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fieldGrid">
        {fields.map(([label, key]) => {
          const isDistrict = key === "district";
          const isDropdown = dropdownFields.includes(key);
          const isLocked = locked.includes(key);
          const isDateField = key === "dateOfBirth" || key.toLowerCase().includes("date");

          const districtList = isDistrict
            ? (data.state && districtsByState[data.state] ? districtsByState[data.state] : defaultDistricts)
            : options[key] || [];

          return (
            <div className="infoFieldGroup" key={key}>
              <span className="infoFieldLabel">{label}</span>
              <div
                className={`infoFieldBox ${edit && !isLocked ? "editing" : ""}`}
                onClick={(e) => {
                  if (!edit && setEdit) {
                    setEdit(true);
                  } else if (edit && isDateField) {
                    const dateInput = e.currentTarget.querySelector('input[type="date"]');
                    if (dateInput && dateInput.showPicker) {
                      try { dateInput.showPicker(); } catch (err) {}
                    }
                  }
                }}
                title={!edit ? "Click to edit" : undefined}
              >
                {isDropdown ? (
                  edit && !isLocked ? (
                    <select
                      value={data[key] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev) => ({
                          ...prev,
                          [key]: val,
                        }));
                      }}
                    >
                      <option value="">-- Select {label} --</option>
                      {data[key] && !districtList.includes(data[key]) && (
                        <option value={data[key]}>{data[key]}</option>
                      )}
                      {districtList.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`infoFieldValueText ${!data[key] ? "empty" : ""}`}>
                      {data[key] || "Not provided"}
                    </span>
                  )
                ) : isDateField ? (
                  edit && !isLocked ? (
                    <input
                      type="date"
                      className="infoFieldDateInput"
                      value={toDateInputValue(data[key])}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const d = new Date(val + "T00:00:00");
                          const formatted = !isNaN(d.getTime())
                            ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : val;
                          setData((prev) => ({
                            ...prev,
                            [key]: formatted,
                          }));
                        } else {
                          setData((prev) => ({ ...prev, [key]: "" }));
                        }
                      }}
                    />
                  ) : (
                    <span className={`infoFieldValueText ${!data[key] ? "empty" : ""}`}>
                      {data[key] ? `📅 ${data[key]}` : "Not provided"}
                    </span>
                  )
                ) : edit && !isLocked ? (
                  <input
                    type="text"
                    value={data[key] !== undefined ? data[key] : ""}
                    placeholder={`Enter ${label}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        [key]: val,
                      }));
                    }}
                  />
                ) : (
                  <span className={`infoFieldValueText ${!data[key] ? "empty" : ""}`}>
                    {data[key] || "Not provided"}
                  </span>
                )}
                {!edit && <span className="infoFieldPencil">✎</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
const getRegisteredAccounts = () => {
  try {
    const raw = localStorage.getItem("sc_registered_users");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasAdmin = parsed.some(
          (u) => u.role === "admin" || u.email?.toLowerCase() === "admin@scholarshipconnect.org"
        );
        if (!hasAdmin && INITIAL_REGISTERED_USERS?.[0]) {
          return [INITIAL_REGISTERED_USERS[0], ...parsed];
        }
        return parsed;
      }
    }
  } catch {}
  return INITIAL_REGISTERED_USERS || [];
};

function AuthModal({ close, onLogin, onDemoLogin, onSwitchLogin, onSwitchRegister, mode, setPage }) {
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [loginMobile, setLoginMobile] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegisterSubmit = (e) => {
    e?.preventDefault?.();
    setError("");
    setSuccess("");

    if (!registerData.firstName.trim()) {
      setError("Please enter your First Name.");
      return;
    }
    if (!registerData.lastName.trim()) {
      setError("Please enter your Last Name.");
      return;
    }
    if (!registerData.email.trim() || !registerData.email.includes("@")) {
      setError("Please enter a valid Email Id.");
      return;
    }
    if (!registerData.phone.trim() || registerData.phone.trim().length < 8) {
      setError("Please enter a valid Mobile Number (min 8 digits).");
      return;
    }
    if (!registerData.password) {
      setError("Please create a password.");
      return;
    }
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    if (!agreedTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    const accounts = getRegisteredAccounts();
    const existing = accounts.find(
      (a) =>
        a.email?.toLowerCase() === registerData.email.trim().toLowerCase() ||
        a.phone?.replace(/[^0-9]/g, "") === registerData.phone.trim().replace(/[^0-9]/g, "")
    );

    if (existing) {
      setError("An account with this email or mobile number already exists. Please login.");
      return;
    }

    const formattedDob = registerData.dateOfBirth
      ? new Date(registerData.dateOfBirth + "T00:00:00").toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "12 Aug 2005";

    const newStudent = {
      studentId: "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      firstName: registerData.firstName.trim(),
      lastName: registerData.lastName.trim(),
      email: registerData.email.trim().toLowerCase(),
      phone: registerData.phone.trim(),
      dateOfBirth: formattedDob,
      password: registerData.password,
      course: "Undergraduate Degree",
      institution: "State University",
      followed: [],
    };

    accounts.push(newStudent);
    localStorage.setItem("sc_registered_users", JSON.stringify(accounts));

    setSuccess("Account created successfully! Logging you in...");
    setTimeout(() => {
      onLogin(newStudent);
      close?.();
    }, 400);
  };

  const handleLoginSubmit = (e) => {
    e?.preventDefault?.();
    setError("");
    setSuccess("");

    const accounts = getRegisteredAccounts();

    if (loginMethod === "mobile") {
      const cleanPhone = loginMobile.trim().replace(/[^0-9]/g, "");
      if (!cleanPhone || cleanPhone.length < 8) {
        setError("Please enter a valid Mobile Number.");
        return;
      }
      if (!loginPassword) {
        setError("Please enter your password.");
        return;
      }

      const matched = accounts.find(
        (a) => a.phone?.replace(/[^0-9]/g, "") === cleanPhone
      );
      if (matched) {
        if (matched.password && matched.password !== loginPassword) {
          setError("Incorrect password. Please verify and try again.");
          return;
        }
        onLogin(matched);
        close?.();
        return;
      }

      // If user typed phone and password, log them in and register profile
      const autoUser = {
        studentId: "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        firstName: "Student",
        lastName: cleanPhone.slice(-4),
        phone: loginMobile.trim(),
        email: `${cleanPhone}@scholarshipconnect.edu`,
        dateOfBirth: "12 Aug 2005",
        password: loginPassword,
        course: "Undergraduate Degree",
        institution: "State University",
        followed: [],
      };
      accounts.push(autoUser);
      localStorage.setItem("sc_registered_users", JSON.stringify(accounts));
      onLogin(autoUser);
      close?.();
    } else {
      const cleanEmail = loginEmail.trim().toLowerCase();
      if (!cleanEmail) {
        setError("Please enter an Email Id or Admin ID.");
        return;
      }

      // Fast check for admin login
      if (
        loginMethod === "admin" ||
        cleanEmail === "admin@scholarshipconnect.org" ||
        cleanEmail === "admin" ||
        cleanEmail === "sc-admin-001"
      ) {
        if (loginPassword && loginPassword !== "admin" && loginPassword !== "admin123") {
          setError("Incorrect admin password. (Demo password is 'admin')");
          return;
        }
        if (onDemoLogin) {
          onDemoLogin("admin");
        } else {
          onLogin?.(INITIAL_REGISTERED_USERS[0]);
          setPage?.("admin");
        }
        close?.();
        return;
      }

      if (!cleanEmail.includes("@")) {
        setError("Please enter a valid Email Id.");
        return;
      }
      if (!loginPassword) {
        setError("Please enter your password.");
        return;
      }

      const matched = accounts.find(
        (a) => a.email?.toLowerCase() === cleanEmail
      );
      if (matched) {
        if (matched.password && matched.password !== loginPassword) {
          setError("Incorrect password. Please verify and try again.");
          return;
        }
        const isAdm =
          matched.role === "admin" ||
          matched.isAdmin === true ||
          matched.email?.toLowerCase().includes("admin@");
        if (isAdm) {
          if (onDemoLogin) {
            onDemoLogin("admin");
          } else {
            onLogin?.(matched);
            setPage?.("admin");
          }
        } else {
          onLogin(matched);
        }
        close?.();
        return;
      }

      // Derive nice name from email
      const namePart = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
      const words = namePart.split(" ").filter(Boolean);
      const firstName = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : "Aarav";
      const lastName = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : "Sharma";

      const autoUser = {
        studentId: "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        firstName,
        lastName,
        email: cleanEmail,
        phone: "+91 98765 43210",
        dateOfBirth: "12 Aug 2005",
        password: loginPassword,
        course: "Undergraduate Degree",
        institution: "State University",
        followed: [],
      };
      accounts.push(autoUser);
      localStorage.setItem("sc_registered_users", JSON.stringify(accounts));
      onLogin(autoUser);
      close?.();
    }
  };

  const switchMode = (newMode) => {
    setError("");
    setSuccess("");
    if (newMode === "login") onSwitchLogin();
    else onSwitchRegister();
  };

  return (
    <div className="loginOverlay">
      <div className="loginModal">
        {/* CLOSE BUTTON */}
        <button
          className="loginClose"
          onClick={close}
          aria-label="Close authentication"
          type="button"
        >
          ×
        </button>
        {/* LEFT SIDE */}
        <div className="loginPromo">
          <div className="loginBrand">
            <span>✦</span>
            ScholarshipConnect <i>AI</i>
          </div>
          <div className="loginIllustration">
            <img
              src="/login-student.png"
              alt="Student"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80";
              }}
            />
          </div>
          <p className="loginQuote">
            “Education is the most powerful weapon you can use to change the
            world.”
          </p>
        </div>
        {/* RIGHT SIDE */}
        <div className="loginForm">
          {mode === "register" ? (
            <form onSubmit={handleRegisterSubmit}>
              {/* REGISTER HEADER */}
              <div className="loginFormTop">
                <p>WELCOME TO SCHOLARSHIPCONNECT AI</p>
                <h2>Create Account</h2>
                <span>Start your scholarship journey with us.</span>
              </div>

              {error && (
                <div className="authErrorAlert">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="authSuccessAlert">
                  <span>✓</span> {success}
                </div>
              )}

              {/* FIRST + LAST NAME */}
              <div className="registerNameRow">
                <label className="loginInput">
                  <span>♙</span>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="loginInput">
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* EMAIL */}
              <label className="loginInput">
                <span>✉</span>
                <input
                  type="email"
                  placeholder="Email Id *"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              {/* MOBILE */}
              <label className="loginInput">
                <span>▯</span>
                <input
                  type="tel"
                  placeholder="Mobile (e.g. 9876543210) *"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      phone: e.target.value,
                    })
                  }
                />
              </label>

              {/* DATE OF BIRTH */}
              <label className="loginInput">
                <span>◷</span>
                <input
                  type="date"
                  value={registerData.dateOfBirth}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </label>

              {/* PASSWORD */}
              <label className="loginInput">
                <span>♙</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 characters) *"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "◉" : "◉"}
                </button>
              </label>

              {/* CONFIRM PASSWORD */}
              <label className="loginInput">
                <span>♙</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password *"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "◉" : "◉"}
                </button>
              </label>

              {/* TERMS */}
              <label className="registerTerms">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                />
                <span>
                  I agree to ScholarshipConnect AI's
                  <a href="#privacy"> Privacy Policy</a> and
                  <a href="#terms"> Terms & Conditions</a>
                </span>
              </label>

              {/* SIGN UP */}
              <button className="loginSubmit" type="submit">
                Sign up
              </button>

              {/* LOGIN LINK */}
              <div className="registerPrompt">
                Have an account?
                <button type="button" onClick={() => switchMode("login")}>
                  Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              {/* LOGIN HEADER */}
              <div className="loginFormTop">
                <p>WELCOME BACK</p>
                <h2>Login to your account</h2>
                <span>Continue your scholarship journey.</span>
              </div>

              {error && (
                <div className="authErrorAlert">
                  <span>⚠️</span> {error}
                </div>
              )}
              {success && (
                <div className="authSuccessAlert">
                  <span>✓</span> {success}
                </div>
              )}

              {/* LOGIN TABS */}
              <div className="loginTabs">
                <button
                  className={loginMethod === "mobile" ? "active" : ""}
                  onClick={() => { setLoginMethod("mobile"); setError(""); }}
                  type="button"
                >
                  Mobile No.
                </button>
                <button
                  className={loginMethod === "email" ? "active" : ""}
                  onClick={() => { setLoginMethod("email"); setError(""); }}
                  type="button"
                >
                  Email Id
                </button>
                <button
                  className={loginMethod === "admin" ? "active" : ""}
                  onClick={() => {
                    setLoginMethod("admin");
                    setLoginEmail("admin@scholarshipconnect.org");
                    setLoginPassword("admin");
                    setError("");
                  }}
                  type="button"
                  style={{
                    color: loginMethod === "admin" ? "#ffffff" : "#4f46e5",
                    fontWeight: "700",
                  }}
                >
                  🛡️ Admin
                </button>
              </div>

              {/* QUICK DEMO LOGINS */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  ⚡ Instant Demo:
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDemoLogin) onDemoLogin("student");
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      fontSize: "11.5px",
                      fontWeight: "600",
                      cursor: "pointer",
                      color: "#1e293b",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDemoLogin) onDemoLogin("admin");
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      border: "none",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      color: "#ffffff",
                    }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* MOBILE / EMAIL */}
              {loginMethod === "mobile" ? (
                <label className="loginInput">
                  <span>▯</span>
                  <input
                    type="tel"
                    placeholder="Enter Mobile No. (e.g. 9876543210)"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                  />
                </label>
              ) : (
                <label className="loginInput">
                  <span>✉</span>
                  <input
                    type="email"
                    placeholder="Enter Email Id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </label>
              )}

              {/* PASSWORD */}
              <label className="loginInput">
                <span>♙</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "◉" : "◉"}
                </button>
              </label>

              {/* OPTIONS */}
              <div className="loginOptions">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Password reset instructions have been dispatched to: " +
                        (loginMethod === "email"
                          ? loginEmail || "your registered email"
                          : loginMobile || "your registered mobile number")
                    )
                  }
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN */}
              <button
                className="loginSubmit"
                type="submit"
              >
                Login
              </button>

              {/* REGISTER */}
              <div className="registerPrompt">
                Not Registered Yet?
                <button type="button" onClick={() => switchMode("register")}>
                  Create an account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
function Footer({ setPage, onOpenAISearch }) {
  return (
    <footer className="footer">
      <div>
        <h2>
          ✦ ScholarshipConnect <i>AI</i>
        </h2>
        <p>
          Making education opportunities easier to discover, understand, and
          pursue.
        </p>
      </div>
      <div>
        <b>Scholarships</b>
        <a onClick={() => setPage?.("scholarships")} style={{ cursor: "pointer" }}>Browse Scholarships</a>
        <a onClick={() => onOpenAISearch?.()} style={{ cursor: "pointer" }}>AI Recommendations</a>
        <a onClick={() => setPage?.("scholarships")} style={{ cursor: "pointer" }}>All Categories</a>
      </div>
      <div>
        <b>Student Support</b>
        <a onClick={() => setPage?.("loan")} style={{ cursor: "pointer" }}>Education Loan</a>
        <a onClick={() => setPage?.("results")} style={{ cursor: "pointer" }}>Application Tracking</a>
        <a onClick={() => setPage?.("services")} style={{ cursor: "pointer" }}>Student Services</a>
      </div>
      <div>
        <b>Company</b>
        <a onClick={() => setPage?.("partner")} style={{ cursor: "pointer" }}>Become a Partner</a>
        <a onClick={() => setPage?.("resources")} style={{ cursor: "pointer" }}>Resources & Guides</a>
        <a onClick={() => setPage?.("articles")} style={{ cursor: "pointer" }}>Articles & News</a>
        <a onClick={() => setPage?.("impact")} style={{ cursor: "pointer" }}>Impact Stories</a>
      </div>
      <div>
        <b>Administration</b>
        <a onClick={() => setPage?.("admin")} style={{ cursor: "pointer" }}>🛡️ Admin Console</a>
        <a onClick={() => setPage?.("results")} style={{ cursor: "pointer" }}>Verification Board</a>
        <a onClick={() => setPage?.("scholarships")} style={{ cursor: "pointer" }}>Scholarship Registry</a>
      </div>
      <small>© 2026 ScholarshipConnect AI. All rights reserved.</small>
    </footer>
  );
}
createRoot(document.getElementById("root")).render(<App />);
