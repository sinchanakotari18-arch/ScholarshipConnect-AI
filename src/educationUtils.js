/**
 * Centralized Education Qualification Normalization and Matching Utility
 * for ScholarshipConnect AI.
 *
 * Normalizes education levels, degree streams, and handles equivalences
 * (such as B.Tech / B.E -> Engineering -> Undergraduate Degree) across
 * Profile, Eligibility Checker, Recommendations, and Search.
 */

// Canonical course streams
export const COURSE_STREAMS = {
  ENGINEERING: "Engineering",
  MEDICAL: "Medical",
  SCIENCE: "Science",
  COMMERCE: "Commerce",
  MANAGEMENT: "Management",
  ARTS: "Arts",
  LAW: "Law",
  AGRICULTURE: "Agriculture",
  ARCHITECTURE: "Architecture",
  DIPLOMA: "Diploma",
  ALL: "All Streams",
};

// Canonical education stages
export const EDUCATION_STAGES = {
  CLASS_10: "Class 10",
  CLASS_11: "Class 11",
  CLASS_12: "Class 12",
  UNDERGRADUATE: "Undergraduate",
  POSTGRADUATE: "Postgraduate",
  DIPLOMA: "Diploma",
  DOCTORATE: "Doctorate",
  ALL: "All",
};

/**
 * Normalizes education qualification details from any profile or input string.
 *
 * @param {Object|string} input - user profile object OR raw degree/course string
 * @returns {Object} normalized education descriptor
 */
export function normalizeEducation(input) {
  const profile = typeof input === "string" 
    ? { degree: input, course: input, stream: input }
    : input || {};

  const degree = (profile.degree || profile.qualification || "").trim();
  const stream = (profile.stream || "").trim();
  const course = (profile.course || "").trim();
  const education = (profile.education || "").trim();

  // Combine textual signals for heuristic classification
  const combinedText = `${degree} ${stream} ${course} ${education}`.toLowerCase();

  let courseStream = "All Streams";
  let displayStream = "Undergraduate Degree";
  let isEngineering = false;
  let isMedical = false;
  let isScience = false;
  let isCommerce = false;
  let isManagement = false;
  let isArts = false;
  let isDiploma = false;

  // Pattern detection regexes
  const engineeringPattern = /(?:b\.?\s*tech|b\.?\s*e\b|btech|be\b|bachelor\s+of\s+(?:engineering|technology)|m\.?\s*tech|m\.?\s*e\b|mtech|master\s+of\s+(?:engineering|technology)|engineering|engineer|computer\s+science\s+&?\s+engineering|electronics\s+&?\s+communication|mechanical\s+(?:&?\s+civil\s+&?\s+electrical\s+)?engineering|civil\s+engineering|electrical\s+engineering)/i;
  const medicalPattern = /(?:mbbs|bds|medical|medicine|dental|nursing|pharmacy|b\.?pharm|pharma|ayush|bams|bhms)/i;
  const sciencePattern = /(?:b\.?\s*sc|bsc|b\.?\s*c\.?\s*a|bca|m\.?\s*sc|msc|m\.?\s*c\.?\s*a|mca|pure\s+sciences?|physics|chemistry|biology|mathematics|natural\s+science|life\s+sciences?)/i;
  const commercePattern = /(?:b\.?\s*com|bcom|m\.?\s*com|mcom|commerce|accountancy|finance|chartered\s+accountancy)/i;
  const managementPattern = /(?:mba|pgdm|bba|b\.?\s*b\.?\s*a|management|business\s+administration)/i;
  const artsPattern = /(?:b\.?\s*a\b|ba\b|m\.?\s*a\b|ma\b|arts|humanities|social\s+sciences?|literature|history|fine\s+arts)/i;
  const diplomaPattern = /(?:diploma|polytechnic|iti\b)/i;

  // 1. Explicit UI dropdown mapping checks from My Profile -> Educational Information
  if (degree === "Undergraduate / Bachelor's (B.Tech / B.E)") {
    isEngineering = true;
    courseStream = "Engineering";
    displayStream = "Engineering / B.Tech / B.E";
  } else if (degree === "Undergraduate (MBBS / BDS / Medical)") {
    isMedical = true;
    courseStream = "Medical";
    displayStream = "Medical / MBBS / BDS";
  } else if (degree === "Undergraduate (B.Sc / B.C.A)") {
    isScience = true;
    courseStream = "Science";
    displayStream = "Science / B.Sc / BCA";
  } else if (degree === "Undergraduate (B.Com / B.B.A / B.A)") {
    if (managementPattern.test(stream)) {
      isManagement = true;
      courseStream = "Management";
      displayStream = "Management / BBA";
    } else if (artsPattern.test(stream)) {
      isArts = true;
      courseStream = "Arts";
      displayStream = "Arts / Humanities (B.A)";
    } else {
      isCommerce = true;
      courseStream = "Commerce";
      displayStream = "Commerce / B.Com / BBA / B.A";
    }
  } else if (degree === "Postgraduate / Master's (M.Tech / M.E / M.S)") {
    isEngineering = true;
    courseStream = "Engineering";
    displayStream = "Engineering / M.Tech / M.E";
  } else if (degree === "Postgraduate (MBA / PGDM)") {
    isManagement = true;
    courseStream = "Management";
    displayStream = "Management / MBA";
  } else if (degree === "Postgraduate (M.Sc / M.Com / M.A / MCA)") {
    if (commercePattern.test(stream)) {
      isCommerce = true;
      courseStream = "Commerce";
      displayStream = "Commerce / M.Com";
    } else if (artsPattern.test(stream)) {
      isArts = true;
      courseStream = "Arts";
      displayStream = "Arts / M.A";
    } else {
      isScience = true;
      courseStream = "Science";
      displayStream = "Science / M.Sc / MCA";
    }
  } else if (degree === "Diploma / Polytechnic") {
    isDiploma = true;
    if (engineeringPattern.test(stream)) {
      isEngineering = true;
      courseStream = "Engineering";
      displayStream = "Diploma in Engineering";
    } else {
      courseStream = "Diploma";
      displayStream = "Diploma / Polytechnic";
    }
  } else {
    // Check signals across degree, stream, and course
    // Engineering checks first to capture B.Tech, B.E, BE, BTech, Bachelor of Engineering, etc.
    if (engineeringPattern.test(degree) || engineeringPattern.test(stream) || engineeringPattern.test(course)) {
      isEngineering = true;
      courseStream = "Engineering";
      displayStream = "Engineering / B.Tech / B.E";
      if (course && course.toLowerCase().includes("computer science")) {
        displayStream = "Engineering (Computer Science & AI)";
      }
    } else if (medicalPattern.test(degree) || medicalPattern.test(stream) || medicalPattern.test(course)) {
      isMedical = true;
      courseStream = "Medical";
      displayStream = degree || stream || course || "Medical";
    } else if (sciencePattern.test(degree) || sciencePattern.test(stream) || sciencePattern.test(course)) {
      isScience = true;
      courseStream = "Science";
      displayStream = degree || stream || course || "Science";
    } else if (commercePattern.test(degree) || commercePattern.test(stream) || commercePattern.test(course)) {
      isCommerce = true;
      courseStream = "Commerce";
      displayStream = degree || stream || course || "Commerce";
    } else if (managementPattern.test(degree) || managementPattern.test(stream) || managementPattern.test(course)) {
      isManagement = true;
      courseStream = "Management";
      displayStream = degree || stream || course || "Management";
    } else if (artsPattern.test(degree) || artsPattern.test(stream) || artsPattern.test(course)) {
      isArts = true;
      courseStream = "Arts";
      displayStream = degree || stream || course || "Arts / Humanities";
    } else if (diplomaPattern.test(degree) || diplomaPattern.test(stream) || diplomaPattern.test(course)) {
      isDiploma = true;
      courseStream = "Diploma";
      displayStream = "Diploma / Polytechnic";
    } else {
      courseStream = "All Streams";
      displayStream = (degree && degree !== "Undergraduate Degree") ? degree : (course || "Undergraduate Degree");
    }
  }

  // 2. Determine Education Stage & Degree Level
  let educationStage = "Undergraduate";
  let degreeLevel = "Bachelor's";

  if (
    combinedText.includes("postgraduate") ||
    combinedText.includes("master") ||
    combinedText.includes("m.tech") ||
    combinedText.includes("m.e") ||
    combinedText.includes("m.sc") ||
    combinedText.includes("mba") ||
    combinedText.includes("m.com")
  ) {
    educationStage = "Postgraduate";
    degreeLevel = "Master's";
  } else if (combinedText.includes("class 12") || combinedText.includes("12th") || combinedText.includes("puc") || combinedText.includes("hsc")) {
    educationStage = "Class 12";
    degreeLevel = "Higher Secondary";
  } else if (combinedText.includes("class 11") || combinedText.includes("11th")) {
    educationStage = "Class 11";
    degreeLevel = "Higher Secondary";
  } else if (combinedText.includes("class 10") || combinedText.includes("10th") || combinedText.includes("sslc")) {
    educationStage = "Class 10";
    degreeLevel = "Secondary";
  } else if (combinedText.includes("diploma") || combinedText.includes("polytechnic")) {
    educationStage = "Diploma";
    degreeLevel = "Diploma";
  } else if (combinedText.includes("ph.d") || combinedText.includes("doctoral")) {
    educationStage = "Doctorate";
    degreeLevel = "Doctorate";
  } else {
    educationStage = "Undergraduate";
    degreeLevel = "Bachelor's";
  }

  return {
    educationStage,
    degreeLevel,
    courseStream,
    displayStream,
    rawDegree: degree,
    rawStream: stream,
    rawCourse: course,
    isEngineering,
    isMedical,
    isScience,
    isCommerce,
    isManagement,
    isArts,
    isDiploma
  };
}

/**
 * Checks whether a user's qualification satisfies a scholarship course requirement.
 *
 * @param {string} scholarshipCourse - e.g. "Engineering", "Science", "All Streams"
 * @param {Object|string} userProfileOrQualification - user profile object or qualification string
 * @returns {{ pass: boolean, notes: string, studentValue: string }}
 */
export function checkCourseStreamEligibility(scholarshipCourse, userProfileOrQualification) {
  const norm = normalizeEducation(userProfileOrQualification);
  const schCourse = (scholarshipCourse || "All Streams").trim();
  const schLower = schCourse.toLowerCase();

  // 1. Open to All Streams
  if (schLower === "all streams" || schLower === "all" || schLower === "" || !scholarshipCourse) {
    return {
      pass: true,
      studentValue: norm.displayStream,
      notes: "Open to all academic disciplines and degree courses.",
    };
  }

  // 2. Engineering requirement
  if (schLower === "engineering" || schLower === "engineer") {
    if (norm.isEngineering) {
      return {
        pass: true,
        studentValue: "Engineering / B.Tech / B.E",
        notes: "Your B.Tech/B.E Engineering qualification satisfies the Engineering requirement.",
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // 3. Medical requirement
  if (schLower === "medical" || schLower === "medicine") {
    if (norm.isMedical) {
      return {
        pass: true,
        studentValue: norm.displayStream,
        notes: "Matches your medical & life sciences qualification requirement.",
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // 4. Science requirement
  if (schLower === "science" || schLower === "sciences") {
    if (norm.isScience || norm.isEngineering) {
      return {
        pass: true,
        studentValue: norm.displayStream,
        notes: `Matches your academic science domain (${norm.displayStream}).`,
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // 5. Commerce requirement
  if (schLower === "commerce") {
    if (norm.isCommerce) {
      return {
        pass: true,
        studentValue: norm.displayStream,
        notes: `Matches your commerce & finance qualification (${norm.displayStream}).`,
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // 6. Management requirement
  if (schLower === "management") {
    if (norm.isManagement || norm.isCommerce) {
      return {
        pass: true,
        studentValue: norm.displayStream,
        notes: `Matches your management & business qualification (${norm.displayStream}).`,
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // 7. Arts / Humanities requirement
  if (schLower === "arts" || schLower === "humanities") {
    if (norm.isArts) {
      return {
        pass: true,
        studentValue: norm.displayStream,
        notes: `Matches your arts & humanities academic domain (${norm.displayStream}).`,
      };
    }
    return {
      pass: false,
      studentValue: norm.displayStream,
      notes: `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
    };
  }

  // Substring or direct match fallback
  const directMatch = norm.courseStream.toLowerCase() === schLower || norm.displayStream.toLowerCase().includes(schLower);
  return {
    pass: directMatch,
    studentValue: norm.displayStream,
    notes: directMatch 
      ? `Matches your academic domain (${norm.displayStream}).`
      : `Requires ${schCourse}, but your registered stream is ${norm.displayStream}.`,
  };
}

/**
 * Checks whether a user's education stage satisfies a scholarship education stage requirement.
 *
 * @param {string} scholarshipEducation - e.g. "Undergraduate", "Class 12", "Postgraduate", "All"
 * @param {Object|string} userProfileOrQualification - user profile object or qualification
 * @returns {{ pass: boolean, notes: string, studentValue: string }}
 */
export function checkEducationStageEligibility(scholarshipEducation, userProfileOrQualification) {
  const norm = normalizeEducation(userProfileOrQualification);
  const schEdu = (scholarshipEducation || "All").trim();
  const schLower = schEdu.toLowerCase();

  if (schLower === "all" || schLower === "" || !scholarshipEducation) {
    return {
      pass: true,
      studentValue: norm.educationStage,
      notes: "Open to all educational levels.",
    };
  }

  if (
    schLower.includes("undergrad") ||
    schLower === "ug" ||
    schLower === "bachelor" ||
    schLower === "graduation"
  ) {
    if (norm.educationStage === "Undergraduate") {
      return {
        pass: true,
        studentValue: norm.educationStage,
        notes: `Qualified for ${schEdu} level.`,
      };
    }
    return {
      pass: false,
      studentValue: norm.educationStage,
      notes: `Requires ${schEdu} enrollment, but your registered level is ${norm.educationStage}.`,
    };
  }

  if (
    schLower.includes("postgrad") ||
    schLower === "pg" ||
    schLower === "master"
  ) {
    if (norm.educationStage === "Postgraduate") {
      return {
        pass: true,
        studentValue: norm.educationStage,
        notes: `Qualified for ${schEdu} level.`,
      };
    }
    return {
      pass: false,
      studentValue: norm.educationStage,
      notes: `Requires ${schEdu} enrollment, but your registered level is ${norm.educationStage}.`,
    };
  }

  if (schLower.includes("class 12") || schLower.includes("12th") || schLower.includes("higher secondary")) {
    if (norm.educationStage === "Class 12") {
      return {
        pass: true,
        studentValue: norm.educationStage,
        notes: `Qualified for ${schEdu} level.`,
      };
    }
    return {
      pass: false,
      studentValue: norm.educationStage,
      notes: `Requires ${schEdu} enrollment, but your registered level is ${norm.educationStage}.`,
    };
  }

  if (schLower.includes("diploma")) {
    if (norm.educationStage === "Diploma") {
      return {
        pass: true,
        studentValue: norm.educationStage,
        notes: `Qualified for ${schEdu} level.`,
      };
    }
    return {
      pass: false,
      studentValue: norm.educationStage,
      notes: `Requires ${schEdu} enrollment, but your registered level is ${norm.educationStage}.`,
    };
  }

  const isMatch = norm.educationStage.toLowerCase().includes(schLower) || schLower.includes(norm.educationStage.toLowerCase());
  return {
    pass: isMatch,
    studentValue: norm.educationStage,
    notes: isMatch 
      ? `Qualified for ${schEdu} level.` 
      : `Requires ${schEdu} enrollment, but your registered level is ${norm.educationStage}.`,
  };
}

/* =========================================================================
 * GENDER & SOCIAL CATEGORY NORMALIZATION & ELIGIBILITY AUDIT ENGINE
 * ========================================================================= */

// Canonical Gender Constants
export const GENDERS = {
  FEMALE: "Female",
  MALE: "Male",
  ALL: "All",
  OTHER: "Other",
};

/**
 * Checks if a string represents a gender term.
 * Used to detect misclassified gender values placed in category/quota fields.
 *
 * @param {string} val
 * @returns {boolean}
 */
export function isGenderTerm(val) {
  if (!val || typeof val !== "string") return false;
  const s = val.trim().toLowerCase();
  return [
    "girl", "girls", "female", "females", "woman", "women", "f",
    "boy", "boys", "male", "males", "man", "men", "m",
    "all genders", "any gender", "both genders", "all gender", "other gender"
  ].includes(s);
}

/**
 * Normalizes any gender input string to canonical representation:
 * - "Girls", "Girl", "Female", "Women", "Woman", "females", "f" -> "Female"
 * - "Boys", "Boy", "Male", "Man", "Men", "males", "m" -> "Male"
 * - "All", "Any", "Both", "All Genders", "Any Gender", null, undefined, "" -> "All"
 * - "Other", "Non-binary", "Transgender" -> "Other"
 *
 * @param {string} val
 * @returns {string} Canonical gender: "Female" | "Male" | "All" | "Other"
 */
export function normalizeGender(val) {
  if (!val) return "All";
  const s = String(val).trim().toLowerCase();

  if (
    s === "all" ||
    s === "any" ||
    s === "both" ||
    s === "all genders" ||
    s === "any gender" ||
    s === "all gender" ||
    s === "open to all" ||
    s === "n/a" ||
    s === "none" ||
    s === "not specified" ||
    s === "not applicable"
  ) {
    return "All";
  }

  if (
    s === "female" ||
    s === "females" ||
    s === "f" ||
    s === "girl" ||
    s === "girls" ||
    s === "woman" ||
    s === "women"
  ) {
    return "Female";
  }

  if (
    s === "male" ||
    s === "males" ||
    s === "m" ||
    s === "boy" ||
    s === "boys" ||
    s === "man" ||
    s === "men"
  ) {
    return "Male";
  }

  if (s === "other" || s === "transgender" || s === "non-binary") {
    return "Other";
  }

  return val.trim();
}

/**
 * Checks whether user gender satisfies scholarship gender requirement.
 *
 * @param {string} scholarshipGender - e.g. "Girls", "Female", "Women", "Boys", "All"
 * @param {string} userGender - e.g. "Female", "Male", "Other"
 * @returns {{ pass: boolean, status: string, required: string, studentValue: string, normSch: string, normUser: string, notes: string }}
 */
export function checkGenderEligibility(scholarshipGender, userGender) {
  const normSch = normalizeGender(scholarshipGender);
  const normUser = normalizeGender(userGender);

  const schDisplay = scholarshipGender && String(scholarshipGender).trim() !== ""
    ? String(scholarshipGender).trim()
    : "All";
  const userDisplay = userGender && String(userGender).trim() !== ""
    ? String(userGender).trim()
    : "Not specified";

  // Open to all or not specified
  if (normSch === "All" || !scholarshipGender || String(scholarshipGender).trim() === "") {
    return {
      pass: true,
      status: "pass",
      required: schDisplay,
      studentValue: userDisplay,
      normSch,
      normUser,
      notes: "Open to all genders.",
    };
  }

  // Canonical match (e.g. Female satisfies Girls/Women/Female, Male satisfies Boys/Male)
  if (normSch === normUser) {
    return {
      pass: true,
      status: "pass",
      required: schDisplay,
      studentValue: userDisplay,
      normSch,
      normUser,
      notes: `Your gender (${userDisplay}) satisfies the scholarship's ${schDisplay} requirement.`,
    };
  }

  // Mismatch
  return {
    pass: false,
    status: "fail",
    required: schDisplay,
    studentValue: userDisplay,
    normSch,
    normUser,
    notes: `Exclusively open to ${schDisplay} candidates (registered gender: ${userDisplay}).`,
  };
}

// Canonical Social Categories
export const SOCIAL_CATEGORIES = {
  GENERAL: "General",
  OBC: "OBC",
  OBC_NC: "OBC-NC",
  OBC_C: "OBC-C",
  SC: "SC",
  ST: "ST",
  SC_ST: "SC/ST",
  EWS: "EWS",
  MINORITY: "Minority",
  PWD: "PwD",
  DEFENCE: "Defence",
  ALL: "All Categories",
};

/**
 * Normalizes any category string into structured descriptor.
 *
 * @param {string} val
 * @returns {Object} normalized category object
 */
export function normalizeCategory(val) {
  if (!val) {
    return { code: "ALL", label: "Not specified", isGeneral: true, isAll: true, raw: "" };
  }
  const raw = String(val).trim();
  const lower = raw.toLowerCase();

  // If input is actually a gender term, identify it
  if (isGenderTerm(raw)) {
    return {
      code: "GENDER_MISCLASSIFIED",
      raw,
      isGender: true,
      isAll: true,
      label: "Not specified",
    };
  }

  if (
    lower === "all" ||
    lower === "all categories" ||
    lower === "any" ||
    lower === "open" ||
    lower === "open to all" ||
    lower === "not specified" ||
    lower === "not applicable" ||
    lower === "none" ||
    lower === "n/a"
  ) {
    return { code: "ALL", raw, label: "Not specified", isAll: true };
  }

  if (lower === "general" || lower.startsWith("general")) {
    return { code: "GENERAL", raw, label: "General", isGeneral: true };
  }

  // OBC variations: OBC-NC, OBC-NCL, Non-Creamy Layer, Creamy Layer
  if (lower.includes("obc") || lower.includes("backward")) {
    const isNC = lower.includes("nc") || lower.includes("non-creamy") || lower.includes("ncl");
    const isCreamy = lower.includes("creamy") && !isNC;
    return {
      code: isNC ? "OBC_NC" : isCreamy ? "OBC_C" : "OBC",
      base: "OBC",
      raw,
      label: isNC ? "OBC-NC" : isCreamy ? "OBC-C" : "OBC",
      isOBC: true,
      isNC,
      isCreamy,
    };
  }

  // SC & ST combinations
  if (
    (lower.includes("sc") && lower.includes("st")) ||
    lower.includes("sc/st") ||
    lower.includes("sc & st")
  ) {
    return { code: "SC_ST", base: "SC_ST", raw, label: "SC/ST", isSC: true, isST: true };
  }

  if (lower.includes("sc") || lower.includes("scheduled caste")) {
    return { code: "SC", base: "SC", raw, label: "SC", isSC: true };
  }

  if (lower.includes("st") || lower.includes("scheduled tribe")) {
    return { code: "ST", base: "ST", raw, label: "ST", isST: true };
  }

  if (lower.includes("ews") || lower.includes("economically weaker")) {
    return { code: "EWS", base: "EWS", raw, label: "EWS", isEWS: true };
  }

  if (lower.includes("minority")) {
    return { code: "MINORITY", base: "MINORITY", raw, label: "Minority", isMinority: true };
  }

  if (lower.includes("pwd") || lower.includes("disab") || lower.includes("handicap")) {
    return { code: "PWD", base: "PWD", raw, label: "PwD", isPwD: true };
  }

  if (lower.includes("defence") || lower.includes("defense") || lower.includes("army") || lower.includes("servicemen")) {
    return { code: "DEFENCE", base: "DEFENCE", raw, label: "Defence", isDefence: true };
  }

  return { code: "OTHER", raw, label: raw };
}

/**
 * Checks whether user category/quota satisfies scholarship category requirement.
 * Strictly separates Gender from Caste/Category/Quota dimensions.
 *
 * @param {string} scholarshipCategory - e.g. "General", "OBC", "SC", "Girls" (misclassified), etc.
 * @param {Object|string} userCategoryOrProfile - user profile object or category string
 * @returns {{ pass: boolean, status: string, required: string, studentValue: string, notes: string }}
 */
export function checkCategoryEligibility(scholarshipCategory, userCategoryOrProfile) {
  let userCatRaw = "General";
  let userReligion = "";

  if (typeof userCategoryOrProfile === "object" && userCategoryOrProfile !== null) {
    userCatRaw = userCategoryOrProfile.category || "General";
    userReligion = userCategoryOrProfile.religion || "";
  } else if (typeof userCategoryOrProfile === "string") {
    userCatRaw = userCategoryOrProfile;
  }

  const userDisplay = userCatRaw && String(userCatRaw).trim() !== ""
    ? String(userCatRaw).trim()
    : "General";

  const normUser = normalizeCategory(userDisplay);
  const normSch = normalizeCategory(scholarshipCategory);

  // Case 1: Scholarship category was a misclassified gender term (e.g. "Girls", "Female")
  // Dimensions must remain strictly separate: gender is not caste/quota.
  if (normSch.isGender) {
    return {
      pass: true,
      status: "pass",
      required: "Not specified",
      studentValue: userDisplay,
      notes: "No specific category/quota restriction is specified for this scholarship.",
    };
  }

  // Case 2: Scholarship has no category restriction / "All" / null / undefined / empty
  if (normSch.isAll || !scholarshipCategory || String(scholarshipCategory).trim() === "") {
    return {
      pass: true,
      status: "pass",
      required: "Not specified",
      studentValue: userDisplay,
      notes: "No specific category/quota restriction is specified for this scholarship.",
    };
  }

  // Case 3: Scholarship is "General" (Open to all categories under General merit)
  if (normSch.isGeneral) {
    return {
      pass: true,
      status: "pass",
      required: "General",
      studentValue: userDisplay,
      notes: `Open to all categories, including ${userDisplay}.`,
    };
  }

  const schDisplay = scholarshipCategory && String(scholarshipCategory).trim() !== ""
    ? String(scholarshipCategory).trim()
    : "General";

  // Case 4: OBC Reservation
  if (normSch.isOBC) {
    if (normUser.isOBC) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  // Case 5: SC / ST Reservation
  if (normSch.code === "SC_ST") {
    if (normUser.isSC || normUser.isST) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  if (normSch.isSC) {
    if (normUser.isSC) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  if (normSch.isST) {
    if (normUser.isST) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  // Case 6: EWS Reservation
  if (normSch.isEWS) {
    if (normUser.isEWS) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  // Case 7: Minority
  if (normSch.isMinority) {
    const isReligiousMinority = ["muslim", "christian", "sikh", "buddhist", "jain", "parsi"].includes(
      userReligion.toLowerCase().trim()
    );
    if (normUser.isMinority || isReligiousMinority) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  // Case 8: PwD
  if (normSch.isPwD) {
    if (normUser.isPwD) {
      return {
        pass: true,
        status: "pass",
        required: schDisplay,
        studentValue: userDisplay,
        notes: `Your ${userDisplay} category satisfies the ${schDisplay} reservation criteria.`,
      };
    }
    return {
      pass: false,
      status: "fail",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Restricted to ${schDisplay} applicants (your category: ${userDisplay}).`,
    };
  }

  // Custom or exact match
  const directMatch =
    normSch.raw.toLowerCase() === normUser.raw.toLowerCase() ||
    normUser.raw.toLowerCase().includes(normSch.raw.toLowerCase()) ||
    normSch.raw.toLowerCase().includes(normUser.raw.toLowerCase());

  if (directMatch) {
    return {
      pass: true,
      status: "pass",
      required: schDisplay,
      studentValue: userDisplay,
      notes: `Your ${userDisplay} category satisfies the ${schDisplay} criteria.`,
    };
  }

  return {
    pass: false,
    status: "fail",
    required: schDisplay,
    studentValue: userDisplay,
    notes: `Designated for ${schDisplay} category applicants (your category: ${userDisplay}).`,
  };
}
