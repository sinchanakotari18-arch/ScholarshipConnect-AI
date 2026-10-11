const express = require("express");
const Application = require("../models/Application");
const { optionalAuthMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET all applications or filter by studentId / email
router.get("/", async (req, res) => {
  try {
    const { studentId, studentEmail } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();

    const applications = await Application.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

// GET single application
router.get("/:id", async (req, res) => {
  try {
    const query = { $or: [{ id: req.params.id }, { _id: req.params.id }] };
    const app = await Application.findOne(query);

    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch application", error: error.message });
  }
});

// POST new application
router.post("/", optionalAuthMiddleware, async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user?.studentId || "SC-2026-5OAP";
    const studentName = req.body.studentName || (req.user ? `${req.user.firstName} ${req.user.lastName || ""}`.trim() : "Sinchana Kotari");
    const studentEmail = req.body.studentEmail || req.user?.email || "sinchana.kotari@example.com";

    const payload = {
      id: "APP-2026-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Submitted",
      statusStage: 1,
      aiMatchScore: Math.floor(85 + Math.random() * 14),
      studentId,
      studentName,
      studentEmail,
      ...req.body,
    };

    const application = await Application.create(payload);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

// PUT update application (status, stage, notes)
router.put("/:id", async (req, res) => {
  try {
    const query = { $or: [{ id: req.params.id }, { _id: req.params.id }] };
    const updated = await Application.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update application",
      error: error.message,
    });
  }
});

// DELETE application
router.delete("/:id", async (req, res) => {
  try {
    const query = { $or: [{ id: req.params.id }, { _id: req.params.id }] };
    const deleted = await Application.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message,
    });
  }
});

module.exports = router;
