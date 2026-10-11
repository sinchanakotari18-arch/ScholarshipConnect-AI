const express = require("express");
const Document = require("../models/Document");

const router = express.Router();

// GET all documents for a student
router.get("/", async (req, res) => {
  try {
    const { studentId, studentEmail } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();

    const docs = await Document.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
});

// POST new document upload
router.post("/", async (req, res) => {
  try {
    const payload = {
      id: "doc_" + Math.random().toString(36).slice(2, 9),
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...req.body,
    };

    const doc = await Document.create(payload);

    res.status(201).json({
      success: true,
      message: "Document saved successfully",
      data: doc,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to save document",
      error: error.message,
    });
  }
});

// DELETE document
router.delete("/:id", async (req, res) => {
  try {
    const query = { $or: [{ id: req.params.id }, { _id: req.params.id }] };
    const deleted = await Document.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
});

module.exports = router;
