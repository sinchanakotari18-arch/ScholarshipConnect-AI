const mongoose = require("mongoose");

const loanInquirySchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      default: "",
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      default: "",
    },
    studentPhone: {
      type: String,
      default: "",
    },
    bank: {
      type: String,
      required: true,
    },
    scheme: {
      type: String,
      default: "",
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    course: {
      type: String,
      default: "",
    },
    institute: {
      type: String,
      default: "",
    },
    coApplicantIncome: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "In Review",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoanInquiry", loanInquirySchema);
