const bcrypt = require("bcryptjs");
const Scholarship = require("./models/Scholarship");
const User = require("./models/User");
const Application = require("./models/Application");
const Award = require("./models/Award");
const Notice = require("./models/Notice");

const initialScholarships = [
  {
    id: "reliance-ug",
    provider: "Reliance Foundation",
    title: "Reliance Foundation Undergraduate Scholarships",
    amount: "Up to ₹2,00,000",
    amountNumeric: 200000,
    eligibility: "Undergraduate students across India (1st year)",
    education: "Undergraduate",
    state: "All India",
    category: "General",
    course: "Engineering",
    gender: "All",
    deadline: "15 Oct 2026",
    deadlineDays: 9,
    color: "#1467d8",
    tag: "Featured",
    featured: true,
    incomeLimit: "₹15,00,000 per annum",
    minMarks: "60% in 12th standard",
    documentsRequired: [
      "Aadhaar Card",
      "Class 12 Marksheet",
      "College Admission Bonafide",
      "Family Income Certificate",
      "Bank Account Details"
    ],
    description: "Supporting promising students with financial assistance and mentorship for their undergraduate journey.",
    officialUrl: "https://www.reliancefoundation.org/",
  },
  {
    id: "sbi-asha",
    provider: "SBI Foundation",
    title: "SBI Platinum Jubilee Asha Scholarship",
    amount: "Up to ₹50,000",
    amountNumeric: 50000,
    eligibility: "Class 6 to postgraduate students from low-income families",
    education: "Class 12",
    state: "All India",
    category: "OBC",
    course: "Science",
    gender: "All",
    deadline: "30 Sep 2026",
    deadlineDays: 2,
    color: "#06864e",
    tag: "Live now",
    featured: true,
    incomeLimit: "₹3,00,000 per annum",
    minMarks: "75% in previous examination",
    documentsRequired: [
      "Marksheet of previous academic year",
      "Government Issued Identity Card",
      "Current Year Admission Proof / Fee Receipt",
      "Income Certificate / BPL Card",
      "Applicant Bank Passbook"
    ],
    description: "Helping talented learners continue their education without financial barriers.",
    officialUrl: "https://www.sbifoundation.in/",
  },
  {
    id: "hdfc-badhte-kadam",
    provider: "HDFC Bank Parivartan",
    title: "HDFC Bank Parivartan's ECSS Programme",
    amount: "Up to ₹75,000",
    amountNumeric: 75000,
    eligibility: "School students (Class 1-12) and college students (UG/PG)",
    education: "Undergraduate",
    state: "All India",
    category: "General",
    course: "Commerce",
    gender: "All",
    deadline: "30 Oct 2026",
    deadlineDays: 24,
    color: "#0d5ca8",
    tag: "Featured",
    featured: true,
    incomeLimit: "₹2,50,000 per annum",
    minMarks: "55% in previous examination",
    documentsRequired: [
      "Passport size photograph",
      "Previous year marksheet",
      "Identity proof (Aadhaar Card/Voter ID/Driving License)",
      "Current year admission proof",
      "Applicant Bank Passbook",
      "Income Proof from authority"
    ],
    description: "Designed to support meritorious students from underprivileged backgrounds across India.",
    officialUrl: "https://www.hdfcbank.com/",
  },
  {
    id: "tata-capital-pankh",
    provider: "Tata Capital",
    title: "Tata Capital Pankh Scholarship Programme",
    amount: "Up to 80% of fees",
    amountNumeric: 60000,
    eligibility: "Class 11, 12, general graduation, and diploma students",
    education: "Class 12",
    state: "All India",
    category: "General",
    course: "Arts",
    gender: "All",
    deadline: "15 Nov 2026",
    deadlineDays: 40,
    color: "#1a6b8a",
    tag: "Closing soon",
    featured: false,
    incomeLimit: "₹2,50,000 per annum",
    minMarks: "60% in previous class",
    documentsRequired: [
      "Photo identity proof",
      "Income proof",
      "Admission proof (School/College ID/Bonafide)",
      "Bank account details",
      "Class 10 or 12 marksheet"
    ],
    description: "Empowering deserving students towards a brighter academic and professional horizon.",
    officialUrl: "https://www.tatacapital.com/",
  },
  {
    id: "kotak-kanya",
    provider: "Kotak Education Foundation",
    title: "Kotak Kanya Scholarship 2026",
    amount: "₹1,50,000 per year",
    amountNumeric: 150000,
    eligibility: "Meritorious girl students pursuing professional courses (Engg, MBBS, Law)",
    education: "Undergraduate",
    state: "All India",
    category: "General",
    course: "Engineering",
    gender: "Girls",
    deadline: "31 Oct 2026",
    deadlineDays: 25,
    color: "#c82333",
    tag: "Featured",
    featured: true,
    incomeLimit: "₹6,00,000 per annum",
    minMarks: "85% or equivalent CGPA in Class 12",
    documentsRequired: [
      "Class 12 Marksheet",
      "Entrance exam scorecard (JEE/NEET/CLAT)",
      "Income Certificate / ITR of parents",
      "Fee receipt of 1st year college",
      "Aadhaar Card",
      "Bank passbook copy"
    ],
    description: "Empowering young women to pursue professional degrees in top Indian institutions.",
    officialUrl: "https://kotakeducation.org/",
  },
  {
    id: "loreal-stem",
    provider: "L'Oréal India",
    title: "L'Oréal India For Young Women In Science",
    amount: "Up to ₹2,50,000",
    amountNumeric: 250000,
    eligibility: "Class 12 pass girl students pursuing graduation in STEM disciplines",
    education: "Undergraduate",
    state: "All India",
    category: "General",
    course: "Science",
    gender: "Girls",
    deadline: "20 Oct 2026",
    deadlineDays: 14,
    color: "#b02a37",
    tag: "Popular",
    featured: true,
    incomeLimit: "₹6,00,000 per annum",
    minMarks: "85% in PCM/PCB in Class 12",
    documentsRequired: [
      "Attested copy of Class 12 marksheet",
      "Age proof (Birth Certificate/Aadhaar)",
      "Income certificate issued by competent authority",
      "Admission letter from recognized college"
    ],
    description: "Recognizing and aiding passionate female scientists of tomorrow.",
    officialUrl: "https://www.loreal.com/",
  },
  {
    id: "dr-reddy-sashakt",
    provider: "Dr. Reddy's Foundation",
    title: "Sashakt Scholarship",
    amount: "₹2,40,000 (3 years)",
    amountNumeric: 240000,
    eligibility: "Bright young girls preparing to study pure/applied natural science",
    education: "Undergraduate",
    state: "All India",
    category: "General",
    course: "Science",
    gender: "Girls",
    deadline: "25 Oct 2026",
    deadlineDays: 19,
    color: "#28a745",
    tag: "Open",
    featured: false,
    incomeLimit: "₹5,00,000 per annum",
    minMarks: "Confirmed admission in leading science colleges",
    documentsRequired: [
      "Class 10 and 12 marksheets",
      "College admission confirmation letter",
      "Income certificate",
      "Statement of Purpose essay"
    ],
    description: "Fostering women innovators in pure and natural science domains.",
    officialUrl: "https://www.sashaktscholarship.org/",
  },
  {
    id: "santosham-merit",
    provider: "Santosham Foundation",
    title: "Santosham Merit-cum-Means Grant",
    amount: "Up to ₹60,000",
    amountNumeric: 60000,
    eligibility: "Karnataka domicile students from economically weaker sections",
    education: "Undergraduate",
    state: "Karnataka",
    category: "General",
    course: "Engineering",
    gender: "All",
    deadline: "05 Nov 2026",
    deadlineDays: 30,
    color: "#6f42c1",
    tag: "State special",
    featured: false,
    incomeLimit: "₹2,00,000 per annum",
    minMarks: "70% in 2nd PUC",
    documentsRequired: [
      "Karnataka Domicile Certificate",
      "PUC II / Class 12 Marksheet",
      "Revenue Dept Income Certificate",
      "College ID Card"
    ],
    description: "Local community support promoting technical and vocational education in Karnataka.",
    officialUrl: "https://santoshamfoundation.org/",
  },
];

const initialApplications = [
  {
    id: "APP-2026-RF10492",
    studentId: "SC-2026-5OAP",
    studentName: "Sinchana Kotari",
    studentEmail: "sinchana.kotari@example.com",
    title: "Reliance Foundation Undergraduate Scholarships 2026–27",
    scholarshipId: "reliance-ug",
    provider: "Reliance Foundation",
    category: "Undergraduate Degree",
    appliedDate: "12 Aug 2026",
    deadline: "05 Oct 2026",
    awardAmount: "₹2,00,000",
    awardAmountNumeric: 200000,
    status: "Shortlisted",
    statusStage: 3,
    academicScore: "94.5% in Class 12",
    annualIncome: "₹ 1,80,000",
    targetInstitution: "National Institute of Engineering / VTU",
    attachedDocuments: ["Aadhaar Card (Verified)", "Class 10 Marksheet", "Family Income Certificate", "College ID"],
    applicationNotes: "Provisional selection approved. National Merit Rank AIR-142. Ready for DBT grant disbursement.",
    aiMatchScore: 96,
  },
  {
    id: "APP-2026-SBI9118",
    studentId: "SC-2026-5OAP",
    studentName: "Sinchana Kotari",
    studentEmail: "sinchana.kotari@example.com",
    title: "SBI Platinum Jubilee Asha Scholarship (Phase-1)",
    scholarshipId: "sbi-asha",
    provider: "SBI Foundation",
    category: "School & UG",
    appliedDate: "28 Aug 2026",
    deadline: "30 Sep 2026",
    awardAmount: "₹50,000",
    awardAmountNumeric: 50000,
    status: "Approved",
    statusStage: 4,
    academicScore: "92.0% Qualifying Marks",
    annualIncome: "₹ 1,80,000",
    targetInstitution: "National Institute of Engineering / VTU",
    attachedDocuments: ["Aadhaar Card", "Bank Passbook (DBT Active)", "Income Certificate"],
    applicationNotes: "Grant amount sanctioned and disbursed via direct account credit.",
    aiMatchScore: 94,
  },
  {
    id: "APP-2026-KK489",
    studentId: "SC-2026-5OAP",
    studentName: "Sinchana Kotari",
    studentEmail: "sinchana.kotari@example.com",
    title: "Kotak Kanya Scholarship Selection Roll 2026",
    scholarshipId: "kotak-kanya",
    provider: "Kotak Education Foundation",
    category: "Girls Professional",
    appliedDate: "04 Sep 2026",
    deadline: "15 Oct 2026",
    awardAmount: "₹1,50,000 / year",
    awardAmountNumeric: 150000,
    status: "Under Review",
    statusStage: 2,
    academicScore: "CET Rank #4,102 (89.5% aggregate)",
    annualIncome: "₹ 1,80,000",
    targetInstitution: "National Institute of Engineering / VTU",
    attachedDocuments: ["Aadhaar Card", "Marks Card", "Income Certificate", "Bonafide Letter"],
    applicationNotes: "Academic documents verified. Screening by regional evaluation committee in progress.",
    aiMatchScore: 91,
  },
  {
    id: "APP-2026-AS701",
    studentId: "SC-2026-IND9021",
    studentName: "Aarav Sharma",
    studentEmail: "aarav.sharma@example.com",
    title: "Reliance Foundation Undergraduate Scholarships 2026–27",
    scholarshipId: "reliance-ug",
    provider: "Reliance Foundation",
    category: "Engineering & AI",
    appliedDate: "15 Aug 2026",
    deadline: "15 Oct 2026",
    awardAmount: "₹2,00,000",
    awardAmountNumeric: 200000,
    status: "Under Review",
    statusStage: 2,
    academicScore: "95.2% in Class 12 (JEE Rank 4200)",
    annualIncome: "₹ 1,80,000",
    targetInstitution: "IIT Bombay / NIT Surathkal",
    attachedDocuments: ["Aadhaar Card", "JEE Rank Card", "Income Certificate", "Bonafide Letter"],
    applicationNotes: "Academic credentials verified. Committee review pending.",
    aiMatchScore: 98,
  },
  {
    id: "APP-2026-PP402-KK",
    studentId: "SC-2026-PP402",
    studentName: "Priya Patel",
    studentEmail: "priya.patel@example.com",
    title: "Kotak Kanya Scholarship Selection Roll 2026",
    scholarshipId: "kotak-kanya",
    provider: "Kotak Education Foundation",
    category: "Girls Professional",
    appliedDate: "04 Sep 2026",
    deadline: "15 Oct 2026",
    awardAmount: "₹1,50,000 / year",
    awardAmountNumeric: 150000,
    status: "Under Review",
    statusStage: 2,
    academicScore: "CET Rank #4,102 (89.5% aggregate)",
    annualIncome: "₹ 2,40,000",
    targetInstitution: "Delhi University",
    attachedDocuments: ["Aadhaar Card", "Marks Card", "Income Certificate", "Bonafide Letter"],
    applicationNotes: "Academic documents verified. Screening by regional evaluation committee in progress.",
    aiMatchScore: 91,
  },
];

const initialAwards = [
  {
    id: "awd-reliance-2026",
    studentId: "SC-2026-5OAP",
    studentEmail: "sinchana.kotari@example.com",
    title: "Reliance Foundation Undergraduate Scholar 2026",
    issuer: "Reliance Foundation & CSR Trust",
    category: "Scholarship Grants",
    dateConferred: "28 Sep 2026",
    standing: "National Level • All India Rank #142",
    prizeValue: "₹2,00,000 Grant",
    verified: true,
    description: "Conferred under the prestigious National CSR Merit Program for exceptional academic performance.",
    certificateRef: "CERT-RF-2026-AIR142",
    badgeColor: "#10b981",
  },
  {
    id: "awd-olympiad-2025",
    studentId: "SC-2026-5OAP",
    studentEmail: "sinchana.kotari@example.com",
    title: "National Science & Mathematics Talent Olympiad - Gold Medalist",
    issuer: "National Science Forum & DST Government of India",
    category: "Olympiads & STEM",
    dateConferred: "14 Nov 2025",
    standing: "State Level • 1st Rank (Karnataka State)",
    prizeValue: "Gold Medal + ₹25,000 Prize",
    verified: true,
    description: "Ranked 1st among 45,000 candidates across the state in theoretical physics and applied mathematics.",
    certificateRef: "CERT-NSTO-KA-001",
    badgeColor: "#f59e0b",
  },
];

async function seedDatabase() {
  try {
    // 1. Seed Scholarships
    // 1. Seed Scholarships - ensure latest criteria & category are synced to MongoDB
    for (const sch of initialScholarships) {
      await Scholarship.findOneAndUpdate(
        { $or: [{ id: sch.id }, { title: sch.title }] },
        { $set: sch },
        { upsert: true, new: true }
      );
    }
    console.log("Synchronized and seeded latest scholarships into MongoDB.");

    // 2. Seed Users
    const adminExists = await User.findOne({
      $or: [{ role: "admin" }, { email: "admin@scholarshipconnect.org" }, { studentId: "SC-ADMIN-001" }],
    });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin", salt);
      await User.create({
        id: "admin-001",
        studentId: "SC-ADMIN-001",
        firstName: "Dr. Rajeshwar",
        lastName: "Rao",
        email: "admin@scholarshipconnect.org",
        phone: "9988776655",
        dateOfBirth: "15 May 1985",
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        department: "Directorate of Higher Education Scholarships",
        institution: "National Scholarship Evaluation Board",
        bio: "Senior Director supervising merit-cum-means awards, DBT distributions, and student verification across pan-India scholarship pipelines.",
        status: "active",
      });
      console.log("Seeded Super-Admin user into MongoDB.");
    }

    const sinchanaExists = await User.findOne({
      $or: [{ email: "sinchana.kotari@example.com" }, { studentId: "SC-2026-5OAP" }],
    });
    if (!sinchanaExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);
      await User.create({
        id: "stu-004",
        studentId: "SC-2026-5OAP",
        firstName: "Sinchana",
        lastName: "Kotari",
        email: "sinchana.kotari@example.com",
        phone: "9876543210",
        dateOfBirth: "14 Aug 2005",
        password: hashedPassword,
        role: "student",
        isAdmin: false,
        course: "B.Tech Computer Science & AI",
        institution: "National Institute of Engineering / VTU",
        annualIncome: "₹ 1,80,000",
        gpa: "9.4 CGPA",
        category: "OBC",
        gender: "Female",
        status: "active",
        favorites: ["reliance-ug", "sbi-asha", "kotak-kanya"],
      });
      console.log("Seeded default student Sinchana into MongoDB.");
    }

    const aaravExists = await User.findOne({
      $or: [{ email: "aarav.sharma@example.com" }, { studentId: "SC-2026-IND9021" }],
    });
    if (!aaravExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);
      await User.create({
        id: "stu-001",
        studentId: "SC-2026-IND9021",
        firstName: "Aarav",
        lastName: "Sharma",
        email: "aarav.sharma@example.com",
        phone: "9876543210",
        dateOfBirth: "12 Aug 2005",
        password: hashedPassword,
        role: "student",
        isAdmin: false,
        course: "B.Tech Computer Science & AI",
        institution: "Indian Institute of Technology / NIT",
        annualIncome: "₹ 1,80,000",
        gpa: "9.2 CGPA",
        category: "General",
        gender: "Male",
        status: "active",
        favorites: ["reliance-ug", "sbi-asha"],
      });
      console.log("Seeded student Aarav Sharma into MongoDB.");
    }

    const priyaExists = await User.findOne({
      $or: [{ email: "priya.patel@example.com" }, { studentId: "SC-2026-PP402" }],
    });
    if (!priyaExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);
      await User.create({
        id: "stu-002",
        studentId: "SC-2026-PP402",
        firstName: "Priya",
        lastName: "Patel",
        email: "priya.patel@example.com",
        phone: "9812345678",
        dateOfBirth: "05 May 2004",
        password: hashedPassword,
        role: "student",
        isAdmin: false,
        course: "B.Sc Physics & Electronics",
        institution: "Delhi University",
        annualIncome: "₹ 2,40,000",
        gpa: "8.9 CGPA",
        category: "OBC",
        gender: "Female",
        status: "active",
        favorites: ["kotak-kanya", "loreal-stem"],
      });
      console.log("Seeded student Priya Patel into MongoDB.");
    }

    // 3. Seed Applications
    const appCount = await Application.countDocuments();
    if (appCount === 0) {
      await Application.insertMany(initialApplications);
      console.log("Seeded initial applications into MongoDB.");
    }

    // 4. Seed Awards
    const awardCount = await Award.countDocuments();
    if (awardCount === 0) {
      await Award.insertMany(initialAwards);
      console.log("Seeded initial awards into MongoDB.");
    }

    // 5. Seed Notice
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create({
        active: true,
        text: "📢 National Scholarship Portal 2026–27 applications are open. Complete Aadhaar & DigiLocker e-KYC before submitting!",
        type: "info",
        updatedAtFormatted: "07 Oct 2026",
      });
      console.log("Seeded initial notice into MongoDB.");
    }
  } catch (error) {
    console.error("Database seed warning:", error.message);
  }
}

module.exports = { seedDatabase };
