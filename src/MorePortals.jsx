import React, { useState } from "react";
import StreamSelector from "./StreamSelector.jsx";

export function StudentServicesView({ user, save, onSelectScholarship, setPage }) {
  // Can open active tool directly in view (e.g. 'stream-selector')
  const [activeService, setActiveService] = useState(null);

  // Modals for other interactive services
  const [mentorshipModal, setMentorshipModal] = useState(false);
  const [fraudModal, setFraudModal] = useState(false);
  const [fraudQuery, setFraudQuery] = useState("");
  const [fraudResult, setFraudResult] = useState(null);
  const [careerModal, setCareerModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const services = [
    {
      icon: "🧠",
      title: "Profile-Based Recommendation Engine",
      desc: "Instant machine-learning match mapping your stream, marks, annual income, and domicile to top grant schemes.",
      badge: "AI Powered",
      action: "View Recommendations",
      target: "recommendations",
      isPrimary: true
    },
    {
      icon: "⚡",
      title: "Multi-Factor Eligibility Checker",
      desc: "Audit all 8 qualification rules in seconds across all top grant schemes to unlock qualified awards.",
      badge: "Automated Audit",
      action: "Check Eligibility",
      target: "eligibility",
      isPrimary: true
    },
    {
      icon: "🎯",
      title: "Stream & Course Selector AI",
      desc: "Scientifically assess your interests, aptitude, and high-paying scholarship opportunities before picking your degree.",
      badge: "Popular AI Tool",
      action: "Launch Assessment",
      isPrimary: false
    },
    {
      icon: "📝",
      title: "SOP & Essay Proofreader",
      desc: "Get your scholarship motivation letter evaluated by academic mentors to maximize committee score.",
      badge: "Free Service",
      action: "Review My Essay",
      target: "ai-chat"
    },
    {
      icon: "📁",
      title: "Digital Document Locker",
      desc: "Securely store verified caste, income, bonafide, and marksheet certificates with automatic expiration alerts.",
      badge: "Verified Vault",
      action: "Open Document Wallet",
      target: "documents"
    },
    {
      icon: "👥",
      title: "1-on-1 Scholar Mentorship",
      desc: "Connect directly with past scholarship winners from IITs, IIMs, and AIIMS for interview coaching.",
      badge: "Live Sessions",
      action: "Book Free Slot",
      modalType: "mentorship"
    },
    {
      icon: "🛡️",
      title: "Scholarship Fraud Prevention Cell",
      desc: "Verify if a scholarship scheme is genuine or a fee-scam. Direct reporting to consumer welfare authority.",
      badge: "Govt Recognized",
      action: "Verify Scheme",
      modalType: "fraud"
    },
    {
      icon: "🎓",
      title: "Career & Placement Guidance",
      desc: "Exclusive internship and job placement assistance for corporate-sponsored scholarship holders.",
      badge: "Placement Drive",
      action: "View Opportunities",
      modalType: "career"
    }
  ];

  const handleServiceClick = (s) => {
    if (s.title.includes("Stream")) {
      setActiveService("stream-selector");
    } else if (s.target === "recommendations") {
      if (setPage) setPage("recommendations");
    } else if (s.target === "eligibility") {
      if (setPage) setPage("eligibility");
    } else if (s.target === "documents") {
      if (setPage) setPage("documents");
    } else if (s.target === "ai-chat") {
      if (setPage) setPage("ai-chat");
    } else if (s.modalType === "mentorship") {
      setMentorshipModal(true);
    } else if (s.modalType === "fraud") {
      setFraudModal(true);
      setFraudResult(null);
      setFraudQuery("");
    } else if (s.modalType === "career") {
      setCareerModal(true);
    }
  };

  const handleVerifyFraud = (e) => {
    e.preventDefault();
    if (!fraudQuery.trim()) return;
    const q = fraudQuery.toLowerCase();
    if (q.includes("free fee") || q.includes("whatsapp prize") || q.includes("pay 500") || q.includes("registration fee")) {
      setFraudResult({
        status: "danger",
        title: "⚠️ High Scam Probability Detected",
        reason: "Legitimate scholarships NEVER charge upfront registration fees or communicate solely via personal WhatsApp numbers."
      });
    } else {
      setFraudResult({
        status: "safe",
        title: "✅ Scheme Matches Verified Pattern",
        reason: "No active red flags found. Ensure you only apply through the official .gov.in or registered corporate foundation domain."
      });
    }
  };

  // If user selected Stream Selector, render StreamSelector component
  if (activeService === "stream-selector") {
    return (
      <StreamSelector
        user={user}
        save={save}
        setPage={setPage}
        onSelectScholarship={onSelectScholarship}
        onBack={() => setActiveService(null)}
      />
    );
  }

  return (
    <div className="servicesPage">
      {toastMsg && <div className="servicesToast">{toastMsg}</div>}

      <section className="servicesHero">
        <div className="resultsHeroBadge">
          <span>✨</span> Comprehensive Student Enablement
        </div>
        <h1>Everything You Need Beyond <em>Scholarships</em></h1>
        <p>Explore tools, document vaults, career guidance, and expert mentorship circles designed to propel your academic career.</p>
      </section>

      <div className="servicesGrid">
        {services.map((s) => (
          <div
            key={s.title}
            className={`serviceCard ${s.isPrimary ? "streamSelectorHighlightCard" : ""}`}
          >
            <div className="serviceCardHeader">
              <div className="serviceIconWrap">{s.icon}</div>
              <span className={`serviceBadge ${s.badge === "Popular AI Tool" ? "badgePopularAI" : ""}`}>
                {s.badge}
              </span>
            </div>

            <div className="serviceCardContent">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>

            <div className="serviceCardFooter">
              <button
                className={`serviceBtn ${s.isPrimary ? "serviceBtnPrimary" : ""}`}
                onClick={() => handleServiceClick(s)}
              >
                <span>{s.action}</span>
                <span className="serviceBtnArrow">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: 1-ON-1 MENTORSHIP ================= */}
      {mentorshipModal && (
        <div className="servicesModalBackdrop" onClick={() => setMentorshipModal(false)}>
          <div className="servicesModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalIconWrap">👥</div>
              <div>
                <h3>Book 1-on-1 Scholar Mentorship</h3>
                <p>Connect with past winners from IIT Bombay, IIM Ahmedabad & AIIMS</p>
              </div>
              <button className="modalCloseBtn" onClick={() => setMentorshipModal(false)}>×</button>
            </div>
            <div className="modalBody">
              <div className="mentorList">
                {[
                  { name: "Ananya Deshmukh", award: "Reliance Foundation Scholar '24", inst: "IIT Bombay CSE", slot: "Tomorrow, 5:00 PM" },
                  { name: "Rahul Sharma", award: "TATA Trust Medical Fellow", inst: "AIIMS New Delhi", slot: "Thursday, 6:30 PM" },
                  { name: "Kavya Menon", award: "Google Generation APAC Winner", inst: "BITS Pilani", slot: "Saturday, 11:00 AM" }
                ].map((m) => (
                  <div key={m.name} className="mentorItem">
                    <div className="mentorAvatar">{m.name.charAt(0)}</div>
                    <div className="mentorDetails">
                      <strong>{m.name}</strong>
                      <small className="mentorAward">{m.award} • {m.inst}</small>
                      <span className="mentorSlot">🕒 Available: {m.slot}</span>
                    </div>
                    <button
                      className="btnBookSlot"
                      onClick={() => {
                        showToast(`🎉 Mentorship slot booked with ${m.name}! Confirmation link sent.`);
                        setMentorshipModal(false);
                      }}
                    >
                      Book Free Slot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FRAUD PREVENTION ================= */}
      {fraudModal && (
        <div className="servicesModalBackdrop" onClick={() => setFraudModal(false)}>
          <div className="servicesModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalIconWrap">🛡️</div>
              <div>
                <h3>Scholarship Fraud Prevention Cell</h3>
                <p>Verify validity of any scholarship website, message or SMS notification</p>
              </div>
              <button className="modalCloseBtn" onClick={() => setFraudModal(false)}>×</button>
            </div>
            <div className="modalBody">
              <form onSubmit={handleVerifyFraud} className="fraudForm">
                <label>Enter Scheme Name or URL / Message snippet</label>
                <input
                  type="text"
                  placeholder="e.g. 'National Merit Grant 2026 - Pay ₹499 fee to claim'"
                  value={fraudQuery}
                  onChange={(e) => setFraudQuery(e.target.value)}
                  required
                />
                <button type="submit" className="btnVerifyFraud">
                  Run Fraud Detection Scan 🔍
                </button>
              </form>

              {fraudResult && (
                <div className={`fraudResultBlock ${fraudResult.status}`}>
                  <h4>{fraudResult.title}</h4>
                  <p>{fraudResult.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CAREER GUIDANCE ================= */}
      {careerModal && (
        <div className="servicesModalBackdrop" onClick={() => setCareerModal(false)}>
          <div className="servicesModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalIconWrap">🎓</div>
              <div>
                <h3>Corporate Partner Placement Drives</h3>
                <p>Exclusive internships for corporate-sponsored scholarship recipients</p>
              </div>
              <button className="modalCloseBtn" onClick={() => setCareerModal(false)}>×</button>
            </div>
            <div className="modalBody">
              <div className="placementList">
                {[
                  { role: "Software Engineering Intern", comp: "Reliance Digital / Jio", stipend: "₹45,000 / month", loc: "Bangalore / Hybrid" },
                  { role: "Data Science & AI Analyst", comp: "Tata Consultancy Services R&D", stipend: "₹40,000 / month", loc: "Pune / Remote" },
                  { role: "Financial Operations Fellow", comp: "HDFC Capital", stipend: "₹35,000 / month", loc: "Mumbai" }
                ].map((p) => (
                  <div key={p.role} className="placementItem">
                    <div>
                      <strong>{p.role}</strong>
                      <p className="placementComp">{p.comp} • {p.loc}</p>
                      <span className="placementStipend">Stipend: {p.stipend}</span>
                    </div>
                    <button
                      className="btnApplyDrive"
                      onClick={() => {
                        showToast(`✅ Profile submitted for ${p.role} at ${p.comp}!`);
                        setCareerModal(false);
                      }}
                    >
                      Apply Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PartnerView() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="partnerPage">
      <section className="partnerHero">
        <div className="resultsHeroBadge">
          <span>🤝</span> Corporate CSR & Philanthropy
        </div>
        <h1>Partner With Us to <em>Empower India’s Future</em></h1>
        <p>Join Reliance Foundation, Tata Trusts, L’Oréal, and 50+ corporate partners in distributing targeted scholarships to verified underprivileged students.</p>
      </section>

      <div className="partnerContentGrid">
        <div className="partnerInfo">
          <h3>Why Partner With ScholarshipConnect AI?</h3>
          <ul className="partnerList">
            <li><strong>End-to-End CSR Execution:</strong> Automated application portal, multi-tier document verification, and Aadhaar-linked disbursements.</li>
            <li><strong>AI-Powered Matching:</strong> Reach exactly the demographic your foundation targets (Women in STEM, Rural Youth, SC/ST, Differently Abled).</li>
            <li><strong>Zero Fraud Guarantee:</strong> Real-time cross-verification with university portals and government databases.</li>
            <li><strong>Detailed Impact Dashboards:</strong> Track academic progress, retention rates, and career placements of sponsored scholars.</li>
          </ul>

          <div className="partnerMetrics">
            <div>
              <strong>₹45+ Crores</strong>
              <small>Disbursed via Platform</small>
            </div>
            <div>
              <strong>120,000+</strong>
              <small>Active Student Scholars</small>
            </div>
            <div>
              <strong>99.4%</strong>
              <small>Course Completion Rate</small>
            </div>
          </div>
        </div>

        <div className="partnerFormCard">
          <h3>Corporate / CSR Enquiry</h3>
          <p>Request platform demo & customised sponsorship proposal.</p>
          {submitted ? (
            <div className="partnerSuccess">
              <h4>🎉 Thank you for reaching out!</h4>
              <p>Our CSR Partnerships Director will contact your team within 24 hours with custom sponsorship frameworks.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <label>
                Organization / Foundation Name
                <input type="text" required placeholder="e.g. Acme Foundation CSR" />
              </label>
              <label>
                Representative Name & Designation
                <input type="text" required placeholder="e.g. Priya Nair, CSR Head" />
              </label>
              <label>
                Work Email Address
                <input type="email" required placeholder="priya.nair@company.com" />
              </label>
              <label>
                Annual Sponsorship Budget (₹)
                <select>
                  <option>₹10 Lakhs - ₹50 Lakhs</option>
                  <option>₹50 Lakhs - ₹2 Crores</option>
                  <option>₹2 Crores +</option>
                </select>
              </label>
              <button type="submit" className="submitPartnerBtn">
                Submit Partnership Enquiry ➔
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResourcesView({ setPage }) {
  const guides = [
    {
      title: "Step-by-Step Income Certificate Application Guide",
      cat: "Document Preparation",
      readTime: "5 min read",
      summary: "How to obtain a valid income certificate from Tehsildar/Revenue Department without delays."
    },
    {
      title: "How to Write a Winning Statement of Purpose (SOP)",
      cat: "Essay Writing",
      readTime: "7 min read",
      summary: "Frameworks, structure, and real examples that secured Reliance & Tata scholarships."
    },
    {
      title: "National Scholarship Portal (NSP 2.0) Complete Walkthrough",
      cat: "Government Schemes",
      readTime: "8 min read",
      summary: "Biometric authentication, OTR generation, and institute verification guidelines."
    },
    {
      title: "Common Reasons Why Scholarship Applications Get Rejected",
      cat: "Tips & Traps",
      readTime: "4 min read",
      summary: "Name mismatches across Aadhaar & marksheets, wrong bank account types, and how to avoid them."
    }
  ];

  return (
    <div className="resourcesPage">
      <section className="resourcesHero">
        <div className="resultsHeroBadge">
          <span>📚</span> Student Knowledge Base
        </div>
        <h1>Scholarship Guides & <em>Application Resources</em></h1>
        <p>Expert guides, application toolkits, and verified instructions to help you submit flawless applications.</p>
      </section>

      <div className="guidesGrid">
        {guides.map(g => (
          <div key={g.title} className="guideCard">
            <span className="guideCat">{g.cat}</span>
            <h4>{g.title}</h4>
            <p>{g.summary}</p>
            <div className="guideFooter">
              <small>⏱️ {g.readTime}</small>
              <button onClick={() => alert(`Opening Guide: ${g.title}`)}>Read Guide →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticlesView() {
  const articles = [
    {
      date: "04 Oct 2026",
      tag: "Govt Update",
      title: "UGC Announces 20,000 New Technical Fellowships for Postgraduates",
      snippet: "Monthly research grant increased to ₹35,000 for AI, biotechnology, and green energy scholars."
    },
    {
      date: "28 Sep 2026",
      tag: "Corporate CSR",
      title: "Tata Trusts Expands Medical Grants for First-Generation College Students",
      snippet: "Comprehensive fee sponsorship launched covering MBBS books, tuition, and equipment."
    },
    {
      date: "20 Sep 2026",
      tag: "Opportunity Alert",
      title: "Google Generation Scholarship (APAC) Applications Open for Women in Tech",
      snippet: "Offering $2,500 USD tuition grant and exclusive mentorship from Google software engineers."
    }
  ];

  return (
    <div className="articlesPage">
      <section className="articlesHero">
        <div className="resultsHeroBadge">
          <span>📰</span> Educational News & Insights
        </div>
        <h1>Latest Articles & <em>Higher Education News</em></h1>
      </section>

      <div className="articlesList">
        {articles.map(a => (
          <article key={a.title} className="articleItem">
            <div className="articleMeta">
              <span className="articleTag">{a.tag}</span>
              <small>{a.date}</small>
            </div>
            <h3>{a.title}</h3>
            <p>{a.snippet}</p>
            <button onClick={() => alert(`Reading article: ${a.title}`)}>Read Full Article →</button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ImpactView() {
  const stories = [
    {
      name: "Sneha Kulkarni",
      college: "IIT Bombay, Computer Science",
      scholarship: "L’Oréal Young Women in Science Scholar",
      quote: "Coming from a small town in Sangli, coaching and tuition fees seemed impossible. The scholarship enabled me to focus purely on coding without taking predatory loans."
    },
    {
      name: "Rohan Verma",
      college: "AIIMS New Delhi, MBBS",
      scholarship: "Tata Trusts Medical Scholar",
      quote: "The monthly stipend covered all my medical books and clinical equipment. Today, I am the first doctor in my family."
    },
    {
      name: "Harish Gowda",
      college: "RV College of Engineering, Mechanical",
      scholarship: "Reliance Foundation UG Scholar",
      quote: "ScholarshipConnect AI matched me with the exact scholarship I was eligible for within 2 minutes. The application process was seamless."
    }
  ];

  return (
    <div className="impactPage">
      <section className="impactHero">
        <div className="resultsHeroBadge">
          <span>🌟</span> Real Student Success
        </div>
        <h1>Empowering Dreams, <em>One Scholar at a Time</em></h1>
        <p>Hear from real students across India whose educational trajectories were transformed through timely financial aid.</p>
      </section>

      <div className="storiesGrid">
        {stories.map(s => (
          <div key={s.name} className="storyCard">
            <div className="storyQuote">“{s.quote}”</div>
            <div className="storyStudent">
              <strong>{s.name}</strong>
              <p>{s.college}</p>
              <span className="scholarTag">🏆 {s.scholarship}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
