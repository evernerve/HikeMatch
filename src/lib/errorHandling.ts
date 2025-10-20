/**
 * Error handling utilities for authentication and Firebase operations
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
}

/**
 * Maps Firebase error codes to user-friendly messages
 */
export const getAuthErrorMessage = (error: any): string => {
  // If error already has a user-friendly message, use it
  if (error.userMessage) {
    return error.userMessage;
  }

  const errorCode = error.code || '';
  const errorMessage = error.message || '';

  // Firebase Authentication error codes
  const errorMessages: Record<string, string> = {
    // Sign in errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid username or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    
    // Sign up errors
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
    'auth/invalid-password': 'Password must be at least 6 characters long.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/timeout': 'The request timed out. Please try again.',
    
    // API key errors
    'auth/api-key-not-valid': 'Configuration error. Please contact support.',
    'auth/app-deleted': 'The app has been deleted. Please contact support.',
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
    
    // Other common errors
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  };

  // Check for custom error messages first
  if (errorMessage.includes('Username is already taken')) {
    return '❌ This username is already taken. Please choose another one.';
  }
  
  if (errorMessage.includes('Username not found')) {
    return '❌ Username not found. Please check your username or sign up for a new account.';
  }

  // Return mapped error message or a generic one
  if (errorCode && errorMessages[errorCode]) {
    return `❌ ${errorMessages[errorCode]}`;
  }

  // Fallback to original message if it's user-friendly
  if (errorMessage && !errorMessage.includes('Firebase') && errorMessage.length < 100) {
    return `❌ ${errorMessage}`;
  }

  // Generic fallback
  return '❌ Something went wrong. Please try again or contact support if the problem persists.';
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates username format
 */
export const isValidUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, message: 'Username is required.' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long.' };
  }

  if (username.length > 20) {
    return { valid: false, message: 'Username must be 20 characters or less.' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores.' };
  }

  if (/^\d+$/.test(username)) {
    return { valid: false, message: 'Username cannot be only numbers.' };
  }

  return { valid: true };
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length === 0) {
    return { valid: false, message: 'Password is required.' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password is too long.' };
  }

  // Optional: Check for password strength
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { 
      valid: true, // Still valid but show warning
      message: '⚠️ For better security, use a mix of letters and numbers.' 
    };
  }

  return { valid: true };
};

/**
 * Validates display name
 */
export const isValidDisplayName = (displayName: string): { valid: boolean; message?: string } => {
  if (!displayName || displayName.trim().length === 0) {
    return { valid: false, message: 'Display name is required.' };
  }

  if (displayName.trim().length < 2) {
    return { valid: false, message: 'Display name must be at least 2 characters long.' };
  }

  if (displayName.length > 50) {
    return { valid: false, message: 'Display name must be 50 characters or less.' };
  }

  return { valid: true };
};

/**
 * Sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Logs errors for debugging (can be extended to send to error tracking service)
 */
export const logError = (context: string, error: any): void => {
  console.error(`[${context}]`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};
