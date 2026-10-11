import { scholarships as defaultScholarships } from "./scholarshipsData.js";
import { api } from "./api.js";

const STORAGE_KEY = "sc_custom_scholarships";
let isFetchingFromBackend = false;

// Trigger background sync with backend MongoDB
export async function syncScholarshipsFromBackend() {
  if (isFetchingFromBackend) return;
  isFetchingFromBackend = true;
  try {
    const res = await api.get("/scholarships");
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      defaultScholarships.length = 0;
      defaultScholarships.push(...res.data);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("sc_scholarships_updated", { detail: res.data }));
      return res.data;
    }
  } catch (e) {
    console.warn("Backend scholarship sync fallback to cache:", e);
  } finally {
    isFetchingFromBackend = false;
  }
  return defaultScholarships;
}

export function getAllScholarships() {
  // 1. Load from cache for instant render
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        defaultScholarships.length = 0;
        defaultScholarships.push(...parsed);
      }
    }
  } catch (e) {
    console.error("Failed to load scholarships from storage:", e);
  }

  // 2. Fetch fresh data from backend MongoDB asynchronously
  syncScholarshipsFromBackend();

  return defaultScholarships;
}

export async function saveScholarship(scholarship) {
  const current = getAllScholarships();
  let updated;
  
  const existingIndex = current.findIndex((s) => s.id === scholarship.id || s._id === scholarship._id);
  const targetId = scholarship.id || scholarship._id;

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...scholarship,
      updatedAt: new Date().toISOString(),
    };
    // Sync to backend DB
    api.put(`/scholarships/${targetId}`, scholarship).catch(console.warn);
  } else {
    const newId = scholarship.id || "sch-" + Math.random().toString(36).slice(2, 8);
    const newScholarship = {
      ...scholarship,
      id: newId,
      color: scholarship.color || "#4f46e5",
      tag: scholarship.tag || (scholarship.featured ? "Featured" : "Active"),
      createdAt: new Date().toISOString(),
    };
    updated = [newScholarship, ...current];
    // Sync to backend DB
    api.post("/scholarships", newScholarship).catch(console.warn);
  }

  try {
    defaultScholarships.length = 0;
    defaultScholarships.push(...updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_scholarships_updated", { detail: updated }));
  } catch (e) {
    console.error("Failed to persist scholarship:", e);
  }

  return updated;
}

export async function deleteScholarship(scholarshipId) {
  const current = getAllScholarships();
  const updated = current.filter((s) => s.id !== scholarshipId && s._id !== scholarshipId);
  
  // Sync to backend DB
  api.delete(`/scholarships/${scholarshipId}`).catch(console.warn);

  try {
    defaultScholarships.length = 0;
    defaultScholarships.push(...updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_scholarships_updated", { detail: updated }));
  } catch (e) {
    console.error("Failed to delete scholarship:", e);
  }
  return updated;
}

export async function toggleFeaturedScholarship(scholarshipId) {
  const current = getAllScholarships();
  const updated = current.map((s) => {
    if (s.id === scholarshipId || s._id === scholarshipId) {
      const newFeatured = !s.featured;
      return {
        ...s,
        featured: newFeatured,
        tag: newFeatured ? "Featured" : "Live now",
      };
    }
    return s;
  });

  // Sync to backend DB
  api.patch(`/scholarships/${scholarshipId}/toggle-featured`).catch(console.warn);

  try {
    defaultScholarships.length = 0;
    defaultScholarships.push(...updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sc_scholarships_updated", { detail: updated }));
  } catch (e) {}
  return updated;
}

export function resetToDefaultScholarships() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    api.post("/scholarships/reset").catch(() => {});
    window.location.reload();
  } catch (e) {}
  return defaultScholarships;
}
