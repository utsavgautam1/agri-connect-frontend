/**
 * validators.js
 * Pure validation functions — no React Native dependencies.
 * Returns { valid: boolean, message: string }.
 */

// ── Email ──────────────────────────────────────────────────────────────────
export const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return { valid: false, message: 'Email is required.' };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value.trim())) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, message: '' };
};

// ── Password ───────────────────────────────────────────────────────────────
export const validatePassword = (value, { minLength = 8 } = {}) => {
  if (!value) {
    return { valid: false, message: 'Password is required.' };
  }
  if (value.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters.` };
  }
  if (!/(?=.*[0-9])/.test(value)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/(?=.*[a-zA-Z])/.test(value)) {
    return { valid: false, message: 'Password must contain at least one letter.' };
  }
  return { valid: true, message: '' };
};

// ── Confirm password ────────────────────────────────────────────────────────
export const validateConfirmPassword = (value, original) => {
  if (!value) return { valid: false, message: 'Please confirm your password.' };
  if (value !== original) return { valid: false, message: 'Passwords do not match.' };
  return { valid: true, message: '' };
};

// ── Full name ───────────────────────────────────────────────────────────────
export const validateName = (value, { minLength = 2, maxLength = 60 } = {}) => {
  if (!value || !value.trim()) return { valid: false, message: 'Name is required.' };
  if (value.trim().length < minLength) return { valid: false, message: `Name must be at least ${minLength} characters.` };
  if (value.trim().length > maxLength) return { valid: false, message: `Name cannot exceed ${maxLength} characters.` };
  return { valid: true, message: '' };
};

// ── Phone number ────────────────────────────────────────────────────────────
export const validatePhone = (value) => {
  if (!value || !value.trim()) return { valid: false, message: 'Phone number is required.' };
  // Accepts formats: +254712345678 | 0712345678 | +1 415 555 0100
  const regex = /^\+?[\d\s\-().]{9,15}$/;
  if (!regex.test(value.trim())) return { valid: false, message: 'Enter a valid phone number (9–15 digits).' };
  return { valid: true, message: '' };
};

// ── NPK numeric range ───────────────────────────────────────────────────────
export const validateNPK = (value, { min = 0, max = 200, label = 'Value' } = {}) => {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: `${label} is required.` };
  }
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, message: `${label} must be a number.` };
  if (num < min || num > max) return { valid: false, message: `${label} must be between ${min} and ${max}.` };
  return { valid: true, message: '' };
};

// ── Required (generic) ──────────────────────────────────────────────────────
export const validateRequired = (value, label = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${label} is required.` };
  }
  return { valid: true, message: '' };
};

// ── Validate an entire form object against a rules map ─────────────────────
/**
 * validateForm({ email: 'x', password: '' }, {
 *   email:    (v) => validateEmail(v),
 *   password: (v) => validatePassword(v),
 * })
 * → { isValid: false, errors: { password: 'Password is required.' } }
 */
export const validateForm = (values, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const result = rules[field](values[field], values);
    if (!result.valid) {
      errors[field] = result.message;
      isValid = false;
    }
  });

  return { isValid, errors };
};