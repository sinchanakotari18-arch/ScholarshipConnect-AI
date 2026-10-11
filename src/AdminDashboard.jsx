import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  getAllScholarships,
  saveScholarship,
  deleteScholarship,
  toggleFeaturedScholarship,
  resetToDefaultScholarships,
} from "./scholarshipStore.js";
import {
  getAllApplications,
  updateApplication,
  addApplication,
  deleteApplication,
} from "./applicationsStore.js";
import "./admin.css";

export default function AdminDashboard({ setPage, onSelectScholarship }) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    loginAsAdmin,
    enableAdminPrivileges,
    loginAsStudent,
    login,
  } = useAuth();

  // If not authenticated or not admin, show Admin Gate
  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminAccessGate
        user={user}
        isAuthenticated={isAuthenticated}
        onLoginAsAdmin={loginAsAdmin}
        onEnableAdmin={enableAdminPrivileges}
        onLoginAsStudent={loginAsStudent}
        onLogin={login}
        onReturnToStudent={async () => {
          if (loginAsStudent && user?.role === "admin" && user?.email?.includes("admin@")) {
            await loginAsStudent();
          }
          setPage("home");
        }}
      />
    );
  }

  return (
    <AdminDashboardContent
      user={user}
      setPage={setPage}
      onSelectScholarship={onSelectScholarship}
    />
  );
}

function AdminDashboardContent({ user, setPage, onSelectScholarship }) {
  const {
    loginAsAdmin,
    loginAsStudent,
    login,
    logout,
    allUsers = [],
    addUser,
    updateStudent,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    systemNotice,
    updateSystemNotice,
    save,
  } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'scholarships' | 'applications' | 'users' | 'ai-settings'

  // Dynamic Stores State
  const [scholarshipsList, setScholarshipsList] = useState(getAllScholarships);
  const [applicationsList, setApplicationsList] = useState(getAllApplications);

  // Listen for storage events
  useEffect(() => {
    const handleSchUpdate = () => setScholarshipsList(getAllScholarships());
    const handleAppUpdate = () => setApplicationsList(getAllApplications());
    window.addEventListener("sc_scholarships_updated", handleSchUpdate);
    window.addEventListener("sc_applications_updated", handleAppUpdate);
    return () => {
      window.removeEventListener("sc_scholarships_updated", handleSchUpdate);
      window.removeEventListener("sc_applications_updated", handleAppUpdate);
    };
  }, []);

  // Modals state
  const [scholarshipModal, setScholarshipModal] = useState({ isOpen: false, item: null, isEdit: false });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, application: null });
  const [userModal, setUserModal] = useState({ isOpen: false });
  const [editStudentModal, setEditStudentModal] = useState({ isOpen: false, user: null });
  const [noticeModal, setNoticeModal] = useState(false);
  const [adminProfileModal, setAdminProfileModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    firstName: "",
    lastName: "",
    roleTitle: "",
    department: "",
    institution: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const openAdminProfileEdit = () => {
    setAdminFormData({
      firstName: user?.firstName || "Dr. Rajeshwar",
      lastName: user?.lastName || "Rao",
      roleTitle: user?.roleTitle || "Super Administrator",
      department: user?.department || "Directorate of Higher Education Scholarships",
      institution: user?.institution || "National Scholarship Evaluation Board",
      email: user?.email || "admin@scholarshipconnect.org",
      phone: user?.phone || "9988776655",
      bio: user?.bio || "Senior Director supervising merit-cum-means awards, DBT distributions, and student verification across pan-India scholarship pipelines.",
      avatar: user?.avatar || "",
    });
    setAdminProfileModal(true);
  };

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Scholarships Tab filters
  const [schSearch, setSchSearch] = useState("");
  const [schCategoryFilter, setSchCategoryFilter] = useState("All");

  // Applications Tab filters
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("All");

  // Users Tab filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");

  // AI Settings State
  const [aiSensitivity, setAiSensitivity] = useState(82);
  const [docConfidence, setDocConfidence] = useState(90);
  const [isReindexing, setIsReindexing] = useState(false);

  // Calculated Metrics
  const totalScholarshipsCount = (scholarshipsList || []).length;
  const featuredCount = (scholarshipsList || []).filter((s) => s.featured).length;
  const totalAppsCount = (applicationsList || []).length;
  const pendingAppsCount = (applicationsList || []).filter((a) => a.statusStage <= 2).length;
  const approvedAppsCount = (applicationsList || []).filter((a) => a.status === "Approved" || a.statusStage === 4).length;

  const totalDisbursedAmountFormatted = useMemo(() => {
    const total = (applicationsList || [])
      .filter((a) => a.status === "Approved" || a.statusStage === 4)
      .reduce((sum, a) => sum + (a.awardAmountNumeric || 150000), 0);
    if (total >= 10000000) return `₹ ${(total / 10000000).toFixed(2)} Cr`;
    if (total >= 100000) return `₹ ${(total / 100000).toFixed(2)} Lakh`;
    return `₹ ${total.toLocaleString("en-IN")}`;
  }, [applicationsList]);

  // Filtered Scholarships
  const filteredScholarships = scholarshipsList.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(schSearch.toLowerCase()) ||
      s.provider?.toLowerCase().includes(schSearch.toLowerCase()) ||
      s.education?.toLowerCase().includes(schSearch.toLowerCase());
    const matchesCategory = schCategoryFilter === "All" || s.category === schCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Applications
  const filteredApplications = applicationsList.filter((a) => {
    const matchesSearch =
      a.studentName?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.title?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.id?.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus =
      appStatusFilter === "All" ||
      (appStatusFilter === "Pending" && a.statusStage <= 2) ||
      (appStatusFilter === "Shortlisted" && a.status === "Shortlisted") ||
      (appStatusFilter === "Approved" && a.status === "Approved") ||
      (appStatusFilter === "Rejected" && a.status === "Rejected");
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.institution?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // CRUD Handlers
  const handleSaveScholarship = (formData) => {
    saveScholarship(formData);
    setScholarshipsList(getAllScholarships());
    setScholarshipModal({ isOpen: false, item: null, isEdit: false });
    showToast(formData.id ? "Scholarship updated successfully!" : "New scholarship published!");
  };

  const handleDeleteScholarship = (id) => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      deleteScholarship(id);
      setScholarshipsList(getAllScholarships());
      showToast("Scholarship removed.");
    }
  };

  const handleToggleFeatured = (id) => {
    toggleFeaturedScholarship(id);
    setScholarshipsList(getAllScholarships());
    showToast("Featured status updated.");
  };

  const handleUpdateApplicationStatus = (appId, newStatus, newStage, notes) => {
    updateApplication(appId, {
      status: newStatus,
      statusStage: newStage,
      applicationNotes: notes || undefined,
    });
    setApplicationsList(getAllApplications());
    setReviewModal({ isOpen: false, application: null });
    showToast(`Application ${appId} marked as ${newStatus}!`);
  };

  const handleReindexAI = () => {
    setIsReindexing(true);
    setTimeout(() => {
      setIsReindexing(false);
      showToast("Semantic AI Vector Index updated across all scholarship datasets!");
    }, 1200);
  };

  return (
    <div className="adminRoot">
      {/* TOP HEADER */}
      <header className="adminTopBar">
        <div className="adminTopBarInner">
          <div className="adminBrandBlock">
            <div className="adminBrandIcon">🛡️</div>
            <div className="adminBrandTitles">
              <h1>
                ScholarshipConnect <i>AI</i>
                <span className="adminBadgeRole">Central Admin Console</span>
              </h1>
              <p>National Directorate Oversight & AI Verification Portal</p>
            </div>
          </div>

          <div className="adminTopActions">
            <button
              className="adminBtnPortalSwitch"
              onClick={async () => {
                if (loginAsStudent) await loginAsStudent();
                setPage("home");
              }}
              title="Switch back to student profile and return to student portal"
            >
              🎓 Switch to Student View
            </button>

            <button
              className="adminBtnPrimary"
              onClick={() =>
                setScholarshipModal({
                  isOpen: true,
                  item: {
                    title: "",
                    provider: "",
                    amount: "Up to ₹1,00,000",
                    amountNumeric: 100000,
                    deadline: "30 Nov 2026",
                    deadlineDays: 45,
                    category: "General",
                    education: "Undergraduate",
                    state: "All India",
                    course: "Any",
                    gender: "All",
                    incomeLimit: "₹ 5,00,000 per annum",
                    minMarks: "60% or equivalent",
                    featured: true,
                    description: "",
                    officialUrl: "https://scholarships.gov.in/",
                    documentsRequired: ["Aadhaar Card", "Marks Card", "Income Certificate", "College ID"],
                  },
                  isEdit: false,
                })
              }
            >
              + Post Scholarship
            </button>

            <div
              className="adminUserPill"
              onClick={openAdminProfileEdit}
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              title="Click to view and edit Administrator Profile"
            >
              <div className="adminUserAvatar">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName || "Admin"}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  user?.firstName?.[0] || "A"
                )}
              </div>
              <div className="adminUserInfo">
                <span className="adminUserName">
                  {user?.firstName || "Dr. Rajeshwar"} {user?.lastName || "Rao"} ✎
                </span>
                <span className="adminUserRole">{user?.roleTitle || "Super Administrator"}</span>
              </div>
              <button
                className="adminBtnLogout"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                  setPage("home");
                }}
                title="Log out from Admin Console"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SYSTEM BROADCAST NOTIFICATION BANNER */}
      {systemNotice && systemNotice.active && (
        <div className="adminBroadcastBanner">
          <div className="adminBroadcastContent">
            <span>📢</span>
            <span>{systemNotice.text}</span>
          </div>
          <button
            className="adminBroadcastEditBtn"
            onClick={() => setNoticeModal(true)}
          >
            Edit Announcement
          </button>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span> {toastMsg}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="adminContainer">
        {/* EXECUTIVE KPI CARDS */}
        <section className="adminMetricsGrid">
          <div className="adminMetricCard">
            <div className="adminMetricHeader">
              <span className="adminMetricLabel">Active Programs</span>
              <div className="adminMetricIcon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                🎓
              </div>
            </div>
            <div className="adminMetricValue">{totalScholarshipsCount}</div>
            <div className="adminMetricFooter">
              <span>{featuredCount} Featured on Portal</span>
              <span className="adminMetricTrend positive">● Active</span>
            </div>
          </div>

          <div className="adminMetricCard">
            <div className="adminMetricHeader">
              <span className="adminMetricLabel">Total Applications</span>
              <div className="adminMetricIcon" style={{ background: "#fffbeb", color: "#d97706" }}>
                📋
              </div>
            </div>
            <div className="adminMetricValue">{totalAppsCount}</div>
            <div className="adminMetricFooter">
              <span style={{ color: "#d97706", fontWeight: "700" }}>
                {pendingAppsCount} Awaiting Review
              </span>
              <span className="adminMetricTrend neutral">↗ +14%</span>
            </div>
          </div>

          <div className="adminMetricCard">
            <div className="adminMetricHeader">
              <span className="adminMetricLabel">Sanctioned Grants</span>
              <div className="adminMetricIcon" style={{ background: "#ecfdf5", color: "#059669" }}>
                💰
              </div>
            </div>
            <div className="adminMetricValue">{totalDisbursedAmountFormatted}</div>
            <div className="adminMetricFooter">
              <span>{approvedAppsCount} DBT transfers sanctioned</span>
              <span className="adminMetricTrend positive">✓ 100% On-time</span>
            </div>
          </div>

          <div className="adminMetricCard">
            <div className="adminMetricHeader">
              <span className="adminMetricLabel">Registered Students</span>
              <div className="adminMetricIcon" style={{ background: "#f0fdf4", color: "#166534" }}>
                👥
              </div>
            </div>
            <div className="adminMetricValue">{allUsers.length}</div>
            <div className="adminMetricFooter">
              <span>Across 28 States & UTs</span>
              <span className="adminMetricTrend positive">● Verified</span>
            </div>
          </div>

          <div className="adminMetricCard">
            <div className="adminMetricHeader">
              <span className="adminMetricLabel">AI Match Precision</span>
              <div className="adminMetricIcon" style={{ background: "#fdf4ff", color: "#c026d3" }}>
                ⚡
              </div>
            </div>
            <div className="adminMetricValue">{aiSensitivity}%</div>
            <div className="adminMetricFooter">
              <span>Semantic Verification</span>
              <span className="adminMetricTrend positive">Active</span>
            </div>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <nav className="adminTabsNav">
          <button
            className={`adminTabBtn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Executive Overview
          </button>
          <button
            className={`adminTabBtn ${activeTab === "scholarships" ? "active" : ""}`}
            onClick={() => setActiveTab("scholarships")}
          >
            🎓 Scholarships Manager
            <span className="adminTabBadge">{scholarshipsList.length}</span>
          </button>
          <button
            className={`adminTabBtn ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            📋 Application Approvals
            <span className="adminTabBadge">{pendingAppsCount} pending</span>
          </button>
          <button
            className={`adminTabBtn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 User & Student Directory
            <span className="adminTabBadge">{allUsers.length}</span>
          </button>
          <button
            className={`adminTabBtn ${activeTab === "ai-settings" ? "active" : ""}`}
            onClick={() => setActiveTab("ai-settings")}
          >
            🤖 AI Engine & System
          </button>
        </nav>

        {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="adminOverviewGrid">
            {/* Left Column: Pipeline & Categories */}
            <div className="adminCard">
              <div className="adminCardHeader">
                <div>
                  <h3 className="adminCardTitle">📊 Scholarship Allocation & Category Insights</h3>
                  <p className="adminCardSubtitle">Live distribution of applicant enrollments across verticals</p>
                </div>
              </div>

              <div className="adminCategoryDistribution">
                {[
                  { label: "Engineering & Artificial Intelligence (STEM)", count: 42, pct: 84, color: "#6366f1" },
                  { label: "Women in STEM & Girls Higher Education", count: 28, pct: 68, color: "#ec4899" },
                  { label: "Need-based & Low Income Category (< 2.5L)", count: 35, pct: 76, color: "#10b981" },
                  { label: "Medical Sciences, MBBS & Healthcare", count: 18, pct: 45, color: "#06b6d4" },
                  { label: "National Merit & Talent Olympiad Fellows", count: 14, pct: 32, color: "#f59e0b" },
                ].map((cat) => (
                  <div className="adminDistRow" key={cat.label}>
                    <div className="adminDistHeader">
                      <span>{cat.label}</span>
                      <span>{cat.count} Beneficiaries ({cat.pct}%)</span>
                    </div>
                    <div className="adminDistBarTrack">
                      <div
                        className="adminDistBarFill"
                        style={{ width: `${cat.pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#334155" }}>
                  ⚡ Priority Applications Requiring Sign-off
                </h4>
                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>Student</th>
                        <th>Scheme</th>
                        <th>AI Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationsList.slice(0, 3).map((app) => (
                        <tr key={app.id}>
                          <td><b>{app.id}</b></td>
                          <td>{app.studentName}</td>
                          <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.title}
                          </td>
                          <td>
                            <span style={{ color: "#059669", fontWeight: "700" }}>
                              ⚡ {app.aiMatchScore || 94}%
                            </span>
                          </td>
                          <td>
                            <span className={`statusBadge ${app.status.toLowerCase().replace(" ", "-")}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="adminBtnSmall primary"
                              onClick={() => setReviewModal({ isOpen: true, application: app })}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Live Audit Feed & Quick Actions */}
            <div className="adminCard">
              <div className="adminCardHeader">
                <div>
                  <h3 className="adminCardTitle">⏱️ Real-time Platform Activity</h3>
                  <p className="adminCardSubtitle">Automated audit trails & verification events</p>
                </div>
              </div>

              <ul className="adminAuditFeed">
                <li className="adminAuditItem">
                  <div className="adminAuditIcon">💳</div>
                  <div className="adminAuditDetails">
                    <p>Direct DBT transfer executed for SBI Asha Scholarship</p>
                    <span>12 minutes ago • Automated Disbursal Gateway</span>
                  </div>
                </li>
                <li className="adminAuditItem">
                  <div className="adminAuditIcon">👤</div>
                  <div className="adminAuditDetails">
                    <p>New candidate profile registered: Aarav Sharma (IIT Bombay)</p>
                    <span>34 minutes ago • Student Onboarding</span>
                  </div>
                </li>
                <li className="adminAuditItem">
                  <div className="adminAuditIcon">📑</div>
                  <div className="adminAuditDetails">
                    <p>DigiLocker OCR verified Aadhaar & Class 12 marksheet for #APP-2026-RF10492</p>
                    <span>1 hour ago • AI Document Validator</span>
                  </div>
                </li>
                <li className="adminAuditItem">
                  <div className="adminAuditIcon">🛡️</div>
                  <div className="adminAuditDetails">
                    <p>Admin Dr. Rajeshwar Rao updated Reliance Foundation criteria</p>
                    <span>2 hours ago • Administration Log</span>
                  </div>
                </li>
                <li className="adminAuditItem">
                  <div className="adminAuditIcon">🤖</div>
                  <div className="adminAuditDetails">
                    <p>AI Semantic Search matched 142 new candidates to Kotak Kanya grant</p>
                    <span>3 hours ago • Vector Index Engine</span>
                  </div>
                </li>
              </ul>

              <div style={{ marginTop: "24px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                <b style={{ display: "block", fontSize: "13px", color: "#1e293b", marginBottom: "6px" }}>
                  💡 Quick Administrator Tools
                </b>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    className="adminBtnSmall"
                    onClick={() => {
                      const sample = addApplication({
                        studentId: "SC-2026-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
                        studentName: "Devika Menon",
                        studentEmail: "devika.menon@example.com",
                        title: "Reliance Foundation Undergraduate Scholarships 2026–27",
                        scholarshipId: "reliance-ug",
                        provider: "Reliance Foundation",
                        category: "Engineering",
                        awardAmount: "₹2,00,000",
                        awardAmountNumeric: 200000,
                        academicScore: "96.4% in 12th PCM",
                        annualIncome: "₹ 1,40,000",
                        targetInstitution: "NIT Calicut",
                        attachedDocuments: ["Aadhaar Card", "DigiLocker Verified Marks", "Income Certificate"],
                        applicationNotes: "High academic merit applicant from rural district.",
                      });
                      setApplicationsList(getAllApplications());
                      showToast(`Generated incoming test application ${sample.id}!`);
                    }}
                  >
                    + Generate Test Application
                  </button>
                  <button
                    className="adminBtnSmall"
                    onClick={handleReindexAI}
                  >
                    ⚡ Re-sync AI Vector Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SCHOLARSHIPS MANAGER ================= */}
        {activeTab === "scholarships" && (
          <div className="adminCard">
            <div className="adminCardHeader">
              <div>
                <h3 className="adminCardTitle">🎓 All Scholarship Programs</h3>
                <p className="adminCardSubtitle">Manage grant opportunities, deadlines, requirements, and featured listings</p>
              </div>

              <div className="adminControlsBar">
                <div className="adminSearchInputWrap">
                  <span>🔍</span>
                  <input
                    type="text"
                    className="adminSearchInput"
                    placeholder="Search by title, sponsor, stream..."
                    value={schSearch}
                    onChange={(e) => setSchSearch(e.target.value)}
                  />
                </div>

                <select
                  className="adminSelect"
                  value={schCategoryFilter}
                  onChange={(e) => setSchCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="Minority">Minority</option>
                  <option value="Disabled">Differently Abled</option>
                </select>

                <button
                  className="adminBtnPrimary"
                  onClick={() =>
                    setScholarshipModal({
                      isOpen: true,
                      item: {
                        title: "",
                        provider: "",
                        amount: "Up to ₹1,50,000",
                        amountNumeric: 150000,
                        deadline: "15 Nov 2026",
                        deadlineDays: 40,
                        category: "General",
                        education: "Undergraduate",
                        state: "All India",
                        course: "Engineering / Science",
                        gender: "All",
                        incomeLimit: "₹ 4,00,000 per annum",
                        minMarks: "65% or equivalent",
                        featured: true,
                        description: "",
                        officialUrl: "https://scholarships.gov.in/",
                        documentsRequired: ["Aadhaar Card", "Class 12 Marksheet", "Income Certificate"],
                      },
                      isEdit: false,
                    })
                  }
                >
                  + Add Scholarship
                </button>
              </div>
            </div>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Scheme / Title</th>
                    <th>Provider</th>
                    <th>Award Amount</th>
                    <th>Category</th>
                    <th>Deadline</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScholarships.map((s) => (
                    <tr key={s.id}>
                      <td style={{ maxWidth: "280px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: s.color || "#4f46e5",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <b style={{ color: "#0f172a", fontSize: "13.5px" }}>{s.title}</b>
                            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                              {s.education} • {s.state}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><b>{s.provider}</b></td>
                      <td>
                        <span style={{ color: "#059669", fontWeight: "700" }}>{s.amount}</span>
                      </td>
                      <td>
                        <span className="statusBadge shortlisted">{s.category}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px" }}>{s.deadline}</span>
                      </td>
                      <td>
                        <button
                          className={`adminBtnSmall ${s.featured ? "success" : ""}`}
                          onClick={() => handleToggleFeatured(s.id)}
                          title="Toggle featured status"
                        >
                          {s.featured ? "⭐ Featured" : "☆ Standard"}
                        </button>
                      </td>
                      <td>
                        <div className="adminActionBtnGroup">
                          <button
                            className="adminBtnSmall primary"
                            onClick={() =>
                              setScholarshipModal({
                                isOpen: true,
                                item: { ...s },
                                isEdit: true,
                              })
                            }
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="adminBtnSmall danger"
                            onClick={() => handleDeleteScholarship(s.id)}
                          >
                            🗑️
                          </button>
                          {onSelectScholarship && (
                            <button
                              className="adminBtnSmall"
                              onClick={() => onSelectScholarship(s)}
                              title="Preview student view"
                            >
                              ↗
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#64748b" }}>
              <span>Showing {filteredScholarships.length} of {scholarshipsList.length} scholarships</span>
              <button
                className="adminBtnSmall"
                onClick={() => {
                  if (window.confirm("Reset all scholarships back to factory defaults?")) {
                    resetToDefaultScholarships();
                    setScholarshipsList(getAllScholarships());
                    showToast("Scholarship catalog reset to defaults.");
                  }
                }}
              >
                ↻ Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: APPLICATIONS & APPROVALS ================= */}
        {activeTab === "applications" && (
          <div className="adminCard">
            <div className="adminCardHeader">
              <div>
                <h3 className="adminCardTitle">📋 Student Applications & Verification Queue</h3>
                <p className="adminCardSubtitle">Inspect applicant dossiers, verify documentation, and sanction DBT funding</p>
              </div>

              <div className="adminControlsBar">
                <div className="adminSearchInputWrap">
                  <span>🔍</span>
                  <input
                    type="text"
                    className="adminSearchInput"
                    placeholder="Search by student, ID, scholarship..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                  />
                </div>

                <select
                  className="adminSelect"
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Approved">Approved & Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Candidate</th>
                    <th>Scholarship Program</th>
                    <th>Applied Date</th>
                    <th>Award Value</th>
                    <th>AI Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td><b>{app.id}</b></td>
                      <td>
                        <div>
                          <b>{app.studentName}</b>
                          <div style={{ fontSize: "11.5px", color: "#64748b" }}>{app.studentEmail}</div>
                        </div>
                      </td>
                      <td style={{ maxWidth: "260px" }}>
                        <div style={{ fontWeight: "600", color: "#1e293b" }}>{app.title}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{app.provider}</div>
                      </td>
                      <td>{app.appliedDate}</td>
                      <td>
                        <span style={{ color: "#059669", fontWeight: "700" }}>{app.awardAmount}</span>
                      </td>
                      <td>
                        <span style={{ color: "#4f46e5", fontWeight: "700" }}>
                          ⚡ {app.aiMatchScore || 92}%
                        </span>
                      </td>
                      <td>
                        <span className={`statusBadge ${app.status.toLowerCase().replace(" ", "-")}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="adminBtnSmall primary"
                          onClick={() => setReviewModal({ isOpen: true, application: app })}
                        >
                          Inspect & Decide
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
              Showing {filteredApplications.length} applications
            </div>
          </div>
        )}

        {/* ================= TAB 4: USER & STUDENT DIRECTORY ================= */}
        {activeTab === "users" && (
          <div className="adminCard">
            <div className="adminCardHeader">
              <div>
                <h3 className="adminCardTitle">👥 Registered Users & Administrator Authority</h3>
                <p className="adminCardSubtitle">Inspect student profiles, verify role authority, and manage account statuses</p>
              </div>

              <div className="adminControlsBar">
                <div className="adminSearchInputWrap">
                  <span>🔍</span>
                  <input
                    type="text"
                    className="adminSearchInput"
                    placeholder="Search by student name, ID, college..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <select
                  className="adminSelect"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>

                <button
                  className="adminBtnPrimary"
                  onClick={() => setUserModal({ isOpen: true })}
                >
                  + Add User
                </button>
              </div>
            </div>

            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>User ID / Student ID</th>
                    <th>Name</th>
                    <th>Email & Phone</th>
                    <th>Institution / Stream</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id || u.email}>
                      <td>
                        <b>{u.studentId || u.id}</b>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: u.role === "admin" ? "#4f46e5" : "#0284c7",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {u.firstName?.[0] || "U"}
                          </span>
                          <b>{u.firstName} {u.lastName}</b>
                        </div>
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{u.phone}</div>
                      </td>
                      <td style={{ maxWidth: "220px" }}>
                        <div>{u.institution || "State University"}</div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{u.course || "Undergraduate"}</div>
                      </td>
                      <td>
                        <span className={`statusBadge ${u.role === "admin" ? "shortlisted" : "active"}`}>
                          {u.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                        </span>
                      </td>
                      <td>
                        <span className={`statusBadge ${u.status === "suspended" ? "suspended" : "approved"}`}>
                          {u.status === "suspended" ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="adminActionBtnGroup">
                          <button
                            className="adminBtnSmall primary"
                            onClick={() => setEditStudentModal({ isOpen: true, user: u })}
                            title="Edit Student Profile Details"
                          >
                            ✎ Edit
                          </button>
                          <button
                            className="adminBtnSmall"
                            onClick={() => {
                              const newRole = u.role === "admin" ? "student" : "admin";
                              updateUserRole(u.id || u.email, newRole);
                              showToast(`Updated ${u.firstName}'s role to ${newRole}!`);
                            }}
                            title="Toggle between student and admin"
                          >
                            {u.role === "admin" ? "Demote" : "Promote"}
                          </button>
                          <button
                            className={`adminBtnSmall ${u.status === "suspended" ? "success" : "danger"}`}
                            onClick={() => {
                              toggleUserStatus(u.id || u.email);
                              showToast(`User status toggled!`);
                            }}
                          >
                            {u.status === "suspended" ? "Activate" : "Suspend"}
                          </button>
                          <button
                            className="adminBtnSmall danger"
                            onClick={() => {
                              if (window.confirm(`Delete user ${u.firstName} ${u.lastName}?`)) {
                                deleteUser(u.id || u.email);
                                showToast("User removed.");
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
              Showing {filteredUsers.length} users
            </div>
          </div>
        )}

        {/* ================= TAB 5: AI ENGINE & SETTINGS ================= */}
        {activeTab === "ai-settings" && (
          <div className="adminAISettingsGrid">
            <div className="adminAISettingCard">
              <h4 className="adminAISettingTitle">⚡ AI Semantic Match Sensitivity</h4>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>
                Controls the strictness of the vector embeddings matching engine. Lower values recommend broader scholarships; higher values require strict qualifications.
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: "700" }}>
                  <span>Sensitivity Threshold:</span>
                  <span style={{ color: "#4f46e5" }}>{aiSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  value={aiSensitivity}
                  onChange={(e) => setAiSensitivity(Number(e.target.value))}
                  className="adminRangeSlider"
                />
              </div>

              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                <h5 style={{ margin: "0 0 6px 0", fontSize: "13px" }}>OCR Document Confidence Threshold</h5>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: "700" }}>
                  <span>Auto-Pass Score:</span>
                  <span style={{ color: "#059669" }}>{docConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="99"
                  value={docConfidence}
                  onChange={(e) => setDocConfidence(Number(e.target.value))}
                  className="adminRangeSlider"
                />
              </div>

              <button
                className="adminBtnPrimary"
                onClick={handleReindexAI}
                disabled={isReindexing}
                style={{ marginTop: "16px" }}
              >
                {isReindexing ? "⚡ Re-indexing Vectors..." : "🔄 Rebuild Vector Embeddings Index"}
              </button>
            </div>

            <div className="adminAISettingCard">
              <h4 className="adminAISettingTitle">📢 System-wide Broadcast Announcement</h4>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0" }}>
                Broadcast crucial notices (e.g. deadline extensions, DBT guidelines) visible across all student pages.
              </p>

              <div className="adminFormGroup">
                <label>Active Broadcast Message</label>
                <textarea
                  className="adminTextarea"
                  rows={3}
                  value={systemNotice?.text || ""}
                  onChange={(e) => updateSystemNotice(e.target.value, systemNotice?.type || "info", true)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "10px" }}>
                <label className="adminCheckboxLabel">
                  <input
                    type="checkbox"
                    checked={Boolean(systemNotice?.active)}
                    onChange={(e) => updateSystemNotice(systemNotice?.text || "", systemNotice?.type || "info", e.target.checked)}
                  />
                  <span>Display on Portal Banner</span>
                </label>

                <select
                  className="adminSelect"
                  value={systemNotice?.type || "info"}
                  onChange={(e) => updateSystemNotice(systemNotice?.text || "", e.target.value, systemNotice?.active)}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="urgent">Urgent / Warning (Amber)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#b91c1c" }}>⚠️ Danger Zone</h5>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 10px 0" }}>
                  Reset platform local test data and re-initialize factory records.
                </p>
                <button
                  className="adminBtnSmall danger"
                  onClick={() => {
                    if (window.confirm("Are you sure? This will reset all scholarships and applications to default demo states.")) {
                      resetToDefaultScholarships();
                      localStorage.removeItem("sc_all_applications");
                      setScholarshipsList(getAllScholarships());
                      setApplicationsList(getAllApplications());
                      showToast("Platform data reset to defaults.");
                    }
                  }}
                >
                  Reset All Platform Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT SCHOLARSHIP ================= */}
      {scholarshipModal.isOpen && (
        <div className="adminModalOverlay" onClick={() => setScholarshipModal({ isOpen: false, item: null })}>
          <div className="adminModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>{scholarshipModal.isEdit ? "✏️ Edit Scholarship Program" : "+ Post New Scholarship Program"}</h2>
              <button
                className="adminModalCloseBtn"
                onClick={() => setScholarshipModal({ isOpen: false, item: null })}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveScholarship(scholarshipModal.item);
              }}
            >
              <div className="adminModalBody">
                <div className="adminFormGrid">
                  <div className="adminFormGroup fullWidth">
                    <label>Scholarship Title *</label>
                    <input
                      type="text"
                      className="adminInput"
                      required
                      value={scholarshipModal.item?.title || ""}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, title: e.target.value },
                        })
                      }
                      placeholder="e.g. Reliance Foundation Undergraduate Scholarships 2026"
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Provider / Sponsor *</label>
                    <input
                      type="text"
                      className="adminInput"
                      required
                      value={scholarshipModal.item?.provider || ""}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, provider: e.target.value },
                        })
                      }
                      placeholder="e.g. Reliance Foundation / Tata Trusts"
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Award Amount Display *</label>
                    <input
                      type="text"
                      className="adminInput"
                      required
                      value={scholarshipModal.item?.amount || ""}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, amount: e.target.value },
                        })
                      }
                      placeholder="e.g. Up to ₹2,00,000"
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Category</label>
                    <select
                      className="adminSelect"
                      value={scholarshipModal.item?.category || "General"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, category: e.target.value },
                        })
                      }
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="Minority">Minority</option>
                      <option value="Disabled">Differently Abled</option>
                    </select>
                  </div>

                  <div className="adminFormGroup">
                    <label>Education Level</label>
                    <select
                      className="adminSelect"
                      value={scholarshipModal.item?.education || "Undergraduate"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, education: e.target.value },
                        })
                      }
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 12">Class 12</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="PhD / Research">PhD / Research</option>
                    </select>
                  </div>

                  <div className="adminFormGroup">
                    <label>Application Deadline</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={scholarshipModal.item?.deadline || "15 Nov 2026"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, deadline: e.target.value },
                        })
                      }
                      placeholder="e.g. 15 Nov 2026"
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Annual Family Income Ceiling</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={scholarshipModal.item?.incomeLimit || "₹ 6,00,000 per annum"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, incomeLimit: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Min Qualifying Marks %</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={scholarshipModal.item?.minMarks || "60% in previous exam"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, minMarks: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="adminFormGroup">
                    <label>Official Application Link (URL)</label>
                    <input
                      type="url"
                      className="adminInput"
                      value={scholarshipModal.item?.officialUrl || "https://scholarships.gov.in/"}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, officialUrl: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="adminFormGroup fullWidth">
                    <label>Description & Scope</label>
                    <textarea
                      className="adminTextarea"
                      rows={3}
                      value={scholarshipModal.item?.description || ""}
                      onChange={(e) =>
                        setScholarshipModal({
                          ...scholarshipModal,
                          item: { ...scholarshipModal.item, description: e.target.value },
                        })
                      }
                      placeholder="Provide program eligibility details, selection process, and benefits..."
                    />
                  </div>

                  <div className="adminFormGroup fullWidth">
                    <label className="adminCheckboxLabel">
                      <input
                        type="checkbox"
                        checked={Boolean(scholarshipModal.item?.featured)}
                        onChange={(e) =>
                          setScholarshipModal({
                            ...scholarshipModal,
                            item: { ...scholarshipModal.item, featured: e.target.checked },
                          })
                        }
                      />
                      <span>Mark as Featured (Highlights on Homepage and Top Banners)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="adminModalFooter">
                <button
                  type="button"
                  className="adminBtnSmall"
                  onClick={() => setScholarshipModal({ isOpen: false, item: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="adminBtnPrimary">
                  {scholarshipModal.isEdit ? "Save Changes" : "Publish Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: APPLICATION REVIEW & VERIFICATION DRAWER ================= */}
      {reviewModal.isOpen && reviewModal.application && (
        <div className="adminModalOverlay" onClick={() => setReviewModal({ isOpen: false, application: null })}>
          <div className="adminModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>📋 Application Dossier Review • {reviewModal.application.id}</h2>
              <button
                className="adminModalCloseBtn"
                onClick={() => setReviewModal({ isOpen: false, application: null })}
              >
                ×
              </button>
            </div>

            <div className="adminModalBody">
              {/* Top Summary Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                  color: "#ffffff",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "#a5b4fc", textTransform: "uppercase" }}>
                    Applied Scheme
                  </div>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "16px", color: "#ffffff" }}>
                    {reviewModal.application.title}
                  </h3>
                  <div style={{ fontSize: "12.5px", color: "#cbd5e1", marginTop: "3px" }}>
                    Provider: {reviewModal.application.provider} • Award: <b>{reviewModal.application.awardAmount}</b>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11.5px", color: "#a5b4fc" }}>AI Match Score</div>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#34d399" }}>
                    ⚡ {reviewModal.application.aiMatchScore || 94}%
                  </div>
                  <span className={`statusBadge ${reviewModal.application.status.toLowerCase().replace(" ", "-")}`}>
                    {reviewModal.application.status}
                  </span>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="adminReviewSection">
                <h4 className="adminReviewSectionTitle">👤 Candidate Credentials</h4>
                <div className="adminReviewInfoGrid">
                  <div className="adminReviewField">
                    <span>Full Name</span>
                    <b>{reviewModal.application.studentName}</b>
                  </div>
                  <div className="adminReviewField">
                    <span>Email Address</span>
                    <b>{reviewModal.application.studentEmail}</b>
                  </div>
                  <div className="adminReviewField">
                    <span>Academic Score</span>
                    <b>{reviewModal.application.academicScore || "94.2% Aggregate"}</b>
                  </div>
                  <div className="adminReviewField">
                    <span>Annual Family Income</span>
                    <b>{reviewModal.application.annualIncome || "₹ 1,80,000"}</b>
                  </div>
                  <div className="adminReviewField">
                    <span>Enrolled Institution</span>
                    <b>{reviewModal.application.targetInstitution || "Indian Institute of Technology"}</b>
                  </div>
                  <div className="adminReviewField">
                    <span>Submission Timestamp</span>
                    <b>{reviewModal.application.appliedDate}</b>
                  </div>
                </div>
              </div>

              {/* Document Verification Checklist */}
              <div className="adminReviewSection">
                <h4 className="adminReviewSectionTitle">📑 Verification of Required Documents</h4>
                <div className="adminDocList">
                  {(reviewModal.application.attachedDocuments || [
                    "Aadhaar Card (e-KYC verified)",
                    "Previous Year Qualifying Marksheet",
                    "Income Certificate (Tehsildar Certified)",
                    "Bank Passbook (DBT Active)",
                  ]).map((doc, idx) => (
                    <div className="adminDocItem" key={idx}>
                      <span>📄 {doc}</span>
                      <span className="adminDocStatus">✓ Verified via DigiLocker</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviewer Notes / Remarks */}
              <div className="adminFormGroup fullWidth">
                <label>Reviewer Remarks & Disbursement Notes</label>
                <textarea
                  className="adminTextarea"
                  rows={2}
                  defaultValue={reviewModal.application.applicationNotes || "Verified against statutory income and academic cut-off."}
                  id="adminAppReviewNotes"
                />
              </div>
            </div>

            <div className="adminModalFooter">
              <button
                type="button"
                className="adminBtnSmall danger"
                onClick={() =>
                  handleUpdateApplicationStatus(
                    reviewModal.application.id,
                    "Rejected",
                    5,
                    document.getElementById("adminAppReviewNotes")?.value
                  )
                }
              >
                ✕ Reject Application
              </button>

              <button
                type="button"
                className="adminBtnSmall"
                onClick={() =>
                  handleUpdateApplicationStatus(
                    reviewModal.application.id,
                    "Shortlisted",
                    3,
                    document.getElementById("adminAppReviewNotes")?.value
                  )
                }
              >
                ⭐ Move to Shortlist
              </button>

              <button
                type="button"
                className="adminBtnPrimary"
                onClick={() =>
                  handleUpdateApplicationStatus(
                    reviewModal.application.id,
                    "Approved",
                    4,
                    document.getElementById("adminAppReviewNotes")?.value
                  )
                }
              >
                ✓ Approve & Sanction DBT Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW USER ================= */}
      {userModal.isOpen && (
        <div className="adminModalOverlay" onClick={() => setUserModal({ isOpen: false })}>
          <div className="adminModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>👥 Register New User / Authority</h2>
              <button className="adminModalCloseBtn" onClick={() => setUserModal({ isOpen: false })}>
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const newUser = {
                  firstName: form.firstName.value,
                  lastName: form.lastName.value,
                  email: form.email.value,
                  phone: form.phone.value,
                  role: form.role.value,
                  isAdmin: form.role.value === "admin",
                  institution: form.institution.value,
                  course: form.course.value,
                  password: "password123",
                };
                addUser(newUser);
                setUserModal({ isOpen: false });
                showToast(`Created user account for ${newUser.firstName}!`);
              }}
            >
              <div className="adminModalBody">
                <div className="adminFormGrid">
                  <div className="adminFormGroup">
                    <label>First Name *</label>
                    <input type="text" name="firstName" required className="adminInput" placeholder="Aarav" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" required className="adminInput" placeholder="Sharma" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Email *</label>
                    <input type="email" name="email" required className="adminInput" placeholder="student@example.com" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Phone *</label>
                    <input type="tel" name="phone" required className="adminInput" placeholder="+91 98765 43210" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Role</label>
                    <select name="role" className="adminSelect" defaultValue="student">
                      <option value="student">Student</option>
                      <option value="admin">Administrator (Level 1)</option>
                    </select>
                  </div>
                  <div className="adminFormGroup">
                    <label>Institution / College</label>
                    <input type="text" name="institution" className="adminInput" placeholder="IIT Bombay / State University" />
                  </div>
                  <div className="adminFormGroup fullWidth">
                    <label>Course / Specialization</label>
                    <input type="text" name="course" className="adminInput" placeholder="B.Tech Computer Science / Medical" />
                  </div>
                </div>
              </div>

              <div className="adminModalFooter">
                <button type="button" className="adminBtnSmall" onClick={() => setUserModal({ isOpen: false })}>
                  Cancel
                </button>
                <button type="submit" className="adminBtnPrimary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STUDENT RECORD ================= */}
      {editStudentModal.isOpen && editStudentModal.user && (
        <div className="adminModalOverlay" onClick={() => setEditStudentModal({ isOpen: false, user: null })}>
          <div className="adminModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>✎ Edit Student Record ({editStudentModal.user.studentId || editStudentModal.user.id})</h2>
              <button className="adminModalCloseBtn" onClick={() => setEditStudentModal({ isOpen: false, user: null })}>
                ×
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const updates = {
                  firstName: form.firstName.value.trim(),
                  lastName: form.lastName.value.trim(),
                  email: form.email.value.trim(),
                  phone: form.phone.value.trim(),
                  course: form.course.value.trim(),
                  institution: form.institution.value.trim(),
                  annualIncome: form.annualIncome.value.trim(),
                  gpa: form.gpa.value.trim(),
                  category: form.category.value,
                  status: form.status.value,
                  role: form.role.value,
                };
                const targetId = editStudentModal.user.studentId || editStudentModal.user.email || editStudentModal.user._id;
                if (updateStudent) {
                  await updateStudent(targetId, updates);
                }
                setEditStudentModal({ isOpen: false, user: null });
                showToast(`✓ Updated ${updates.firstName}'s student profile successfully!`);
              }}
            >
              <div className="adminModalBody">
                <div className="adminFormGrid">
                  <div className="adminFormGroup">
                    <label>First Name</label>
                    <input type="text" name="firstName" defaultValue={editStudentModal.user.firstName || ""} required className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Last Name</label>
                    <input type="text" name="lastName" defaultValue={editStudentModal.user.lastName || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Email</label>
                    <input type="email" name="email" defaultValue={editStudentModal.user.email || ""} required className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Phone</label>
                    <input type="tel" name="phone" defaultValue={editStudentModal.user.phone || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Course / Degree</label>
                    <input type="text" name="course" defaultValue={editStudentModal.user.course || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Institution / University</label>
                    <input type="text" name="institution" defaultValue={editStudentModal.user.institution || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Annual Family Income</label>
                    <input type="text" name="annualIncome" defaultValue={editStudentModal.user.annualIncome || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Qualifying GPA / Marks</label>
                    <input type="text" name="gpa" defaultValue={editStudentModal.user.gpa || ""} className="adminInput" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Category</label>
                    <select name="category" className="adminSelect" defaultValue={editStudentModal.user.category || "General"}>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  <div className="adminFormGroup">
                    <label>Account Status</label>
                    <select name="status" className="adminSelect" defaultValue={editStudentModal.user.status || "active"}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="adminFormGroup fullWidth">
                    <label>Role Authority</label>
                    <select name="role" className="adminSelect" defaultValue={editStudentModal.user.role || "student"}>
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="adminModalFooter">
                <button type="button" className="adminBtnSmall" onClick={() => setEditStudentModal({ isOpen: false, user: null })}>
                  Cancel
                </button>
                <button type="submit" className="adminBtnPrimary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BROADCAST NOTICE ================= */}
      {noticeModal && (
        <div className="adminModalOverlay" onClick={() => setNoticeModal(false)}>
          <div className="adminModalCard" style={{ width: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>📢 Edit Broadcast Notice</h2>
              <button className="adminModalCloseBtn" onClick={() => setNoticeModal(false)}>
                ×
              </button>
            </div>
            <div className="adminModalBody">
              <div className="adminFormGroup">
                <label>Announcement Text</label>
                <textarea
                  className="adminTextarea"
                  rows={3}
                  id="noticeEditInput"
                  defaultValue={systemNotice?.text || ""}
                />
              </div>
            </div>
            <div className="adminModalFooter">
              <button className="adminBtnSmall" onClick={() => setNoticeModal(false)}>
                Cancel
              </button>
              <button
                className="adminBtnPrimary"
                onClick={() => {
                  const val = document.getElementById("noticeEditInput")?.value;
                  if (val) {
                    updateSystemNotice(val, systemNotice?.type || "info", true);
                    setNoticeModal(false);
                    showToast("Broadcast announcement updated!");
                  }
                }}
              >
                Save & Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ADMIN PROFILE ================= */}
      {adminProfileModal && (
        <div className="adminModalOverlay" onClick={() => setAdminProfileModal(false)}>
          <div className="adminModalCard" style={{ width: "650px", maxWidth: "95vw" }} onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h2>🛡️ Edit Administrator Profile</h2>
              <button className="adminModalCloseBtn" onClick={() => setAdminProfileModal(false)}>
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = {
                  ...user,
                  firstName: adminFormData.firstName.trim() || user.firstName,
                  lastName: adminFormData.lastName.trim() || user.lastName,
                  roleTitle: adminFormData.roleTitle.trim(),
                  department: adminFormData.department.trim(),
                  institution: adminFormData.institution.trim(),
                  email: adminFormData.email.trim() || user.email,
                  phone: adminFormData.phone.trim() || user.phone,
                  bio: adminFormData.bio.trim(),
                  avatar: adminFormData.avatar.trim(),
                  profilePhoto: adminFormData.avatar.trim(),
                };
                save(updated);
                setAdminProfileModal(false);
                showToast("Administrator profile updated successfully! ✓");
              }}
            >
              <div className="adminModalBody">
                <div className="adminFormGrid">
                  <div className="adminFormGroup">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={adminFormData.firstName}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={adminFormData.lastName}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Official Email</label>
                    <input
                      type="email"
                      className="adminInput"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Official Contact Number</label>
                    <input
                      type="tel"
                      className="adminInput"
                      value={adminFormData.phone}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Designation / Role Title</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={adminFormData.roleTitle}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, roleTitle: e.target.value }))}
                      placeholder="Super Administrator / Senior Director"
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Department</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={adminFormData.department}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, department: e.target.value }))}
                    />
                  </div>
                  <div className="adminFormGroup fullWidth">
                    <label>Evaluation Board / Authority Institution</label>
                    <input
                      type="text"
                      className="adminInput"
                      value={adminFormData.institution}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, institution: e.target.value }))}
                    />
                  </div>
                  <div className="adminFormGroup fullWidth">
                    <label>Profile Avatar / Photo URL</label>
                    <input
                      type="url"
                      className="adminInput"
                      value={adminFormData.avatar}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, avatar: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="adminFormGroup fullWidth">
                    <label>Executive Bio & Directorate Note</label>
                    <textarea
                      rows={3}
                      className="adminTextarea"
                      value={adminFormData.bio}
                      onChange={(e) => setAdminFormData((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Senior Director supervising scholarship disbursements..."
                    />
                  </div>
                </div>
              </div>
              <div className="adminModalFooter">
                <button type="button" className="adminBtnSmall" onClick={() => setAdminProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="adminBtnPrimary">
                  Save Administrator Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ACCESS DENIED GATE / LOGIN GATE FOR NON-ADMIN USERS
function AdminAccessGate({
  user,
  isAuthenticated,
  onLoginAsAdmin,
  onEnableAdmin,
  onLoginAsStudent,
  onLogin,
  onReturnToStudent,
}) {
  const [emailInput, setEmailInput] = useState("admin@scholarshipconnect.org");
  const [passwordInput, setPasswordInput] = useState("admin");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGateSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanId = (emailInput || "").trim().toLowerCase();
    const cleanPass = (passwordInput || "").trim();
    if (!cleanId) {
      setErrorMsg("Please enter an administrator email or ID.");
      return;
    }
    // Fast path for admin credentials
    if (
      (cleanId === "admin" ||
        cleanId === "admin@scholarshipconnect.org" ||
        cleanId === "sc-admin-001" ||
        cleanId === "admin-001") &&
      (cleanPass === "admin" || cleanPass === "admin123" || !cleanPass)
    ) {
      onLoginAsAdmin();
      return;
    }
    const res = onLogin({ identifier: emailInput, password: passwordInput });
    if (!res?.success) {
      setErrorMsg(res?.error || "Invalid administrator credentials.");
    } else if (!res?.user?.isAdmin && res?.user?.role !== "admin") {
      setErrorMsg("Access Denied: Logged in account does not have administrative privileges. Use admin@scholarshipconnect.org.");
    }
  };

  return (
    <div className="adminGateRoot">
      <div className="adminGateCard">
        <div className="adminGateIcon">🛡️</div>
        <h2>Administrative Authority Required</h2>
        <p>
          This console provides supervisory controls for scholarship approval, DBT disbursements, and candidate eligibility verification.
        </p>

        {isAuthenticated && user && !user.isAdmin && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "14px",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#fca5a5",
              marginBottom: "18px",
              textAlign: "left",
            }}
          >
            Currently logged in as: <strong>{user.firstName} {user.lastName}</strong> (Student Role).
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                className="adminGateQuickLoginBtn"
                style={{ width: "100%", padding: "10px 14px", fontSize: "13px", background: "linear-gradient(135deg, #10b981, #059669)" }}
                onClick={async () => {
                  if (onEnableAdmin) await onEnableAdmin();
                  else await onLoginAsAdmin();
                }}
              >
                ⚡ Continue as Supervisor with {user.firstName}'s Profile
              </button>
              <button
                type="button"
                className="adminGateQuickLoginBtn"
                style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                onClick={() => onLoginAsAdmin()}
              >
                ⚡ Switch to Dedicated Administrator Account
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="adminGateActions">
          <button
            type="button"
            className="adminGateQuickLoginBtn"
            onClick={() => onLoginAsAdmin()}
          >
            ⚡ One-Click Sign In as Administrator
          </button>

          <form onSubmit={handleGateSubmit} style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Admin Email or ID (e.g. admin@scholarshipconnect.org)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="adminInput"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
            />
            <input
              type="password"
              placeholder="Password (e.g. admin)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="adminInput"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
            />
            <button
              type="submit"
              className="adminBtnPortalSwitch"
              style={{ justifyContent: "center", background: "rgba(255,255,255,0.15)" }}
            >
              Sign In with Credentials
            </button>
          </form>

          <button className="adminGateBackBtn" onClick={onReturnToStudent} style={{ marginTop: "10px" }}>
            ← Return to Student Portal
          </button>
        </div>

        <div className="adminGateHint">
          <b>Official Demo Admin Credentials:</b><br />
          Email: <code>admin@scholarshipconnect.org</code> • Password: <code>admin</code>
        </div>
      </div>
    </div>
  );
}
