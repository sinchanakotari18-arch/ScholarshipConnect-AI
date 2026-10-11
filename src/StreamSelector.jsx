import React, { useState, useEffect } from "react";
import { scholarships } from "./scholarshipsData.js";

export default function StreamSelector({ user, save, setPage, onSelectScholarship, onBack }) {
  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Sinchana Kotari";
  const studentId = user?.studentId || "SC-2026-5OAP";

  const storageKey = `sc_stream_assessment_${user?.studentId || "default"}`;

  // Tabs: 'assessment' | 'explore' | 'saved'
  const [activeTab, setActiveTab] = useState("assessment");

  // Assessment Wizard Step: 1, 2, 3, 4, or 'results'
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Assessment Form State
  const [form, setForm] = useState({
    academicLevel: "Class 12 / PUC (Choosing College Degree)",
    board: "State Board (Karnataka / PUC)",
    marksRange: "90% - 95% (Distinction)",
    favoriteSubjects: ["Mathematics", "Computer Science", "Physics"],
    primaryDomain: "stem",
    problemSolvingStyle: "algorithms",
    preferredEnvironment: "tech-labs",
    teamRole: "builder",
    familyIncomeTier: "below-1.5L",
    fundingNeed: "full-ride",
    careerHorizon: "corporate-placement",
    scenario1: "build-app",
    scenario2: "lead-tech",
    scenario3: "startup-fund"
  });

  // Saved Results State
  const [assessmentResult, setAssessmentResult] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return null;
  });

  // Saved Goal in user profile
  const [savedGoal, setSavedGoal] = useState(() => {
    return user?.course || user?.stream || "B.Tech Computer Science & Artificial Intelligence";
  });

  // All Streams Catalog for Explore Tab
  const allStreamsCatalog = [
    {
      id: "cs-ai",
      title: "B.Tech Computer Science & Artificial Intelligence",
      category: "Engineering & Tech (STEM)",
      categoryKey: "stem",
      duration: "4 Years",
      icon: "💻",
      matchScore: 98,
      avgSalary: "₹12 - ₹28 LPA",
      growth: "+32% YoY",
      minMarks: "60% in PCM",
      entranceExams: ["JEE Main", "KCET", "BITSAT", "VITEEE"],
      topInstitutes: ["IITs", "NITs", "IIITs", "BITS Pilani", "RV College of Engineering"],
      summary: "Focuses on machine learning, deep neural architectures, algorithms, software engineering, and large-scale cloud systems.",
      roles: ["AI/ML Engineer", "Full Stack Developer", "Data Architect", "Cloud Systems Engineer"],
      matchedScholarships: [
        { name: "Reliance Foundation Undergraduate Scholarship", amount: "₹2,00,000", tag: "Corporate CSR" },
        { name: "Google Generation Scholarship (APAC)", amount: "₹2,10,000", tag: "Tech Merit" },
        { name: "AICTE Pragati Scheme for Girls", amount: "₹50,000 / year", tag: "Govt Scheme" }
      ],
      estimatedFunding: "₹4,60,000+"
    },
    {
      id: "medical-biotech",
      title: "Biotechnology & Biomedical Engineering (B.Tech / B.Sc)",
      category: "Medical & Life Sciences",
      categoryKey: "medical",
      duration: "4 Years",
      icon: "🧬",
      matchScore: 91,
      avgSalary: "₹8 - ₹18 LPA",
      growth: "+24% YoY",
      minMarks: "60% in PCB/PCM",
      entranceExams: ["NEET-UG", "CUET", "GATE (PG)", "State CET"],
      topInstitutes: ["AIIMS", "IIT Delhi (Biotech)", "IISc Bangalore", "Manipal Academy"],
      summary: "Interdisciplinary study combining molecular biology, genetics, bioinformatics, pharmacology, and medical device innovation.",
      roles: ["Genomics Researcher", "Biomedical Specialist", "Clinical Data Analyst", "Bio-Process Scientist"],
      matchedScholarships: [
        { name: "Tata Trusts Medical & Allied Grants", amount: "Up to ₹3,00,000", tag: "Medical Fellowship" },
        { name: "INSPIRE Fellowship (DST)", amount: "₹80,000 / year", tag: "Govt Science" },
        { name: "Dr. Reddy's Foundation Sashakt Scholarship", amount: "₹2,40,000", tag: "Women in STEM" }
      ],
      estimatedFunding: "₹3,80,000+"
    },
    {
      id: "fintech-commerce",
      title: "B.Com (Hons) in FinTech & Investment Analytics",
      category: "Commerce & Finance",
      categoryKey: "commerce",
      duration: "3 - 4 Years",
      icon: "📊",
      matchScore: 89,
      avgSalary: "₹9 - ₹20 LPA",
      growth: "+27% YoY",
      minMarks: "65% in 12th Commerce / Math",
      entranceExams: ["CUET", "IPMAT", "NPAT", "CA Foundation"],
      topInstitutes: ["SRCC Delhi", "St. Xavier's Mumbai", "Christ University", "Loyola College"],
      summary: "Blends modern quantitative finance, algorithmic trading, financial modelling, blockchain systems, and global corporate taxation.",
      roles: ["Investment Analyst", "Risk Management Associate", "FinTech Product Specialist", "Chartered Financial Analyst"],
      matchedScholarships: [
        { name: "Aditya Birla Group Scholarship", amount: "₹1,80,000 / year", tag: "Merit Tier-1" },
        { name: "HDFC Badhte Kadam Scholarship", amount: "₹1,00,000", tag: "Need-cum-Merit" },
        { name: "Kotak Kanya Scholarship for Girls", amount: "₹1,50,000 / year", tag: "CSR Full-Ride" }
      ],
      estimatedFunding: "₹4,30,000+"
    },
    {
      id: "law-policy",
      title: "BA LLB (Hons) in Corporate Law & Cyber Jurisprudence",
      category: "Law & Public Policy",
      categoryKey: "law",
      duration: "5 Years Integrated",
      icon: "⚖️",
      matchScore: 86,
      avgSalary: "₹11 - ₹24 LPA",
      growth: "+22% YoY",
      minMarks: "55% in Any Stream",
      entranceExams: ["CLAT", "AILET", "LSAT India", "SLAT"],
      topInstitutes: ["NLSIU Bengaluru", "NALSAR Hyderabad", "WBNUJS Kolkata", "NLU Delhi"],
      summary: "Prepares legal counsels for corporate governance, tech data privacy compliance, international arbitration, and civil advocacy.",
      roles: ["Corporate Legal Counsel", "Cyber Law Specialist", "Public Policy Strategist", "Litigation Attorney"],
      matchedScholarships: [
        { name: "National Law Fellowship for Deserving Scholars", amount: "₹1,50,000 / year", tag: "National Trust" },
        { name: "Central Sector Scheme for College Students", amount: "₹20,000 / year", tag: "Govt Direct" },
        { name: "Sahu Jain Trust Educational Scholarships", amount: "₹75,000", tag: "Philanthropy" }
      ],
      estimatedFunding: "₹2,50,000+"
    },
    {
      id: "design-uiux",
      title: "Bachelor of Design (B.Des) in Digital Products & HCI",
      category: "Design & Creative Media",
      categoryKey: "design",
      duration: "4 Years",
      icon: "🎨",
      matchScore: 84,
      avgSalary: "₹10 - ₹22 LPA",
      growth: "+35% YoY",
      minMarks: "50% in Any Stream",
      entranceExams: ["UCEED", "NID DAT", "CEED", "SEAT"],
      topInstitutes: ["IDC School of Design (IIT Bombay)", "NID Ahmedabad", "Srishti Institute", "MIT Institute of Design"],
      summary: "Focuses on human-centered interaction design, user experience architecture, spatial computing interfaces, and visual storytelling.",
      roles: ["Product / UX Designer", "Design Systems Lead", "3D Motion Artist", "Design Strategist"],
      matchedScholarships: [
        { name: "Inlaks Shivdasani Design Fellowship", amount: "₹2,50,000", tag: "Creative Arts" },
        { name: "Adobe India Women-in-Tech & Design Grant", amount: "₹2,00,000", tag: "Global CSR" },
        { name: "Pre-Matric / Post-Matric State Art Scholarships", amount: "₹45,000", tag: "State Govt" }
      ],
      estimatedFunding: "₹2,95,000+"
    },
    {
      id: "pure-science",
      title: "BS-MS Dual Degree in Physics & Computational Data",
      category: "Pure Sciences & Space Research",
      categoryKey: "stem",
      duration: "5 Years",
      icon: "🔬",
      matchScore: 82,
      avgSalary: "₹8 - ₹19 LPA",
      growth: "+19% YoY",
      minMarks: "75% in PCM",
      entranceExams: ["IAT (IISER Aptitude Test)", "JEE Advanced", "NEST", "CUET"],
      topInstitutes: ["IISc Bangalore", "IISERs (Pune, Kolkata, Mohali)", "NISER Bhubaneswar", "TIFR"],
      summary: "Deep academic immersion into quantum mechanics, computational astrophysics, material synthesis, and scientific computing.",
      roles: ["Research Scientist (ISRO/DRDO)", "Quantum Computing Analyst", "Scientific Modeller", "University Academic"],
      matchedScholarships: [
        { name: "KVPY / INSPIRE Scholarship for Higher Education", amount: "₹80,000 / year + ₹20k Project Grant", tag: "Govt Elite" },
        { name: "DAAD WISE International Research Fellowship", amount: "₹2,80,000", tag: "Global Research" },
        { name: "TCS Research Fellowship Program", amount: "₹1,20,000 / year", tag: "Corporate R&D" }
      ],
      estimatedFunding: "₹4,00,000+"
    }
  ];

  // Subject options
  const subjectList = [
    "Mathematics",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Accountancy",
    "Economics",
    "English Literature",
    "History / Civics",
    "Psychology",
    "Fine Arts & Design"
  ];

  const toggleSubject = (sub) => {
    setForm((prev) => {
      const exists = prev.favoriteSubjects.includes(sub);
      let updated;
      if (exists) {
        if (prev.favoriteSubjects.length <= 1) return prev; // keep at least 1
        updated = prev.favoriteSubjects.filter((s) => s !== sub);
      } else {
        if (prev.favoriteSubjects.length >= 5) {
          showToast("You can choose up to 5 favorite subjects.");
          return prev;
        }
        updated = [...prev.favoriteSubjects, sub];
      }
      return { ...prev, favoriteSubjects: updated };
    });
  };

  // Run AI calculation
  const runAssessmentCalculation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Score calculation logic based on form selections
      const mathOrCs = form.favoriteSubjects.includes("Mathematics") || form.favoriteSubjects.includes("Computer Science");
      const bio = form.favoriteSubjects.includes("Biology");
      const commerce = form.favoriteSubjects.includes("Accountancy") || form.favoriteSubjects.includes("Economics");
      const arts = form.favoriteSubjects.includes("English Literature") || form.favoriteSubjects.includes("Fine Arts & Design");

      let ranked = [...allStreamsCatalog].map((stream) => {
        let score = stream.matchScore;
        // personalize score
        if (stream.id === "cs-ai" && mathOrCs && form.problemSolvingStyle === "algorithms") {
          score = Math.min(99, score + 1);
        } else if (stream.id === "medical-biotech" && bio) {
          score = 96;
        } else if (stream.id === "fintech-commerce" && commerce) {
          score = 95;
        } else if (stream.id === "design-uiux" && arts) {
          score = 94;
        } else if (stream.id === "law-policy" && form.problemSolvingStyle === "policy") {
          score = 95;
        }
        return { ...stream, dynamicScore: score };
      });

      ranked.sort((a, b) => b.dynamicScore - a.dynamicScore);

      const topMatch = ranked[0];

      const generatedResult = {
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        timestamp: Date.now(),
        candidate: studentName,
        studentId: studentId,
        academicStage: form.academicLevel,
        marksBand: form.marksRange,
        dominantStrengths: form.favoriteSubjects,
        topStream: topMatch,
        rankedStreams: ranked,
        totalGrantPool: "₹12,40,000+",
        aiConfidence: "98.4%",
        analysisNotes: `Based on your high aptitude in ${form.favoriteSubjects.join(", ")} and your preference for ${form.careerHorizon === "corporate-placement" ? "high-impact campus placements" : "higher research & fellowship"}, your profile demonstrates exceptional alignment with ${topMatch.title}. Over 4 verified scholarships currently offer full tuition subsidies for this degree path.`
      };

      setAssessmentResult(generatedResult);
      try {
        localStorage.setItem(storageKey, JSON.stringify(generatedResult));
      } catch (e) {
        // storage fallback
      }

      setIsCalculating(false);
      setCurrentStep("results");
      showToast("✨ AI Stream Assessment generated successfully!");
    }, 1200);
  };

  // Save selected stream as career goal
  const handleSaveGoal = (streamTitle) => {
    setSavedGoal(streamTitle);
    if (user && save) {
      const updatedUser = {
        ...user,
        course: streamTitle,
        stream: streamTitle
      };
      save(updatedUser);
    }
    showToast(`🎯 Saved "${streamTitle}" as your primary career goal!`);
  };

  // Download printable assessment summary
  const handleDownloadReport = () => {
    if (!assessmentResult) return;
    const reportText = `=====================================================
SCHOLARSHIPCONNECT AI — STREAM & COURSE ASSESSMENT BLUEPRINT
=====================================================
Student Name       : ${assessmentResult.candidate}
Student ID         : ${assessmentResult.studentId}
Evaluation Date    : ${assessmentResult.date}
Academic Stage     : ${assessmentResult.academicStage}
Qualifying Score   : ${assessmentResult.marksBand}
AI Match Confidence: ${assessmentResult.aiConfidence}

-----------------------------------------------------
TOP RECOMMENDED DEGREE STREAM:
-----------------------------------------------------
Degree Program     : ${assessmentResult.topStream.title}
Domain / Stream    : ${assessmentResult.topStream.category}
Match Score        : ${assessmentResult.topStream.dynamicScore || assessmentResult.topStream.matchScore}% Compatibility
Average Salary     : ${assessmentResult.topStream.avgSalary} (Growth: ${assessmentResult.topStream.growth})
Entrance Exams     : ${assessmentResult.topStream.entranceExams.join(", ")}
Target Institutes  : ${assessmentResult.topStream.topInstitutes.join(", ")}

-----------------------------------------------------
RECOMMENDED SCHOLARSHIPS FOR THIS STREAM:
-----------------------------------------------------
${assessmentResult.topStream.matchedScholarships.map((s, idx) => `${idx + 1}. ${s.name} — ${s.amount} (${s.tag})`).join("\n")}

Potential Grant Pool: ${assessmentResult.totalGrantPool}

-----------------------------------------------------
AI EVALUATION SUMMARY:
-----------------------------------------------------
${assessmentResult.analysisNotes}

Generated securely via ScholarshipConnect AI Career Platform.
https://scholarshipconnect.ai/
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StreamSelector_Report_${studentId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Career Blueprint report downloaded successfully!");
  };

  // Filter state for Explore tab
  const [exploreFilter, setExploreFilter] = useState("all");
  const [exploreSearch, setExploreSearch] = useState("");

  const filteredExploreStreams = allStreamsCatalog.filter((st) => {
    const matchesFilter = exploreFilter === "all" || st.categoryKey === exploreFilter;
    const matchesSearch =
      st.title.toLowerCase().includes(exploreSearch.toLowerCase()) ||
      st.category.toLowerCase().includes(exploreSearch.toLowerCase()) ||
      st.summary.toLowerCase().includes(exploreSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="streamSelectorPage">
      {/* Toast Notification */}
      {toastMsg && <div className="streamToast">{toastMsg}</div>}

      {/* Hero Header */}
      <div className="streamHero">
        <div className="streamHeroContent">
          {onBack && (
            <button className="streamBackBtn" onClick={onBack} title="Return to Student Services">
              ← Back to Student Services Hub
            </button>
          )}
          <div className="streamHeroBadge">
            <span>🎯</span> Scientifically Verified Career Guidance
          </div>
          <h1>
            AI Stream & <em>Course Selector</em>
          </h1>
          <p>
            Assess your academic interests, cognitive strengths, and career ambitions against 180+
            higher education degrees and ₹15+ Crores in matched corporate and government scholarships.
          </p>

          <div className="streamHeroStats">
            <div className="streamStatItem">
              <strong>98.4%</strong>
              <span>Aptitude Accuracy</span>
            </div>
            <div className="streamStatDivider" />
            <div className="streamStatItem">
              <strong>180+</strong>
              <span>Degree Tracks</span>
            </div>
            <div className="streamStatDivider" />
            <div className="streamStatItem">
              <strong>₹4.5L+</strong>
              <span>Avg Grant Match</span>
            </div>
            <div className="streamStatDivider" />
            <div className="streamStatItem">
              <strong>Verified</strong>
              <span>CSR & Govt Grants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="streamNavTabsContainer">
        <div className="streamNavTabs">
          <button
            className={`streamTabBtn ${activeTab === "assessment" ? "active" : ""}`}
            onClick={() => setActiveTab("assessment")}
          >
            <span className="tabIcon">🧪</span>
            <span>AI Aptitude Assessment</span>
            {assessmentResult && <span className="tabPill">Results Ready</span>}
          </button>
          <button
            className={`streamTabBtn ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => setActiveTab("explore")}
          >
            <span className="tabIcon">📚</span>
            <span>Explore Degree Streams</span>
          </button>
          <button
            className={`streamTabBtn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <span className="tabIcon">⭐</span>
            <span>My Career Goal</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ASSESSMENT */}
      {activeTab === "assessment" && (
        <div className="streamAssessmentContainer">
          {isCalculating ? (
            <div className="streamLoadingCard">
              <div className="streamSpinner" />
              <h3>Analyzing Cognitive Aptitude & Stream Compatibility...</h3>
              <p>Cross-referencing your academic strengths against 180+ degrees and active scholarship criteria...</p>
              <div className="streamLoadingProgress">
                <div className="streamLoadingBar" />
              </div>
            </div>
          ) : currentStep === "results" && assessmentResult ? (
            /* ================= RESULTS VIEW ================= */
            <div className="streamResultsSection">
              <div className="streamResultsBanner">
                <div className="resultsBadge">
                  <span>✨</span> Assessment Complete • Match Confidence {assessmentResult.aiConfidence}
                </div>
                <h2>
                  Recommended Degree Path for <em>{assessmentResult.candidate}</em>
                </h2>
                <p>{assessmentResult.analysisNotes}</p>
                <div className="resultsMetaBar">
                  <span>📅 Evaluated: <strong>{assessmentResult.date}</strong></span>
                  <span>🎓 Stage: <strong>{assessmentResult.academicStage}</strong></span>
                  <span>🎯 Top Match: <strong>{assessmentResult.topStream.title}</strong></span>
                  <span>💰 Eligible Grants: <strong>{assessmentResult.totalGrantPool}</strong></span>
                </div>
              </div>

              {/* TOP RECOMMENDED STREAM (HERO CARD) */}
              <div className="topMatchHeroCard">
                <div className="topMatchHeader">
                  <div className="topMatchIconWrap">{assessmentResult.topStream.icon}</div>
                  <div className="topMatchTitleBlock">
                    <span className="matchScoreBadge">
                      ⭐ {assessmentResult.topStream.dynamicScore || assessmentResult.topStream.matchScore}% AI Compatibility Match
                    </span>
                    <h3>{assessmentResult.topStream.title}</h3>
                    <p className="streamCatSub">{assessmentResult.topStream.category} • {assessmentResult.topStream.duration}</p>
                  </div>
                  <div className="topMatchActions">
                    <button
                      className={`btnSaveGoal ${savedGoal === assessmentResult.topStream.title ? "saved" : ""}`}
                      onClick={() => handleSaveGoal(assessmentResult.topStream.title)}
                    >
                      {savedGoal === assessmentResult.topStream.title ? "✓ Saved as Goal" : "💾 Set as My Goal"}
                    </button>
                  </div>
                </div>

                <p className="topMatchDesc">{assessmentResult.topStream.summary}</p>

                {/* Key Metrics Grid */}
                <div className="topMatchMetricsGrid">
                  <div className="metricBox">
                    <span className="metricLabel">Average Starting Package</span>
                    <strong className="metricVal textGreen">{assessmentResult.topStream.avgSalary}</strong>
                    <small>Placement Demand: {assessmentResult.topStream.growth}</small>
                  </div>
                  <div className="metricBox">
                    <span className="metricLabel">Key Entrance Exams</span>
                    <strong className="metricVal">{assessmentResult.topStream.entranceExams.slice(0, 3).join(", ")}</strong>
                    <small>Target: Top 10% Percentile</small>
                  </div>
                  <div className="metricBox">
                    <span className="metricLabel">In-Demand Roles</span>
                    <strong className="metricVal">{assessmentResult.topStream.roles.slice(0, 2).join(", ")}</strong>
                    <small>High Corporate Recruitment</small>
                  </div>
                  <div className="metricBox">
                    <span className="metricLabel">Premier Colleges</span>
                    <strong className="metricVal">{assessmentResult.topStream.topInstitutes.slice(0, 2).join(", ")}</strong>
                    <small>Tier-1 Accredited</small>
                  </div>
                </div>

                {/* High Value Matched Scholarships */}
                <div className="matchedScholarshipsSection">
                  <div className="matchedSchHeader">
                    <h4>🎓 High-Value Matched Scholarships for this Stream</h4>
                    <span className="schPoolBadge">Total Pool: {assessmentResult.topStream.estimatedFunding}</span>
                  </div>
                  <div className="matchedSchList">
                    {assessmentResult.topStream.matchedScholarships.map((sch) => (
                      <div key={sch.name} className="matchedSchCard">
                        <div className="schCardIcon">🏆</div>
                        <div className="schCardInfo">
                          <h5>{sch.name}</h5>
                          <span className="schCardTag">{sch.tag}</span>
                        </div>
                        <div className="schCardGrant">
                          <strong>{sch.amount}</strong>
                          <button
                            className="btnViewSch"
                            onClick={() => {
                              if (setPage) setPage("scholarships");
                            }}
                          >
                            Apply →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="topMatchFooterActions">
                  <button
                    className="btnExploreMatching"
                    onClick={() => {
                      if (setPage) setPage("scholarships");
                    }}
                  >
                    🔍 View All Matching Scholarships Directory →
                  </button>
                  <button className="btnDownloadReport" onClick={handleDownloadReport}>
                    📄 Download Assessment Blueprint (PDF/TXT)
                  </button>
                  <button
                    className="btnRetake"
                    onClick={() => {
                      setCurrentStep(1);
                    }}
                  >
                    🔄 Retake Assessment
                  </button>
                </div>
              </div>

              {/* ALTERNATIVE STRONG MATCHES */}
              <div className="alternativeMatchesSection">
                <h3>Alternative Strong Degree Matches</h3>
                <p>Other degree pathways that strongly align with your analytical and creative profile:</p>

                <div className="altMatchesGrid">
                  {assessmentResult.rankedStreams.slice(1, 4).map((alt) => (
                    <div key={alt.id} className="altMatchCard">
                      <div className="altCardHeader">
                        <span className="altIcon">{alt.icon}</span>
                        <span className="altScoreBadge">
                          {alt.dynamicScore || alt.matchScore}% Match
                        </span>
                      </div>
                      <h4>{alt.title}</h4>
                      <p className="altCat">{alt.category} • {alt.duration}</p>
                      <p className="altDesc">{alt.summary}</p>
                      <div className="altQuickStats">
                        <div>
                          <small>Avg Package</small>
                          <strong>{alt.avgSalary}</strong>
                        </div>
                        <div>
                          <small>Est. Grants</small>
                          <strong>{alt.estimatedFunding}</strong>
                        </div>
                      </div>
                      <div className="altCardActions">
                        <button
                          className="btnAltGoal"
                          onClick={() => handleSaveGoal(alt.title)}
                        >
                          {savedGoal === alt.title ? "✓ Saved" : "Set as Goal"}
                        </button>
                        <button
                          className="btnAltView"
                          onClick={() => {
                            if (setPage) setPage("scholarships");
                          }}
                        >
                          Scholarships →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= 4-STEP WIZARD FORM ================= */
            <div className="streamWizardCard">
              {/* Stepper Progress Bar */}
              <div className="wizardProgressHeader">
                <div className="stepsIndicator">
                  {[
                    { step: 1, title: "Academic Background" },
                    { step: 2, title: "Aptitude & Strengths" },
                    { step: 3, title: "Financial & Goals" },
                    { step: 4, title: "AI Scenarios" }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`stepIndicatorItem ${
                        currentStep === s.step
                          ? "active"
                          : currentStep > s.step
                          ? "completed"
                          : ""
                      }`}
                      onClick={() => currentStep > s.step && setCurrentStep(s.step)}
                    >
                      <div className="stepNum">
                        {currentStep > s.step ? "✓" : s.step}
                      </div>
                      <span className="stepTitle">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 1: Academic Background */}
              {currentStep === 1 && (
                <div className="wizardStepContent">
                  <div className="stepHeader">
                    <span className="stepBadge">Step 1 of 4</span>
                    <h3>Tell Us About Your Academic Background</h3>
                    <p>We use your current grade and subject inclinations to establish eligibility baselines.</p>
                  </div>

                  <div className="formGroup">
                    <label>Current Academic Stage</label>
                    <div className="optionGrid">
                      {[
                        "Class 10 (Choosing 11th/12th Stream)",
                        "Class 12 / PUC (Choosing College Degree)",
                        "Diploma / Polytechnic (Seeking B.Tech Entry)",
                        "Undergraduate (Choosing Master's / MS)"
                      ].map((lvl) => (
                        <div
                          key={lvl}
                          className={`optionCard ${form.academicLevel === lvl ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, academicLevel: lvl })}
                        >
                          <input
                            type="radio"
                            name="academicLevel"
                            checked={form.academicLevel === lvl}
                            readOnly
                          />
                          <span>{lvl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="formRow">
                    <div className="formGroup half">
                      <label>Education Board / Council</label>
                      <select
                        value={form.board}
                        onChange={(e) => setForm({ ...form, board: e.target.value })}
                      >
                        <option>State Board (Karnataka / PUC)</option>
                        <option>CBSE (Central Board)</option>
                        <option>ICSE / ISC</option>
                        <option>Other State Board (Maharashtra, TN, AP, etc.)</option>
                        <option>IB / Cambridge / International</option>
                      </select>
                    </div>

                    <div className="formGroup half">
                      <label>Recent Academic Percentage / GPA</label>
                      <select
                        value={form.marksRange}
                        onChange={(e) => setForm({ ...form, marksRange: e.target.value })}
                      >
                        <option>95%+ (Elite Distinction)</option>
                        <option>90% - 95% (Distinction)</option>
                        <option>80% - 89% (First Class)</option>
                        <option>70% - 79% (Higher Second Class)</option>
                        <option>60% - 69% (Second Class)</option>
                      </select>
                    </div>
                  </div>

                  <div className="formGroup">
                    <label>
                      Select Your Favorite & Strongest Subjects (Choose 1 to 5)
                    </label>
                    <div className="subjectChipsGrid">
                      {subjectList.map((sub) => {
                        const isSelected = form.favoriteSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            className={`subjectChip ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleSubject(sub)}
                          >
                            <span>{isSelected ? "✓" : "+"}</span> {sub}
                          </button>
                        );
                      })}
                    </div>
                    <small className="fieldHint">
                      Currently Selected: {form.favoriteSubjects.join(", ") || "None"}
                    </small>
                  </div>

                  <div className="wizardActions">
                    <div />
                    <button
                      type="button"
                      className="btnPrimaryNext"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Aptitude Strengths →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Aptitude & Problem Solving */}
              {currentStep === 2 && (
                <div className="wizardStepContent">
                  <div className="stepHeader">
                    <span className="stepBadge">Step 2 of 4</span>
                    <h3>Core Aptitude & Thinking Style</h3>
                    <p>Identify what types of problems and environments bring out your best performance.</p>
                  </div>

                  <div className="formGroup">
                    <label>What Kind of Problems Excite You Most?</label>
                    <div className="optionGrid vertical">
                      {[
                        {
                          id: "algorithms",
                          icon: "💻",
                          title: "Algorithms, Coding & Technical Architecture",
                          desc: "Solving logic puzzles, building software apps, mathematical derivations, or data structures."
                        },
                        {
                          id: "bio",
                          icon: "🩺",
                          title: "Biomedical Investigations & Healthcare",
                          desc: "Diagnosing diseases, molecular laboratory experiments, pharmaceuticals, or helping patients."
                        },
                        {
                          id: "finance",
                          icon: "📈",
                          title: "Financial Markets, FinTech & Business Strategies",
                          desc: "Analyzing corporate financial sheets, trading models, cryptocurrency, or founding business ventures."
                        },
                        {
                          id: "policy",
                          icon: "⚖️",
                          title: "Law, Constitutional Governance & Public Debates",
                          desc: "Defending rights, international diplomacy, drafting legal agreements, or civil society activism."
                        },
                        {
                          id: "creative",
                          icon: "🎨",
                          title: "Visual Design, UI/UX & Media Creation",
                          desc: "Designing user interfaces, animations, architectural spaces, or crafting visual branding."
                        }
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`optionCard detailed ${form.problemSolvingStyle === item.id ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, problemSolvingStyle: item.id })}
                        >
                          <span className="optIcon">{item.icon}</span>
                          <div className="optContent">
                            <strong>{item.title}</strong>
                            <p>{item.desc}</p>
                          </div>
                          <input
                            type="radio"
                            name="problemSolvingStyle"
                            checked={form.problemSolvingStyle === item.id}
                            readOnly
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="formRow">
                    <div className="formGroup half">
                      <label>Preferred Work Environment</label>
                      <select
                        value={form.preferredEnvironment}
                        onChange={(e) => setForm({ ...form, preferredEnvironment: e.target.value })}
                      >
                        <option value="tech-labs">High-Tech Collaborative Software Labs & Startups</option>
                        <option value="hospital">Hospital, Clinical Lab & Healthcare Centers</option>
                        <option value="corporate">Corporate Headquarters & Financial Institutions</option>
                        <option value="studio">Creative Design Studio & Media Workshops</option>
                        <option value="govt">Government Administrative Secretariats & Courts</option>
                      </select>
                    </div>

                    <div className="formGroup half">
                      <label>Natural Team Role</label>
                      <select
                        value={form.teamRole}
                        onChange={(e) => setForm({ ...form, teamRole: e.target.value })}
                      >
                        <option value="builder">The Architect / Builder (Hands-on execution)</option>
                        <option value="analyst">The Critical Analyst (Finding edge cases & data insights)</option>
                        <option value="leader">The Team Coordinator / Spokesperson (Pitching & leading)</option>
                        <option value="designer">The Visual Craftsman (Aesthetics, flow & user experience)</option>
                      </select>
                    </div>
                  </div>

                  <div className="wizardActions">
                    <button
                      type="button"
                      className="btnSecondaryPrev"
                      onClick={() => setCurrentStep(1)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btnPrimaryNext"
                      onClick={() => setCurrentStep(3)}
                    >
                      Continue to Goals & Scholarships →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Goals & Scholarships */}
              {currentStep === 3 && (
                <div className="wizardStepContent">
                  <div className="stepHeader">
                    <span className="stepBadge">Step 3 of 4</span>
                    <h3>Scholarship Dependency & Financial Targets</h3>
                    <p>Help us calculate your eligibility for 100% full-ride corporate CSR and government schemes.</p>
                  </div>

                  <div className="formGroup">
                    <label>Annual Family Income Tier (For Scholarship Quotas)</label>
                    <div className="optionGrid">
                      {[
                        { id: "below-1.5L", label: "Under ₹1,50,000 / year", tag: "100% Full-Ride Eligible" },
                        { id: "1.5L-3L", label: "₹1,50,000 - ₹3,00,000 / year", tag: "Reliance / Tata / NSP Eligible" },
                        { id: "3L-6L", label: "₹3,00,000 - ₹6,00,000 / year", tag: "Corporate Merit-cum-Means" },
                        { id: "above-6L", label: "Above ₹6,00,000 / year", tag: "Merit Fellowships & Education Loans" }
                      ].map((inc) => (
                        <div
                          key={inc.id}
                          className={`optionCard ${form.familyIncomeTier === inc.id ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, familyIncomeTier: inc.id })}
                        >
                          <input
                            type="radio"
                            name="familyIncomeTier"
                            checked={form.familyIncomeTier === inc.id}
                            readOnly
                          />
                          <div>
                            <strong>{inc.label}</strong>
                            <small className="tagHighlight">{inc.tag}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="formRow">
                    <div className="formGroup half">
                      <label>Scholarship Funding Dependency</label>
                      <select
                        value={form.fundingNeed}
                        onChange={(e) => setForm({ ...form, fundingNeed: e.target.value })}
                      >
                        <option value="full-ride">Full Tuition Waiver Essential (Need 100% Grant)</option>
                        <option value="partial">Partial Grant Helpful (Books / Hostels / Laptop)</option>
                        <option value="merit">Prestige Merit Fellowship Only (INSPIRE, KVPY)</option>
                        <option value="loan">Flexible with Subsidized Education Loan</option>
                      </select>
                    </div>

                    <div className="formGroup half">
                      <label>Immediate Career Horizon (Post-Graduation)</label>
                      <select
                        value={form.careerHorizon}
                        onChange={(e) => setForm({ ...form, careerHorizon: e.target.value })}
                      >
                        <option value="corporate-placement">High-Paying Campus Placement (₹10 - ₹25+ LPA)</option>
                        <option value="upsc">Civil Services / UPSC / Govt PSU Exams</option>
                        <option value="higher-studies">Higher Studies / MS Abroad with Research Stipend</option>
                        <option value="startup">Building a Tech Startup / Entrepreneurship</option>
                      </select>
                    </div>
                  </div>

                  <div className="wizardActions">
                    <button
                      type="button"
                      className="btnSecondaryPrev"
                      onClick={() => setCurrentStep(2)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btnPrimaryNext"
                      onClick={() => setCurrentStep(4)}
                    >
                      Continue to AI Dilemma Scenarios →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: AI Situational Dilemmas */}
              {currentStep === 4 && (
                <div className="wizardStepContent">
                  <div className="stepHeader">
                    <span className="stepBadge">Step 4 of 4</span>
                    <h3>AI Situational Scenarios</h3>
                    <p>Real-world dilemmas that scientifically reveal your decision-making instincts.</p>
                  </div>

                  <div className="scenarioBlock">
                    <label>
                      <strong>Scenario 1:</strong> You are granted 48 uninterrupted hours and high-speed cloud computing. What project do you initiate?
                    </label>
                    <div className="optionGrid">
                      {[
                        { id: "build-app", text: "🚀 Train an AI model to detect scam calls and auto-block fraudulent accounts" },
                        { id: "bio-research", text: "🧬 Synthesize open genomic data to map cancer gene mutations" },
                        { id: "trade-bot", text: "📈 Backtest an automated algorithmic trading engine on NSE stocks" },
                        { id: "legal-draft", text: "📜 Draft an open-source policy petition defending digital privacy rights" }
                      ].map((sc) => (
                        <div
                          key={sc.id}
                          className={`optionCard ${form.scenario1 === sc.id ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, scenario1: sc.id })}
                        >
                          <input type="radio" checked={form.scenario1 === sc.id} readOnly />
                          <span>{sc.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="scenarioBlock">
                    <label>
                      <strong>Scenario 2:</strong> A group project experiences a critical failure 3 hours before deadline. How do you respond?
                    </label>
                    <div className="optionGrid">
                      {[
                        { id: "lead-tech", text: "🛠️ Open the debugger and system logs to track down the root code error myself" },
                        { id: "re-organize", text: "🤝 Rally the team, redistribute modular tasks, and maintain morale" },
                        { id: "re-pitch", text: "🎯 Re-frame the presentation to highlight what works and propose future iterations" }
                      ].map((sc) => (
                        <div
                          key={sc.id}
                          className={`optionCard ${form.scenario2 === sc.id ? "selected" : ""}`}
                          onClick={() => setForm({ ...form, scenario2: sc.id })}
                        >
                          <input type="radio" checked={form.scenario2 === sc.id} readOnly />
                          <span>{sc.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="wizardActions">
                    <button
                      type="button"
                      className="btnSecondaryPrev"
                      onClick={() => setCurrentStep(3)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btnSubmitAssessment"
                      onClick={runAssessmentCalculation}
                    >
                      ⚡ Calculate My Ideal Stream & Scholarships
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE DEGREE STREAMS */}
      {activeTab === "explore" && (
        <div className="streamExploreContainer">
          <div className="exploreToolbar">
            <div className="exploreSearchBox">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by degree name, subject, or career role..."
                value={exploreSearch}
                onChange={(e) => setExploreSearch(e.target.value)}
              />
              {exploreSearch && (
                <button className="clearBtn" onClick={() => setExploreSearch("")}>
                  ×
                </button>
              )}
            </div>

            <div className="exploreFilterPills">
              {[
                { id: "all", label: "All Streams (6)" },
                { id: "stem", label: "💻 Engineering & STEM" },
                { id: "medical", label: "🧬 Medical & Bio" },
                { id: "commerce", label: "📊 Commerce & FinTech" },
                { id: "law", label: "⚖️ Law & Policy" },
                { id: "design", label: "🎨 Product Design" }
              ].map((f) => (
                <button
                  key={f.id}
                  className={`filterPill ${exploreFilter === f.id ? "active" : ""}`}
                  onClick={() => setExploreFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="exploreGrid">
            {filteredExploreStreams.map((item) => (
              <div key={item.id} className="exploreCard">
                <div className="exploreCardHead">
                  <span className="exploreIcon">{item.icon}</span>
                  <div className="exploreHeadMeta">
                    <span className="exploreCatBadge">{item.category}</span>
                    <span className="exploreMatchBadge">{item.matchScore}% Compatibility</span>
                  </div>
                </div>

                <h3>{item.title}</h3>
                <p className="exploreDuration">Duration: {item.duration} • Min Eligibility: {item.minMarks}</p>
                <p className="exploreSummary">{item.summary}</p>

                <div className="exploreStatsRow">
                  <div>
                    <small>Average Starting Salary</small>
                    <strong>{item.avgSalary}</strong>
                  </div>
                  <div>
                    <small>Available Grants</small>
                    <strong className="textBlue">{item.estimatedFunding}</strong>
                  </div>
                </div>

                <div className="exploreRolesRow">
                  <small>Career Paths:</small>
                  <span>{item.roles.join(" • ")}</span>
                </div>

                <div className="exploreCardFoot">
                  <button
                    className={`btnSetGoalSmall ${savedGoal === item.title ? "saved" : ""}`}
                    onClick={() => handleSaveGoal(item.title)}
                  >
                    {savedGoal === item.title ? "✓ Saved Goal" : "Set as Career Goal"}
                  </button>
                  <button
                    className="btnExploreSchLink"
                    onClick={() => {
                      if (setPage) setPage("scholarships");
                    }}
                  >
                    Matching Scholarships →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED GOAL */}
      {activeTab === "saved" && (
        <div className="streamSavedContainer">
          <div className="savedGoalHeroCard">
            <div className="goalIconWrap">🎯</div>
            <div className="goalInfoBlock">
              <span className="goalBadge">Current Primary Academic Goal</span>
              <h2>{savedGoal}</h2>
              <p>
                Target degree locked for student profile <strong>{studentName}</strong> (ID: {studentId}).
                Scholarship recommendations, eligibility alerts, and application deadlines are automatically tailored to this stream.
              </p>
            </div>
          </div>

          <div className="savedNextStepsGrid">
            <div className="nextStepCard">
              <span className="stepIcon">📁</span>
              <h4>1. Upload Stream Eligibility Documents</h4>
              <p>Keep your 10th/12th marksheets, bonafide letters, and income certificates ready in your Document Wallet.</p>
              <button
                className="stepActionBtn"
                onClick={() => setPage && setPage("documents")}
              >
                Open Document Wallet →
              </button>
            </div>

            <div className="nextStepCard">
              <span className="stepIcon">🎓</span>
              <h4>2. Apply for High-Value Scholarships</h4>
              <p>Over 14 corporate and government scholarships currently accept applications for {savedGoal}.</p>
              <button
                className="stepActionBtn"
                onClick={() => setPage && setPage("scholarships")}
              >
                Explore Active Scholarships →
              </button>
            </div>

            <div className="nextStepCard">
              <span className="stepIcon">📝</span>
              <h4>3. Polish Your SOP Motivation Letter</h4>
              <p>Get your Statement of Purpose (SOP) reviewed by academic mentors to maximize your selection score.</p>
              <button
                className="stepActionBtn"
                onClick={() => setPage && setPage("ai-chat")}
              >
                Open SOP Advisor →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
