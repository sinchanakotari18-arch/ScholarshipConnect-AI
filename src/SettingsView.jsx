import React, { useState } from "react";

export default function SettingsView({ user, save, setPage, onLogout }) {
  const [activeTab, setActiveTab] = useState("account");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Account State
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "2005-08-14",
    stream: user?.course || user?.stream || "B.Tech Computer Science & AI",
    category: user?.category || "General",
    state: user?.state || "Karnataka",
    annualIncome: user?.annualIncome || "₹ 1,80,000",
    studentId: user?.studentId || ""
  });

  React.useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "2005-08-14",
        stream: user.course || user.stream || "B.Tech Computer Science & AI",
        category: user.category || "General",
        state: user.state || "Karnataka",
        annualIncome: user.annualIncome || "₹ 1,80,000",
        studentId: user.studentId || ""
      });
    }
  }, [user]);

  // Notification Preferences State
  const [notifState, setNotifState] = useState(() => {
    try {
      const stored = localStorage.getItem(`sc_notif_prefs_${user?.studentId || "default"}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      whatsappAlerts: true,
      whatsappNumber: user?.phone || "+91 98765 43210",
      emailFrequency: "daily",
      documentExpiryAlert: true,
      statusPush: true,
      smsAlerts: false
    };
  });

  // AI & Security State
  const [aiSettings, setAiSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("sc_ai_settings");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      matchingSensitivity: "balanced",
      autofillFromWallet: true,
      advisorTone: "mentor",
      customGeminiKey: localStorage.getItem("sc_gemini_api_key") || ""
    };
  });

  const [securityState, setSecurityState] = useState({
    twoFactor: true,
    autoLockMins: "15",
    biometricLogin: false
  });

  // Support Ticket Form
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "Scholarship Application",
    message: ""
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(null);

  // Save Account Profile
  const handleSaveAccount = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      ...accountForm,
      course: accountForm.stream,
      stream: accountForm.stream
    };
    if (save) save(updatedUser);
    showToast("✅ Profile settings updated successfully!");
  };

  // Save Notification Preferences
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    localStorage.setItem(
      `sc_notif_prefs_${user?.studentId || "default"}`,
      JSON.stringify(notifState)
    );
    showToast("🔔 Notification preferences saved!");
  };

  // Save AI Settings
  const handleSaveAISettings = (e) => {
    e.preventDefault();
    localStorage.setItem("sc_ai_settings", JSON.stringify(aiSettings));
    if (aiSettings.customGeminiKey) {
      localStorage.setItem("sc_gemini_api_key", aiSettings.customGeminiKey.trim());
    } else {
      localStorage.removeItem("sc_gemini_api_key");
    }
    showToast("✨ AI Engine preferences saved!");
  };

  // Submit Support Ticket
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;
    const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketSubmitted({
      id: ticketId,
      time: "Just now",
      subject: ticketForm.subject
    });
    setTicketForm({ subject: "", category: "Scholarship Application", message: "" });
    showToast(`🎉 Support ticket ${ticketId} created! Our team will contact you.`);
  };

  // Download Profile Data
  const handleExportData = () => {
    const exportData = {
      profile: accountForm,
      notifications: notifState,
      aiPreferences: aiSettings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ScholarshipConnect_Profile_${accountForm.studentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("📥 Student profile backup downloaded!");
  };

  const initials = `${(accountForm.firstName || "S")[0]}${(accountForm.lastName || "K")[0]}`.toUpperCase();

  return (
    <div className="settingsPage">
      {/* Toast Notification */}
      {toastMsg && <div className="settingsToast">{toastMsg}</div>}

      {/* Top Banner */}
      <div className="settingsHeaderBanner">
        <div className="settingsUserBlock">
          <div className="settingsAvatar">{initials}</div>
          <div className="settingsUserInfo">
            <h2>{accountForm.firstName} {accountForm.lastName}</h2>
            <p className="studentIdTag">
              Student ID: <strong>{accountForm.studentId}</strong> • Verified Student Scholar
            </p>
          </div>
        </div>

        <div className="settingsHeaderActions">
          {setPage && (user?.role === "admin" || user?.isAdmin) && (
            <button
              className="btnReturnProfile"
              style={{ background: "#4f46e5", color: "#ffffff", border: "none", fontWeight: "700", marginRight: "8px" }}
              onClick={() => setPage("admin")}
            >
              🛡️ Open Admin Console
            </button>
          )}
          {setPage && (
            <button className="btnReturnProfile" onClick={() => setPage("profile")}>
              ← Back to My Profile
            </button>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="settingsTabsBar">
        {[
          { id: "account", icon: "👤", label: "Profile & Account" },
          { id: "notifications", icon: "🔔", label: "Alerts & WhatsApp" },
          { id: "ai", icon: "✨", label: "AI Engine & Matching" },
          { id: "security", icon: "🔒", label: "Security & Vault" },
          { id: "support", icon: "💬", label: "Help Desk & FAQ" }
        ].map((t) => (
          <button
            key={t.id}
            className={`settingsTabBtn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tabIcon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: PROFILE & ACCOUNT ================= */}
      {activeTab === "account" && (
        <div className="settingsContentCard">
          <div className="cardHead">
            <div className="cardHeadIcon">👤</div>
            <div>
              <h3>Student Profile & Academic Credentials</h3>
              <p>Keep your contact information and target academic degree up to date for precise scholarship matching.</p>
            </div>
          </div>

          <form onSubmit={handleSaveAccount} className="settingsForm">
            <div className="formGrid">
              <div className="formField">
                <label>First Name</label>
                <input
                  type="text"
                  value={accountForm.firstName}
                  onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Last Name</label>
                <input
                  type="text"
                  value={accountForm.lastName}
                  onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Mobile Number (For DBT & SMS)</label>
                <input
                  type="tel"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="formField">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={
                    accountForm.dateOfBirth
                      ? (/^\d{4}-\d{2}-\d{2}$/.test(accountForm.dateOfBirth)
                          ? accountForm.dateOfBirth
                          : (() => {
                              const d = new Date(accountForm.dateOfBirth);
                              return !isNaN(d.getTime())
                                ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                                : "";
                            })())
                      : ""
                  }
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAccountForm({ ...accountForm, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="formField">
                <label>Social Category / Quota</label>
                <select
                  value={accountForm.category}
                  onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
                >
                  <option value="General">General / Open Category</option>
                  <option value="OBC">OBC (Non-Creamy Layer)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>

              <div className="formField">
                <label>State of Domicile</label>
                <select
                  value={accountForm.state}
                  onChange={(e) => setAccountForm({ ...accountForm, state: e.target.value })}
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi (NCR)</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Telangana">Telangana</option>
                  <option value="All India">All India / Other</option>
                </select>
              </div>

              <div className="formField">
                <label>Annual Family Income Band</label>
                <select
                  value={accountForm.annualIncome}
                  onChange={(e) => setAccountForm({ ...accountForm, annualIncome: e.target.value })}
                >
                  <option value="Below ₹ 1,50,000">Below ₹ 1,50,000 / year (Priority Quota)</option>
                  <option value="₹ 1,80,000">₹ 1,50,000 - ₹ 2,50,000 / year</option>
                  <option value="₹ 4,00,000">₹ 2,50,000 - ₹ 5,00,000 / year</option>
                  <option value="₹ 7,50,000">Above ₹ 5,00,000 / year</option>
                </select>
              </div>

              <div className="formField fullWidth">
                <div className="streamGoalLabelRow">
                  <label>Current Degree Stream / Academic Goal</label>
                  {setPage && (
                    <button
                      type="button"
                      className="linkStreamSelector"
                      onClick={() => setPage("stream-selector")}
                    >
                      🎯 Retake AI Stream Selector →
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={accountForm.stream}
                  onChange={(e) => setAccountForm({ ...accountForm, stream: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science & AI"
                />
                <small className="inputHelp">
                  Matches your scholarship alerts to this specific stream.
                </small>
              </div>
            </div>

            <div className="formActions">
              <button type="submit" className="btnSavePrimary">
                💾 Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 2: ALERTS & NOTIFICATIONS ================= */}
      {activeTab === "notifications" && (
        <div className="settingsContentCard">
          <div className="cardHead">
            <div className="cardHeadIcon">🔔</div>
            <div>
              <h3>Deadline Alerts & Communication Preferences</h3>
              <p>Never miss a scholarship deadline. Receive real-time WhatsApp, email, and SMS notifications.</p>
            </div>
          </div>

          <form onSubmit={handleSaveNotifications} className="settingsForm">
            <div className="toggleList">
              <div className="toggleItem">
                <div className="toggleInfo">
                  <div className="toggleTitle">
                    <span>📱</span>
                    <strong>WhatsApp Deadline Reminders</strong>
                    <span className="pillPopular">Most Popular</span>
                  </div>
                  <p>Get automated WhatsApp alerts 7 days, 3 days, and 24 hours before your matched scholarship application closes.</p>
                  {notifState.whatsappAlerts && (
                    <div className="subInputBox">
                      <label>WhatsApp Number:</label>
                      <input
                        type="text"
                        value={notifState.whatsappNumber}
                        onChange={(e) => setNotifState({ ...notifState, whatsappNumber: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifState.whatsappAlerts}
                    onChange={(e) => setNotifState({ ...notifState, whatsappAlerts: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggleItem">
                <div className="toggleInfo">
                  <div className="toggleTitle">
                    <span>📁</span>
                    <strong>Document Expiration Warnings</strong>
                  </div>
                  <p>Receive alert reminders 30 days before your Income, Caste, or Bonafide certificates expire in the Document Wallet.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifState.documentExpiryAlert}
                    onChange={(e) => setNotifState({ ...notifState, documentExpiryAlert: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggleItem">
                <div className="toggleInfo">
                  <div className="toggleTitle">
                    <span>⚡</span>
                    <strong>Live Application Status Updates</strong>
                  </div>
                  <p>Instant alerts whenever a submitted application changes status (Under Review, Shortlisted, Approved, Disbursed).</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifState.statusPush}
                    onChange={(e) => setNotifState({ ...notifState, statusPush: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggleItem">
                <div className="toggleInfo">
                  <div className="toggleTitle">
                    <span>✉️</span>
                    <strong>Email Digest Frequency</strong>
                  </div>
                  <p>Choose how often our AI compiles new matching scholarships and corporate CSR announcements for you.</p>
                  <div className="radioGroup">
                    {[
                      { id: "daily", label: "Daily Morning Digest" },
                      { id: "weekly", label: "Weekly Summary (Recommended)" },
                      { id: "urgent", label: "Only Urgent Deadlines (<48h)" }
                    ].map((f) => (
                      <label key={f.id} className="radioLabel">
                        <input
                          type="radio"
                          name="emailFreq"
                          checked={notifState.emailFrequency === f.id}
                          onChange={() => setNotifState({ ...notifState, emailFrequency: f.id })}
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="formActions">
              <button type="submit" className="btnSavePrimary">
                🔔 Save Notification Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 3: AI ENGINE & PREFERENCES ================= */}
      {activeTab === "ai" && (
        <div className="settingsContentCard">
          <div className="cardHead">
            <div className="cardHeadIcon">✨</div>
            <div>
              <h3>AI Engine & Semantic Search Customization</h3>
              <p>Configure how our NLP semantic match algorithm evaluates scholarships and assists in SOP generation.</p>
            </div>
          </div>

          <form onSubmit={handleSaveAISettings} className="settingsForm">
            <div className="formField">
              <label>AI Matching Sensitivity</label>
              <div className="optionCardsRow">
                {[
                  {
                    id: "strict",
                    title: "Strict Eligibility",
                    desc: "Only matches scholarships where every single criteria (State, Quota, Stream, Income) is 100% satisfied."
                  },
                  {
                    id: "balanced",
                    title: "Balanced (Recommended)",
                    desc: "Includes high-confidence matches plus scholarships with flexible merit waivers."
                  },
                  {
                    id: "broad",
                    title: "Broad Exploration",
                    desc: "Discovers interdisciplinary grants, international fellowships, and general corporate awards."
                  }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={`settingOptionBox ${aiSettings.matchingSensitivity === opt.id ? "selected" : ""}`}
                    onClick={() => setAiSettings({ ...aiSettings, matchingSensitivity: opt.id })}
                  >
                    <strong>{opt.title}</strong>
                    <p>{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="formField">
              <label>AI Advisor Tone</label>
              <select
                value={aiSettings.advisorTone}
                onChange={(e) => setAiSettings({ ...aiSettings, advisorTone: e.target.value })}
              >
                <option value="mentor">Empathetic & Supportive Mentor (Standard)</option>
                <option value="direct">Direct & Factual (Quick answers without preamble)</option>
                <option value="academic">Academic & Formal (Ideal for rigorous SOP drafts)</option>
              </select>
            </div>

            <div className="formField">
              <label>Custom Google Gemini API Key (Optional)</label>
              <input
                type="password"
                placeholder="AIzaSy... (Leave blank to use built-in engine)"
                value={aiSettings.customGeminiKey}
                onChange={(e) => setAiSettings({ ...aiSettings, customGeminiKey: e.target.value })}
              />
              <small className="inputHelp">
                If provided, all AI Chat and SOP questions will run through your personal Gemini 1.5 Flash quota for unmetered high-speed generations.
              </small>
            </div>

            <div className="toggleItem inline">
              <div className="toggleInfo">
                <strong>Auto-Fill Application Data from Verified Document Locker</strong>
                <p>Allow ScholarshipConnect AI to automatically populate Aadhaar, income, and marks from verified certificates when opening new scheme forms.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={aiSettings.autofillFromWallet}
                  onChange={(e) => setAiSettings({ ...aiSettings, autofillFromWallet: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="formActions">
              <button type="submit" className="btnSavePrimary">
                ✨ Save AI Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 4: SECURITY & VAULT ================= */}
      {activeTab === "security" && (
        <div className="settingsContentCard">
          <div className="cardHead">
            <div className="cardHeadIcon">🔒</div>
            <div>
              <h3>Security, Two-Factor Authentication & Document Locker Safety</h3>
              <p>Manage encryption settings, session timeouts, and verified identity protections.</p>
            </div>
          </div>

          <div className="securityList">
            <div className="securityRow">
              <div>
                <strong>Aadhaar & Document Locker Encryption</strong>
                <p>All caste certificates, marksheets, and bank passes are stored using client-side AES-256 encryption.</p>
              </div>
              <span className="badgeSecurityActive">Active 🔒</span>
            </div>

            <div className="securityRow">
              <div>
                <strong>Two-Factor Authentication (2FA) for Document Downloads</strong>
                <p>Requires SMS OTP verification before downloading sensitive certificates on new devices.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={securityState.twoFactor}
                  onChange={(e) => {
                    setSecurityState({ ...securityState, twoFactor: e.target.checked });
                    showToast("2FA setting updated!");
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="securityRow">
              <div>
                <strong>Auto-Lock Document Wallet on Inactivity</strong>
                <p>Automatically lock certificate previews after specified minutes of inactivity.</p>
              </div>
              <select
                value={securityState.autoLockMins}
                onChange={(e) => {
                  setSecurityState({ ...securityState, autoLockMins: e.target.value });
                  showToast(`Auto-lock set to ${e.target.value} minutes.`);
                }}
                className="selectMins"
              >
                <option value="5">5 Minutes</option>
                <option value="15">15 Minutes (Default)</option>
                <option value="30">30 Minutes</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          {/* Data Backup & Danger Zone */}
          <div className="dangerZone">
            <h4>Data Export & Account Management</h4>
            <div className="dangerButtons">
              <button type="button" className="btnExportData" onClick={handleExportData}>
                📥 Export Complete Student Profile (JSON)
              </button>
              <button
                type="button"
                className="btnLogoutAll"
                onClick={() => {
                  if (onLogout) onLogout();
                  else {
                    localStorage.removeItem("sc-user");
                    window.location.reload();
                  }
                }}
              >
                🚪 Log Out of Current Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: HELP & SUPPORT DESK ================= */}
      {activeTab === "support" && (
        <div className="settingsContentCard">
          <div className="cardHead">
            <div className="cardHeadIcon">💬</div>
            <div>
              <h3>Student Help Desk & Support Services</h3>
              <p>Get in touch with our scholarship verification counselors or find instant answers in the FAQ.</p>
            </div>
          </div>

          <div className="supportGrid">
            {/* Contact Cards */}
            <div className="supportCardsCol">
              <div className="helpCard">
                <span className="helpCardIcon">📞</span>
                <h4>Toll-Free Helpline</h4>
                <p>Speak directly with scholarship advisory team.</p>
                <strong>1800-111-2026</strong>
                <small>Mon - Sat (9:00 AM - 6:00 PM IST)</small>
              </div>

              <div className="helpCard">
                <span className="helpCardIcon">✉️</span>
                <h4>Official Email Desk</h4>
                <p>For document verification disputes or institution queries.</p>
                <strong>support@scholarshipconnect.ai</strong>
                <small>Average response time: &lt; 4 hours</small>
              </div>

              <div className="helpCard">
                <span className="helpCardIcon">💬</span>
                <h4>AI 24/7 Advisor</h4>
                <p>Ask anything about eligibility, SOP structure, or deadlines.</p>
                {setPage && (
                  <button className="btnLaunchChat" onClick={() => setPage("ai-chat")}>
                    Launch AI Chat Advisor →
                  </button>
                )}
              </div>
            </div>

            {/* Ticket Form */}
            <div className="supportFormCol">
              <h4>Submit a Support Request</h4>
              {ticketSubmitted ? (
                <div className="ticketSuccessBlock">
                  <div className="ticketCheck">✅</div>
                  <h5>Ticket #{ticketSubmitted.id} Received</h5>
                  <p>Our student help coordinator will review your request regarding "{ticketSubmitted.subject}" and reply to {accountForm.email}.</p>
                  <button
                    className="btnNewTicket"
                    onClick={() => setTicketSubmitted(null)}
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="ticketForm">
                  <div className="formField">
                    <label>Query Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option>Scholarship Application Issue</option>
                      <option>Document Verification & Locker</option>
                      <option>Bank Account / DBT Linking</option>
                      <option>Stream Selector & Assessment</option>
                      <option>General Support</option>
                    </select>
                  </div>

                  <div className="formField">
                    <label>Subject / Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Discrepancy in annual income certificate verification"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="formField">
                    <label>Detailed Message</label>
                    <textarea
                      rows="4"
                      placeholder="Please explain the issue or error encountered in detail..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btnSubmitTicket">
                    🚀 Submit Support Ticket
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className="faqSection">
            <h4>Frequently Asked Questions</h4>
            <div className="faqList">
              <details className="faqItem">
                <summary>How does the platform verify my uploaded documents?</summary>
                <p>Documents uploaded to your Document Wallet are validated against state DigiLocker APIs, Tehsildar revenue databases, and university enrollments to prevent rejection during official committee screening.</p>
              </details>
              <details className="faqItem">
                <summary>Can I apply for more than one scholarship at the same time?</summary>
                <p>Yes! Unless a specific scheme prohibits multiple grants (such as certain government full tuition schemes), you can combine corporate CSR merit scholarships with state student fee waivers.</p>
              </details>
              <details className="faqItem">
                <summary>What should I do if my Aadhaar name doesn't match my marksheet?</summary>
                <p>Submit an affidavit of name clarification and update your Aadhaar biometric records at your nearest CSC center before the final application deadline.</p>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
