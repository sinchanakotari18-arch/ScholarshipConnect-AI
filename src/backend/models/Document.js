const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
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
    docType: {
      type: String,
      default: "Other Document",
    },
    docNumber: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "document.pdf",
    },
    fileSize: {
      type: String,
      default: "1.2 MB",
    },
    uploadDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    expiryDate: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "Self-Uploaded",
    },
    dataUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Document", documentSchema);
