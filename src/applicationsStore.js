import { api } from "./api.js";

const STORAGE_KEY = "sc_all_applications";

export const INITIAL_APPLICATIONS = [
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
    id: "APP-2026-KK489",
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

let isSyncingApplications = false;

export async function syncApplicationsFromBackend() {
  if (isSyncingApplications) return;
  isSyncingApplications = true;
  try {
    const res = await api.get("/applications");
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("sc_applications_updated", { detail: res.data }));
      return res.data;
    }
  } catch (e) {
    console.warn("Backend applications sync error:", e);
  } finally {
    isSyncingApplications = false;
  }
}

export function getAllApplications() {
  // Sync in background from MongoDB
  syncApplicationsFromBackend();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load applications:", e);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
  } catch (e) {}
  return INITIAL_APPLICATIONS;
}

export async function updateApplication(appId, updates) {
  const current = getAllApplications();
  const updated = current.map((app) => {
    if (app.id === appId || app._id === appId) {
      return { ...app, ...updates, updatedAt: new Date().toISOString() };
    }
    return app;
  });

  // Sync to backend DB
  api.put(`/applications/${appId}`, updates).catch(console.warn);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_applications_updated", { detail: updated }));
  } catch (e) {
    console.error("Failed to persist application update:", e);
  }
  return updated;
}

export async function addApplication(newApp) {
  const current = getAllApplications();
  const created = {
    id: "APP-2026-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Submitted",
    statusStage: 1,
    aiMatchScore: Math.floor(85 + Math.random() * 14),
    ...newApp,
  };

  // Sync to backend DB
  api.post("/applications", created).then((res) => {
    if (res && res.success && res.data) {
      syncApplicationsFromBackend();
    }
  }).catch(console.warn);

  const updated = [created, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_applications_updated", { detail: updated }));
  } catch (e) {}
  return created;
}

export async function deleteApplication(appId) {
  const current = getAllApplications();
  const updated = current.filter((a) => a.id !== appId && a._id !== appId);

  // Sync to backend DB
  api.delete(`/applications/${appId}`).catch(console.warn);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_applications_updated", { detail: updated }));
  } catch (e) {}
  return updated;
}
