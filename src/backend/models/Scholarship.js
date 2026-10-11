const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    amount: {
      type: String,
      default: "",
    },
    amountNumeric: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: String,
      default: "",
    },
    deadlineDays: {
      type: Number,
      default: 30,
    },
    eligibility: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "Undergraduate",
    },
    state: {
      type: String,
      default: "All India",
    },
    category: {
      type: String,
      default: "General",
    },
    course: {
      type: String,
      default: "All Streams",
    },
    gender: {
      type: String,
      default: "All",
    },
    color: {
      type: String,
      default: "#1467d8",
    },
    tag: {
      type: String,
      default: "Active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    incomeLimit: {
      type: String,
      default: "",
    },
    minMarks: {
      type: String,
      default: "",
    },
    documentsRequired: {
      type: [String],
      default: [],
    },
    officialUrl: {
      type: String,
      default: "",
    },
    applicationLink: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);
