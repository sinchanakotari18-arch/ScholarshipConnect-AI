const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      default: "",
    },
    institution: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      default: "Undergraduate Degree",
    },
    degree: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "Undergraduate",
    },
    stream: {
      type: String,
      default: "",
    },
    annualIncome: {
      type: String,
      default: "",
    },
    gpa: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    gender: {
      type: String,
      default: "Female",
    },
    state: {
      type: String,
      default: "Karnataka",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    joinedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    avatar: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    aadhaar: {
      type: String,
      default: "",
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    whatsapp: {
      type: String,
      default: "",
    },
    favorites: {
      type: [String],
      default: [],
    },
    followed: {
      type: [String],
      default: [],
    },
    streamAssessment: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notificationPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        whatsappAlerts: true,
        whatsappNumber: "",
        emailFrequency: "daily",
        documentExpiryAlert: true,
        statusPush: true,
        smsAlerts: false,
      }),
    },
    securitySettings: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        twoFactor: true,
        autoLockMins: "15",
        biometricLogin: false,
      }),
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("User", userSchema);
