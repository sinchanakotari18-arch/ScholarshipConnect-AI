const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
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
    studentName: {
      type: String,
      default: "",
    },
    studentEmail: {
      type: String,
      default: "",
    },
    scholarshipId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    appliedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    deadline: {
      type: String,
      default: "",
    },
    awardAmount: {
      type: String,
      default: "",
    },
    awardAmountNumeric: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Submitted",
    },
    statusStage: {
      type: Number,
      default: 1, // 1: Submitted, 2: Under Review, 3: Shortlisted, 4: Approved/Disbursed, 5: Rejected
    },
    academicScore: {
      type: String,
      default: "",
    },
    annualIncome: {
      type: String,
      default: "",
    },
    targetInstitution: {
      type: String,
      default: "",
    },
    attachedDocuments: {
      type: [String],
      default: [],
    },
    applicationNotes: {
      type: String,
      default: "",
    },
    aiMatchScore: {
      type: Number,
      default: 90,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Application", applicationSchema);
