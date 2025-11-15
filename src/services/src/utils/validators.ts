/**
 * Input Validation Utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 * @param email Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
}

/**
 * Validate name field
 * @param name Name to validate
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }

  return { valid: true };
}

/**
 * Validate required field
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate minimum length
 * @param value Value to validate
 * @param minLength Minimum required length
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }

  return { valid: true };
}

/**
 * Validate maximum length
 * @param value Value to validate
 * @param maxLength Maximum allowed length
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate number is in range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateNumberRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { valid: true };
}

/**
 * Validate if value is numeric
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateNumeric(value: any, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (isNaN(Number(value))) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  return { valid: true };
}

/**
 * Validate URL format
 * @param url URL to validate
 * @returns Validation result
 */
export function validateURL(url: string): ValidationResult {
  if (!url) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch (_) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate array is not empty
 * @param array Array to validate
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateArrayNotEmpty(array: any[], fieldName: string): ValidationResult {
  if (!Array.isArray(array)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (array.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  return { valid: true };
}

/**
 * Validate date is valid and in the future
 * @param date Date string to validate
 * @param fieldName Name of the field for error message
 * @returns Validation result
 */
export function validateFutureDate(date: string, fieldName: string): ValidationResult {
  if (!date) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` };
  }

  if (dateObj <= new Date()) {
    return { valid: false, error: `${fieldName} must be in the future` };
  }

  return { valid: true };
}
