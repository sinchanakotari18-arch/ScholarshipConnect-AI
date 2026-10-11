const mongoose = require("mongoose");

const awardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentEmail: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Academic Excellence",
    },
    dateConferred: {
      type: String,
      default: "",
    },
    standing: {
      type: String,
      default: "",
    },
    prizeValue: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    certificateRef: {
      type: String,
      default: "",
    },
    badgeColor: {
      type: String,
      default: "#10b981",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Award", awardSchema);
