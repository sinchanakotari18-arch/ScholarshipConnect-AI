const express = require("express");
const Award = require("../models/Award");

const router = express.Router();

// GET all awards for a student
router.get("/", async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;

    const awards = await Award.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: awards.length,
      data: awards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch awards",
      error: error.message,
    });
  }
});

// POST new award
router.post("/", async (req, res) => {
  try {
    const payload = {
      id: "awd-" + Math.random().toString(36).slice(2, 9),
      ...req.body,
    };

    const award = await Award.create(payload);

    res.status(201).json({
      success: true,
      message: "Award recorded successfully",
      data: award,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to record award",
      error: error.message,
    });
  }
});

// DELETE award
router.delete("/:id", async (req, res) => {
  try {
    const query = { $or: [{ id: req.params.id }, { _id: req.params.id }] };
    const deleted = await Award.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Award not found" });
    }

    res.status(200).json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete award",
      error: error.message,
    });
  }
});

module.exports = router;
