import React, { useState } from "react";
import { api } from "./api.js";

export default function EducationLoan({ onAuth, user }) {
  const [loanAmount, setLoanAmount] = useState(1500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(10);
  const [applyModalBank, setApplyModalBank] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "",
    mobile: user?.phone || "",
    email: user?.email || "",
    course: "B.Tech / MBBS / MBA",
    institute: "Premier Institute in India",
    coApplicantIncome: "₹6,00,000 / year"
  });

  // Calculate Monthly EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  const loanSchemes = [
    {
      id: "sbi-scholar",
      bank: "State Bank of India (SBI)",
      scheme: "SBI Scholar & Student Loan Scheme",
      maxAmount: "Up to ₹50,00,000",
      interest: "8.15% - 8.65% p.a.",
      processingFee: "Zero processing fee for top institutes",
      collateral: "No collateral required up to ₹7.5 Lakhs",
      moratorium: "Course duration + 12 months",
      tag: "Most Popular",
      color: "#0f4fa8"
    },
    {
      id: "hdfc-credila",
      bank: "HDFC Bank (Credila)",
      scheme: "Customized Higher Education Loan",
      maxAmount: "Up to ₹1,50,00,000",
      interest: "9.25% - 11.50% p.a.",
      processingFee: "1% of loan amount",
      collateral: "Unsecured loans up to ₹25 Lakhs available",
      moratorium: "Course duration + 6 months",
      tag: "Fast Approval",
      color: "#004c8f"
    },
    {
      id: "canara-vidya",
      bank: "Canara Bank",
      scheme: "Canara Vidya Turant & Vidya Sagar",
      maxAmount: "Up to ₹40,00,000",
      interest: "7.95% - 8.40% p.a.",
      processingFee: "Nil for Indian institutions",
      collateral: "No collateral for listed premier colleges",
      moratorium: "Course duration + 1 year",
      tag: "Lowest Interest",
      color: "#00838f"
    },
    {
      id: "bob-scholar",
      bank: "Bank of Baroda",
      scheme: "Baroda Scholar & Vidya Loan",
      maxAmount: "Up to ₹80,00,000",
      interest: "8.20% - 9.10% p.a.",
      processingFee: "100% concession for girl students",
      collateral: "Tangible security required above ₹7.5 Lakhs",
      moratorium: "Course duration + 12 months",
      tag: "Special Girl Discount",
      color: "#f57c00"
    }
  ];

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplySuccess(true);
    api.post("/loans", {
      studentId: user?.studentId || "",
      studentEmail: applicantForm.email || user?.email || "",
      applicantName: applicantForm.name,
      mobile: applicantForm.mobile,
      bank: applyModalBank?.bank,
      scheme: applyModalBank?.scheme,
      course: applicantForm.course,
      institute: applicantForm.institute,
      loanAmount: loanAmount,
      tenureYears: tenureYears,
      interestRate: interestRate,
      estimatedEmi: emi,
      coApplicantIncome: applicantForm.coApplicantIncome,
    }).catch(console.warn);

    setTimeout(() => {
      setApplySuccess(false);
      setApplyModalBank(null);
      alert(`🎉 Application for ${applyModalBank.bank} submitted successfully! A dedicated education loan counsellor will contact you within 24 hours.`);
    }, 1200);
  };

  return (
    <div className="loanPage">
      {/* HERO BANNER */}
      <section className="loanHero">
        <div className="loanHeroBadge">
          <span>₹</span> Zero Commission Education Financing
        </div>
        <h1>Education Loans with <em>Lowest Interest Rates</em></h1>
        <p>
          Compare pre-approved loan schemes from top public and private banks. Get 100% tuition coverage,
          living allowance, zero collateral options, and tax savings under Section 80E.
        </p>
      </section>

      {/* CALCULATOR SECTION */}
      <section className="loanCalculatorSection">
        <div className="loanCalcCard">
          <div className="calcLeft">
            <h3>🧮 Interactive EMI & Eligibility Calculator</h3>
            <p>Customize your requirements to see exact monthly repayment figures.</p>

            <div className="calcInputGroup">
              <div className="calcInputHeader">
                <label>Loan Amount Required</label>
                <span className="calcVal">₹{loanAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
              <div className="rangeLabels">
                <span>₹1 Lakh</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>

            <div className="calcInputGroup">
              <div className="calcInputHeader">
                <label>Interest Rate (% p.a.)</label>
                <span className="calcVal">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="7.5"
                max="14.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
              <div className="rangeLabels">
                <span>7.5%</span>
                <span>10.5%</span>
                <span>14.0%</span>
              </div>
            </div>

            <div className="calcInputGroup">
              <div className="calcInputHeader">
                <label>Repayment Tenure</label>
                <span className="calcVal">{tenureYears} Years ({totalMonths} Months)</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
              />
              <div className="rangeLabels">
                <span>1 Year</span>
                <span>7 Years</span>
                <span>15 Years</span>
              </div>
            </div>
          </div>

          <div className="calcRight">
            <div className="emiSummaryBox">
              <small>ESTIMATED MONTHLY EMI</small>
              <h2>₹{emi.toLocaleString("en-IN")} <span>/ month</span></h2>
              <hr />
              <div className="emiDetailsGrid">
                <div>
                  <small>Principal Amount</small>
                  <strong>₹{loanAmount.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <small>Total Interest</small>
                  <strong style={{ color: "#d97706" }}>₹{totalInterest.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <small>Total Amount Payable</small>
                  <strong>₹{totalPayment.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <small>Moratorium Grace Period</small>
                  <strong style={{ color: "#10b981" }}>No EMI during college</strong>
                </div>
              </div>
              <button
                className="calcApplyBtn"
                onClick={() => setApplyModalBank(loanSchemes[0])}
              >
                Apply for Loan with this EMI →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BANK COMPARISON GRID */}
      <section className="loanBanksSection">
        <div className="sectionTitle">
          <p>TOP LENDING PARTNERS</p>
          <h2>Compare Pre-Approved Bank Schemes</h2>
          <span>Direct partnership with PSU and private lenders with guaranteed speed sanctions.</span>
        </div>

        <div className="loanSchemesGrid">
          {loanSchemes.map((s) => (
            <div key={s.id} className="loanSchemeCard">
              <div className="schemeTop">
                <span className="schemeTag">{s.tag}</span>
                <span className="schemeRate">{s.interest}</span>
              </div>
              <h4>{s.bank}</h4>
              <p className="schemeName">{s.scheme}</p>
              
              <div className="schemeFeatures">
                <div>
                  <small>Maximum Sanction</small>
                  <strong>{s.maxAmount}</strong>
                </div>
                <div>
                  <small>Collateral Requirement</small>
                  <span>{s.collateral}</span>
                </div>
                <div>
                  <small>Moratorium Relief</small>
                  <span>{s.moratorium}</span>
                </div>
                <div>
                  <small>Processing Fee</small>
                  <span>{s.processingFee}</span>
                </div>
              </div>

              <div className="schemeFooter">
                <button
                  className="applyLoanBtn"
                  onClick={() => setApplyModalBank(s)}
                >
                  Apply Online Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS HIGHLIGHT */}
      <section className="loanBenefitsSection">
        <div className="sectionTitle">
          <p>WHY APPLY THROUGH US</p>
          <h2>Exclusive Student Borrower Benefits</h2>
        </div>
        <div className="loanBenefitsGrid">
          <div className="loanBenefitCard">
            <span className="benefitIcon">🛡️</span>
            <h4>No Collateral Guarantee</h4>
            <p>Loans up to ₹7.5 Lakhs require zero physical mortgage or third-party guarantee under the Credit Guarantee Fund.</p>
          </div>
          <div className="loanBenefitCard">
            <span className="benefitIcon">📉</span>
            <h4>0.50% Girl Student Subsidy</h4>
            <p>Special concession of 50 basis points on interest rate for female applicants pursuing STEM and management.</p>
          </div>
          <div className="loanBenefitCard">
            <span className="benefitIcon">📜</span>
            <h4>Section 80E Tax Deduction</h4>
            <p>Full 100% tax deduction on interest paid for 8 continuous financial years under Section 80E of the Income Tax Act.</p>
          </div>
          <div className="loanBenefitCard">
            <span className="benefitIcon">⚡</span>
            <h4>72-Hour Digital Sanction</h4>
            <p>Fast-track processing with digital upload of institute admission proof and KYC documents.</p>
          </div>
        </div>
      </section>

      {/* APPLICATION MODAL */}
      {applyModalBank && (
        <div className="aiModalOverlay" onClick={() => setApplyModalBank(null)}>
          <div className="loanApplyModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <h3>Apply for {applyModalBank.bank}</h3>
                <p>{applyModalBank.scheme} • {applyModalBank.interest}</p>
              </div>
              <button className="aiCloseBtn" onClick={() => setApplyModalBank(null)}>✕</button>
            </div>

            <form onSubmit={handleApplySubmit} className="loanForm">
              <div className="formRow">
                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    value={applicantForm.name}
                    onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                  />
                </label>
                <label>
                  Mobile Number
                  <input
                    type="tel"
                    required
                    value={applicantForm.mobile}
                    onChange={(e) => setApplicantForm({ ...applicantForm, mobile: e.target.value })}
                  />
                </label>
              </div>

              <div className="formRow">
                <label>
                  Email Address
                  <input
                    type="email"
                    required
                    value={applicantForm.email}
                    onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                  />
                </label>
                <label>
                  Course / Degree
                  <input
                    type="text"
                    required
                    value={applicantForm.course}
                    onChange={(e) => setApplicantForm({ ...applicantForm, course: e.target.value })}
                  />
                </label>
              </div>

              <div className="formRow">
                <label>
                  Target Institute / College
                  <input
                    type="text"
                    required
                    value={applicantForm.institute}
                    onChange={(e) => setApplicantForm({ ...applicantForm, institute: e.target.value })}
                  />
                </label>
                <label>
                  Requested Loan Amount (₹)
                  <input
                    type="text"
                    defaultValue={`₹${loanAmount.toLocaleString("en-IN")}`}
                  />
                </label>
              </div>

              <button type="submit" className="submitLoanAppBtn" disabled={applySuccess}>
                {applySuccess ? "Submitting Application..." : "Submit Loan Application ➔"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
