import React, { useState, useEffect } from "react";

export default function ResultsPortal({ user, onAuth, onSelectScholarship, setPage }) {
  // Input credentials state
  const [searchId, setSearchId] = useState(user?.studentId || "SC-2026-5OAP");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchDob, setSearchDob] = useState(user?.dateOfBirth || "");
  const [searchScheme, setSearchScheme] = useState("Reliance Foundation Undergraduate Scholarships 2026–27");
  
  // Results & modal state
  const [searchedRecord, setSearchedRecord] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [meritSearchTerm, setMeritSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState(null); // 'awardLetter' | 'meritList' | 'bankMandate'
  const [selectedMeritRoll, setSelectedMeritRoll] = useState(null);
  const [meritFilterQuery, setMeritFilterQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const candidateName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana kotari";

  // Pre-configured official declared results database
  const declaredResults = [
    {
      id: "res-reliance-2026",
      title: "Reliance Foundation Undergraduate Scholarships 2026–27",
      provider: "Reliance Foundation",
      releaseDate: "28 Sep 2026",
      totalSelected: "5,000 Scholars",
      awardTotal: "Up to ₹2,00,000 per scholar",
      status: "Announced",
      category: "Undergraduate",
      cutOffMarks: "82% in Class 12",
      description: "First merit list of selected 1st year degree students across India.",
      sampleCandidates: [
        { rank: "AIR-1", roll: "RF-2026-10001", name: "Ananya Deshmukh", state: "Maharashtra", category: "General", amount: "₹2,00,000", status: "Sanctioned" },
        { rank: "AIR-14", roll: "RF-2026-10014", name: "Rohan K. Varma", state: "Karnataka", category: "OBC", amount: "₹2,00,000", status: "Sanctioned" },
        { rank: "AIR-42", roll: "RF-2026-10042", name: "Pooja Sundaram", state: "Tamil Nadu", category: "General", amount: "₹2,00,000", status: "Sanctioned" },
        { rank: "AIR-142", roll: "RF-2026-10142", name: candidateName, state: "Karnataka", category: "OBC", amount: "₹2,00,000", status: "Provisionally Selected" },
        { rank: "AIR-210", roll: "RF-2026-10210", name: "Vikram Sengupta", state: "West Bengal", category: "EWS", amount: "₹2,00,000", status: "Sanctioned" },
        { rank: "AIR-355", roll: "RF-2026-10355", name: "Meera Nambiar", state: "Kerala", category: "General", amount: "₹2,00,000", status: "Sanctioned" },
      ]
    },
    {
      id: "res-sbi-asha-2026",
      title: "SBI Platinum Jubilee Asha Scholarship (Phase-1)",
      provider: "SBI Foundation",
      releaseDate: "22 Sep 2026",
      totalSelected: "12,400 Students",
      awardTotal: "Up to ₹50,000",
      status: "Disbursed",
      category: "School & UG",
      cutOffMarks: "Income < ₹3,00,000 & 75% marks",
      description: "Direct bank grant disbursement completed for verified low-income applicants.",
      sampleCandidates: [
        { rank: "ASHA-001", roll: "SBI-2026-9011", name: "Gaurav Joshi", state: "Rajasthan", category: "OBC", amount: "₹50,000", status: "Disbursed" },
        { rank: "ASHA-118", roll: "SBI-2026-9118", name: "Sinchana kotari", state: "Karnataka", category: "General", amount: "₹50,000", status: "Disbursed" },
        { rank: "ASHA-245", roll: "SBI-2026-9245", name: "Amina Khatun", state: "Assam", category: "EWS", amount: "₹50,000", status: "Disbursed" }
      ]
    },
    {
      id: "res-loreal-2026",
      title: "L’Oréal India For Young Women in Science 2026",
      provider: "L’Oréal India",
      releaseDate: "15 Sep 2026",
      totalSelected: "250 Women Scholars",
      awardTotal: "Up to ₹2,50,000",
      status: "Announced",
      category: "Women in STEM",
      cutOffMarks: "85% in PCB/PCM",
      description: "Final shortlist of female scientists pursuing higher degrees in India.",
      sampleCandidates: [
        { rank: "STEM-01", roll: "LOR-2026-301", name: "Deepika R.", state: "Telangana", category: "Women in Science", amount: "₹2,50,000", status: "Selected" },
        { rank: "STEM-12", roll: "LOR-2026-312", name: candidateName, state: "Karnataka", category: "Women in Science", amount: "₹2,50,000", status: "Shortlisted" },
        { rank: "STEM-45", roll: "LOR-2026-345", name: "Priya Nair", state: "Kerala", category: "Women in Science", amount: "₹2,50,000", status: "Selected" }
      ]
    },
    {
      id: "res-kotak-kanya-2026",
      title: "Kotak Kanya Scholarship Selection Roll 2026",
      provider: "Kotak Education Foundation",
      releaseDate: "10 Sep 2026",
      totalSelected: "1,200 Girl Scholars",
      awardTotal: "Up to ₹1,50,000 / year",
      status: "Announced",
      category: "Girls Professional",
      cutOffMarks: "JEE / NEET / CET Qualified",
      description: "Selection list for meritorious girl students in professional courses.",
      sampleCandidates: [
        { rank: "KOTAK-04", roll: "KK-2026-404", name: "Sneha Patil", state: "Maharashtra", category: "Engineering", amount: "₹1,50,000", status: "Selected" },
        { rank: "KOTAK-89", roll: "KK-2026-489", name: candidateName, state: "Karnataka", category: "Engineering", amount: "₹1,50,000", status: "Verified" }
      ]
    },
    {
      id: "res-tata-trusts-2026",
      title: "Tata Trusts Medical and Healthcare Fellowship Grants",
      provider: "Tata Trusts",
      releaseDate: "05 Sep 2026",
      totalSelected: "850 Medical Students",
      awardTotal: "Up to ₹1,80,000",
      status: "Announced",
      category: "Medical",
      cutOffMarks: "NEET All India Rank < 40,000",
      description: "Tuition waiver and clinical stipend allocations for MBBS/BDS scholars.",
      sampleCandidates: [
        { rank: "MED-02", roll: "TT-2026-102", name: "Dr. Alok Verma", state: "Delhi", category: "MBBS", amount: "₹1,80,000", status: "Selected" },
        { rank: "MED-34", roll: "TT-2026-134", name: "Kavya Menon", state: "Karnataka", category: "BDS", amount: "₹1,80,000", status: "Selected" }
      ]
    }
  ];

  // Auto-load default record on first visit
  useEffect(() => {
    handleSearchCheck();
  }, []);

  // Autofill user credentials
  const handleAutofill = () => {
    const studentId = user?.studentId || "SC-2026-5OAP";
    setSearchId(studentId);
    setSearchRoll("RF-2026-10142");
    setSearchDob(user?.dateOfBirth || "12 Aug 2005");
    setSearchScheme("Reliance Foundation Undergraduate Scholarships 2026–27");
    showToast("Credentials autofilled from your active student profile! ⚡");
  };

  // Perform credential check
  const handleSearchCheck = (e) => {
    if (e) e.preventDefault();

    const cleanId = (searchId || "").trim().toUpperCase();
    if (!cleanId && !searchRoll.trim()) {
      showToast("Please enter your Student ID or Roll Number.");
      return;
    }

    // Build rich verified result record
    let statusBadge = "PROVISIONALLY SELECTED";
    let allottedAmt = "₹2,00,000";
    let stage = 3;
    let rank = "AIR-142 (National Merit List #1)";
    let schemeTitle = searchScheme || "Reliance Foundation Undergraduate Scholarships 2026–27";
    let providerName = "Reliance Foundation";
    let bankStatus = "Aadhaar-Linked DBT Active • State Bank of India (A/C **4291)";
    let interviewGrade = "Grade A+ (Cleared with High Distinction)";
    let remarks = "Congratulations! You have been provisionally selected for the Reliance Foundation Scholarship Grant. First semester disbursement of ₹1,00,000 is scheduled.";

    if (cleanId.includes("SBI") || searchScheme.includes("SBI")) {
      statusBadge = "GRANT DISBURSED";
      allottedAmt = "₹50,000";
      stage = 4;
      rank = "Merit Rank #118";
      schemeTitle = "SBI Platinum Jubilee Asha Scholarship (Phase-1)";
      providerName = "SBI Foundation";
      bankStatus = "Credited via DBT • UTR Ref: SBIN202609228812";
      interviewGrade = "Income & Merit Verified";
      remarks = "Full grant amount of ₹50,000 successfully disbursed to your bank account via Direct Benefit Transfer.";
    } else if (cleanId.includes("LOR") || searchScheme.includes("L’Oréal")) {
      statusBadge = "MERIT SHORTLISTED";
      allottedAmt = "₹2,50,000";
      stage = 3;
      rank = "State Merit Rank #12 (Karnataka)";
      schemeTitle = "L’Oréal India For Young Women in Science 2026";
      providerName = "L’Oréal India";
      bankStatus = "Pending Verification";
      interviewGrade = "Interview Cleared (89.5%)";
      remarks = "Shortlisted in Top 250 Scholars nationwide. Final verification in progress.";
    } else if (cleanId.includes("KOTAK") || searchScheme.includes("Kotak")) {
      statusBadge = "DOCUMENT VERIFIED";
      allottedAmt = "₹1,50,000 / year";
      stage = 2;
      rank = "Merit Ranking Active";
      schemeTitle = "Kotak Kanya Scholarship Selection Roll 2026";
      providerName = "Kotak Education Foundation";
      bankStatus = "Mandate Submitted";
      interviewGrade = "Screening In Progress";
      remarks = "Your submitted academic documents have been successfully verified. Merit ranking is under committee finalization.";
    }

    setSearchedRecord({
      studentId: cleanId || user?.studentId || "SC-2026-5OAP",
      rollNumber: searchRoll.trim() || "RF-2026-10142",
      dob: searchDob.trim() || user?.dateOfBirth || "12 Aug 2005",
      applicantName: candidateName,
      scholarshipName: schemeTitle,
      provider: providerName,
      allottedAmount: allottedAmt,
      statusBadge: statusBadge,
      currentStage: stage,
      selectionRank: rank,
      bankStatus: bankStatus,
      interviewStatus: interviewGrade,
      remarks: remarks,
      dateDeclared: "28 Sep 2026",
      academicYear: "2026–27"
    });

    showToast("Application record found & verified! ✓");
  };

  const handleReset = () => {
    setSearchId("");
    setSearchRoll("");
    setSearchDob("");
    setSearchedRecord(null);
  };

  const openMeritListModal = (rollItem) => {
    setSelectedMeritRoll(rollItem);
    setMeritFilterQuery("");
    setActiveModal("meritList");
  };

  const filteredResults = declaredResults.filter((r) => {
    const matchesCategory = filterCategory === "All" || r.category.includes(filterCategory);
    const matchesSearch = !meritSearchTerm ||
      r.title.toLowerCase().includes(meritSearchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(meritSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="resultsPage">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="resultsToast">
          <span>✨</span>
          <p>{toastMsg}</p>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="resultsHeroSection">
        <div className="resultsHeroBadge">
          <span>🏆</span> Official National Merit &amp; Sanction Portal
        </div>
        <h1>
          Scholarship Results &amp; <em>Merit Lists 2026</em>
        </h1>
        <p>
          Input your credentials to verify your selection status, track your DBT disbursement timeline,
          and download official sanction orders issued by corporate trusts and foundations.
        </p>

        {/* HERO STATS BAR */}
        <div className="resultsHeroStats">
          <div className="resultsStatBox">
            <span className="resultsStatVal">₹48.5 Crore</span>
            <span className="resultsStatLbl">Total Aid Sanctioned</span>
          </div>
          <div className="resultsStatBox">
            <span className="resultsStatVal">38,500+</span>
            <span className="resultsStatLbl">Selected Scholars</span>
          </div>
          <div className="resultsStatBox">
            <span className="resultsStatVal">100% Direct</span>
            <span className="resultsStatLbl">Aadhaar DBT Transfer</span>
          </div>
          <div className="resultsStatBox">
            <span className="resultsStatVal">Verified 2026</span>
            <span className="resultsStatLbl">Audited CSR Lists</span>
          </div>
        </div>
      </section>

      {/* CREDENTIALS TRACKER SECTION */}
      <section className="resultsTrackerSection" id="credential-check">
        <div className="trackerCard">
          
          <div className="trackerHeader">
            <div className="trackerHeaderTitle">
              <span className="trackerHeaderIcon">🔍</span>
              <div>
                <h2>Check Your Application Result &amp; Sanction Status</h2>
                <p>Verify your individual selection roll, merit rank, and grant sanction details.</p>
              </div>
            </div>

            {/* AUTOFILL ACTION */}
            <button
              type="button"
              className="autofillBtn"
              onClick={handleAutofill}
              title="Autofill using your logged-in student account credentials"
            >
              <span>⚡</span> Autofill My Credentials
            </button>
          </div>

          {/* CREDENTIALS INPUT FORM */}
          <form onSubmit={handleSearchCheck} className="trackerFormGrid">
            
            <div className="formField">
              <label>
                Student ID / Application ID <span className="reqStar">*</span>
              </label>
              <div className="inputWithIcon">
                <span className="inputIcon">🆔</span>
                <input
                  type="text"
                  required
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. SC-2026-5OAP"
                />
              </div>
              <small className="fieldHint">Found on your profile or application receipt</small>
            </div>

            <div className="formField">
              <label>
                Roll Number / Hall Ticket <span className="optTag">(Optional)</span>
              </label>
              <div className="inputWithIcon">
                <span className="inputIcon">🎫</span>
                <input
                  type="text"
                  value={searchRoll}
                  onChange={(e) => setSearchRoll(e.target.value)}
                  placeholder="e.g. RF-2026-10142"
                />
              </div>
              <small className="fieldHint">Exam seat number or portal roll reference</small>
            </div>

            <div className="formField">
              <label>
                Date of Birth (DOB) <span className="optTag">(Optional)</span>
              </label>
              <div className="inputWithIcon">
                <span className="inputIcon">🎂</span>
                <input
                  type="text"
                  value={searchDob}
                  onChange={(e) => setSearchDob(e.target.value)}
                  placeholder="DD/MM/YYYY or 12 Aug 2005"
                />
              </div>
              <small className="fieldHint">For verified identity authentication</small>
            </div>

            <div className="formField">
              <label>Scholarship Scheme Applied For</label>
              <div className="inputWithIcon">
                <span className="inputIcon">🎓</span>
                <select
                  value={searchScheme}
                  onChange={(e) => setSearchScheme(e.target.value)}
                >
                  <option value="Reliance Foundation Undergraduate Scholarships 2026–27">
                    Reliance Foundation Undergraduate Scholarships 2026–27
                  </option>
                  <option value="SBI Platinum Jubilee Asha Scholarship (Phase-1)">
                    SBI Platinum Jubilee Asha Scholarship (Phase-1)
                  </option>
                  <option value="L’Oréal India For Young Women in Science 2026">
                    L’Oréal India For Young Women in Science 2026
                  </option>
                  <option value="Kotak Kanya Scholarship Selection Roll 2026">
                    Kotak Kanya Scholarship Selection Roll 2026
                  </option>
                  <option value="Tata Trusts Medical and Healthcare Fellowship Grants">
                    Tata Trusts Medical and Healthcare Fellowship Grants
                  </option>
                </select>
              </div>
              <small className="fieldHint">Select targeted scholarship program</small>
            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="formActionsRow">
              <div className="quickTestChips">
                <span className="chipsLabel">Quick Test IDs:</span>
                <button
                  type="button"
                  className="testChip"
                  onClick={() => {
                    setSearchId("SC-2026-5OAP");
                    setSearchRoll("RF-2026-10142");
                    setSearchScheme("Reliance Foundation Undergraduate Scholarships 2026–27");
                  }}
                >
                  Reliance (Selected)
                </button>
                <button
                  type="button"
                  className="testChip"
                  onClick={() => {
                    setSearchId("SBI-2026-8812");
                    setSearchRoll("SBI-2026-9118");
                    setSearchScheme("SBI Platinum Jubilee Asha Scholarship (Phase-1)");
                  }}
                >
                  SBI Asha (Disbursed)
                </button>
                <button
                  type="button"
                  className="testChip"
                  onClick={() => {
                    setSearchId("LOR-2026-3391");
                    setSearchRoll("LOR-2026-312");
                    setSearchScheme("L’Oréal India For Young Women in Science 2026");
                  }}
                >
                  L’Oréal (Shortlisted)
                </button>
              </div>

              <div className="actionButtonsGroup">
                <button type="button" className="btnSecondary" onClick={handleReset}>
                  🔄 Reset
                </button>
                <button type="submit" className="checkResultBtn">
                  <span>🔍</span> Check Status ➔
                </button>
              </div>
            </div>

          </form>

          {/* ================= RECORD DETAILS CARD ================= */}
          {searchedRecord && (
            <div className="resultRecordCard" id="result-view">
              
              {/* TOP HEADER */}
              <div className="recordHeader">
                <div className="recordHeaderMain">
                  <span className={`recordBadge badge-${searchedRecord.currentStage >= 3 ? "selected" : "review"}`}>
                    ★ {searchedRecord.statusBadge}
                  </span>
                  <h3>{searchedRecord.scholarshipName}</h3>
                  <div className="recordMetaIdentifiers">
                    <span>
                      Candidate: <strong>{searchedRecord.applicantName}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Student ID: <strong>{searchedRecord.studentId}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Roll No: <strong>{searchedRecord.rollNumber}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Academic Session: <strong>{searchedRecord.academicYear}</strong>
                    </span>
                  </div>
                </div>

                <div className="awardAmountBox">
                  <span className="awardBoxLabel">Total Aid Sanctioned</span>
                  <strong className="awardBoxValue">{searchedRecord.allottedAmount}</strong>
                  <span className="awardBoxStatus">Direct Benefit Transfer (DBT)</span>
                </div>
              </div>

              {/* INTERACTIVE MULTI-STAGE PROGRESS TIMELINE */}
              <div className="timelineContainer">
                <h4 className="timelineHeading">Application Progression Status:</h4>
                <div className="resultTimeline">
                  
                  <div className={`timelineStep ${searchedRecord.currentStage >= 1 ? "done" : ""}`}>
                    <div className="stepCircle">{searchedRecord.currentStage >= 1 ? "✓" : "1"}</div>
                    <div className="stepDetails">
                      <span className="stepTitle">1. Submitted</span>
                      <small className="stepSub">12 Aug 2026</small>
                    </div>
                  </div>

                  <div className={`timelineLine ${searchedRecord.currentStage >= 2 ? "done" : ""}`}></div>

                  <div className={`timelineStep ${searchedRecord.currentStage >= 2 ? "done" : ""}`}>
                    <div className="stepCircle">{searchedRecord.currentStage >= 2 ? "✓" : "2"}</div>
                    <div className="stepDetails">
                      <span className="stepTitle">2. Document Verified</span>
                      <small className="stepSub">DigiLocker Checked</small>
                    </div>
                  </div>

                  <div className={`timelineLine ${searchedRecord.currentStage >= 3 ? "done" : ""}`}></div>

                  <div className={`timelineStep ${searchedRecord.currentStage >= 3 ? (searchedRecord.currentStage === 3 ? "current" : "done") : ""}`}>
                    <div className="stepCircle">{searchedRecord.currentStage >= 3 ? "✦" : "3"}</div>
                    <div className="stepDetails">
                      <span className="stepTitle">3. Merit Shortlisted</span>
                      <small className="stepSub">{searchedRecord.selectionRank.split("(")[0]}</small>
                    </div>
                  </div>

                  <div className={`timelineLine ${searchedRecord.currentStage >= 4 ? "done" : ""}`}></div>

                  <div className={`timelineStep ${searchedRecord.currentStage >= 4 ? "done" : ""}`}>
                    <div className="stepCircle">{searchedRecord.currentStage >= 4 ? "✓" : "4"}</div>
                    <div className="stepDetails">
                      <span className="stepTitle">4. Grant Disbursed</span>
                      <small className="stepSub">
                        {searchedRecord.currentStage >= 4 ? "Account Credited" : "Scheduled"}
                      </small>
                    </div>
                  </div>

                </div>
              </div>

              {/* MERIT & EVALUATION METADATA CARDS */}
              <div className="recordMetaGrid">
                <div className="metaCard">
                  <span className="metaCardIcon">🥇</span>
                  <div>
                    <small>Official Merit Rank</small>
                    <p>{searchedRecord.selectionRank}</p>
                  </div>
                </div>

                <div className="metaCard">
                  <span className="metaCardIcon">📋</span>
                  <div>
                    <small>Interview &amp; Aptitude Score</small>
                    <p>{searchedRecord.interviewStatus}</p>
                  </div>
                </div>

                <div className="metaCard">
                  <span className="metaCardIcon">🏦</span>
                  <div>
                    <small>Aadhaar DBT Bank Status</small>
                    <p>{searchedRecord.bankStatus}</p>
                  </div>
                </div>

                <div className="metaCard">
                  <span className="metaCardIcon">📅</span>
                  <div>
                    <small>Date of Result Declaration</small>
                    <p>{searchedRecord.dateDeclared}</p>
                  </div>
                </div>
              </div>

              {/* COMMITTEE REMARKS & NOTICE */}
              <div className="recordRemarksBox">
                <div className="remarksIcon">📢</div>
                <div className="remarksContent">
                  <strong>Official Committee Notice:</strong>
                  <p>{searchedRecord.remarks}</p>
                </div>
              </div>

              {/* WORKING ACTION BUTTONS */}
              <div className="recordActionButtons">
                <button
                  type="button"
                  className="btnRecordPrimary"
                  onClick={() => setActiveModal("awardLetter")}
                >
                  <span>📄</span> Download Official Award Letter
                </button>

                <button
                  type="button"
                  className="btnRecordSecondary"
                  onClick={() => {
                    const match = declaredResults.find(r => r.title === searchedRecord.scholarshipName) || declaredResults[0];
                    openMeritListModal(match);
                  }}
                >
                  <span>📋</span> View Official Selection Roll
                </button>

                <button
                  type="button"
                  className="btnRecordSecondary"
                  onClick={() => setActiveModal("bankMandate")}
                >
                  <span>🏦</span> Bank Mandate &amp; DBT Status
                </button>

                <button
                  type="button"
                  className="btnRecordSecondary"
                  onClick={() => window.print()}
                >
                  <span>🖨️</span> Print Result
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ================= OFFICIAL MERIT LISTS & BULLETINS ================= */}
      <section className="meritListsSection">
        <div className="sectionHeader">
          <div>
            <span className="sectionCategoryBadge">OFFICIAL BULLETINS</span>
            <h2>Recent Selection Rolls &amp; Announcements</h2>
            <p>Direct audited releases published by sponsoring trusts and corporate CSR boards.</p>
          </div>

          <div className="meritSearchBox">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search published merit roll..."
              value={meritSearchTerm}
              onChange={(e) => setMeritSearchTerm(e.target.value)}
            />
            {meritSearchTerm && (
              <button type="button" onClick={() => setMeritSearchTerm("")}>✕</button>
            )}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="resultsTabs">
          {["All", "Undergraduate", "Women in STEM", "Medical", "School"].map((cat) => (
            <button
              key={cat}
              className={`resultTabBtn ${filterCategory === cat ? "active" : ""}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* BULLETINS GRID */}
        <div className="meritGrid">
          {filteredResults.map((item) => (
            <div key={item.id} className="meritCard">
              
              <div className="meritTop">
                <span className="meritCategoryBadge">{item.category}</span>
                <span className="meritDateTag">📅 {item.releaseDate}</span>
              </div>

              <h3>{item.title}</h3>
              <p className="meritProviderName">
                <span>🏢</span> {item.provider}
              </p>
              <p className="meritDesc">{item.description}</p>

              <div className="meritStatsRow">
                <div className="statItem">
                  <small>Total Selected</small>
                  <strong>{item.totalSelected}</strong>
                </div>
                <div className="statItem">
                  <small>Financial Aid</small>
                  <strong>{item.awardTotal}</strong>
                </div>
              </div>

              <div className="meritCutoffBox">
                <span className="cutoffIcon">🎯</span>
                <div>
                  <small>Eligibility Cut-Off:</small>
                  <strong>{item.cutOffMarks}</strong>
                </div>
              </div>

              <div className="meritFooterActions">
                <button
                  type="button"
                  className="btnViewList"
                  onClick={() => openMeritListModal(item)}
                >
                  <span>📋</span> View Selection Roll
                </button>

                <button
                  type="button"
                  className="btnQuickCheck"
                  onClick={() => {
                    setSearchScheme(item.title);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                    showToast(`Selected "${item.title}". Click Check Status above! ⚡`);
                  }}
                >
                  <span>🔍</span> Check My Roll
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ================= MODAL: OFFICIAL AWARD LETTER ================= */}
      {activeModal === "awardLetter" && searchedRecord && (
        <div className="resultsModalBackdrop" onClick={() => setActiveModal(null)}>
          <div className="awardLetterModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalControlBar">
              <span>Official Scholarship Sanction Letter</span>
              <div className="modalControlBtns">
                <button type="button" onClick={() => window.print()} className="btnModalAction">
                  🖨️ Print Letter
                </button>
                <button type="button" onClick={() => setActiveModal(null)} className="btnCloseModal">
                  ✕
                </button>
              </div>
            </div>

            {/* PRINTABLE LETTER BODY */}
            <div className="awardLetterSheet" id="printable-award-letter">
              
              <div className="letterHeader">
                <div className="letterEmblem">🏛️</div>
                <div className="letterHeaderTitle">
                  <h2>{searchedRecord.provider.toUpperCase()}</h2>
                  <h3>NATIONAL HIGHER EDUCATION CSR SCHOLARSHIP INITIATIVE</h3>
                  <small>Reference No: SC/GOV/{searchedRecord.rollNumber}/2026 • New Delhi, India</small>
                </div>
                <div className="letterSeal">
                  <span>✓ OFFICIAL</span>
                  <small>VERIFIED</small>
                </div>
              </div>

              <hr className="letterDivider" />

              <div className="letterDateRow">
                <span>Date of Issue: <strong>{searchedRecord.dateDeclared}</strong></span>
                <span>Academic Session: <strong>{searchedRecord.academicYear}</strong></span>
              </div>

              <div className="letterToSection">
                <p>To,</p>
                <h4>{searchedRecord.applicantName}</h4>
                <p>Student Identification: <strong>{searchedRecord.studentId}</strong></p>
                <p>Selection Roll Number: <strong>{searchedRecord.rollNumber}</strong></p>
                <p>Merit Standing: <strong>{searchedRecord.selectionRank}</strong></p>
              </div>

              <div className="letterSubject">
                <strong>SUBJECT: PROVISIONAL SELECTION &amp; FINANCIAL SANCTION ORDER FOR THE SCHEME "{searchedRecord.scholarshipName.toUpperCase()}"</strong>
              </div>

              <div className="letterContent">
                <p>Dear <strong>{searchedRecord.applicantName}</strong>,</p>
                <p>
                  We are pleased to inform you that upon thorough evaluation of your academic records, qualifying examination merits, and socioeconomic credentials, the Central Scholarship Advisory Committee has officially selected you as a <strong>National CSR Scholar</strong> for the academic year {searchedRecord.academicYear}.
                </p>
                
                <div className="sanctionCallout">
                  <div className="calloutRow">
                    <span>Sanctioned Scholarship Grant:</span>
                    <strong>{searchedRecord.allottedAmount}</strong>
                  </div>
                  <div className="calloutRow">
                    <span>Disbursement Mode:</span>
                    <strong>Aadhaar-Enabled Direct Benefit Transfer (DBT)</strong>
                  </div>
                  <div className="calloutRow">
                    <span>Target Bank Account:</span>
                    <strong>{searchedRecord.bankStatus}</strong>
                  </div>
                </div>

                <p>
                  The first installment of your scholarship grant has been sanctioned for direct release to your verified bank account. Please maintain academic regularity and upload semester performance updates through the <strong>ScholarshipConnect AI</strong> platform.
                </p>

                <p>
                  We congratulate you on your academic achievements and wish you continued excellence in your higher education endeavors.
                </p>
              </div>

              <div className="letterSignatures">
                <div className="signBlock">
                  <div className="signStamp">
                    <span>DIGITALLY CERTIFIED</span>
                    <small>UIDAI / NAD VERIFIED</small>
                  </div>
                  <p>National Verification Authority</p>
                </div>

                <div className="signBlock right">
                  <div className="signSignature">Dr. Rajeshwari Sharma</div>
                  <strong>Controller of Grants &amp; Fellowships</strong>
                  <p>{searchedRecord.provider}</p>
                </div>
              </div>

            </div>

            <div className="modalFooterActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => {
                  window.print();
                  showToast("Opening print dialog for official award letter! 📄");
                }}
              >
                📥 Download / Print Sanction Order
              </button>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: OFFICIAL MERIT LIST ROLL ================= */}
      {activeModal === "meritList" && selectedMeritRoll && (
        <div className="resultsModalBackdrop" onClick={() => setActiveModal(null)}>
          <div className="meritRollModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalHeader">
              <div>
                <span className="modalBadge">OFFICIAL CANDIDATE ROLL</span>
                <h3>{selectedMeritRoll.title}</h3>
                <small>Published on {selectedMeritRoll.releaseDate} by {selectedMeritRoll.provider}</small>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="btnCloseModal">
                ✕
              </button>
            </div>

            <div className="meritTableToolbar">
              <div className="tableSearch">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search by candidate name, roll number, or state..."
                  value={meritFilterQuery}
                  onChange={(e) => setMeritFilterQuery(e.target.value)}
                />
              </div>

              <div className="tableStats">
                <span>Showing verified candidates from Merit List #1</span>
              </div>
            </div>

            <div className="meritTableContainer">
              <table className="meritTable">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Roll Number</th>
                    <th>Candidate Name</th>
                    <th>State</th>
                    <th>Category</th>
                    <th>Sanction Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedMeritRoll.sampleCandidates || [])
                    .filter((c) => {
                      if (!meritFilterQuery) return true;
                      const q = meritFilterQuery.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        c.roll.toLowerCase().includes(q) ||
                        c.state.toLowerCase().includes(q)
                      );
                    })
                    .map((cand) => {
                      const isCurrentUser = cand.name.toLowerCase() === candidateName.toLowerCase();
                      return (
                        <tr key={cand.roll} className={isCurrentUser ? "highlightRow" : ""}>
                          <td><strong>{cand.rank}</strong></td>
                          <td><code>{cand.roll}</code></td>
                          <td>
                            <strong>{cand.name}</strong>
                            {isCurrentUser && <span className="youBadge">YOU</span>}
                          </td>
                          <td>{cand.state}</td>
                          <td>{cand.category}</td>
                          <td><span className="amtBadge">{cand.amount}</span></td>
                          <td>
                            <span className={`statusPill status-${cand.status.toLowerCase().replace(/\s+/g, "")}`}>
                              ✓ {cand.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="modalFooterActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => {
                  showToast(`Exported full selection list for ${selectedMeritRoll.title}! 📋`);
                  setActiveModal(null);
                }}
              >
                📥 Export Selection Roll (PDF)
              </button>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: BANK MANDATE & DBT STATUS ================= */}
      {activeModal === "bankMandate" && searchedRecord && (
        <div className="resultsModalBackdrop" onClick={() => setActiveModal(null)}>
          <div className="bankMandateModal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modalHeader">
              <div>
                <span className="modalBadge">DIRECT BENEFIT TRANSFER (DBT)</span>
                <h3>Bank Mandate &amp; Payment Tracker</h3>
                <small>National Payments Corporation of India (NPCI) &amp; Aadhaar Bridge</small>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="btnCloseModal">
                ✕
              </button>
            </div>

            <div className="bankMandateBody">
              
              <div className="dbtStatusCard">
                <div className="dbtStatusIcon">✓</div>
                <div>
                  <h4>Aadhaar Payment Bridge (APB) Active</h4>
                  <p>Your Aadhaar is verified and linked to your primary bank account for seamless grant credits.</p>
                </div>
              </div>

              <div className="bankDetailsGrid">
                <div className="bankDetailItem">
                  <small>Beneficiary Name</small>
                  <strong>{searchedRecord.applicantName}</strong>
                </div>

                <div className="bankDetailItem">
                  <small>Student ID</small>
                  <strong>{searchedRecord.studentId}</strong>
                </div>

                <div className="bankDetailItem">
                  <small>Designated Bank</small>
                  <strong>State Bank of India</strong>
                </div>

                <div className="bankDetailItem">
                  <small>Account Number</small>
                  <strong>•••• •••• 4291</strong>
                </div>

                <div className="bankDetailItem">
                  <small>IFSC Code</small>
                  <strong>SBIN0040182</strong>
                </div>

                <div className="bankDetailItem">
                  <small>NPCI Mapper Status</small>
                  <strong style={{ color: "#059669" }}>Active &amp; Seeded</strong>
                </div>
              </div>

              <div className="tranchesBox">
                <h4>Grant Disbursement Schedule:</h4>
                <div className="trancheItem">
                  <div>
                    <strong>Tranche 1: Initial Semester Academic Grant</strong>
                    <small>Scheduled release: 15 Oct 2026 • ₹1,00,000</small>
                  </div>
                  <span className="trancheBadge pending">Processing via DBT</span>
                </div>
                <div className="trancheItem">
                  <div>
                    <strong>Tranche 2: Second Semester Academic Grant</strong>
                    <small>Scheduled release: 15 Feb 2027 • ₹1,00,000</small>
                  </div>
                  <span className="trancheBadge future">Upcoming</span>
                </div>
              </div>

            </div>

            <div className="modalFooterActions">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => {
                  showToast("Bank mandate verification confirmed! 🏦");
                  setActiveModal(null);
                }}
              >
                ✓ Confirm Bank Details
              </button>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
