const express = require("express");
const Scholarship = require("../models/Scholarship");

const router = express.Router();

// GET all scholarships
router.get("/", async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scholarships",
      error: error.message,
    });
  }
});

// GET single scholarship by ID or Mongo _id
router.get("/:id", async (req, res) => {
  try {
    let scholarship = null;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);

    if (isMongoId) {
      scholarship = await Scholarship.findById(req.params.id);
    }
    if (!scholarship) {
      scholarship = await Scholarship.findOne({ id: req.params.id });
    }

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scholarship",
      error: error.message,
    });
  }
});

// POST new scholarship
router.post("/", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      id: req.body.id || "sch-" + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
    };

    const scholarship = await Scholarship.create(payload);

    res.status(201).json({
      success: true,
      message: "Scholarship created successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create scholarship",
      error: error.message,
    });
  }
});

// PUT update scholarship
router.put("/:id", async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { $or: [{ _id: req.params.id }, { id: req.params.id }] } : { id: req.params.id };

    const scholarship = await Scholarship.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true }
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scholarship updated successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update scholarship",
      error: error.message,
    });
  }
});

// PATCH toggle featured
router.patch("/:id/toggle-featured", async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { $or: [{ _id: req.params.id }, { id: req.params.id }] } : { id: req.params.id };

    const existing = await Scholarship.findOne(query);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    const newFeatured = !existing.featured;
    existing.featured = newFeatured;
    existing.tag = newFeatured ? "Featured" : "Live now";
    await existing.save();

    res.status(200).json({
      success: true,
      message: "Featured status toggled",
      data: existing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle status", error: error.message });
  }
});

// DELETE scholarship
router.delete("/:id", async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { $or: [{ _id: req.params.id }, { id: req.params.id }] } : { id: req.params.id };

    const scholarship = await Scholarship.findOneAndDelete(query);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Scholarship deleted successfully",
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete scholarship",
      error: error.message,
    });
  }
});

module.exports = router;
