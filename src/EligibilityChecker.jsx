import React, { useState, useMemo } from "react";
import { scholarships } from "./scholarshipsData.js";
import { checkScholarshipEligibility, getProfileRecommendations, normalizeEducation } from "./aiEngine.js";

export default function EligibilityChecker({ user, onSelectScholarship, setPage, onBack, initialScholarshipId = null }) {
  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana Kotari";
  const studentId = user?.studentId || "SC-2026-5OAP1P";

  // Selected scholarship for detailed audit
  const [selectedSchId, setSelectedSchId] = useState(() => {
    return initialScholarshipId || (scholarships[0] ? scholarships[0].id : "");
  });

  // Active view: 'single' | 'batch'
  const [activeTab, setActiveTab] = useState("single");
  const [filterBatch, setFilterBatch] = useState("all");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const activeScholarship = useMemo(() => {
    return scholarships.find((s) => s.id === selectedSchId) || scholarships[0];
  }, [selectedSchId]);

  // Run audit for active scholarship
  const auditResult = useMemo(() => {
    return checkScholarshipEligibility(activeScholarship, user);
  }, [activeScholarship, user]);

  // Run batch audit across all scholarships
  const allAudits = useMemo(() => {
    return scholarships.map((s) => ({
      scholarship: s,
      audit: checkScholarshipEligibility(s, user),
    }));
  }, [user]);

  const batchStats = useMemo(() => {
    const eligible = allAudits.filter((a) => a.audit.status === "eligible");
    const warning = allAudits.filter((a) => a.audit.status === "warning");
    const ineligible = allAudits.filter((a) => a.audit.status === "ineligible");
    return {
      total: allAudits.length,
      eligibleCount: eligible.length,
      warningCount: warning.length,
      ineligibleCount: ineligible.length
    };
  }, [allAudits]);

  const filteredBatchAudits = useMemo(() => {
    if (filterBatch === "eligible") return allAudits.filter((a) => a.audit.status === "eligible");
    if (filterBatch === "warning") return allAudits.filter((a) => a.audit.status === "warning");
    if (filterBatch === "ineligible") return allAudits.filter((a) => a.audit.status === "ineligible");
    if (filterBatch === "high-grant") return allAudits.filter((a) => (a.scholarship.amountNumeric || 0) >= 100000);
    return allAudits;
  }, [allAudits, filterBatch]);

  return (
    <div className="eligibilityCheckerPage">
      {/* Toast */}
      {toastMsg && <div className="eligibilityToast">{toastMsg}</div>}

      {/* Hero Header */}
      <div className="eligibilityHero">
        <div className="eligibilityHeroContent">
          {onBack && (
            <button className="btnReturnBack" onClick={onBack}>
              ← Back to Overview
            </button>
          )}
          <div className="eligibilityBadge">
            <span>⚡</span> Automated AI Audit System
          </div>
          <h1>
            Scholarship <em>Eligibility Checker</em>
          </h1>
          <p>
            Verify your exact qualification across academic marks, family income limits, state domicile,
            category quotas, and document readiness in real time.
          </p>

          <div className="profileContextPill">
            <span>Evaluating for:</span>
            <strong>{studentName}</strong> (ID: {studentId}) • {normalizeEducation(user).displayStream || user?.course || "Engineering"} • Gender: <strong>{user?.gender || "Female"}</strong> • Category: <strong>{user?.category || "General"}</strong> • {user?.state || "Karnataka"} • Income: {user?.annualIncome || "₹1,80,000"}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="eligibilityNavTabs">
        <button
          className={`tabBtn ${activeTab === "single" ? "active" : ""}`}
          onClick={() => setActiveTab("single")}
        >
          <span>🎯</span> Audit Single Scholarship
        </button>
        <button
          className={`tabBtn ${activeTab === "batch" ? "active" : ""}`}
          onClick={() => setActiveTab("batch")}
        >
          <span>📊</span> Scan All ({batchStats.eligibleCount} Eligible Schemes)
        </button>
      </div>

      {/* ================= TAB 1: SINGLE SCHOLARSHIP AUDIT ================= */}
      {activeTab === "single" && (
        <div className="eligibilityAuditContainer">
          {/* Picker Dropdown */}
          <div className="scholarshipPickerCard">
            <label>Select Scholarship to Check:</label>
            <select
              value={selectedSchId}
              onChange={(e) => setSelectedSchId(e.target.value)}
              className="scholarshipSelectDropdown"
            >
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.provider}) — {s.amount}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Result Display */}
          {auditResult && (
            <div className={`auditResultCard ${auditResult.status}`}>
              <div className="auditResultHeader">
                <div className="scoreGaugeWrap">
                  <div className={`scoreCircle ${auditResult.status}`}>
                    <span className="scoreNum">{auditResult.eligibilityScore}%</span>
                    <small>Compatibility</small>
                  </div>
                </div>

                <div className="auditSummaryBlock">
                  <div className="statusBadgeWrap">
                    <span className={`verdictStatusPill ${auditResult.status}`}>
                      {auditResult.status === "eligible"
                        ? "✅ Highly Eligible (Direct Fit)"
                        : auditResult.status === "warning"
                          ? "⚠️ Conditionally Eligible (Waiver Required)"
                          : "❌ Ineligible (Criteria Mismatch)"}
                    </span>
                    <span className="awardAmountPill">💰 {auditResult.awardAmount}</span>
                  </div>

                  <h3>{auditResult.scholarshipTitle}</h3>
                  <p className="providerName">Sponsored by <strong>{auditResult.provider}</strong> • Deadline: <strong>{auditResult.deadline}</strong></p>
                  <p className="auditVerdictText">{auditResult.verdict}</p>
                </div>
              </div>

              {/* Multi-Factor Criteria Matrix */}
              <div className="criteriaMatrixSection">
                <h4>Detailed Verification Breakdown</h4>
                <div className="criteriaMatrixGrid">
                  {auditResult.breakdown.map((item) => (
                    <div key={item.factor} className={`criteriaItemBox ${item.status}`}>
                      <div className="criteriaHead">
                        <span className="criteriaFactor">{item.factor}</span>
                        <span className={`criteriaStatusPill ${item.status}`}>
                          {item.status === "pass" ? "✓ Pass" : item.status === "warn" ? "⚠️ Check" : "✕ Fail"}
                        </span>
                      </div>
                      <div className="criteriaValues">
                        <div>
                          <small>Requirement:</small>
                          <strong>{item.required}</strong>
                        </div>
                        <div>
                          <small>Your Profile:</small>
                          <span>{item.studentValue}</span>
                        </div>
                      </div>
                      <p className="criteriaNotes">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Readiness Check */}
              <div className="docReadinessSection">
                <div className="docReadinessHead">
                  <h4>📁 Mandatory Documents Required for Application</h4>
                  <span className="docReadinessBadge">Locker Verified</span>
                </div>
                <div className="docListPills">
                  {auditResult.requiredDocuments.map((doc, idx) => (
                    <div key={doc} className="docPillItem">
                      <span className="docIcon">📄</span>
                      <span>{doc}</span>
                      <span className="docCheckIcon">✓ Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="auditActionsFooter">
                <button
                  className="btnApplyOfficial"
                  onClick={() => {
                    if (activeScholarship.officialUrl) {
                      window.open(activeScholarship.officialUrl, "_blank", "noopener,noreferrer");
                    } else if (onSelectScholarship) {
                      onSelectScholarship(activeScholarship);
                    }
                  }}
                >
                  🚀 Proceed to Official Application ↗
                </button>
                <button
                  className="btnDocumentWalletLink"
                  onClick={() => setPage && setPage("documents")}
                >
                  📁 Verify Documents in Wallet
                </button>
                <button
                  className="btnViewAllRecs"
                  onClick={() => setActiveTab("batch")}
                >
                  📊 View All Eligible Scholarships →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: BATCH ALL SCHOLARSHIPS SCAN ================= */}
      {activeTab === "batch" && (
        <div className="batchScanContainer">
          {/* Metrics Overview Bar */}
          <div className="batchStatsBar">
            <div className="batchStatBox green">
              <strong>{batchStats.eligibleCount}</strong>
              <span>100% Fully Eligible</span>
            </div>
            <div className="batchStatBox yellow">
              <strong>{batchStats.warningCount}</strong>
              <span>Conditionally Eligible</span>
            </div>
            <div className="batchStatBox red">
              <strong>{batchStats.ineligibleCount}</strong>
              <span>Ineligible Schemes</span>
            </div>
            <div className="batchStatBox blue">
              <strong>{batchStats.total}</strong>
              <span>Total Programs Scanned</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="batchFilterBar">
            <span>Filter Schemes:</span>
            {[
              { id: "all", label: "All Schemes" },
              { id: "eligible", label: `✅ Fully Eligible (${batchStats.eligibleCount})` },
              { id: "warning", label: `⚠️ Conditional (${batchStats.warningCount})` },
              { id: "high-grant", label: "💰 High Value (₹1L+)" }
            ].map((f) => (
              <button
                key={f.id}
                className={`filterPillBtn ${filterBatch === f.id ? "active" : ""}`}
                onClick={() => setFilterBatch(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          <div className="batchCardsGrid">
            {filteredBatchAudits.map(({ scholarship, audit }) => (
              <div key={scholarship.id} className={`batchCard ${audit.status}`}>
                <div className="batchCardHead">
                  <div className="batchTitleBlock">
                    <span className={`statusTag ${audit.status}`}>
                      {audit.status === "eligible" ? "✓ Eligible" : audit.status === "warning" ? "⚠️ Conditional" : "✕ Ineligible"}
                    </span>
                    <h4>{scholarship.title}</h4>
                    <p className="batchProvider">{scholarship.provider} • {scholarship.course}</p>
                  </div>
                  <div className="batchScoreGauge">
                    <strong>{audit.eligibilityScore}%</strong>
                    <small>Match</small>
                  </div>
                </div>

                <div className="batchMetaRow">
                  <div>
                    <small>Award Amount</small>
                    <strong className="textGreen">{scholarship.amount}</strong>
                  </div>
                  <div>
                    <small>Deadline</small>
                    <strong>{scholarship.deadline}</strong>
                  </div>
                  <div>
                    <small>State</small>
                    <span>{scholarship.state}</span>
                  </div>
                </div>

                <p className="batchVerdict">{audit.verdict}</p>

                <div className="batchCardActions">
                  <button
                    className="btnCheckDetailed"
                    onClick={() => {
                      setSelectedSchId(scholarship.id);
                      setActiveTab("single");
                    }}
                  >
                    View Detailed Audit Breakdown →
                  </button>
                  <button
                    className="btnApplyQuick"
                    onClick={() => {
                      if (scholarship.officialUrl) {
                        window.open(scholarship.officialUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    Apply ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
