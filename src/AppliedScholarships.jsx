import React, { useState, useEffect } from "react";

export default function AppliedScholarships({ user, onSelect, setPage }) {
  const candidateName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana kotari";
  const studentId = user?.studentId || "SC-2026-5OAP";

  const storageKey = `sc_applied_apps_${user?.studentId || "default"}`;

  const defaultApplications = [
    {
      id: "APP-2026-RF10492",
      title: "Reliance Foundation Undergraduate Scholarships 2026–27",
      provider: "Reliance Foundation",
      category: "Undergraduate Degree",
      appliedDate: "12 Aug 2026",
      deadline: "05 Oct 2026",
      awardAmount: "₹2,00,000",
      status: "Shortlisted",
      statusStage: 3, // 1: Submitted, 2: Verification, 3: Shortlisted, 4: Disbursed
      academicScore: "94.5% in Class 12",
      annualIncome: "₹ 1,80,000",
      targetInstitution: "National Institute of Engineering / VTU",
      attachedDocuments: ["Aadhaar Card (Verified)", "Class 10 Marksheet", "Family Income Certificate", "College ID"],
      applicationNotes: "Provisional selection approved. National Merit Rank AIR-142. Next: DBT grant disbursement.",
    },
    {
      id: "APP-2026-SBI9118",
      title: "SBI Platinum Jubilee Asha Scholarship (Phase-1)",
      provider: "SBI Foundation",
      category: "School & UG",
      appliedDate: "28 Aug 2026",
      deadline: "30 Sep 2026",
      awardAmount: "₹50,000",
      status: "Approved",
      statusStage: 4,
      academicScore: "92.0% Qualifying Marks",
      annualIncome: "₹ 1,80,000",
      targetInstitution: "Bangalore University Affiliated",
      attachedDocuments: ["Aadhaar Card", "Bank Passbook (DBT Active)", "Income Certificate"],
      applicationNotes: "Grant amount sanctioned and disbursed via direct account credit.",
    },
    {
      id: "APP-2026-KK489",
      title: "Kotak Kanya Scholarship Selection Roll 2026",
      provider: "Kotak Education Foundation",
      category: "Girls Professional",
      appliedDate: "04 Sep 2026",
      deadline: "15 Oct 2026",
      awardAmount: "₹1,50,000 / year",
      status: "Under Review",
      statusStage: 2,
      academicScore: "CET Rank #4,102",
      annualIncome: "₹ 1,80,000",
      targetInstitution: "Engineering Degree Course",
      attachedDocuments: ["Aadhaar Card", "Marks Card", "Income Certificate", "Bonafide Letter"],
      applicationNotes: "Academic documents verified. Screening by regional evaluation committee in progress.",
    },
    {
      id: "APP-2026-LOR312",
      title: "L’Oréal India For Young Women in Science 2026",
      provider: "L’Oréal India",
      category: "Women in STEM",
      appliedDate: "10 Sep 2026",
      deadline: "20 Oct 2026",
      awardAmount: "₹2,50,000",
      status: "Under Review",
      statusStage: 2,
      academicScore: "95.2% in PCM",
      annualIncome: "₹ 2,40,000",
      targetInstitution: "B.Sc / B.Tech STEM Faculty",
      attachedDocuments: ["Class 12 Marksheet", "Identity Card", "Statement of Purpose (SOP)"],
      applicationNotes: "SOP evaluated with High Grade. Committee shortlist will be finalized by end of October.",
    }
  ];

  const [applications, setApplications] = useState(() => {
    try {
      const allRaw = localStorage.getItem("sc_all_applications");
      if (allRaw) {
        const all = JSON.parse(allRaw);
        const studentApps = all.filter(
          (a) =>
            !user ||
            a.studentId === user.studentId ||
            a.studentEmail === user.email ||
            a.studentName?.toLowerCase().includes(user.firstName?.toLowerCase())
        );
        if (studentApps.length > 0) return studentApps;
        if (user && user.studentId && user.studentId !== "SC-2026-5OAP") return [];
      }
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return JSON.parse(stored);
      if (user && user.studentId && user.studentId !== "SC-2026-5OAP") return [];
      return defaultApplications;
    } catch (e) {
      if (user && user.studentId && user.studentId !== "SC-2026-5OAP") return [];
      return defaultApplications;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const allRaw = localStorage.getItem("sc_all_applications");
        if (allRaw) {
          const all = JSON.parse(allRaw);
          const studentApps = all.filter(
            (a) =>
              !user ||
              a.studentId === user.studentId ||
              a.studentEmail === user.email ||
              a.studentName?.toLowerCase().includes(user.firstName?.toLowerCase())
          );
          setApplications(studentApps);
        }
      } catch (e) {}
    };
    handleUpdate();
    window.addEventListener("sc_applications_updated", handleUpdate);
    return () => window.removeEventListener("sc_applications_updated", handleUpdate);
  }, [user]);

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [appToWithdraw, setAppToWithdraw] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const saveApps = (newApps) => {
    setApplications(newApps);
    localStorage.setItem(storageKey, JSON.stringify(newApps));
  };

  const handleWithdraw = () => {
    if (!appToWithdraw) return;
    const updated = applications.filter((a) => a.id !== appToWithdraw.id);
    saveApps(updated);
    showToast(`Application for ${appToWithdraw.title} has been withdrawn.`);
    setAppToWithdraw(null);
  };

  const filteredApps = applications.filter((app) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Under Review" && app.status === "Under Review") ||
      (activeTab === "Shortlisted" && app.status === "Shortlisted") ||
      (activeTab === "Approved" && app.status === "Approved");

    const matchesSearch =
      !searchQuery ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="appliedPage">
      
      {/* TOAST */}
      {toastMsg && (
        <div className="appliedToast">
          <span>ℹ️</span>
          <p>{toastMsg}</p>
        </div>
      )}

      {/* HEADER HERO */}
      <section className="appliedHeroSection">
        <div className="appliedHeroBadge">
          <span>📄</span> Official Student Applications Dashboard
        </div>
        <h1>
          My Applied <em>Scholarships</em>
        </h1>
        <p>
          Monitor the live status of all your submitted scholarship applications, review verification stages,
          inspect attached documents from your wallet, and track grant disbursement timelines.
        </p>

        {/* METRICS ROW */}
        <div className="appliedMetricsGrid">
          <div className="appliedMetricCard">
            <span className="appliedMetricVal">{applications.length}</span>
            <span className="appliedMetricLbl">Total Applications</span>
          </div>
          <div className="appliedMetricCard">
            <span className="appliedMetricVal" style={{ color: "#d97706" }}>
              {applications.filter((a) => a.status === "Under Review").length}
            </span>
            <span className="appliedMetricLbl">Under Review</span>
          </div>
          <div className="appliedMetricCard">
            <span className="appliedMetricVal" style={{ color: "#2563eb" }}>
              {applications.filter((a) => a.status === "Shortlisted").length}
            </span>
            <span className="appliedMetricLbl">Merit Shortlisted</span>
          </div>
          <div className="appliedMetricCard">
            <span className="appliedMetricVal" style={{ color: "#059669" }}>
              {applications.filter((a) => a.status === "Approved").length}
            </span>
            <span className="appliedMetricLbl">Approved &amp; Disbursed</span>
          </div>
        </div>
      </section>

      {/* TOOLBAR CONTROLS */}
      <div className="appliedToolbar">
        <div className="appliedSearchBox">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search applied scholarships by title, provider, or application ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="appliedTabPills">
          {["All", "Under Review", "Shortlisted", "Approved"].map((tab) => {
            const count =
              tab === "All"
                ? applications.length
                : applications.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                className={`appliedTabBtn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className="appliedTabCount">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btnApplyMore"
          onClick={() => setPage?.("scholarships")}
        >
          <span>➕</span> Browse &amp; Apply More
        </button>
      </div>

      {/* APPLICATIONS LIST */}
      {filteredApps.length > 0 ? (
        <div className="appliedCardsGrid">
          {filteredApps.map((app) => (
            <div className="appliedCard" key={app.id}>
              
              {/* TOP HEADER */}
              <div className="appliedCardHeader">
                <div>
                  <span className="appIdBadge">{app.id}</span>
                  <span className="appCategoryTag">{app.category}</span>
                </div>
                <span className={`appStatusPill pill-${app.status.toLowerCase().replace(/\s+/g, "")}`}>
                  {app.status === "Approved" ? "✓ " : app.status === "Shortlisted" ? "★ " : "⏳ "}
                  {app.status}
                </span>
              </div>

              {/* CARD TITLE & PROVIDER */}
              <h3 className="appTitle">{app.title}</h3>
              <p className="appProvider">
                <span>🏢</span> {app.provider}
              </p>

              {/* DETAILS SUMMARY */}
              <div className="appMetaSummary">
                <div className="metaItem">
                  <small>Applied Date</small>
                  <strong>📅 {app.appliedDate}</strong>
                </div>
                <div className="metaItem">
                  <small>Sanctioned Value</small>
                  <strong className="amtHighlight">{app.awardAmount}</strong>
                </div>
                <div className="metaItem">
                  <small>Applicant</small>
                  <strong>{candidateName}</strong>
                </div>
                <div className="metaItem">
                  <small>Deadline</small>
                  <strong>{app.deadline}</strong>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="appProgressSection">
                <div className="progressLabels">
                  <span>Application Stage:</span>
                  <strong>
                    {app.statusStage === 4
                      ? "Stage 4 of 4 • Disbursed"
                      : app.statusStage === 3
                      ? "Stage 3 of 4 • Merit Shortlisted"
                      : app.statusStage === 2
                      ? "Stage 2 of 4 • Document Screening"
                      : "Stage 1 of 4 • Submitted"}
                  </strong>
                </div>
                <div className="appProgressBar">
                  <div
                    className="appProgressFill"
                    style={{
                      width: `${(app.statusStage / 4) * 100}%`,
                      background:
                        app.statusStage === 4
                          ? "linear-gradient(90deg, #10b981, #059669)"
                          : app.statusStage === 3
                          ? "linear-gradient(90deg, #2563eb, #10b981)"
                          : "linear-gradient(90deg, #f59e0b, #3b82f6)"
                    }}
                  />
                </div>
              </div>

              {/* ATTACHED DOCUMENTS TAGS */}
              <div className="appDocsSection">
                <small>Attached Credentials:</small>
                <div className="appDocTags">
                  {app.attachedDocuments.map((doc) => (
                    <span key={doc} className="appDocTag">
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="appliedCardFooter">
                <button
                  type="button"
                  className="btnAppAction btnAppView"
                  onClick={() => setSelectedAppModal(app)}
                >
                  <span>👁️</span> View Form
                </button>

                <button
                  type="button"
                  className="btnAppAction btnAppTrack"
                  onClick={() => {
                    setPage?.("results");
                    showToast(`Navigating to live results tracker for ${app.title}`);
                  }}
                >
                  <span>🔍</span> Live Result
                </button>

                <button
                  type="button"
                  className="btnAppAction btnAppWithdraw"
                  onClick={() => setAppToWithdraw(app)}
                  title="Withdraw Application"
                >
                  <span>🗑️</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="appliedEmptyState">
          <div className="emptyIcon">📄</div>
          <h3>No applications found in this category</h3>
          <p>
            You have not submitted applications matching your current filter. Explore verified scholarships
            and submit your application in under 3 minutes.
          </p>
          <button
            type="button"
            className="btnPrimary"
            onClick={() => setPage?.("scholarships")}
          >
            🎓 Explore Open Scholarships
          </button>
        </div>
      )}

      {/* ================= MODAL: VIEW SUBMITTED APPLICATION FORM ================= */}
      {selectedAppModal && (
        <div className="appliedModalBackdrop" onClick={() => setSelectedAppModal(null)}>
          <div className="appFormModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalHeader">
              <div>
                <span className="modalBadge">SUBMITTED APPLICATION FORM</span>
                <h3>{selectedAppModal.title}</h3>
                <small>Application ID: {selectedAppModal.id} • Sponsoring Trust: {selectedAppModal.provider}</small>
              </div>
              <button
                type="button"
                className="btnCloseModal"
                onClick={() => setSelectedAppModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="appFormModalBody">
              
              {/* STATUS BANNER */}
              <div className="appFormBanner">
                <div className="bannerStatus">
                  <span>Current Application Status:</span>
                  <strong>{selectedAppModal.status.toUpperCase()}</strong>
                </div>
                <div className="bannerAmt">
                  <span>Target Grant:</span>
                  <strong>{selectedAppModal.awardAmount}</strong>
                </div>
              </div>

              {/* APPLICANT SECTION */}
              <div className="formSection">
                <h4>1. Applicant Identification &amp; Contact</h4>
                <div className="formGrid">
                  <div className="formItem">
                    <small>Candidate Full Name</small>
                    <strong>{candidateName}</strong>
                  </div>
                  <div className="formItem">
                    <small>Scholar Student ID</small>
                    <strong>{studentId}</strong>
                  </div>
                  <div className="formItem">
                    <small>Date of Birth</small>
                    <strong>{user?.dateOfBirth || "12 Aug 2005"}</strong>
                  </div>
                  <div className="formItem">
                    <small>Aadhaar Verification</small>
                    <strong style={{ color: "#059669" }}>✓ UIDAI Verified</strong>
                  </div>
                  <div className="formItem">
                    <small>Registered Email</small>
                    <strong>{user?.email || "sinchana.kotari@example.com"}</strong>
                  </div>
                  <div className="formItem">
                    <small>Registered Phone</small>
                    <strong>{user?.phone || "+91 98765 43210"}</strong>
                  </div>
                </div>
              </div>

              {/* ACADEMIC & INSTITUTION */}
              <div className="formSection">
                <h4>2. Academic Records &amp; Eligibility</h4>
                <div className="formGrid">
                  <div className="formItem">
                    <small>Degree / Level</small>
                    <strong>{selectedAppModal.category}</strong>
                  </div>
                  <div className="formItem">
                    <small>Qualifying Academic Score</small>
                    <strong>{selectedAppModal.academicScore}</strong>
                  </div>
                  <div className="formItem">
                    <small>Annual Family Income</small>
                    <strong>{selectedAppModal.annualIncome}</strong>
                  </div>
                  <div className="formItem">
                    <small>Target Educational Institution</small>
                    <strong>{selectedAppModal.targetInstitution}</strong>
                  </div>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS FROM WALLET */}
              <div className="formSection">
                <h4>3. Attached Verified Credentials (from Document Wallet)</h4>
                <div className="attachedDocsList">
                  {selectedAppModal.attachedDocuments.map((doc) => (
                    <div className="attachedDocItem" key={doc}>
                      <span>📁</span>
                      <div>
                        <strong>{doc}</strong>
                        <small>Verified by DigiLocker / ScholarshipConnect AI</small>
                      </div>
                      <span className="docVerifiedCheck">✓ Certified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMITTEE NOTES */}
              <div className="formSection">
                <h4>4. Advisory Committee Notes</h4>
                <div className="committeeNotesBox">
                  <p>{selectedAppModal.applicationNotes}</p>
                </div>
              </div>

            </div>

            <div className="modalFooterActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => {
                  window.print();
                  showToast("Generating printable application summary...");
                }}
              >
                🖨️ Print Application Copy
              </button>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setSelectedAppModal(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: WITHDRAW CONFIRMATION ================= */}
      {appToWithdraw && (
        <div className="appliedModalBackdrop" onClick={() => setAppToWithdraw(null)}>
          <div className="withdrawModal" onClick={(e) => e.stopPropagation()}>
            <div className="withdrawIcon">⚠️</div>
            <h3>Withdraw Application?</h3>
            <p>
              Are you sure you want to withdraw your application for{" "}
              <strong>"{appToWithdraw.title}"</strong> (ID: {appToWithdraw.id})?
            </p>
            <p className="withdrawWarning">
              Once withdrawn, your spot in the review queue will be forfeited and you will need to re-apply before the deadline.
            </p>

            <div className="modalFooterActions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setAppToWithdraw(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btnDanger"
                onClick={handleWithdraw}
              >
                Yes, Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
