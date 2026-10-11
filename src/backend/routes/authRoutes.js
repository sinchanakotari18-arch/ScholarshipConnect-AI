const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, studentId: user.studentId, role: user.role, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, phone, password, role, course, institution, dateOfBirth } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({ success: false, message: "First name and email are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const isExplicitAdmin = Boolean(
      role === "admin" || cleanEmail.includes("admin@scholarshipconnect")
    );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const studentId = isExplicitAdmin
      ? "SC-ADMIN-" + Math.random().toString(36).slice(2, 6).toUpperCase()
      : "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const newUser = await User.create({
      id: (isExplicitAdmin ? "admin-" : "stu-") + Math.random().toString(36).slice(2, 8),
      studentId,
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      email: cleanEmail,
      phone: (phone || "+91 98765 43210").trim(),
      dateOfBirth: dateOfBirth || "12 Aug 2005",
      password: hashedPassword,
      role: isExplicitAdmin ? "admin" : "student",
      isAdmin: isExplicitAdmin,
      course: course || "Undergraduate Degree",
      institution: institution || "State University",
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      user: userObj,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const cleanId = (identifier || email || phone || "").trim().toLowerCase();

    if (!cleanId) {
      return res.status(400).json({ success: false, message: "Please provide an email, student ID, or phone number" });
    }

    // Admin direct shortcut check ('admin', 'admin@scholarshipconnect.org', 'sc-admin-001')
    const isAdminId =
      cleanId === "admin" ||
      cleanId === "admin@scholarshipconnect.org" ||
      cleanId === "sc-admin-001" ||
      cleanId === "admin-001";

    let user;
    if (isAdminId) {
      user = await User.findOne({
        $or: [
          { role: "admin" },
          { email: "admin@scholarshipconnect.org" },
          { studentId: "SC-ADMIN-001" },
        ],
      });
    } else {
      user = await User.findOne({
        $or: [
          { email: cleanId },
          { studentId: { $regex: new RegExp(`^${cleanId}$`, "i") } },
          { phone: cleanId },
          { id: cleanId },
        ],
      });
    }

    // Auto-create user if not found yet (seamless first-time student onboarding as supported in original app)
    if (!user) {
      if (isAdminId) {
        // Create initial admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin", salt);
        user = await User.create({
          id: "admin-001",
          studentId: "SC-ADMIN-001",
          firstName: "Dr. Rajeshwar",
          lastName: "Rao",
          email: "admin@scholarshipconnect.org",
          phone: "9988776655",
          password: hashedPassword,
          role: "admin",
          isAdmin: true,
          department: "Directorate of Higher Education Scholarships",
          institution: "National Scholarship Evaluation Board",
          bio: "Senior Director supervising merit-cum-means awards, DBT distributions, and student verification across pan-India scholarship pipelines.",
          status: "active",
        });
      } else {
        const namePart = cleanId.split("@")[0].replace(/[._-]/g, " ");
        const words = namePart.split(" ").filter(Boolean);
        const firstName = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : "Student";
        const lastName = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : "User";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || "password123", salt);

        user = await User.create({
          id: "stu-" + Math.random().toString(36).slice(2, 8),
          studentId: "SC-2026-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          firstName,
          lastName,
          email: cleanId.includes("@") ? cleanId : `${cleanId}@scholarshipconnect.edu`,
          phone: cleanId.includes("@") ? "+91 98765 43210" : cleanId,
          password: hashedPassword,
          role: "student",
          isAdmin: false,
          course: "Undergraduate Degree",
          institution: "State University",
          status: "active",
        });
      }
    }

    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "This account has been suspended by administration." });
    }

    // Password validation: match bcrypt or plaintext fallback for seeded accounts
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isMatch && user.password !== password) {
        // Special case: if demo admin password is 'admin' or 'admin123'
        if (user.role === "admin" && (password === "admin" || password === "admin123")) {
          // allow demo login
        } else if (password === "password123") {
          // allow demo login
        } else {
          return res.status(400).json({ success: false, message: "Incorrect password. Please verify and try again." });
        }
      }
    }

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userObj,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

// GET /api/auth/me - Validate token and return current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
  }
});

// GET /api/auth/profile - Fetch profile by studentId, email, or authenticated session
router.get("/profile", async (req, res) => {
  try {
    const { studentId, email, id, _id } = req.query;
    let query = null;
    const mongoose = require("mongoose");
    if (_id && mongoose.Types.ObjectId.isValid(_id)) query = { _id };
    else if (studentId) query = { studentId };
    else if (email) query = { email: email.toLowerCase() };
    else if (id) query = { id };
    else if (_id) query = { id: _id };

    if (!query) {
      return res.status(400).json({ success: false, message: "Identifier required" });
    }

    const user = await User.findOne(query).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
});

// PUT /api/auth/profile - Update current user profile / settings
router.put("/profile", async (req, res) => {
  try {
    const { _id, id, studentId, email, ...updates } = req.body;
    const mongoose = require("mongoose");
    
    // Find by _id (if valid), studentId, email, or id
    let query = null;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) query = { _id };
    else if (studentId) query = { studentId };
    else if (email) query = { email: email.toLowerCase() };
    else if (id) query = { id };
    else if (_id) query = { id: _id };

    if (!query) {
      return res.status(400).json({ success: false, message: "Identifier required" });
    }

    // Never overwrite password directly through profile endpoint unless explicitly requested
    delete updates.password;

    let updatedUser = await User.findOneAndUpdate(query, { $set: updates }, { new: true }).select("-password");
    if (!updatedUser && (studentId || email)) {
      // Fallback search by other identifiers
      const altQuery = studentId ? { studentId } : { email: email?.toLowerCase() };
      updatedUser = await User.findOneAndUpdate(altQuery, { $set: updates }, { new: true }).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
});

// POST /api/auth/favorites/toggle - Add or remove favourite scholarship for user
router.post("/favorites/toggle", async (req, res) => {
  try {
    const { scholarshipId, userId, studentId, email } = req.body;
    if (!scholarshipId) {
      return res.status(400).json({ success: false, message: "Scholarship ID is required" });
    }

    let user;
    if (email) user = await User.findOne({ email: email.toLowerCase() });
    if (!user && studentId) user = await User.findOne({ studentId });
    if (!user && userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user) user = await User.findOne({ id: userId });
    }
    if (!user && req.user) user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentFavs = Array.isArray(user.favorites) ? user.favorites : [];
    const isFav = currentFavs.includes(scholarshipId);

    let updatedFavs;
    if (isFav) {
      updatedFavs = currentFavs.filter((id) => id !== scholarshipId);
    } else {
      // Store only once - no duplicates
      updatedFavs = Array.from(new Set([...currentFavs, scholarshipId]));
    }

    user.favorites = updatedFavs;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      isFavorite: !isFav,
      favorites: updatedFavs,
      user: userObj,
      message: isFav ? "Removed from favourites" : "Added to favourites",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle favourite", error: error.message });
  }
});

// GET /api/auth/favorites - Get all favourite IDs for user
router.get("/favorites", async (req, res) => {
  try {
    const { studentId, email, userId } = req.query;
    let user;
    if (email) user = await User.findOne({ email: email.toLowerCase() }).select("favorites");
    if (!user && studentId) user = await User.findOne({ studentId }).select("favorites");
    if (!user && userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId).select("favorites");
      }
      if (!user) user = await User.findOne({ id: userId }).select("favorites");
    }
    if (!user && req.user) user = await User.findById(req.user._id).select("favorites");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch favourites", error: error.message });
  }
});

// GET /api/auth/users - Get all registered users (Admin / User management)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
});

// POST /api/auth/users - Add user (Admin)
router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password, ...rest } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    const newUser = await User.create({
      id: "usr-" + Math.random().toString(36).slice(2, 8),
      studentId: (role === "admin" ? "SC-ADMIN-" : "SC-2026-") + Math.random().toString(36).slice(2, 6).toUpperCase(),
      firstName: (firstName || "").trim(),
      lastName: (lastName || "").trim(),
      email: cleanEmail,
      phone: phone || "+91 98765 43210",
      password: hashedPassword,
      role: role || "student",
      isAdmin: role === "admin",
      status: "active",
      ...rest,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create user", error: error.message });
  }
});

// PUT /api/auth/users/:id - Update student / user details (Admin)
router.put("/users/:id", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const idParam = req.params.id;
    const query = {
      $or: [
        ...(mongoose.Types.ObjectId.isValid(idParam) ? [{ _id: idParam }] : []),
        { id: idParam },
        { studentId: idParam },
        { email: idParam.toLowerCase() },
      ],
    };

    const updates = { ...req.body };
    delete updates.password;
    if (updates.role) {
      updates.isAdmin = updates.role === "admin";
    }

    const user = await User.findOneAndUpdate(query, { $set: updates }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
});

// PUT /api/auth/users/:id/role - Update user role (Admin)
router.put("/users/:id/role", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { role } = req.body;
    const idParam = req.params.id;
    const query = {
      $or: [
        ...(mongoose.Types.ObjectId.isValid(idParam) ? [{ _id: idParam }] : []),
        { id: idParam },
        { studentId: idParam },
        { email: idParam.toLowerCase() },
      ],
    };
    const user = await User.findOneAndUpdate(
      query,
      { role, isAdmin: role === "admin" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update role", error: error.message });
  }
});

// PUT /api/auth/users/:id/status - Toggle active/suspended (Admin)
router.put("/users/:id/status", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const idParam = req.params.id;
    const query = {
      $or: [
        ...(mongoose.Types.ObjectId.isValid(idParam) ? [{ _id: idParam }] : []),
        { id: idParam },
        { studentId: idParam },
        { email: idParam.toLowerCase() },
      ],
    };
    const existing = await User.findOne(query);
    if (!existing) return res.status(404).json({ success: false, message: "User not found" });

    const newStatus = existing.status === "suspended" ? "active" : "suspended";
    existing.status = newStatus;
    await existing.save();

    const userObj = existing.toObject();
    delete userObj.password;
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle status", error: error.message });
  }
});

// DELETE /api/auth/users/:id - Delete user (Admin)
router.delete("/users/:id", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const idParam = req.params.id;
    const query = {
      $or: [
        ...(mongoose.Types.ObjectId.isValid(idParam) ? [{ _id: idParam }] : []),
        { id: idParam },
        { studentId: idParam },
        { email: idParam.toLowerCase() },
      ],
    };
    const user = await User.findOneAndDelete(query);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
});

module.exports = router;
