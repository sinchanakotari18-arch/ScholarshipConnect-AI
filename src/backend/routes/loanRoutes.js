const express = require("express");
const LoanInquiry = require("../models/LoanInquiry");

const router = express.Router();

// GET all loan inquiries
router.get("/", async (req, res) => {
  try {
    const { studentId, studentEmail } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();

    const inquiries = await LoanInquiry.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch loan inquiries", error: error.message });
  }
});

// POST new loan inquiry
router.post("/", async (req, res) => {
  try {
    const inquiry = await LoanInquiry.create(req.body);
    res.status(201).json({
      success: true,
      message: "Loan inquiry submitted successfully! A banking advisor will reach out to you within 24 hours.",
      data: inquiry,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to submit loan inquiry", error: error.message });
  }
});

module.exports = router;
