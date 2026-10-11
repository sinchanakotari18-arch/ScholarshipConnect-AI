const express = require("express");
const Notice = require("../models/Notice");

const router = express.Router();

// GET active notice
router.get("/", async (req, res) => {
  try {
    let notice = await Notice.findOne({ active: true }).sort({ updatedAt: -1 });
    if (!notice) {
      notice = {
        active: true,
        text: "📢 National Scholarship Portal 2026–27 applications are open. Complete Aadhaar & DigiLocker e-KYC before submitting!",
        type: "info",
        updatedAtFormatted: "07 Oct 2026",
      };
    }
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notice", error: error.message });
  }
});

// POST / PUT update notice
router.post("/", async (req, res) => {
  try {
    const { text, type, active } = req.body;
    
    // Deactivate previous active notices
    await Notice.updateMany({}, { active: false });

    const newNotice = await Notice.create({
      text,
      type: type || "info",
      active: active !== undefined ? active : true,
      updatedAtFormatted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });

    res.status(201).json({
      success: true,
      message: "System announcement updated",
      data: newNotice,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update notice", error: error.message });
  }
});

module.exports = router;
