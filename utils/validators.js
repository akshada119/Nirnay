// ============================================================
// NIRNAY - CENTRAL VALIDATION HELPERS
// ============================================================

// ============================================================
// COMMON HELPERS
// ============================================================

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

// ============================================================
// USER VALIDATION
// ============================================================

// -------------------------
// NAME
// -------------------------

function validateName(name) {
  if (isEmpty(name)) {
    return "Name is required.";
  }

  const value = name.trim();

  if (value.length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (value.length > 50) {
    return "Name cannot exceed 50 characters.";
  }

  if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(value)) {
    return "Name can contain only letters, spaces, apostrophes, dots and hyphens.";
  }

  return null;
}

// -------------------------
// EMAIL
// -------------------------

function validateEmail(email) {
  if (isEmpty(email)) {
    return "Email is required.";
  }

  const value = email.trim().toLowerCase();

  if (value.length > 100) {
    return "Email cannot exceed 100 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(value)) {
    return "Please enter a valid email address.";
  }

  return null;
}

// -------------------------
// MOBILE
// -------------------------

function validateMobile(mobile) {
  if (isEmpty(mobile)) {
    return "Mobile number is required.";
  }

  const value = String(mobile).trim();

  if (!/^[0-9]\d{9}$/.test(value)) {
    return "Please enter a valid 10-digit mobile number.";
  }

  return null;
}

// -------------------------
// PASSWORD
// -------------------------

function validatePassword(password) {
  if (isEmpty(password)) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password.length > 128) {
    return "Password cannot exceed 128 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return null;
}

// -------------------------
// CONFIRM PASSWORD
// -------------------------

function validateConfirmPassword(password, confirmPassword) {
  if (isEmpty(confirmPassword)) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

// -------------------------
// ADDRESS
// -------------------------

function validateAddress(address) {
  if (isEmpty(address)) {
    return "Address is required.";
  }

  const value = address.trim();

  if (value.length < 5) {
    return "Address must be at least 5 characters.";
  }

  if (value.length > 250) {
    return "Address cannot exceed 250 characters.";
  }

  return null;
}

// -------------------------
// LOCATION
// -------------------------

function validateLocation(location) {
  if (isEmpty(location)) {
    return null;
  }

  const value = location.trim();

  if (value.length > 150) {
    return "Location cannot exceed 150 characters.";
  }

  return null;
}

// -------------------------
// ROLE
// -------------------------

function validateRole(role) {
  const allowedRoles = ["customer", "professional", "admin"];

  if (isEmpty(role)) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return "Invalid user role.";
  }

  return null;
}

// -------------------------
// ACCOUNT STATUS
// -------------------------

function validateAccountStatus(accountStatus) {
  const allowedStatuses = ["active", "inactive", "suspended"];

  if (isEmpty(accountStatus)) {
    return null;
  }

  if (!allowedStatuses.includes(accountStatus)) {
    return "Invalid account status.";
  }

  return null;
}

// ============================================================
// PROFESSIONAL USER FIELDS
// ============================================================

// -------------------------
// CONSULTANCY
// -------------------------

function validateConsultancy(consultancy) {
  if (isEmpty(consultancy)) {
    return null;
  }

  const value = consultancy.trim();

  if (value.length > 100) {
    return "Consultancy cannot exceed 100 characters.";
  }

  return null;
}

// -------------------------
// CATEGORY
// -------------------------

function validateCategory(category) {
  if (isEmpty(category)) {
    return "Category is required.";
  }

  const value = category.trim();

  if (value.length < 2) {
    return "Category must be at least 2 characters.";
  }

  if (value.length > 100) {
    return "Category cannot exceed 100 characters.";
  }

  return null;
}

// -------------------------
// SPECIALIZATION
// -------------------------

function validateSpecialization(specialization) {
  if (isEmpty(specialization)) {
    return null;
  }

  const value = specialization.trim();

  if (value.length > 150) {
    return "Specialization cannot exceed 150 characters.";
  }

  return null;
}

// -------------------------
// EXPERIENCE
// -------------------------

function validateExperience(experience) {
  if (isEmpty(experience)) {
    return null;
  }

  const value = experience.trim();

  if (value.length > 50) {
    return "Experience cannot exceed 50 characters.";
  }

  return null;
}

// -------------------------
// SKILLS
// -------------------------

function validateSkills(skills) {
  if (isEmpty(skills)) {
    return null;
  }

  const value = skills.trim();

  if (value.length > 500) {
    return "Skills cannot exceed 500 characters.";
  }

  return null;
}

// -------------------------
// PROFESSIONAL DESCRIPTION
// -------------------------

function validateProfessionalDescription(description) {
  if (isEmpty(description)) {
    return null;
  }

  const value = description.trim();

  if (value.length > 2000) {
    return "Professional description cannot exceed 2000 characters.";
  }

  return null;
}

// -------------------------
// ABOUT
// -------------------------

function validateAbout(about) {
  if (isEmpty(about)) {
    return null;
  }

  const value = about.trim();

  if (value.length > 2000) {
    return "About section cannot exceed 2000 characters.";
  }

  return null;
}

// ============================================================
// COMPANY VALIDATION
// ============================================================

// -------------------------
// COMPANY NAME
// -------------------------

function validateCompanyName(name) {
  if (isEmpty(name)) {
    return "Company name is required.";
  }

  const value = name.trim();

  if (value.length < 2) {
    return "Company name must be at least 2 characters.";
  }

  if (value.length > 100) {
    return "Company name cannot exceed 100 characters.";
  }

  return null;
}

// -------------------------
// DESCRIPTION
// -------------------------

function validateDescription(description, fieldName = "Description") {
  if (isEmpty(description)) {
    return `${fieldName} is required.`;
  }

  const value = description.trim();

  if (value.length < 10) {
    return `${fieldName} must be at least 10 characters.`;
  }

  if (value.length > 2000) {
    return `${fieldName} cannot exceed 2000 characters.`;
  }

  return null;
}

// -------------------------
// CITY
// -------------------------

function validateCity(city) {
  if (isEmpty(city)) {
    return "City is required.";
  }

  const value = city.trim();

  if (value.length < 2) {
    return "City must be at least 2 characters.";
  }

  if (value.length > 100) {
    return "City cannot exceed 100 characters.";
  }

  if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(value)) {
    return "City contains invalid characters.";
  }

  return null;
}

// -------------------------
// WEBSITE
// -------------------------

function validateWebsite(website) {
  if (isEmpty(website)) {
    return null;
  }

  const value = website.trim();

  if (value.length > 255) {
    return "Website URL cannot exceed 255 characters.";
  }

  try {
    const url = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`,
    );

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Please enter a valid website URL.";
    }
  } catch (error) {
    return "Please enter a valid website URL.";
  }

  return null;
}

// ============================================================
// SERVICE VALIDATION
// ============================================================

// -------------------------
// SERVICE NAME
// -------------------------

function validateServiceName(name) {
  if (isEmpty(name)) {
    return "Service name is required.";
  }

  const value = name.trim();

  if (value.length < 2) {
    return "Service name must be at least 2 characters.";
  }

  if (value.length > 150) {
    return "Service name cannot exceed 150 characters.";
  }

  return null;
}

// -------------------------
// SERVICE SLUG
// -------------------------

function validateSlug(slug) {
  if (isEmpty(slug)) {
    return "Slug is required.";
  }

  const value = slug.trim().toLowerCase();

  if (value.length < 2) {
    return "Slug must be at least 2 characters.";
  }

  if (value.length > 150) {
    return "Slug cannot exceed 150 characters.";
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return "Slug can contain only lowercase letters, numbers and hyphens.";
  }

  return null;
}

// -------------------------
// PRICE
// -------------------------

function validatePrice(price) {
  if (price === undefined || price === null || price === "") {
    return "Price is required.";
  }

  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "Price must be a valid number.";
  }

  if (value < 0) {
    return "Price cannot be negative.";
  }

  if (value > 100000000) {
    return "Price is too large.";
  }

  return null;
}

// -------------------------
// DURATION
// -------------------------

function validateDuration(duration) {
  if (isEmpty(duration)) {
    return "Duration is required.";
  }

  const value = duration.trim();

  if (value.length < 1) {
    return "Duration is required.";
  }

  if (value.length > 100) {
    return "Duration cannot exceed 100 characters.";
  }

  return null;
}

// ============================================================
// BOOKING VALIDATION
// ============================================================

// -------------------------
// BOOKING DATE
// -------------------------

function validateBookingDate(date) {
  if (isEmpty(date)) {
    return "Booking date is required.";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Please select a valid booking date.";
  }

  return null;
}

// -------------------------
// BOOKING MESSAGE
// -------------------------

function validateBookingMessage(message) {
  if (isEmpty(message)) {
    return null;
  }

  const value = message.trim();

  if (value.length > 1000) {
    return "Booking message cannot exceed 1000 characters.";
  }

  return null;
}

// -------------------------
// BOOKING STATUS
// -------------------------

function validateBookingStatus(status) {
  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

  if (isEmpty(status)) {
    return null;
  }

  if (!allowedStatuses.includes(status)) {
    return "Invalid booking status.";
  }

  return null;
}

// -------------------------
// CANCELLATION REASON
// -------------------------

function validateCancellationReason(reason) {
  if (isEmpty(reason)) {
    return "Cancellation reason is required.";
  }

  const value = reason.trim();

  if (value.length < 3) {
    return "Cancellation reason must be at least 3 characters.";
  }

  if (value.length > 500) {
    return "Cancellation reason cannot exceed 500 characters.";
  }

  return null;
}

// ============================================================
// REVIEW VALIDATION
// ============================================================

// -------------------------
// RATING
// -------------------------

function validateRating(rating) {
  if (rating === undefined || rating === null || rating === "") {
    return "Rating is required.";
  }

  const value = Number(rating);

  if (!Number.isInteger(value)) {
    return "Rating must be a whole number.";
  }

  if (value < 1 || value > 5) {
    return "Rating must be between 1 and 5.";
  }

  return null;
}

// -------------------------
// REVIEW COMMENT
// -------------------------

function validateReviewComment(comment) {
  if (isEmpty(comment)) {
    return "Review comment is required.";
  }

  const value = comment.trim();

  if (value.length < 5) {
    return "Review must be at least 5 characters.";
  }

  if (value.length > 500) {
    return "Review cannot exceed 500 characters.";
  }

  return null;
}

// ============================================================
// SETTINGS VALIDATION
// ============================================================

// -------------------------
// PLATFORM NAME
// -------------------------

function validatePlatformName(platformName) {
  if (isEmpty(platformName)) {
    return "Platform name is required.";
  }

  const value = platformName.trim();

  if (value.length < 2) {
    return "Platform name must be at least 2 characters.";
  }

  if (value.length > 100) {
    return "Platform name cannot exceed 100 characters.";
  }

  return null;
}

// -------------------------
// SUPPORT PHONE
// -------------------------

function validateSupportPhone(supportPhone) {
  if (isEmpty(supportPhone)) {
    return null;
  }

  return validateMobile(supportPhone);
}

// -------------------------
// PLATFORM ADDRESS
// -------------------------

function validatePlatformAddress(platformAddress) {
  if (isEmpty(platformAddress)) {
    return null;
  }

  const value = platformAddress.trim();

  if (value.length > 250) {
    return "Platform address cannot exceed 250 characters.";
  }

  return null;
}

// -------------------------
// DEFAULT BOOKING STATUS
// -------------------------

function validateDefaultBookingStatus(status) {
  const allowedStatuses = ["pending", "confirmed"];

  if (isEmpty(status)) {
    return "Default booking status is required.";
  }

  if (!allowedStatuses.includes(status)) {
    return "Invalid default booking status.";
  }

  return null;
}

// -------------------------
// CANCELLATION LIMIT VALUE
// -------------------------

function validateCancellationLimitValue(value) {
  if (value === undefined || value === null || value === "") {
    return "Cancellation limit is required.";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Cancellation limit must be a valid number.";
  }

  if (number < 1) {
    return "Cancellation limit must be at least 1.";
  }

  if (number > 365) {
    return "Cancellation limit cannot exceed 365.";
  }

  return null;
}

// -------------------------
// CANCELLATION LIMIT UNIT
// -------------------------

function validateCancellationLimitUnit(unit) {
  const allowedUnits = ["hours", "days"];

  if (isEmpty(unit)) {
    return "Cancellation limit unit is required.";
  }

  if (!allowedUnits.includes(unit)) {
    return "Invalid cancellation limit unit.";
  }

  return null;
}

// ============================================================
// MONGOOSE OBJECT ID
// ============================================================

function validateObjectId(id, fieldName = "ID") {
  if (isEmpty(id)) {
    return `${fieldName} is required.`;
  }

  if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
    return `Invalid ${fieldName}.`;
  }

  return null;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Common
  isEmpty,

  // User
  validateName,
  validateEmail,
  validateMobile,
  validatePassword,
  validateConfirmPassword,
  validateAddress,
  validateLocation,
  validateRole,
  validateAccountStatus,

  // Professional
  validateConsultancy,
  validateCategory,
  validateSpecialization,
  validateExperience,
  validateSkills,
  validateProfessionalDescription,
  validateAbout,

  // Company
  validateCompanyName,
  validateDescription,
  validateCity,
  validateWebsite,

  // Service
  validateServiceName,
  validateSlug,
  validatePrice,
  validateDuration,

  // Booking
  validateBookingDate,
  validateBookingMessage,
  validateBookingStatus,
  validateCancellationReason,

  // Review
  validateRating,
  validateReviewComment,

  // Settings
  validatePlatformName,
  validateSupportPhone,
  validatePlatformAddress,
  validateDefaultBookingStatus,
  validateCancellationLimitValue,
  validateCancellationLimitUnit,

  // Database
  validateObjectId,
};
