# 🔒 Security Audit Report - HikeMatch Application

**Date:** October 20, 2025  
**Application:** HikeMatch  
**Technology Stack:** React + TypeScript + Firebase (Firestore + Authentication)  
**Lines of Code:** ~6,500+ lines  
**Auditor:** AI Security Review  

---

## Executive Summary

This comprehensive security audit identified **12 security issues** ranging from **CRITICAL** to **LOW** severity. The application has several security vulnerabilities that require immediate attention, particularly around Firebase security rules, API key exposure, and authorization controls.

### Risk Summary
- 🔴 **CRITICAL**: 2 issues
- 🟠 **HIGH**: 3 issues  
- 🟡 **MEDIUM**: 4 issues
- 🟢 **LOW**: 3 issues

---

## 🔴 CRITICAL SEVERITY ISSUES

### 1. Insecure Firestore Security Rules - Wide Open Database
**File:** `firestore.rules`  
**Risk Level:** CRITICAL  
**CWE:** CWE-285 (Improper Authorization)

**Issue:**
```javascript
match /{document=**} {
  allow read, write: if request.time < timestamp.date(2025, 11, 13);
}
```

Your Firestore database is currently **WIDE OPEN** to anyone with your Firebase project ID until November 13, 2025. This is the default "test mode" configuration.

**Impact:**
- ❌ Any user can read ALL data from all collections
- ❌ Any user can modify or delete ANY document
- ❌ No authentication required
- ❌ Complete data breach risk
- ❌ Users can access other users' private data (matches, swipes, profiles)
- ❌ Malicious users can delete the entire database
- ❌ Data integrity completely compromised

**Proof of Concept:**
```javascript
// Anyone can execute this from their browser console:
const db = getFirestore();
const allUsers = await getDocs(collection(db, 'users'));
// Returns ALL user profiles, emails, etc.

const matches = await getDocs(collection(db, 'matches'));
// Returns ALL matches for ALL users

// Or worse - delete everything:
await deleteDoc(doc(db, 'users', 'any-user-id'));
```

**Remediation:**
Immediately replace with production-ready security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isItemOwner() {
      return isAuthenticated() && 
             (resource.data.createdBy == request.auth.uid ||
              !('createdBy' in resource.data)); // For legacy items
    }
    
    // Users - can only read all, write own
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
      allow delete: if false;
    }
    
    // Trails/Items - read if authenticated, write only own contributions
    match /{collection}/{itemId} {
      allow read: if isAuthenticated() && 
                     collection in ['trails', 'movies', 'tvShows', 'restaurants'];
      allow create: if isAuthenticated() && 
                       collection in ['trails', 'movies', 'tvShows', 'restaurants'] &&
                       request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if isItemOwner() &&
                               collection in ['trails', 'movies', 'tvShows', 'restaurants'];
    }
    
    // User swipes - only own
    match /userSwipes/{userId}/swipes/{swipeId} {
      allow read, write: if isOwner(userId);
    }
    
    // Matches - only for participants
    match /matches/{matchId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.userIds;
      allow create: if isAuthenticated() &&
                       request.auth.uid in request.resource.data.userIds;
      allow update, delete: if false;
    }
    
    // User contributions tracking
    match /userContributions/{contributionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Connection requests
    match /connectionRequests/{requestId} {
      allow read: if isAuthenticated() && 
                     (resource.data.fromUserId == request.auth.uid ||
                      resource.data.toUserId == request.auth.uid);
      allow create: if isAuthenticated() &&
                       request.resource.data.fromUserId == request.auth.uid;
      allow update: if isAuthenticated() &&
                       resource.data.toUserId == request.auth.uid;
      allow delete: if isAuthenticated() &&
                       resource.data.fromUserId == request.auth.uid;
    }
    
    // Connections
    match /connections/{connectionId} {
      allow read: if isAuthenticated() &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.connectedUserId == request.auth.uid);
      allow create: if isAuthenticated();
      allow delete: if isAuthenticated() &&
                       resource.data.userId == request.auth.uid;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Deployment Steps:**
1. Go to Firebase Console → Firestore Database → Rules
2. Replace entire rules file with above
3. Click "Publish"
4. Test thoroughly with authenticated and unauthenticated users

**Priority:** 🔥 **DEPLOY IMMEDIATELY** - This is a critical production blocker

---

### 2. Exposed Firebase API Keys in Repository
**File:** `.env`, `scripts/updateTrails.ts`  
**Risk Level:** CRITICAL  
**CWE:** CWE-798 (Use of Hard-coded Credentials)

**Issue:**
```typescript
// .env file contains actual Firebase credentials
VITE_FIREBASE_API_KEY=AIzaSyC18XDo55XZ6AjIsvkk5cSQeeuz_qtNyhA
VITE_FIREBASE_PROJECT_ID=hikematch42

// scripts/updateTrails.ts has hardcoded config
const firebaseConfig = {
  apiKey: "AIzaSyBdABsUO9CvnuaLyYvMTLpGkiKLKwB9dGQ",
  authDomain: "hikematch42.firebaseapp.com",
  projectId: "hikematch42",
  // ...
};
```

**Impact:**
- ✅ API keys are visible in GitHub repository
- ✅ Anyone can clone repo and access Firebase project
- ✅ Combined with open security rules = complete compromise
- ✅ Potential for abuse, quota exhaustion, cost overruns
- ✅ Cannot revoke these keys without breaking app

**Important Note:**
Firebase API keys for web apps are **designed to be public** - they're embedded in your client-side code. However:
1. They should still not be committed to public repos
2. Security MUST be enforced via Firestore Rules (see Issue #1)
3. Without proper rules, exposed keys = full database access

**Remediation:**

1. **Immediately add `.env` to `.gitignore`:**
```bash
# .gitignore
.env
.env.local
.env.*.local
```

2. **Remove `.env` from git history:**
```bash
# Remove from current commit
git rm --cached .env

# Remove from entire git history (CAUTION)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if necessary)
git push origin --force --all
```

3. **Refactor `scripts/updateTrails.ts`:**
```typescript
// Use environment variables or Firebase config file
import { config } from 'dotenv';
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

4. **Consider Firebase App Check:**
Adds an additional layer protecting against unauthorized clients:
```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

**Priority:** 🔥 **FIX IMMEDIATELY** - Remove from git history, secure with rules

---

## 🟠 HIGH SEVERITY ISSUES

### 3. Missing Authorization Checks in User Contributions
**File:** `src/lib/firestoreHelpers.ts` (lines 963-1015)  
**Risk Level:** HIGH  
**CWE:** CWE-862 (Missing Authorization)

**Issue:**
```typescript
export const updateUserContribution = async (
  itemId: string,
  category: CategoryType,
  updates: Partial<SwipeItem>
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to update');
  }
  
  // No check if currentUser actually owns this contribution!
  const itemRef = doc(db, collectionName, itemId);
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};
```

**Impact:**
- ❌ Any authenticated user can modify ANY contribution
- ❌ User A can edit/delete User B's items
- ❌ No ownership verification before update/delete
- ❌ Potential for vandalism, data corruption

**Remediation:**
```typescript
export const updateUserContribution = async (
  itemId: string,
  category: CategoryType,
  updates: Partial<SwipeItem>
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to update');
  }

  const userId = auth.currentUser.uid;
  const collectionName = category === 'hikes' ? 'trails' : 
                        category === 'tv' ? 'tvShows' : category;
  
  // ✅ Verify ownership BEFORE allowing update
  const itemRef = doc(db, collectionName, itemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) {
    throw new Error('Item not found');
  }
  
  const itemData = itemSnap.data();
  
  // ✅ Check if user owns this item
  if (itemData.createdBy && itemData.createdBy !== userId) {
    throw new Error('Unauthorized: You can only edit your own contributions');
  }
  
  // ✅ Prevent tampering with ownership fields
  const safeUpdates = { ...updates };
  delete safeUpdates.createdBy; // Cannot change owner
  delete safeUpdates.id; // Cannot change ID
  
  await updateDoc(itemRef, {
    ...safeUpdates,
    updatedAt: Timestamp.now(),
  });
};
```

Apply same fix to `deleteUserContribution()`.

**Priority:** 🔥 Fix before production

---

### 4. Client-Side Rate Limiting is Bypassable
**File:** `src/lib/contributionValidation.ts` (lines 293-323)  
**Risk Level:** HIGH  
**CWE:** CWE-807 (Reliance on Untrusted Inputs)

**Issue:**
```typescript
export const checkRateLimit = (category: CategoryType): { allowed: boolean; waitTime?: number } => {
  const key = `lastContribution_${category}`;
  const lastContribution = localStorage.getItem(key); // ❌ Client-side only!
  
  if (!lastContribution) {
    return { allowed: true };
  }
  // ... timing check
};
```

**Impact:**
- ❌ Users can clear `localStorage` and bypass rate limit
- ❌ No server-side enforcement
- ❌ Spam contributions possible
- ❌ Database pollution risk

**Bypass:**
```javascript
// User can easily bypass:
localStorage.clear(); // Rate limit gone!
```

**Remediation:**

Implement server-side rate limiting using Firestore:

```typescript
// Server-side function (move to Cloud Functions)
export const checkRateLimitServer = async (
  userId: string, 
  category: CategoryType
): Promise<{ allowed: boolean; waitTime?: number }> => {
  const rateLimitRef = doc(db, `rateLimits/${userId}_${category}`);
  const rateLimitSnap = await getDoc(rateLimitRef);
  
  if (!rateLimitSnap.exists()) {
    return { allowed: true };
  }
  
  const lastContribution = rateLimitSnap.data().timestamp.toMillis();
  const now = Date.now();
  const cooldownMs = 5 * 60 * 1000;
  const timeSince = now - lastContribution;
  
  if (timeSince < cooldownMs) {
    const waitTime = Math.ceil((cooldownMs - timeSince) / 1000 / 60);
    return { allowed: false, waitTime };
  }
  
  return { allowed: true };
};

// Update after successful contribution
export const updateRateLimitServer = async (
  userId: string,
  category: CategoryType
): Promise<void> => {
  const rateLimitRef = doc(db, `rateLimits/${userId}_${category}`);
  await setDoc(rateLimitRef, {
    timestamp: Timestamp.now(),
    userId,
    category
  });
};
```

**Alternative:** Use Firebase Security Rules with timestamps:
```javascript
// In firestore.rules
match /trails/{itemId} {
  allow create: if isAuthenticated() &&
    !exists(/databases/$(database)/documents/rateLimits/$(request.auth.uid + '_trails')) ||
    get(/databases/$(database)/documents/rateLimits/$(request.auth.uid + '_trails')).data.timestamp < 
      request.time - duration.value(5, 'm');
}
```

**Priority:** High - Implement server-side validation

---

### 5. No CSRF Protection on State-Changing Operations
**Risk Level:** HIGH  
**CWE:** CWE-352 (Cross-Site Request Forgery)

**Issue:**
The application performs state-changing operations (swipes, matches, connections) without CSRF tokens. While Firebase Authentication provides some protection, it's not sufficient for all scenarios.

**Impact:**
- ❌ Potential for CSRF attacks if tokens are leaked
- ❌ Malicious sites could trigger unwanted actions
- ❌ Cross-origin request vulnerabilities

**Remediation:**

1. **Enable Firebase App Check:**
```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('site-key'),
  isTokenAutoRefreshEnabled: true
});
```

2. **Implement SameSite cookies** (if using custom sessions):
```typescript
// In your session configuration
{
  sameSite: 'strict',
  secure: true,
  httpOnly: true
}
```

3. **Validate origin headers:**
```typescript
// In Cloud Functions
const allowedOrigins = ['https://yourdomain.com'];
if (!allowedOrigins.includes(request.headers.origin)) {
  throw new functions.https.HttpsError('permission-denied', 'Invalid origin');
}
```

**Priority:** High - Implement before public launch

---

## 🟡 MEDIUM SEVERITY ISSUES

### 6. Weak Password Policy
**File:** `src/lib/errorHandling.ts` (line 114)  
**Risk Level:** MEDIUM  
**CWE:** CWE-521 (Weak Password Requirements)

**Issue:**
```typescript
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  // Only suggests mixing letters and numbers, doesn't enforce
  if (!hasLetter || !hasNumber) {
    return { 
      valid: true, // ❌ Still accepts weak passwords
      message: '⚠️ For better security, use a mix of letters and numbers.' 
    };
  }
}
```

**Impact:**
- ❌ Passwords like "aaaaaa" or "123456" are accepted
- ❌ No special character requirement
- ❌ No upper/lower case mix
- ❌ Vulnerable to brute force attacks

**Remediation:**
```typescript
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) { // ✅ Minimum 8 characters
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long.' };
  }
  
  // ✅ Enforce requirements
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasLower || !hasUpper || !hasNumber) {
    return { 
      valid: false, 
      message: 'Password must contain uppercase, lowercase, and numbers.' 
    };
  }
  
  // ✅ Recommend but don't require special chars (better UX)
  if (!hasSpecial) {
    return {
      valid: true,
      message: '⚠️ Consider adding special characters for better security.'
    };
  }
  
  // ✅ Check against common passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'Password1'];
  if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
    return { valid: false, message: 'This password is too common. Please choose a stronger one.' };
  }
  
  return { valid: true };
};
```

**Priority:** Medium - Improve for better security

---

### 7. Username Enumeration Vulnerability
**File:** `src/lib/firestoreHelpers.ts` (line 158), `src/components/AuthForm.tsx`  
**Risk Level:** MEDIUM  
**CWE:** CWE-204 (Observable Response Discrepancy)

**Issue:**
```typescript
// Different error messages reveal if username exists
export const signIn = async (username: string, password: string): Promise<User> => {
  const email = await getEmailFromUsername(username);
  
  if (!email) {
    throw new Error('Username not found'); // ❌ Reveals username doesn't exist
  }
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user; // ❌ Different error for wrong password
};
```

**Impact:**
- ❌ Attackers can enumerate valid usernames
- ❌ Helps targeted attacks
- ❌ Privacy leak - confirms if someone has an account

**Remediation:**
```typescript
export const signIn = async (username: string, password: string): Promise<User> => {
  try {
    const email = await getEmailFromUsername(username);
    
    if (!email) {
      // ✅ Generic error that doesn't reveal existence
      throw new Error('INVALID_CREDENTIALS');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // ✅ Always return same generic error
    if (error.code === 'auth/wrong-password' || 
        error.code === 'auth/user-not-found' ||
        error.message === 'INVALID_CREDENTIALS') {
      throw new Error('Invalid username or password'); // Same message for both
    }
    throw error;
  }
};
```

**Priority:** Medium - Fix to prevent enumeration

---

### 8. Insufficient Input Sanitization for User-Generated Content
**File:** Multiple files with user input  
**Risk Level:** MEDIUM  
**CWE:** CWE-79 (Cross-Site Scripting - Stored)

**Issue:**
User-generated content (trail names, descriptions, reviews) is stored without sanitization. While React provides XSS protection by default, there are edge cases:

```typescript
// src/lib/errorHandling.ts
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' '); // ❌ Only removes whitespace
};
```

**Impact:**
- ⚠️ Limited XSS risk (React escapes by default)
- ❌ No protection against HTML injection if rendered improperly
- ❌ No script tag filtering
- ❌ Database pollution with malicious content

**Remediation:**
```typescript
// Install: npm install dompurify
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  // Remove excessive whitespace
  let cleaned = input.trim().replace(/\s+/g, ' ');
  
  // Remove potentially dangerous characters
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: []
  });
  
  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length
  return cleaned.substring(0, 1000);
};

// For rich text fields (descriptions)
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};
```

**Additional Protection:**
```typescript
// Add Content Security Policy
// In index.html <head>
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://apis.google.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' https: data:;
               connect-src 'self' https://*.firebaseio.com https://*.googleapis.com">
```

**Priority:** Medium - Add robust sanitization

---

### 9. Lack of Input Validation on Image URLs
**File:** `src/lib/contributionValidation.ts` (line 16)  
**Risk Level:** MEDIUM  
**CWE:** CWE-20 (Improper Input Validation)

**Issue:**
```typescript
export const validateImageURL = (url: string): { valid: boolean; message?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: false, message: 'Image URL is required' };
  }

  try {
    new URL(url); // ❌ Only checks if it's a valid URL
    return { valid: true };
  } catch {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};
```

**Impact:**
- ❌ Accepts `javascript:` URLs
- ❌ Accepts `data:` URLs with potential malicious content
- ❌ Accepts non-image URLs
- ❌ No SSRF protection

**Remediation:**
```typescript
export const validateImageURL = (url: string): { valid: boolean; message?: string } => {
  if (!url || url.trim().length === 0) {
    return { valid: false, message: 'Image URL is required' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { valid: false, message: 'Please enter a valid URL' };
  }

  // ✅ Only allow HTTPS (except localhost for dev)
  if (parsedUrl.protocol !== 'https:' && 
      !parsedUrl.hostname.includes('localhost')) {
    return { valid: false, message: 'Image URL must use HTTPS' };
  }

  // ✅ Whitelist allowed domains
  const allowedDomains = [
    'images.unsplash.com',
    'unsplash.com',
    'upload.wikimedia.org',
    'image.tmdb.org',
    'i.imgur.com',
    'firebasestorage.googleapis.com',
    'via.placeholder.com' // For testing
  ];

  const isAllowedDomain = allowedDomains.some(domain => 
    parsedUrl.hostname === domain || 
    parsedUrl.hostname.endsWith('.' + domain)
  );

  if (!isAllowedDomain) {
    return { 
      valid: false, 
      message: 'Image must be from a trusted source (Unsplash, Wikipedia, TMDb, Imgur, or Firebase Storage)' 
    };
  }

  // ✅ Check file extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    parsedUrl.pathname.toLowerCase().endsWith(ext)
  );

  // Allow URLs without extensions if they have image parameters
  const hasImageParams = parsedUrl.search.includes('w=') || 
                         parsedUrl.search.includes('q=') ||
                         parsedUrl.pathname.includes('/photo-');

  if (!hasImageExtension && !hasImageParams) {
    return { 
      valid: false, 
      message: 'URL must point to an image file' 
    };
  }

  return { valid: true };
};
```

**Priority:** Medium - Prevent malicious URLs

---

## 🟢 LOW SEVERITY ISSUES

### 10. Verbose Error Messages Expose System Information
**File:** Multiple files with error handling  
**Risk Level:** LOW  
**CWE:** CWE-209 (Information Exposure Through Error Message)

**Issue:**
```typescript
console.error('Demo login error:', error); // ❌ Logs full error details
throw error; // ❌ Exposes error stack to client
```

**Impact:**
- ⚠️ Stack traces reveal file paths and structure
- ⚠️ Error messages may leak database structure
- ⚠️ Aids reconnaissance for attackers

**Remediation:**
```typescript
// Create error logger that sanitizes in production
export const logError = (context: string, error: any): void => {
  if (import.meta.env.DEV) {
    // Full details in development
    console.error(`[${context}]`, error);
  } else {
    // Sanitized in production
    console.error(`[${context}]`, {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
      // Don't log: stack, fileName, lineNumber
    });
  }
  
  // Send to monitoring service (Sentry, LogRocket, etc.)
  // captureException(error, { tags: { context } });
};

// Use generic errors for users
try {
  await riskyOperation();
} catch (error) {
  logError('Operation', error); // Log detailed error server-side
  throw new Error('An error occurred. Please try again.'); // Generic message to user
}
```

**Priority:** Low - Sanitize before production

---

### 11. No Rate Limiting on Authentication Endpoints
**File:** Authentication logic  
**Risk Level:** LOW  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Issue:**
No rate limiting on login attempts allows brute force attacks.

**Impact:**
- ⚠️ Potential brute force attacks on passwords
- ⚠️ Account enumeration through timing attacks
- ⚠️ DoS through excessive auth attempts

**Remediation:**

Firebase Authentication has built-in rate limiting, but enhance it:

```typescript
// Implement exponential backoff
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

export const checkLoginAttempts = (username: string): { allowed: boolean; waitTime?: number } => {
  const key = `loginAttempts_${username}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return { allowed: true };
  }
  
  const attempt: LoginAttempt = JSON.parse(stored);
  const now = Date.now();
  
  if (attempt.lockedUntil > now) {
    const waitTime = Math.ceil((attempt.lockedUntil - now) / 1000 / 60);
    return { allowed: false, waitTime };
  }
  
  return { allowed: true };
};

export const recordLoginAttempt = (username: string, success: boolean): void => {
  const key = `loginAttempts_${username}`;
  const stored = localStorage.getItem(key);
  let attempt: LoginAttempt;
  
  if (!stored) {
    attempt = { count: 0, lastAttempt: 0, lockedUntil: 0 };
  } else {
    attempt = JSON.parse(stored);
  }
  
  if (success) {
    // Reset on successful login
    localStorage.removeItem(key);
    return;
  }
  
  attempt.count++;
  attempt.lastAttempt = Date.now();
  
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  localStorage.setItem(key, JSON.stringify(attempt));
};
```

**Better Solution:** Use Firebase's built-in rate limiting + reCAPTCHA:
```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Enable App Check
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('site-key'),
  isTokenAutoRefreshEnabled: true
});
```

**Priority:** Low - Firebase handles basic protection

---

### 12. Missing Security Headers
**Risk Level:** LOW  
**CWE:** CWE-693 (Protection Mechanism Failure)

**Issue:**
Application lacks security headers for defense in depth.

**Impact:**
- ⚠️ No clickjacking protection
- ⚠️ No MIME-sniffing protection
- ⚠️ Missing referrer policy

**Remediation:**

Add headers via `vercel.json` (or hosting config):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com"
        }
      ]
    }
  ]
}
```

**Priority:** Low - Add for defense in depth

---

## Additional Security Recommendations

### 1. Implement Monitoring and Alerting
- Set up Firebase Crashlytics for error tracking
- Monitor authentication failures
- Track unusual database access patterns
- Set up alerts for excessive writes/reads

### 2. Regular Security Audits
- Review Firestore rules quarterly
- Audit user permissions and access logs
- Update dependencies regularly (`npm audit fix`)
- Penetration testing before major releases

### 3. Data Privacy Compliance
- Implement data deletion on user request (GDPR)
- Add privacy policy and terms of service
- Implement consent management
- Regular data backup and encryption at rest

### 4. Development Best Practices
```typescript
// Always validate on both client AND server
// Client-side for UX
if (!isValidInput(userInput)) {
  showError('Invalid input');
  return;
}

// Server-side for security (in Cloud Functions)
if (!isValidInput(data.userInput)) {
  throw new functions.https.HttpsError('invalid-argument', 'Invalid input');
}
```

### 5. Use Environment-Specific Configuration
```typescript
// .env.development
VITE_FIREBASE_PROJECT_ID=hikematch-dev

// .env.production
VITE_FIREBASE_PROJECT_ID=hikematch-prod
```

---

## Remediation Priority Order

### Immediate (Week 1)
1. 🔴 Deploy production Firestore security rules
2. 🔴 Remove `.env` from git repository
3. 🟠 Add ownership checks to update/delete functions

### Short-term (Week 2-4)
4. 🟠 Implement server-side rate limiting
5. 🟠 Add Firebase App Check
6. 🟡 Improve password policy
7. 🟡 Fix username enumeration

### Medium-term (Month 2-3)
8. 🟡 Enhance input sanitization
9. 🟡 Whitelist image URL domains
10. 🟢 Sanitize error messages for production
11. 🟢 Add security headers

### Ongoing
12. Regular dependency updates
13. Security audit schedule
14. Monitoring and alerting setup

---

## Testing Checklist

After implementing fixes, test:

- [ ] Unauthenticated users cannot access data
- [ ] Users can only modify their own contributions
- [ ] Rate limiting prevents spam
- [ ] XSS attempts are blocked
- [ ] Invalid image URLs are rejected
- [ ] CSRF attacks are prevented
- [ ] Error messages don't leak information
- [ ] Security headers are present
- [ ] Password policy is enforced
- [ ] All production secrets are in environment variables

---

## Conclusion

The HikeMatch application has a solid foundation with Firebase Authentication and good client-side validation. However, **critical security issues must be addressed immediately**, particularly:

1. **Open Firestore database** - Deploy proper security rules NOW
2. **Exposed credentials** - Remove from git history
3. **Missing authorization checks** - Verify ownership before updates

After addressing these critical issues, the application will have a significantly improved security posture. Continue with the short-term and medium-term remediation items before launching to production.

**Estimated Effort:**
- Critical fixes: 4-8 hours
- High priority: 8-16 hours  
- Medium priority: 16-24 hours
- Low priority: 8-12 hours

**Total:** ~36-60 hours for comprehensive security improvements

---

**Report Generated:** October 20, 2025  
**Next Review:** After critical fixes are deployed  
**Contact:** Please address critical issues before public launch
