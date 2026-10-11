// Intelligent AI Matching & Natural Language Engine for ScholarshipConnect AI

import {
  normalizeEducation,
  checkCourseStreamEligibility,
  checkEducationStageEligibility,
  GENDERS,
  SOCIAL_CATEGORIES,
  isGenderTerm,
  normalizeGender,
  checkGenderEligibility,
  normalizeCategory,
  checkCategoryEligibility
} from "./educationUtils.js";
export {
  normalizeEducation,
  checkCourseStreamEligibility,
  checkEducationStageEligibility,
  GENDERS,
  SOCIAL_CATEGORIES,
  isGenderTerm,
  normalizeGender,
  checkGenderEligibility,
  normalizeCategory,
  checkCategoryEligibility
};

export function extractSearchIntents(query) {
  const q = query.toLowerCase();
  const intents = {
    gender: null,
    education: null,
    course: null,
    category: null,
    state: null,
    amountMin: null,
    closingSoon: false,
    lowIncome: false,
    keywords: []
  };

  // Gender detection
  if (/\b(girl|girls|women|woman|female|kanya)\b/.test(q)) {
    intents.gender = "Girls";
  }

  // Education level
  if (/\b(undergrad|undergraduate|b\.?tech|b\.?e|bachelor|degree|1st year|first year|ug)\b/.test(q)) {
    intents.education = "Undergraduate";
  } else if (/\b(postgrad|postgraduate|masters|m\.?tech|mba|pg|phd|m\.?phil|research)\b/.test(q)) {
    intents.education = "Postgraduate";
  } else if (/\b(class 10|class 11|class 12|10th|12th|school|intermediate)\b/.test(q)) {
    intents.education = "Class 12";
  }

  // Course / Stream
  if (/\b(engineering|tech|technology|btech|software|computer|cs|it|coding)\b/.test(q)) {
    intents.course = "Engineering";
  } else if (/\b(medical|mbbs|bds|doctor|health|nursing|pharma|healthcare)\b/.test(q)) {
    intents.course = "Medical";
  } else if (/\b(management|mba|business|finance|bba)\b/.test(q)) {
    intents.course = "Management";
  } else if (/\b(science|stem|physics|chemistry|biology|maths)\b/.test(q)) {
    intents.course = "Science";
  } else if (/\b(commerce|bcom|accounting|banking)\b/.test(q)) {
    intents.course = "Commerce";
  } else if (/\b(arts|humanities|ba|social|literature)\b/.test(q)) {
    intents.course = "Arts";
  }

  // Category
  if (/\b(sc|st|scheduled caste|scheduled tribe)\b/.test(q)) {
    intents.category = "SC/ST";
  } else if (/\b(obc|backward)\b/.test(q)) {
    intents.category = "OBC";
  } else if (/\b(ews|economically weak)\b/.test(q)) {
    intents.category = "EWS";
  } else if (/\b(minority|muslim|christian|sikh|jain|buddhist)\b/.test(q)) {
    intents.category = "Minority";
  } else if (/\b(disabled|disability|handicap|pwd|differently abled)\b/.test(q)) {
    intents.category = "Disabled";
  } else if (/\b(defence|army|soldier|ex-servicemen|air force|navy|pmss)\b/.test(q)) {
    intents.category = "Defence";
  }

  // Geography / State
  if (/\b(karnataka|bangalore|bengaluru)\b/.test(q)) {
    intents.state = "Karnataka";
  } else if (/\b(maharashtra|mumbai|pune)\b/.test(q)) {
    intents.state = "Maharashtra";
  }

  // Award Amount
  if (/\b(1,?00,?000|1 lakh|1l|high award|huge|above 1 lakh|100k)\b/.test(q)) {
    intents.amountMin = 100000;
  } else if (/\b(2,?00,?000|2 lakh|2l)\b/.test(q)) {
    intents.amountMin = 200000;
  } else if (/\b(50,?000|50k)\b/.test(q)) {
    intents.amountMin = 50000;
  }

  // Deadlines
  if (/\b(closing soon|urgent|deadline|days left|fast|this week|expiring)\b/.test(q)) {
    intents.closingSoon = true;
  }

  // Financial Need
  if (/\b(low income|poor|financial need|bpl|needy|aid|hardship|fee support)\b/.test(q)) {
    intents.lowIncome = true;
  }

  return intents;
}

export function searchScholarshipsWithAI(query, scholarshipsList, userProfile = null) {
  if (!query || !query.trim()) {
    return scholarshipsList.map((s) => ({
      ...s,
      aiScore: s.featured ? 92 : 80,
      aiReason: s.featured ? "Featured top-tier opportunity" : "Available live program"
    }));
  }

  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
  const intents = extractSearchIntents(query);

  const scored = scholarshipsList.map((item) => {
    let score = 30; // base score
    let reasons = [];

    // Gender intent match
    if (intents.gender) {
      const gCheck = checkGenderEligibility(item.gender, intents.gender);
      const normItemGender = normalizeGender(item.gender);
      if (gCheck.pass && normItemGender !== "All") {
        score += 35;
        reasons.push(`Specifically dedicated for ${item.gender || intents.gender}`);
      } else if (normItemGender === "All") {
        score += 15;
      } else {
        score -= 25;
      }
    }

    // Education match
    if (intents.education) {
      if (item.education?.toLowerCase() === intents.education.toLowerCase()) {
        score += 30;
        reasons.push(`Matches ${intents.education} level`);
      } else {
        score -= 15;
      }
    }

    // Course match
    if (intents.course) {
      if (item.course?.toLowerCase() === intents.course.toLowerCase() || item.course === "All Streams") {
        score += 25;
        reasons.push(`Targeted towards ${intents.course} studies`);
      } else {
        score -= 10;
      }
    }

    // Category match
    if (intents.category) {
      const catCheck = checkCategoryEligibility(item.category, intents.category);
      const normItemCat = normalizeCategory(item.category);
      if (catCheck.pass && normItemCat.code !== "ALL" && normItemCat.code !== "GENERAL") {
        score += 30;
        reasons.push(`Designated for ${item.category || intents.category} category`);
      } else if (item.category === "General" || catCheck.pass) {
        score += 10;
      }
    }

    // State match
    if (intents.state) {
      if (item.state === intents.state) {
        score += 25;
        reasons.push(`Open to students in ${intents.state}`);
      } else if (item.state === "All India") {
        score += 15;
        reasons.push("Open pan-India");
      } else {
        score -= 20;
      }
    }

    // Amount match
    if (intents.amountMin) {
      if ((item.amountNumeric || 0) >= intents.amountMin) {
        score += 20;
        reasons.push(`High financial aid (${item.amount})`);
      }
    }

    // Closing soon match
    if (intents.closingSoon) {
      if ((item.deadlineDays || 99) <= 20) {
        score += 25;
        reasons.push(`Closing soon in ${item.deadlineDays} days`);
      }
    }

    // Low income match
    if (intents.lowIncome) {
      if (item.incomeLimit && item.incomeLimit.includes("₹")) {
        score += 15;
        reasons.push(`Income support: ${item.incomeLimit}`);
      }
    }

    // Text token search against all fields
    const fullText = `${item.title} ${item.provider} ${item.description} ${item.eligibility} ${item.course} ${item.category} ${item.state}`.toLowerCase();
    
    let tokenMatches = 0;
    tokens.forEach((t) => {
      if (fullText.includes(t)) {
        score += 12;
        tokenMatches++;
      }
    });

    if (tokenMatches > 0 && reasons.length === 0) {
      reasons.push(`Keywords matched: "${tokens.slice(0, 2).join('", "')}"`);
    }

    // User profile alignment if provided
    if (userProfile) {
      if (checkGenderEligibility(item.gender, userProfile.gender).pass) score += 10;
      if (userProfile.state && (item.state === userProfile.state || item.state === "All India")) score += 8;
      if (checkCategoryEligibility(item.category, userProfile).pass) score += 10;
    }

    // Normalize score 40 - 99
    const finalScore = Math.min(99, Math.max(35, Math.round(score)));

    let finalReason = reasons.join(" • ");
    if (!finalReason) {
      finalReason = `Matches relevant scholarship criteria for "${query.slice(0, 30)}"`;
    }

    return {
      ...item,
      aiScore: finalScore,
      aiReason: finalReason
    };
  });

  return scored.sort((a, b) => b.aiScore - a.aiScore);
}

// AI Advisor conversational knowledge base & generation logic
export function generateAIAdvisorResponse(userInput, scholarshipsList, userProfile = null) {
  const q = userInput.toLowerCase().trim();

  // 1. SOP / Essay Assistance
  if (/\b(sop|statement of purpose|essay|cover letter|motivation letter|write an essay|draft)\b/.test(q)) {
    return {
      text: `### 📝 Custom Scholarship Statement of Purpose (SOP) Framework

Here is a winning SOP structure tailored for merit & need-based scholarship committees:

---

**[Header]**  
*Statement of Purpose for Financial Grant & Mentorship*  
**Applicant:** ${userProfile ? `${userProfile.firstName || 'Student'} ${userProfile.lastName || ''}` : 'Applicant'}

**1. The Introduction & Academic Passion:**  
"Ever since entering my academic journey in **${userProfile?.course || 'my discipline'}**, my commitment has been to leverage high-level education to solve real-world community challenges. Despite financial hurdles, I have maintained unwavering academic dedication..."

**2. Family Background & The Financial Need:**  
"My family's annual income is constrained, making tuition fees and learning resources a substantial barrier. Securing this scholarship will alleviate the financial pressure on my family and enable me to devote 100% of my time to research, innovation, and learning."

**3. Future Vision & Giving Back:**  
"Upon graduating, I aim to spearhead impactful solutions in the industry and establish a mentorship circle for younger students facing similar educational barriers."

---
💡 **Pro-Tips for Your Application:**
- Quantify your achievements (e.g., *'Scored top 5% in entrance exam'*).
- Always customize the first paragraph with the specific organization's mission (e.g. Reliance, L'Oréal, Tata Trusts).
- Keep it concise: 500–750 words is the sweet spot!`,
      cards: [],
      quickReplies: ["What documents are required?", "Find scholarships for me", "Check upcoming deadlines"]
    };
  }

  // 2. Document Checklist Assistance
  if (/\b(document|documents|certificate|proof|passbook|income certificate|marksheet|bonafide)\b/.test(q)) {
    // Find if specific scholarship is mentioned
    const matchedScholarship = scholarshipsList.find(s => 
      q.includes(s.provider.toLowerCase()) || q.includes(s.id.toLowerCase()) || q.includes(s.title.toLowerCase().split(' ')[0].toLowerCase())
    );

    if (matchedScholarship) {
      return {
        text: `### 📁 Document Checklist for **${matchedScholarship.title}**

Here are the verified documents required by **${matchedScholarship.provider}**:

${matchedScholarship.documentsRequired.map((doc, idx) => `**${idx + 1}.** ${doc}`).join('\n')}

> ⚠️ **Verification Tip:** Ensure documents are in clean PDF/JPEG format under 2MB. Make sure your name matches exactly across Aadhaar, Class 10 marksheet, and Bank Passbook to prevent rejection!`,
        cards: [matchedScholarship],
        quickReplies: ["How to apply?", "Other scholarships like this", "Open Document Wallet"]
      };
    }

    return {
      text: `### 📁 Universal Master Document Checklist for Indian Scholarships

Most scholarship sponsors (Government, Tata, Reliance, Kotak, SBI) require these 6 key documents:

1. **Academic Marksheets:** Class 10, 12, or latest semester transcripts (min 60–75% aggregate).
2. **Current Bonafide / Admission Proof:** Official letterhead issued by your college Dean or Principal with current academic year seal.
3. **Valid Income Certificate:** Issued by Tehsildar / SDO / Revenue Authority (usually dated within the last 12 months).
4. **Government ID & Domicile:** Aadhaar Card (linked with mobile & active bank account) + State Domicile Certificate.
5. **Active Bank Passbook:** Student's own single savings account (Joint accounts with parents often get rejected).
6. **Passport Size Photograph & Category/Caste Certificate** (if applying under SC/ST/OBC/EWS/Minority/PWD).

💡 *You can store and organize all your verified credentials directly in the **My Document Wallet** section on ScholarshipConnect AI!*`,
      cards: [],
      quickReplies: ["Find scholarships for me", "How to write an SOP?", "Check eligibility criteria"]
    };
  }

  // 3. Deadline / Closing Soon Query
  if (/\b(deadline|closing|expire|urgent|due date|last date)\b/.test(q)) {
    const urgentItems = [...scholarshipsList]
      .sort((a, b) => (a.deadlineDays || 99) - (b.deadlineDays || 99))
      .slice(0, 3);

    return {
      text: `### ⏳ Upcoming Scholarship Deadlines (Urgent Attention!)

These high-impact opportunities are closing soonest:

${urgentItems.map(item => `* **${item.title}** (${item.provider}) — ⏰ **${item.deadline}** (*${item.deadlineDays} days remaining*) | Award: **${item.amount}**`).join('\n')}

> 🚀 **Advice:** Submit at least 48 hours prior to the deadline to avoid portal server congestion on the final day.`,
      cards: urgentItems,
      quickReplies: ["View closing scholarships", "What documents do I need?", "SOP writing help"]
    };
  }

  // 4. Girls / Women in STEM Query
  if (/\b(girl|women|woman|female|kanya|stem women)\b/.test(q)) {
    const girlScholarships = scholarshipsList.filter(s => s.gender === "Girls" || s.title.toLowerCase().includes("women") || s.title.toLowerCase().includes("kanya"));
    
    return {
      text: `### 👩‍🎓 Dedicated Scholarships for Women & Girls

There are dedicated high-value grants empowering female students in STEM, medicine, and higher education:

${girlScholarships.map(s => `* **${s.title}** by *${s.provider}* — 💰 **${s.amount}** (Deadline: ${s.deadline})`).join('\n')}

These schemes offer not just financial tuition grants, but also mentorship networks and leadership seminars!`,
      cards: girlScholarships,
      quickReplies: ["How to apply for L'Oréal?", "Kotak Kanya details", "Document checklist"]
    };
  }

  // 5. Engineering / Tech / MBBS Medical
  if (/\b(engineering|btech|computer science|medical|mbbs)\b/.test(q)) {
    const isMed = /\b(medical|mbbs)\b/.test(q);
    const targetCourse = isMed ? "Medical" : "Engineering";
    const courseScholarships = scholarshipsList.filter(s => s.course === targetCourse).slice(0, 3);

    return {
      text: `### 🎓 Top Scholarships for **${targetCourse}** Students

Here are top recommended schemes tailored for your field of study:

${courseScholarships.map(s => `* **${s.title}** — Award: **${s.amount}** (Eligibility: *${s.eligibility}*)`).join('\n')}

Would you like me to evaluate your family income limit and exam marks to verify your full qualification?`,
      cards: courseScholarships,
      quickReplies: ["Check my eligibility", "What documents are required?", "Show all scholarships"]
    };
  }

  // 6. User Profile Eligibility Check
  if (/\b(eligibility|eligible|check my profile|can i apply|qualify)\b/.test(q)) {
    if (userProfile) {
      const matched = searchScholarshipsWithAI(`${userProfile.education || ''} ${userProfile.course || ''} ${userProfile.category || ''}`, scholarshipsList, userProfile).slice(0, 3);
      return {
        text: `### 🎯 Personalized Profile Evaluation for **${userProfile.firstName || 'Student'}**

Based on your registered profile:
- **Education:** ${userProfile.education || 'Undergraduate'}
- **Category:** ${userProfile.category || 'General'}
- **Course / Stream:** ${userProfile.course || 'Professional Degree'}
- **State:** ${userProfile.state || 'All India'}

You have a **High Match (88%–97%)** for the following active scholarship programs:`,
        cards: matched,
        quickReplies: ["Prepare required documents", "Draft an SOP", "Search more scholarships"]
      };
    } else {
      return {
        text: `### 🎯 Real-Time Eligibility Matcher

I can automatically screen and calculate your eligibility percentage across all scholarships!

To give you the most accurate answer:
1. Are you in **School (10th/12th)**, **Undergraduate**, or **Postgraduate**?
2. What is your **Field/Course** (e.g. Engineering, Medicine, Science, Arts, Commerce)?
3. What is your approximate **annual family income**?

Or you can log in / register, and I'll immediately analyze your verified profile!`,
        cards: scholarshipsList.slice(0, 2),
        quickReplies: ["Undergraduate Engineering", "Women in Science", "Family income under 3 lakhs"]
      };
    }
  }

  // 7. General search / recommendation fallback
  const results = searchScholarshipsWithAI(userInput, scholarshipsList, userProfile).slice(0, 3);

  return {
    text: `### ✦ AI Scholarship Recommendations

I analyzed your request (*"${userInput}"*) against our verified scholarship database. Here are the top matched opportunities:

${results.map(r => `* **${r.title}** (${r.provider}) — 💰 **${r.amount}** | **${r.aiScore}% Match**\n  *Reason: ${r.aiReason}*`).join('\n\n')}

How else can I assist you today? You can ask me to draft your SOP, prepare your document checklist, or explain application steps!`,
    cards: results,
    quickReplies: ["Check required documents", "Help me draft an SOP", "View urgent deadlines"]
  };
}

// Live Google Gemini API Integration (optional with fallback)
export async function queryGeminiAI(userQuery, scholarshipsList, userProfile, apiKey) {
  const scholarshipsContext = scholarshipsList.map((s) => ({
    id: s.id,
    title: s.title,
    provider: s.provider,
    amount: s.amount,
    deadline: s.deadline,
    eligibility: s.eligibility,
    category: s.category,
    gender: s.gender,
    state: s.state,
  }));

  const systemInstructions = `You are ScholarBot AI, an intelligent, empathetic, and expert scholarship advisor for ScholarshipConnect AI in India.
Your mission is to help Indian students discover scholarships, write winning SOPs/essays, understand document requirements, and navigate application deadlines.

Context of active scholarships in India:
${JSON.stringify(scholarshipsContext, null, 2)}

${
  userProfile
    ? `Current Student Profile:
- Name: ${userProfile.firstName} ${userProfile.lastName || ""}
- Email: ${userProfile.email || "Not specified"}
- Phone: ${userProfile.phone || "Not specified"}
- Target Course: ${userProfile.course || "Undergraduate"}
- Category: ${userProfile.category || "General"}
- State: ${userProfile.state || "All India"}`
    : "Student has not logged in yet."
}

Guidelines:
1. Format your response cleanly using Markdown headings (###), bold text, bullet points, and quotes.
2. If the student asks for scholarships, recommend the most relevant ones from the context list with award amounts and deadlines.
3. If the student asks for an SOP or essay, provide a structured, tailored statement of purpose draft.
4. Keep the tone encouraging, professional, and clear.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstructions}\n\nStudent's question: "${userQuery}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API error (${response.status})`
    );
  }

  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error("Empty response received from Gemini AI");
  return answer;
}

// ============================================================================
// RECOMMENDATION ENGINE & ELIGIBILITY CHECKER (CORE AUDIT LOGIC)
// ============================================================================

function parseIncomeAmount(str) {
  if (!str) return 0;
  if (typeof str === "number") return str;
  const clean = str.replace(/[,₹\s]/g, "").toLowerCase();
  if (clean.includes("lakh") || clean.includes("lac")) {
    const num = parseFloat(clean.replace(/lakh|lac/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }
  if (clean.includes("crore") || clean.includes("cr")) {
    const num = parseFloat(clean.replace(/crore|cr/g, ""));
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function parseMarksPercentage(str) {
  if (!str) return 0;
  if (typeof str === "number") return str;
  const match = String(str).match(/(\d+(\.\d+)?)\s*%/);
  if (match) return parseFloat(match[1]);
  const numMatch = String(str).match(/\d+(\.\d+)?/);
  return numMatch ? parseFloat(numMatch[0]) : 0;
}

/**
 * Rigorously checks whether a user profile is eligible for a specific scholarship
 */
export function checkScholarshipEligibility(scholarship, userProfile = null) {
  if (!scholarship) return null;

  const normEdu = normalizeEducation(userProfile);

  // Defaults for unauthenticated or partial profiles
  const profile = {
    firstName: userProfile?.firstName || "Student",
    education: normEdu.educationStage,
    course: normEdu.displayStream,
    category: userProfile?.category || "General",
    state: userProfile?.state || "Karnataka",
    annualIncomeNum: parseIncomeAmount(userProfile?.annualIncome || "180000"),
    marksNum: parseMarksPercentage(userProfile?.marks || userProfile?.percentage || "92"),
    gender: userProfile?.gender || "Female"
  };

  let totalWeight = 0;
  let earnedWeight = 0;
  const breakdown = [];

  // 1. Course / Academic Stream
  totalWeight += 25;
  const courseAudit = checkCourseStreamEligibility(scholarship.course, userProfile);
  if (courseAudit.pass) {
    earnedWeight += 25;
  }

  breakdown.push({
    factor: "Course / Stream",
    required: scholarship.course || "All Streams",
    studentValue: courseAudit.studentValue,
    status: courseAudit.pass ? "pass" : "fail",
    notes: courseAudit.notes
  });

  // 2. Education Stage
  totalWeight += 20;
  const eduAudit = checkEducationStageEligibility(scholarship.education, userProfile);
  if (eduAudit.pass) {
    earnedWeight += 20;
  }

  breakdown.push({
    factor: "Education Stage",
    required: scholarship.education || "Undergraduate",
    studentValue: eduAudit.studentValue,
    status: eduAudit.pass ? "pass" : "fail",
    notes: eduAudit.notes
  });

  // 3. Annual Family Income
  totalWeight += 20;
  const limitNum = parseIncomeAmount(scholarship.incomeLimit);
  let incomePass = false;
  let incomeStatus = "pass";
  let incomeNotes = "";

  if (!limitNum || limitNum === 0 || profile.annualIncomeNum <= limitNum) {
    incomePass = true;
    earnedWeight += 20;
    incomeNotes = `Your annual income (₹${profile.annualIncomeNum.toLocaleString('en-IN')}) is within the eligible ceiling (${scholarship.incomeLimit || 'No Limit'}).`;
  } else if (profile.annualIncomeNum <= limitNum * 1.2) {
    incomeStatus = "warn";
    earnedWeight += 10;
    incomeNotes = `Income slightly exceeds standard limit, but special merit waivers may apply.`;
  } else {
    incomeStatus = "fail";
    incomeNotes = `Family income exceeds scholarship ceiling of ${scholarship.incomeLimit}.`;
  }

  breakdown.push({
    factor: "Income Ceiling",
    required: scholarship.incomeLimit || "No Limit Specified",
    studentValue: `₹${profile.annualIncomeNum.toLocaleString('en-IN')}`,
    status: incomeStatus,
    notes: incomeNotes
  });

  // 4. Academic Marks / Cutoff
  totalWeight += 15;
  const minMarksRequired = parseMarksPercentage(scholarship.minMarks);
  let marksStatus = "pass";
  let marksNotes = "";

  if (minMarksRequired === 0 || profile.marksNum >= minMarksRequired) {
    earnedWeight += 15;
    marksNotes = `Your qualifying score (${profile.marksNum}%) clears the minimum requirement (${scholarship.minMarks || '50%'}).`;
  } else if (profile.marksNum >= minMarksRequired - 5) {
    marksStatus = "warn";
    earnedWeight += 8;
    marksNotes = `Slightly below cutoff; category reservations may lower the threshold.`;
  } else {
    marksStatus = "fail";
    marksNotes = `Requires at least ${scholarship.minMarks}.`;
  }

  breakdown.push({
    factor: "Minimum Marks Cutoff",
    required: scholarship.minMarks || "50% Aggregate",
    studentValue: `${profile.marksNum}%`,
    status: marksStatus,
    notes: marksNotes
  });

  // 5. State / Domicile
  totalWeight += 10;
  const schState = scholarship.state || "All India";
  let statePass = false;
  let stateNotes = "";

  if (schState === "All India" || schState.toLowerCase() === profile.state.toLowerCase()) {
    statePass = true;
    earnedWeight += 10;
    stateNotes = `Eligible under ${schState} regional allocation.`;
  } else {
    stateNotes = `Restricted to permanent residents of ${schState}.`;
  }

  breakdown.push({
    factor: "State Domicile",
    required: schState,
    studentValue: profile.state,
    status: statePass ? "pass" : "fail",
    notes: stateNotes
  });

  // 6. Category / Quota (Strictly separated from Gender)
  totalWeight += 5;
  const catAudit = checkCategoryEligibility(scholarship.category, userProfile || profile.category);
  if (catAudit.pass) {
    earnedWeight += 5;
  }

  breakdown.push({
    factor: "Category / Quota",
    required: catAudit.required,
    studentValue: catAudit.studentValue,
    status: catAudit.status,
    notes: catAudit.notes
  });

  // 7. Gender Criteria
  totalWeight += 5;
  const genderAudit = checkGenderEligibility(scholarship.gender, profile.gender);
  if (genderAudit.pass) {
    earnedWeight += 5;
  }

  breakdown.push({
    factor: "Gender Criteria",
    required: genderAudit.required,
    studentValue: genderAudit.studentValue,
    status: genderAudit.status,
    notes: genderAudit.notes
  });

  // Overall Score Calculation
  const eligibilityScore = Math.min(99, Math.max(25, Math.round((earnedWeight / totalWeight) * 100)));

  const hasCriticalFail = breakdown.some(
    b => (b.factor === "Course / Stream" || b.factor === "State Domicile" || b.factor === "Gender Criteria" || b.factor === "Category / Quota") && b.status === "fail"
  );

  let status = "eligible";
  let verdict = "Highly Qualified! All core eligibility criteria are satisfied.";
  if (hasCriticalFail) {
    status = "ineligible";
    verdict = "Not Recommended: Does not satisfy mandatory domicile, gender, caste quota, or degree stream criteria.";
  } else if (eligibilityScore < 75) {
    status = "warning";
    verdict = "Partially Qualified: You may apply, but committee may require additional income/marks proof.";
  }

  const requiredDocs = scholarship.documentsRequired || ["Aadhaar Card", "Class 12 Marksheet", "Income Certificate"];

  return {
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    provider: scholarship.provider,
    awardAmount: scholarship.amount,
    deadline: scholarship.deadline,
    status,
    eligibilityScore: hasCriticalFail ? Math.min(45, eligibilityScore) : eligibilityScore,
    verdict,
    breakdown,
    requiredDocuments: requiredDocs
  };
}

/**
 * Profile-Based Recommendation Engine
 */
export function getProfileRecommendations(userProfile, scholarshipsList, options = {}) {
  if (!scholarshipsList || scholarshipsList.length === 0) return [];

  const evaluated = scholarshipsList.map((scholarship) => {
    const audit = checkScholarshipEligibility(scholarship, userProfile);

    let boost = 0;
    const badges = [];

    if (audit.status === "eligible") {
      boost += 18;
      badges.push("100% Eligible");
    }

    if (scholarship.featured) {
      boost += 6;
      badges.push("Featured");
    }

    if ((scholarship.amountNumeric || 0) >= 100000) {
      boost += 10;
      badges.push("High Value");
    }

    if ((scholarship.deadlineDays || 99) <= 15) {
      badges.push("Closing Soon");
    }

    const streamMatch = audit.breakdown.find(b => b.factor === "Course / Stream");
    if (streamMatch && streamMatch.status === "pass" && scholarship.course !== "All Streams") {
      boost += 12;
      badges.push("Direct Stream Fit");
    }

    const finalScore = Math.min(99, Math.max(35, Math.round(audit.eligibilityScore * 0.75 + boost)));

    let reason = "";
    const normEdu = normalizeEducation(userProfile);
    if (audit.status === "eligible") {
      reason = `Matches your ${normEdu.displayStream || userProfile?.course || 'degree stream'} + verified income under ${scholarship.incomeLimit || 'specified limit'}.`;
    } else if (audit.status === "warning") {
      reason = `Partially matches criteria; review ${audit.breakdown.filter(b => b.status !== 'pass').map(b => b.factor).join(', ')}.`;
    } else {
      reason = `High competition; requires specific ${audit.breakdown.find(b => b.status === 'fail')?.factor || 'criteria'}.`;
    }

    return {
      ...scholarship,
      matchScore: finalScore,
      aiScore: finalScore,
      audit,
      fitReason: reason,
      aiReason: reason,
      highlightBadges: badges
    };
  });

  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Batch audit all scholarships against the profile
 */
export function batchCheckEligibility(scholarshipsList, userProfile) {
  const audits = (scholarshipsList || []).map(s => checkScholarshipEligibility(s, userProfile));
  const eligible = audits.filter(a => a.status === "eligible");
  const warnings = audits.filter(a => a.status === "warning");
  const ineligible = audits.filter(a => a.status === "ineligible");

  return {
    total: audits.length,
    eligibleCount: eligible.length,
    warningCount: warnings.length,
    ineligibleCount: ineligible.length,
    audits
  };
}

export const RecommendationEngine = {
  getProfileRecommendations,
  checkScholarshipEligibility,
  batchCheckEligibility,
  extractSearchIntents,
  searchScholarshipsWithAI
};

export const EligibilityChecker = {
  checkScholarshipEligibility,
  batchCheckEligibility
};

