import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setAuthToken } from "./api.js";
import { normalizeEducation } from "./educationUtils.js";

// Initial seed registered accounts if none in localStorage or during initial bootstrap
export const INITIAL_REGISTERED_USERS = [
  {
    id: "admin-001",
    studentId: "SC-ADMIN-001",
    firstName: "Dr. Rajeshwar",
    lastName: "Rao",
    email: "admin@scholarshipconnect.org",
    phone: "9988776655",
    dateOfBirth: "15 May 1985",
    password: "admin",
    role: "admin",
    isAdmin: true,
    department: "Directorate of Higher Education Scholarships",
    institution: "National Scholarship Evaluation Board",
    bio: "Senior Director supervising merit-cum-means awards, DBT distributions, and student verification across pan-India scholarship pipelines.",
    status: "active",
    joinedDate: "15 Jan 2024",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "stu-001",
    studentId: "SC-2026-IND9021",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    dateOfBirth: "12 Aug 2005",
    password: "password123",
    role: "student",
    isAdmin: false,
    course: "B.Tech Computer Science & AI",
    institution: "Indian Institute of Technology / NIT",
    annualIncome: "₹ 1,80,000",
    gpa: "9.2 CGPA",
    category: "General",
    gender: "Male",
    status: "active",
    joinedDate: "10 Aug 2026",
    followed: ["reliance-ug", "sbi-asha"],
  },
  {
    id: "stu-002",
    studentId: "SC-2026-PP402",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@example.com",
    phone: "9812345678",
    dateOfBirth: "05 May 2004",
    password: "password123",
    role: "student",
    isAdmin: false,
    course: "B.Sc Physics & Electronics",
    institution: "Delhi University",
    annualIncome: "₹ 2,40,000",
    gpa: "8.9 CGPA",
    category: "OBC",
    gender: "Female",
    status: "active",
    joinedDate: "15 Aug 2026",
    followed: ["kotak-kanya", "loreal-stem"],
  },
  {
    id: "stu-004",
    studentId: "SC-2026-5OAP",
    firstName: "Sinchana",
    lastName: "Kotari",
    email: "sinchana.kotari@example.com",
    phone: "9876543210",
    dateOfBirth: "14 Aug 2005",
    password: "password123",
    role: "student",
    isAdmin: false,
    course: "B.Tech Computer Science & AI",
    institution: "National Institute of Engineering / VTU",
    annualIncome: "₹ 1,80,000",
    gpa: "9.4 CGPA",
    category: "OBC",
    gender: "Female",
    status: "active",
    joinedDate: "01 Aug 2026",
    followed: ["reliance-ug", "sbi-asha", "kotak-kanya"],
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load current logged in user from localStorage cache for instant render
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("sc-user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading sc-user from localStorage:", e);
    }
    return null;
  });

  // Load all registered users (for user management & login verification)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem("sc_registered_users");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_REGISTERED_USERS;
  });

  // Auth modal control
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login", // 'login' | 'register'
    redirectPage: null,
  });

  // System Announcement Broadcast (editable by admin)
  const [systemNotice, setSystemNoticeState] = useState(() => {
    try {
      const stored = localStorage.getItem("sc_system_notice");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      active: true,
      text: "📢 National Scholarship Portal 2026–27 applications are open. Complete Aadhaar & DigiLocker e-KYC before submitting!",
      type: "info",
      updatedAt: "07 Oct 2026",
    };
  });

  // Sync session and initial data with backend MongoDB on mount
  useEffect(() => {
    // 1. Validate session with backend /api/auth/me
    const token = localStorage.getItem("sc-token");
    if (token) {
      api.get("/auth/me").then((res) => {
        if (res && res.success && res.user) {
          const isUserAdmin = Boolean(res.user.role === "admin" || res.user.isAdmin);
          const normEdu = normalizeEducation(res.user);
          const normalized = {
            ...res.user,
            course: (res.user.course && res.user.course !== "Undergraduate Degree") ? res.user.course : normEdu.displayStream,
            education: res.user.education || normEdu.educationStage,
            role: isUserAdmin ? "admin" : res.user.role || "student",
            isAdmin: isUserAdmin,
          };
          setUser(normalized);
          try {
            localStorage.setItem("sc-user", JSON.stringify(normalized));
          } catch (e) {}
        }
      }).catch(() => {});
    } else {
      // If user is restored from local storage without token, refresh full profile & favourites from backend
      try {
        const stored = localStorage.getItem("sc-user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.email || parsed.studentId)) {
            api
              .get(
                `/auth/profile?email=${encodeURIComponent(parsed.email || "")}&studentId=${encodeURIComponent(parsed.studentId || "")}`
              )
              .then((res) => {
                if (res && res.success && res.user) {
                  const isUserAdmin = Boolean(res.user.role === "admin" || res.user.isAdmin);
                  const normEdu = normalizeEducation(res.user);
                  const normalized = {
                    ...res.user,
                    course: (res.user.course && res.user.course !== "Undergraduate Degree") ? res.user.course : normEdu.displayStream,
                    education: res.user.education || normEdu.educationStage,
                    role: isUserAdmin ? "admin" : res.user.role || "student",
                    isAdmin: isUserAdmin,
                  };
                  setUser(normalized);
                  try {
                    localStorage.setItem("sc-user", JSON.stringify(normalized));
                  } catch (e) {}
                }
              })
              .catch(() => {});
          }
        }
      } catch (e) {}
    }

    // 2. Load all registered users from backend /api/auth/users
    api.get("/auth/users").then((res) => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRegisteredUsers(res.data);
        try {
          localStorage.setItem("sc_registered_users", JSON.stringify(res.data));
        } catch (e) {}
      }
    }).catch(() => {});

    // 3. Load active system notice from backend /api/notices
    api.get("/notices").then((res) => {
      if (res && res.success && res.data) {
        setSystemNoticeState(res.data);
        try {
          localStorage.setItem("sc_system_notice", JSON.stringify(res.data));
        } catch (e) {}
      }
    }).catch(() => {});
  }, []);

  // Sync registered users to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem("sc_registered_users", JSON.stringify(registeredUsers));
    } catch (e) {
      console.error("Error saving registered users:", e);
    }
  }, [registeredUsers]);

  // Sync current user to localStorage whenever changed
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("sc-user", JSON.stringify(user));
      } else {
        localStorage.removeItem("sc-user");
      }
    } catch (e) {
      console.error("Error syncing sc-user:", e);
    }
  }, [user]);

  // Save current user helper
  const saveUser = useCallback(async (updatedUser) => {
    if (!updatedUser) {
      setUser(null);
      try {
        localStorage.removeItem("sc-user");
      } catch (e) {}
      return;
    }
    const isUserAdmin = Boolean(
      updatedUser.role === "admin" ||
      updatedUser.isAdmin === true ||
      updatedUser.email?.toLowerCase() === "admin@scholarshipconnect.org"
    );
    const normEdu = normalizeEducation(updatedUser);
    const normalizedUser = {
      ...updatedUser,
      degree: updatedUser.degree !== undefined ? updatedUser.degree : "",
      stream: updatedUser.stream !== undefined ? updatedUser.stream : "",
      course: (updatedUser.course && updatedUser.course !== "Undergraduate Degree") ? updatedUser.course : normEdu.displayStream,
      education: updatedUser.education || normEdu.educationStage,
      role: isUserAdmin ? "admin" : updatedUser.role || "student",
      isAdmin: isUserAdmin,
    };
    setUser(normalizedUser);
    try {
      localStorage.setItem("sc-user", JSON.stringify(normalizedUser));
    } catch (e) {}

    setRegisteredUsers((prev) => {
      const exists = prev.some(
        (u) =>
          u.email?.toLowerCase() === normalizedUser.email?.toLowerCase() ||
          u.studentId === normalizedUser.studentId
      );
      if (exists) {
        return prev.map((u) =>
          u.email?.toLowerCase() === normalizedUser.email?.toLowerCase() ||
          u.studentId === normalizedUser.studentId
            ? { ...u, ...normalizedUser }
            : u
        );
      }
      return [normalizedUser, ...prev];
    });

    // Sync to backend MongoDB profile
    try {
      const res = await api.put("/auth/profile", normalizedUser);
      if (res && res.success && res.user) {
        const synced = {
          ...res.user,
          role: isUserAdmin ? "admin" : res.user.role || "student",
          isAdmin: isUserAdmin,
        };
        setUser(synced);
        try {
          localStorage.setItem("sc-user", JSON.stringify(synced));
        } catch (e) {}
        setRegisteredUsers((prev) =>
          prev.map((u) =>
            u.email?.toLowerCase() === synced.email?.toLowerCase() ||
            u.studentId === synced.studentId
              ? { ...u, ...synced }
              : u
          )
        );
        window.dispatchEvent(new CustomEvent("sc_user_updated", { detail: synced }));
      }
    } catch (err) {
      console.warn("Failed to sync profile to database:", err);
    }
  }, []);

  // Login handler
  const login = async (credentials) => {
    if (!credentials) return { success: false, error: "Please enter login credentials." };

    // Try backend authentication via /api/auth/login
    try {
      const res = await api.post("/auth/login", credentials);
      if (res && res.success && res.user) {
        if (res.token) setAuthToken(res.token);
        const isUserAdmin = Boolean(res.user.role === "admin" || res.user.isAdmin);
        const normalized = {
          ...res.user,
          role: isUserAdmin ? "admin" : res.user.role || "student",
          isAdmin: isUserAdmin,
        };
        saveUser(normalized);
        setAuthModal({ isOpen: false, mode: "login", redirectPage: isUserAdmin ? "admin" : null });
        return { success: true, user: normalized };
      } else if (res && res.error && !res.networkError) {
        return { success: false, error: res.error };
      }
    } catch (err) {
      console.warn("Backend login network error, attempting local fallback:", err);
    }

    // Fallback: Local authentication logic if offline
    const identifier = (credentials.identifier || credentials.email || credentials.phone || "").trim().toLowerCase();
    const password = (credentials.password || "").trim();

    const isAdminIdentifier =
      identifier === "admin" ||
      identifier === "admin@scholarshipconnect.org" ||
      identifier === "sc-admin-001" ||
      identifier === "admin-001";

    if (isAdminIdentifier) {
      if (password && password !== "admin" && password !== "admin123") {
        return { success: false, error: "Incorrect admin password. (Demo password is 'admin')" };
      }
      const adminAcc = {
        ...INITIAL_REGISTERED_USERS[0],
        role: "admin",
        isAdmin: true,
        password: "admin",
      };
      saveUser(adminAcc);
      setAuthModal({ isOpen: false, mode: "login", redirectPage: "admin" });
      return { success: true, user: adminAcc };
    }

    const matched = registeredUsers.find(
      (u) =>
        u.email?.toLowerCase() === identifier ||
        u.studentId?.toLowerCase() === identifier ||
        u.id?.toLowerCase() === identifier ||
        u.phone?.replace(/[^0-9]/g, "") === identifier.replace(/[^0-9]/g, "")
    );

    if (matched) {
      if (matched.status === "suspended") {
        return { success: false, error: "This account has been suspended by administration. Please contact support." };
      }
      const isUserAdmin = matched.role === "admin" || matched.isAdmin === true;
      const loggedInUser = {
        ...matched,
        role: isUserAdmin ? "admin" : matched.role || "student",
        isAdmin: isUserAdmin,
      };
      saveUser(loggedInUser);
      setAuthModal({ isOpen: false, mode: "login", redirectPage: isUserAdmin ? "admin" : null });
      return { success: true, user: loggedInUser };
    }

    // Auto-create local fallback student
    const autoUser = {
      id: "stu-" + Math.random().toString(36).slice(2, 8),
      studentId: "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      firstName: "Student",
      lastName: "User",
      email: identifier.includes("@") ? identifier : `${identifier}@scholarshipconnect.edu`,
      phone: identifier.includes("@") ? "+91 98765 43210" : identifier,
      password: password || "password123",
      role: "student",
      isAdmin: false,
      course: "Undergraduate Degree",
      institution: "State University",
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      followed: [],
    };

    setRegisteredUsers((prev) => [autoUser, ...prev]);
    saveUser(autoUser);
    setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
    return { success: true, user: autoUser };
  };

  // Register new account handler
  const register = async (registrationData) => {
    if (!registrationData.email || !registrationData.firstName) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Call backend /api/auth/register
    try {
      const res = await api.post("/auth/register", registrationData);
      if (res && res.success && res.user) {
        if (res.token) setAuthToken(res.token);
        saveUser(res.user);
        setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
        return { success: true, user: res.user };
      } else if (res && res.error && !res.networkError) {
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn("Backend registration error, fallback to local:", e);
    }

    // Local fallback registration
    const cleanEmail = registrationData.email.trim().toLowerCase();
    const isExplicitAdmin = registrationData.role === "admin" || cleanEmail.includes("admin@scholarshipconnect");

    const newStudent = {
      id: (isExplicitAdmin ? "admin-" : "stu-") + Math.random().toString(36).slice(2, 8),
      studentId: isExplicitAdmin
        ? "SC-ADMIN-" + Math.random().toString(36).slice(2, 6).toUpperCase()
        : "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      firstName: registrationData.firstName.trim(),
      lastName: (registrationData.lastName || "").trim(),
      email: cleanEmail,
      phone: (registrationData.phone || "+91 98765 43210").trim(),
      dateOfBirth: registrationData.dateOfBirth || "12 Aug 2005",
      password: registrationData.password || "password123",
      role: isExplicitAdmin ? "admin" : "student",
      isAdmin: isExplicitAdmin,
      course: registrationData.course || "Undergraduate Degree",
      institution: registrationData.institution || "State University",
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      followed: [],
    };

    setRegisteredUsers((prev) => [newStudent, ...prev]);
    saveUser(newStudent);
    setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
    return { success: true, user: newStudent };
  };

  // One-click quick demo login as Admin
  const loginAsAdmin = async () => {
    if (user && !user.isAdmin && user.role !== "admin" && user.email) {
      try {
        localStorage.setItem("sc-last-student-email", user.email);
        localStorage.setItem("sc-last-student-id", user.studentId || "");
        localStorage.setItem("sc-last-student-user", JSON.stringify(user));
      } catch (e) {}
    }

    const res = await login({ identifier: "admin", password: "admin" });
    if (res && res.success) {
      setAuthModal({ isOpen: false, mode: "login", redirectPage: "admin" });
      return res.user;
    }

    const adminAcc = {
      ...INITIAL_REGISTERED_USERS[0],
      role: "admin",
      isAdmin: true,
      password: "admin",
    };
    await saveUser(adminAcc);
    setAuthModal({ isOpen: false, mode: "login", redirectPage: "admin" });
    return adminAcc;
  };

  // Grant admin privileges to current user without changing account identity
  const enableAdminPrivileges = async () => {
    if (!user) return loginAsAdmin();
    const updated = { ...user, role: "admin", isAdmin: true };
    await saveUser(updated);
    return updated;
  };

  // One-click quick demo login as Student
  const loginAsStudent = async (email) => {
    let target = email;
    if (!target) {
      try {
        target = localStorage.getItem("sc-last-student-email");
      } catch (e) {}
    }
    let targetId = null;
    try {
      targetId = localStorage.getItem("sc-last-student-id");
    } catch (e) {}

    // First try fetching fresh profile from backend DB
    if (target || targetId) {
      try {
        const pRes = await api.get(`/auth/profile?email=${encodeURIComponent(target || "")}&studentId=${encodeURIComponent(targetId || "")}`);
        if (pRes && pRes.success && pRes.user) {
          const syncedStu = { ...pRes.user, role: "student", isAdmin: false };
          await saveUser(syncedStu);
          setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
          return syncedStu;
        }
      } catch (e) {}
    }

    const finalTarget = target || "sinchana.kotari@example.com";
    const res = await login({ identifier: finalTarget, password: "password123" });
    if (res && res.success) {
      const studentUser = { ...res.user, role: "student", isAdmin: false };
      await saveUser(studentUser);
      setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
      return studentUser;
    }

    // Try finding cached student from last session
    try {
      const lastRaw = localStorage.getItem("sc-last-student-user");
      if (lastRaw) {
        const parsedLast = JSON.parse(lastRaw);
        if (parsedLast && parsedLast.email) {
          const restoredStu = { ...parsedLast, role: "student", isAdmin: false };
          await saveUser(restoredStu);
          setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
          return restoredStu;
        }
      }
    } catch (e) {}

    const stu =
      registeredUsers.find((u) => u.email?.toLowerCase() === finalTarget.toLowerCase()) ||
      INITIAL_REGISTERED_USERS[3] ||
      INITIAL_REGISTERED_USERS[1];
    const fallbackStu = { ...stu, role: "student", isAdmin: false };
    await saveUser(fallbackStu);
    setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
    return fallbackStu;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("sc-user");
  };

  // Profile update handler
  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
  };

  // Admin User Management Helpers
  const addUser = async (newUserData) => {
    try {
      const res = await api.post("/auth/users", newUserData);
      if (res && res.success && res.user) {
        setRegisteredUsers((prev) => [res.user, ...prev]);
        return res.user;
      }
    } catch (e) {}

    const newUser = {
      id: "usr-" + Math.random().toString(36).slice(2, 8),
      studentId: (newUserData.role === "admin" ? "SC-ADMIN-" : "SC-2026-") + Math.random().toString(36).slice(2, 6).toUpperCase(),
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      followed: [],
      ...newUserData,
    };
    setRegisteredUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUserRole = async (userIdOrEmail, newRole) => {
    api.put(`/auth/users/${userIdOrEmail}/role`, { role: newRole }).catch(console.warn);

    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.id === userIdOrEmail || u.email === userIdOrEmail || u.studentId === userIdOrEmail || u._id === userIdOrEmail) {
          const updated = { ...u, role: newRole, isAdmin: newRole === "admin" };
          if (user && (user.id === u.id || user.email === u.email || user._id === u._id)) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const toggleUserStatus = async (userIdOrEmail) => {
    api.put(`/auth/users/${userIdOrEmail}/status`, {}).catch(console.warn);

    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.id === userIdOrEmail || u.email === userIdOrEmail || u.studentId === userIdOrEmail || u._id === userIdOrEmail) {
          const nextStatus = u.status === "suspended" ? "active" : "suspended";
          const updated = { ...u, status: nextStatus };
          if (user && (user.id === u.id || user.email === u.email || user._id === u._id)) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = async (userIdOrEmail) => {
    api.delete(`/auth/users/${userIdOrEmail}`).catch(console.warn);

    setRegisteredUsers((prev) =>
      prev.filter((u) => u.id !== userIdOrEmail && u.email !== userIdOrEmail && u.studentId !== userIdOrEmail && u._id !== userIdOrEmail)
    );
    if (user && (user.id === userIdOrEmail || user.email === userIdOrEmail || user._id === userIdOrEmail)) {
      logout();
    }
  };

  // Broadcast Notification Banner
  const updateSystemNotice = async (text, type = "info", active = true) => {
    const newNotice = {
      active,
      text,
      type,
      updatedAtFormatted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setSystemNoticeState(newNotice);
    try {
      localStorage.setItem("sc_system_notice", JSON.stringify(newNotice));
    } catch (e) {}

    // Persist to backend MongoDB
    api.post("/notices", newNotice).catch(console.warn);
  };

  // Toggle favourite scholarship helper (MongoDB + Local sync)
  const toggleFavorite = async (scholarshipId) => {
    if (!scholarshipId) return { success: false };
    if (!user) {
      openLogin();
      return { success: false, requireAuth: true };
    }

    const currentFavs = Array.isArray(user.favorites) ? user.favorites : [];
    const isFav = currentFavs.includes(scholarshipId);
    const updatedFavs = isFav
      ? currentFavs.filter((id) => id !== scholarshipId)
      : Array.from(new Set([...currentFavs, scholarshipId]));

    const updatedUser = { ...user, favorites: updatedFavs };
    saveUser(updatedUser);

    try {
      const res = await api.post("/auth/favorites/toggle", {
        scholarshipId,
        studentId: user.studentId,
        email: user.email,
        userId: user._id,
      });
      if (res && res.success && Array.isArray(res.favorites)) {
        const syncedUser = { ...user, favorites: res.favorites };
        saveUser(syncedUser);
        return { success: true, isFavorite: res.isFavorite, favorites: res.favorites };
      }
    } catch (e) {
      console.warn("Backend toggle favorite error, local state retained:", e);
    }

    return { success: true, isFavorite: !isFav, favorites: updatedFavs };
  };

  const isFavorite = (scholarshipId) => {
    if (!user || !Array.isArray(user.favorites)) return false;
    return user.favorites.includes(scholarshipId);
  };

  // Modal open/close helpers
  const openLogin = (redirectPage = null) => {
    setAuthModal({ isOpen: true, mode: "login", redirectPage });
  };

  const openRegister = () => {
    setAuthModal({ isOpen: true, mode: "register", redirectPage: null });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: "login", redirectPage: null });
  };

  const switchAuthMode = (mode) => {
    setAuthModal((prev) => ({ ...prev, mode }));
  };

  const isAuthenticated = Boolean(user);
  // Admin update student details helper
  const updateStudent = async (studentIdOrEmail, updates) => {
    try {
      const res = await api.put(`/auth/users/${encodeURIComponent(studentIdOrEmail)}`, updates);
      if (res && res.success && res.user) {
        const synced = res.user;
        setRegisteredUsers((prev) =>
          prev.map((u) =>
            u.studentId === synced.studentId ||
            u.email?.toLowerCase() === synced.email?.toLowerCase() ||
            u._id === synced._id
              ? { ...u, ...synced }
              : u
          )
        );
        if (
          user &&
          (user.studentId === synced.studentId ||
            user.email?.toLowerCase() === synced.email?.toLowerCase() ||
            user._id === synced._id)
        ) {
          setUser((prev) => ({ ...prev, ...synced }));
          try {
            localStorage.setItem("sc-user", JSON.stringify({ ...user, ...synced }));
          } catch (e) {}
        }
        window.dispatchEvent(new CustomEvent("sc_user_updated", { detail: synced }));
        return { success: true, user: synced };
      }
    } catch (e) {
      console.warn("Failed to update student by admin:", e);
    }
    return { success: false };
  };

  const isAdmin = Boolean(
    user && (user.role === "admin" || user.isAdmin === true || user.email?.toLowerCase().includes("admin@"))
  );

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    role: user?.role || (isAuthenticated ? "student" : "guest"),
    allUsers: registeredUsers,
    registeredUsers,
    authModal,
    systemNotice,
    login,
    loginAsAdmin,
    enableAdminPrivileges,
    loginAsStudent,
    logout,
    register,
    updateUser,
    updateStudent,
    save: saveUser,
    addUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    updateSystemNotice,
    toggleFavorite,
    isFavorite,
    openLogin,
    openRegister,
    closeAuthModal,
    switchAuthMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to consume AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
