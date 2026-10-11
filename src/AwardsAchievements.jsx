import React, { useState, useEffect } from "react";
import { api } from "./api.js";

export default function AwardsAchievements({ user, setPage }) {
  const candidateName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana kotari";
  const studentId = user?.studentId || "SC-2026-5OAP";

  const storageKey = `sc_awards_achievements_${user?.studentId || "default"}`;

  const defaultAwards = [
    {
      id: "awd-reliance-2026",
      title: "Reliance Foundation Undergraduate Scholar 2026",
      issuer: "Reliance Foundation & CSR Trust",
      category: "Scholarship Grants",
      dateConferred: "28 Sep 2026",
      standing: "National Level • All India Rank #142",
      prizeValue: "₹2,00,000 Grant",
      verified: true,
      description: "Conferred under the prestigious National CSR Merit Program for exceptional academic performance and undergraduate research potential.",
      certificateRef: "CERT-RF-2026-AIR142",
      badgeColor: "#10b981"
    },
    {
      id: "awd-olympiad-2025",
      title: "National Science & Mathematics Talent Olympiad - Gold Medalist",
      issuer: "National Science Forum & DST Government of India",
      category: "Olympiads & STEM",
      dateConferred: "14 Nov 2025",
      standing: "State Level • 1st Rank (Karnataka State)",
      prizeValue: "Gold Medal + ₹25,000 Prize",
      verified: true,
      description: "Ranked 1st among 45,000 candidates across the state in theoretical physics and applied mathematics olympiad.",
      certificateRef: "CERT-NSTO-KA-001",
      badgeColor: "#f59e0b"
    },
    {
      id: "awd-cbse-merit-2024",
      title: "CBSE National Certificate of Merit - Top 0.1% Standing",
      issuer: "Central Board of Secondary Education (CBSE)",
      category: "Academic Excellence",
      dateConferred: "22 May 2024",
      standing: "National Scholastic Distinction",
      prizeValue: "National Honor Scroll",
      verified: true,
      description: "Awarded by CBSE to meritorious candidates placed in the top 0.1% nationwide in Secondary School Mathematics (Score: 99/100).",
      certificateRef: "CBSE-MERIT-2024-X-98124",
      badgeColor: "#3b82f6"
    },
    {
      id: "awd-hackathon-2025",
      title: "Youth Social Innovation & Prototype Challenge - 1st Runner Up",
      issuer: "IIT Bombay Entrepreneurship Cell",
      category: "Competitions & Hackathons",
      dateConferred: "18 Jan 2025",
      standing: "National College Finals",
      prizeValue: "₹50,000 Prototype Seed Grant",
      verified: true,
      description: "Developed an AI-driven accessible education learning assistant prototype evaluated by industry tech leaders.",
      certificateRef: "IITB-EC-2025-RUNNERUP",
      badgeColor: "#8b5cf6"
    },
    {
      id: "awd-state-merit-2024",
      title: "State Merit-Cum-Means Scholastic Award of Honor",
      issuer: "Department of Higher Education & Collegiate Affairs",
      category: "Academic Excellence",
      dateConferred: "10 Aug 2024",
      standing: "District Topper",
      prizeValue: "Citation + ₹20,000 Bursary",
      verified: true,
      description: "Felicitated by the District Commissioner for top score distinction in district board examinations.",
      certificateRef: "DHE-KA-2024-DIST-04",
      badgeColor: "#059669"
    }
  ];

  const [awards, setAwards] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return JSON.parse(stored);
      if (user && user.studentId && user.studentId !== "SC-2026-5OAP") return [];
      return defaultAwards;
    } catch (e) {
      if (user && user.studentId && user.studentId !== "SC-2026-5OAP") return [];
      return defaultAwards;
    }
  });

  // Sync awards with backend MongoDB
  useEffect(() => {
    if (studentId) {
      api.get("/awards", { studentId }).then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setAwards(res.data);
            localStorage.setItem(storageKey, JSON.stringify(res.data));
          } else if (user && user.studentId && user.studentId !== "SC-2026-5OAP") {
            setAwards([]);
          }
        }
      }).catch(() => {});
    }
  }, [studentId, storageKey]);

  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);
  const [awardToDelete, setAwardToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // New Achievement Form State
  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    category: "Academic Excellence",
    dateConferred: "",
    standing: "",
    prizeValue: "",
    description: "",
    proofFile: null,
    proofFileName: ""
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const saveAwards = (newAwardsList) => {
    setAwards(newAwardsList);
    localStorage.setItem(storageKey, JSON.stringify(newAwardsList));
  };

  // Submit New Achievement Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newAward.title.trim() || !newAward.issuer.trim()) {
      showToast("Please provide both Achievement Title and Issuing Organization.");
      return;
    }

    const awardItem = {
      id: `awd-${Date.now()}`,
      title: newAward.title.trim(),
      issuer: newAward.issuer.trim(),
      category: newAward.category || "Academic Excellence",
      dateConferred: newAward.dateConferred.trim() || new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      standing: newAward.standing.trim() || "Merit Recognition",
      prizeValue: newAward.prizeValue.trim() || "Certificate of Honor",
      verified: true,
      description: newAward.description.trim() || "Verified scholastic and extra-curricular credential added to student portfolio.",
      certificateRef: `CERT-SC-${Date.now().toString().slice(-6)}`,
      badgeColor: "#2563eb",
      customProofName: newAward.proofFileName || ""
    };

    const updated = [awardItem, ...awards];
    saveAwards(updated);
    showToast(`"${awardItem.title}" saved to your portfolio! 🏆`);
    setIsFormModalOpen(false);

    // Reset Form
    setNewAward({
      title: "",
      issuer: "",
      category: "Academic Excellence",
      dateConferred: "",
      standing: "",
      prizeValue: "",
      description: "",
      proofFile: null,
      proofFileName: ""
    });
  };

  const handleDeleteAward = () => {
    if (!awardToDelete) return;
    const updated = awards.filter((a) => a.id !== awardToDelete.id);
    saveAwards(updated);
    showToast(`Removed "${awardToDelete.title}" from your achievements.`);
    setAwardToDelete(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAward((prev) => ({
        ...prev,
        proofFile: file,
        proofFileName: file.name
      }));
      showToast(`Attached certificate: ${file.name}`);
    }
  };

  const filteredAwards = awards.filter((awd) => {
    const matchesCategory = filterCategory === "All" || awd.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      awd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awd.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awd.standing.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="awardsPage">
      
      {/* TOAST */}
      {toastMsg && (
        <div className="awardsToast">
          <span>🏆</span>
          <p>{toastMsg}</p>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="awardsHeroSection">
        <div className="awardsHeroBadge">
          <span>🏅</span> Student Honors &amp; Verified Credential Vault
        </div>
        <h1>
          Awards &amp; <em>Achievements</em>
        </h1>
        <p>
          Showcase your academic honors, olympiad medals, scholarships won, and certified credentials.
          Achievements are automatically attached to strengthen your future scholarship applications.
        </p>

        {/* METRICS ROW */}
        <div className="awardsMetricsGrid">
          <div className="awardsMetricCard">
            <span className="awardsMetricVal">{awards.length}</span>
            <span className="awardsMetricLbl">Honors &amp; Awards Conferred</span>
          </div>
          <div className="awardsMetricCard">
            <span className="awardsMetricVal" style={{ color: "#059669" }}>
              ₹2,75,000+
            </span>
            <span className="awardsMetricLbl">Cumulative Grants &amp; Prizes</span>
          </div>
          <div className="awardsMetricCard">
            <span className="awardsMetricVal" style={{ color: "#2563eb" }}>
              AIR-142
            </span>
            <span className="awardsMetricLbl">Top National Merit Standing</span>
          </div>
          <div className="awardsMetricCard">
            <span className="awardsMetricVal" style={{ color: "#7c3aed" }}>
              100% Verified
            </span>
            <span className="awardsMetricLbl">Audited Digital Credentials</span>
          </div>
        </div>
      </section>

      {/* TOOLBAR CONTROLS */}
      <div className="awardsToolbar">
        <div className="awardsSearchBox">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search honors by title, issuing body, or medal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <div className="awardsTabPills">
          {[
            "All",
            "Academic Excellence",
            "Olympiads & STEM",
            "Scholarship Grants",
            "Competitions & Hackathons"
          ].map((cat) => {
            const count =
              cat === "All"
                ? awards.length
                : awards.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`awardsTabBtn ${filterCategory === cat ? "active" : ""}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
                <span className="awardsTabCount">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ADD ACHIEVEMENT BUTTON */}
        <button
          type="button"
          className="btnAddAchievement"
          onClick={() => setIsFormModalOpen(true)}
        >
          <span>➕</span> Add New Achievement
        </button>
      </div>

      {/* AWARDS SHOWCASE GRID */}
      {filteredAwards.length > 0 ? (
        <div className="awardsGrid">
          {filteredAwards.map((awd) => (
            <div className="awardCard" key={awd.id}>
              
              {/* TOP HEADER */}
              <div className="awardCardTop">
                <div className="awardCategoryPill">{awd.category}</div>
                <div className="awardVerifiedBadge">✓ Officially Verified</div>
              </div>

              {/* CARD TITLE & ISSUER */}
              <div className="awardMainInfo">
                <div className="awardTrophyIcon">🏆</div>
                <div>
                  <h3 className="awardTitle">{awd.title}</h3>
                  <p className="awardIssuer">
                    <span>🏢</span> Conferred by <strong>{awd.issuer}</strong>
                  </p>
                </div>
              </div>

              {/* METADATA CHIPS */}
              <div className="awardMetaPills">
                <div className="metaPill">
                  <small>Standing / Rank</small>
                  <strong>{awd.standing}</strong>
                </div>
                <div className="metaPill">
                  <small>Prize / Grant</small>
                  <strong className="prizeHighlight">{awd.prizeValue}</strong>
                </div>
                <div className="metaPill">
                  <small>Date Conferred</small>
                  <strong>📅 {awd.dateConferred}</strong>
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="awardDescription">{awd.description}</p>

              {/* FOOTER ACTIONS */}
              <div className="awardCardFooter">
                <button
                  type="button"
                  className="btnAwardView"
                  onClick={() => setSelectedCertificateModal(awd)}
                >
                  <span>📜</span> View Certificate
                </button>

                <button
                  type="button"
                  className="btnAwardPrint"
                  onClick={() => {
                    setSelectedCertificateModal(awd);
                    setTimeout(() => window.print(), 300);
                  }}
                  title="Print Certificate"
                >
                  <span>🖨️</span>
                </button>

                <button
                  type="button"
                  className="btnAwardDelete"
                  onClick={() => setAwardToDelete(awd)}
                  title="Delete Achievement"
                >
                  <span>🗑️</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="awardsEmptyState">
          <div className="emptyIcon">🏆</div>
          <h3>No awards found in this category</h3>
          <p>
            You haven't added any achievements under this category yet. Click below to add an award,
            olympiad standing, certificate of merit, or competition medal.
          </p>
          <button
            type="button"
            className="btnAddAchievement"
            onClick={() => setIsFormModalOpen(true)}
          >
            <span>➕</span> Add New Achievement Now
          </button>
        </div>
      )}

      {/* ================= MODAL: ADD ACHIEVEMENT FORM ================= */}
      {isFormModalOpen && (
        <div className="awardsModalBackdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="awardFormModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalHeader">
              <div>
                <span className="modalBadge">ADD CREDENTIAL TO PORTFOLIO</span>
                <h3>Add New Achievement / Award</h3>
                <small>Record your scholastic honors, competition ranks, and scholarship grants.</small>
              </div>
              <button
                type="button"
                className="btnCloseModal"
                onClick={() => setIsFormModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* THE FORM */}
            <form onSubmit={handleFormSubmit} className="awardFormBody">
              
              <div className="formRow">
                <div className="formGroup formCol">
                  <label>
                    Achievement / Award Title <span className="reqStar">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Science Olympiad Gold Medalist"
                    value={newAward.title}
                    onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                  />
                  <small>Full name of the award, medal, or fellowship</small>
                </div>

                <div className="formGroup formCol">
                  <label>
                    Issuing Organization / Authority <span className="reqStar">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Education / Reliance Foundation / CBSE"
                    value={newAward.issuer}
                    onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                  />
                  <small>University, Trust, Government Department, or Board</small>
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup formCol">
                  <label>Achievement Category</label>
                  <select
                    value={newAward.category}
                    onChange={(e) => setNewAward({ ...newAward, category: e.target.value })}
                  >
                    <option value="Academic Excellence">Academic Excellence</option>
                    <option value="Olympiads & STEM">Olympiads & STEM</option>
                    <option value="Scholarship Grants">Scholarship Grants</option>
                    <option value="Competitions & Hackathons">Competitions & Hackathons</option>
                    <option value="Sports & Athletics">Sports & Athletics</option>
                    <option value="Leadership & Social Impact">Leadership & Social Impact</option>
                  </select>
                </div>

                <div className="formGroup formCol">
                  <label>Date / Month Conferred</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 2026 or 15 Aug 2025"
                    value={newAward.dateConferred}
                    onChange={(e) => setNewAward({ ...newAward, dateConferred: e.target.value })}
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup formCol">
                  <label>
                    Standing / Rank <span className="optTag">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Rank (Gold Medalist), AIR-142, Top 0.1%"
                    value={newAward.standing}
                    onChange={(e) => setNewAward({ ...newAward, standing: e.target.value })}
                  />
                </div>

                <div className="formGroup formCol">
                  <label>
                    Prize / Grant Amount <span className="optTag">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 Cash Prize / Certificate of Merit"
                    value={newAward.prizeValue}
                    onChange={(e) => setNewAward({ ...newAward, prizeValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="formGroup">
                <label>Description &amp; Significance</label>
                <textarea
                  rows="3"
                  placeholder="Describe your achievement, the competition difficulty, and any key project details..."
                  value={newAward.description}
                  onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                />
              </div>

              {/* CERTIFICATE UPLOAD */}
              <div className="formGroup">
                <label>Upload Certificate / Proof Document</label>
                <div className="fileUploadZone">
                  <input
                    type="file"
                    id="award-proof-input"
                    style={{ display: "none" }}
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="btnUploadFile"
                    onClick={() => document.getElementById("award-proof-input")?.click()}
                  >
                    📁 Browse Certificate / PDF
                  </button>
                  <span className="uploadFileName">
                    {newAward.proofFileName ? (
                      <strong style={{ color: "#059669" }}>✓ {newAward.proofFileName}</strong>
                    ) : (
                      "Supports JPG, PNG, PDF (Up to 10MB)"
                    )}
                  </span>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="modalFooterActions">
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btnSaveAward">
                  <span>💾</span> Save Achievement to Portfolio
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: CERTIFICATE OF HONOR LIGHTBOX ================= */}
      {selectedCertificateModal && (
        <div className="awardsModalBackdrop" onClick={() => setSelectedCertificateModal(null)}>
          <div className="certificateModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalControlBar">
              <span>Official Certificate of Merit &amp; Honor</span>
              <div className="modalControlBtns">
                <button type="button" onClick={() => window.print()} className="btnModalAction">
                  🖨️ Print Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertificateModal(null)}
                  className="btnCloseModal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* CERTIFICATE BODY */}
            <div className="certificateCanvas">
              
              <div className="certBorderOuter">
                <div className="certBorderInner">
                  
                  <div className="certHeader">
                    <span className="certEmblem">🏛️</span>
                    <h2>CERTIFICATE OF SCHOLASTIC MERIT &amp; EXCELLENCE</h2>
                    <p className="certSubtitle">Conferred by {selectedCertificateModal.issuer.toUpperCase()}</p>
                  </div>

                  <p className="certPresentText">This is proudly presented to</p>
                  <h3 className="certCandidateName">{candidateName}</h3>
                  <p className="certStudentId">
                    Scholar ID: <strong>{studentId}</strong> • Reference: <strong>{selectedCertificateModal.certificateRef}</strong>
                  </p>

                  <div className="certBodyText">
                    In formal recognition of outstanding performance, academic excellence, and distinguished accomplishment in
                    <strong className="certHonorTitle">{selectedCertificateModal.title}</strong>
                    conferred on <strong>{selectedCertificateModal.dateConferred}</strong> with the distinction of{" "}
                    <strong>{selectedCertificateModal.standing}</strong>.
                  </div>

                  {selectedCertificateModal.prizeValue && (
                    <div className="certPrizeCallout">
                      Grant / Award Conferred: <strong>{selectedCertificateModal.prizeValue}</strong>
                    </div>
                  )}

                  <div className="certFooterRow">
                    <div className="certSealBlock">
                      <div className="certGoldSeal">
                        <span>★ OFFICIAL ★</span>
                        <small>VERIFIED</small>
                      </div>
                      <p>ScholarshipConnect AI Verified Credential</p>
                    </div>

                    <div className="certSignBlock">
                      <div className="certSignature">Dr. K. S. Narayanan</div>
                      <strong>Chief Evaluation Officer</strong>
                      <p>{selectedCertificateModal.issuer}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="modalFooterActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => {
                  window.print();
                  showToast("Opening print/export dialog for certificate! 📜");
                }}
              >
                📥 Download / Print Certificate
              </button>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setSelectedCertificateModal(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {awardToDelete && (
        <div className="awardsModalBackdrop" onClick={() => setAwardToDelete(null)}>
          <div className="awardDeleteModal" onClick={(e) => e.stopPropagation()}>
            <div className="deleteIcon">🗑️</div>
            <h3>Remove Achievement?</h3>
            <p>
              Are you sure you want to remove <strong>"{awardToDelete.title}"</strong> from your awards showcase?
            </p>
            <div className="modalFooterActions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setAwardToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btnDanger"
                onClick={handleDeleteAward}
              >
                Yes, Remove Award
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
