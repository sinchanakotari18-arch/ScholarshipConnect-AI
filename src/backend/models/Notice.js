const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "urgent", "success"],
      default: "info",
    },
    active: {
      type: Boolean,
      default: true,
    },
    updatedAtFormatted: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notice", noticeSchema);
