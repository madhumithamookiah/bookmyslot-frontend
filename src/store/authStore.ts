import { useSyncExternalStore } from 'react';
import type { User } from '../types';
import { DEFAULT_ORGANIZATION_ID } from '../types';
import {
  fetchUsersFromDB,
  loginViaAPI,
  logoutViaAPI,
  initiateSignupViaAPI,
  verifySignupViaAPI,
  resendVerificationCodeViaAPI,
  requestPasswordResetViaAPI,
  verifyPasswordResetViaAPI,
} from '../services/apiService';

export interface StoredAccount extends User {
  passwordHash: string;
  isVerified: boolean;
  createdAt: string;
}

export interface PendingVerification {
  name: string;
  registrationNumber: string;
  email: string;
  passwordHash: string;
  code: string;
  expiresAt: number;
  sentAt: number;
}

const USERS_STORAGE_KEY = 'campus_sports_users_v2';
const PENDING_STORAGE_KEY = 'campus_sports_pending_verifications_v2';
const CURRENT_USER_KEY = 'campus_sports_current_user_v2';
const REMEMBER_ME_KEY = 'campus_sports_remember_me_v2';

export const ADMIN_EMAIL = 'admin@campus.com';
export const ADMIN_PASSWORD = 'admin@987';

export const ADMIN_USER: User = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@campus.com',
  role: 'org_admin',
  isAdmin: true,
  isVerified: true,
  isGuest: false,
  organizationId: DEFAULT_ORGANIZATION_ID,
};

export const SUPER_ADMIN_EMAIL = 'super@bookmyslot.com';
export const SUPER_ADMIN_PASSWORD = 'super@987';

export const SUPER_ADMIN_USER: User = {
  id: 'user-super-1',
  name: 'Platform Super Admin',
  email: 'super@bookmyslot.com',
  role: 'super_admin',
  isAdmin: true,
  isVerified: true,
  isGuest: false,
  organizationId: DEFAULT_ORGANIZATION_ID,
};

// Clean slate: NO MOCK DATA. Real accounts only.
function loadUsers(): StoredAccount[] {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed: StoredAccount[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out any legacy mock accounts
        return parsed.filter(
          u =>
            u.email !== 'rahul.campus@gmail.com' &&
            u.email !== 'alex.campus@gmail.com' &&
            u.passwordHash !== 'password123' &&
            u.isVerified === true
        );
      }
    }
  } catch (e) {
    console.error('Failed to parse saved users', e);
  }
  return [];
}

function loadPendingVerifications(): Record<string, PendingVerification> {
  try {
    const saved = localStorage.getItem(PENDING_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse pending verifications', e);
  }
  return {};
}

function loadCurrentUser(): User | null {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      const user = JSON.parse(saved);
      // Ensure only real verified users or guest are persisted
      if (
        user &&
        user.email !== 'rahul.campus@gmail.com' &&
        user.email !== 'alex.campus@gmail.com'
      ) {
        return user;
      }
    }
  } catch (e) {
    console.error('Failed to parse current user', e);
  }
  return null;
}

function loadRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
  } catch {
    return true;
  }
}

interface AuthState {
  users: StoredAccount[];
  pendingVerifications: Record<string, PendingVerification>;
  currentUser: User | null;
  rememberMe: boolean;
}

// Global Singleton Store State
let globalState: AuthState = {
  users: loadUsers(),
  pendingVerifications: loadPendingVerifications(),
  currentUser: loadCurrentUser(),
  rememberMe: loadRememberMe(),
};

// Sync users from DB if logged in as an admin with credentials
const syncUsersFromDB = () => {
  const current = globalState.currentUser;
  if (!current || (current.role !== 'org_admin' && current.role !== 'super_admin')) {
    return;
  }
  fetchUsersFromDB(current.organizationId).then(dbUsers => {
    if (dbUsers && Array.isArray(dbUsers)) {
      setGlobalState(prev => ({
        ...prev,
        users: dbUsers,
      }));
    }
  });
};

syncUsersFromDB();
setInterval(syncUsersFromDB, 5000);

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function setGlobalState(updater: (prev: AuthState) => AuthState) {
  globalState = updater(globalState);

  // Synchronously persist
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(globalState.users));
    localStorage.setItem(
      PENDING_STORAGE_KEY,
      JSON.stringify(globalState.pendingVerifications)
    );
    if (globalState.currentUser) {
      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(globalState.currentUser)
      );
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    localStorage.setItem(REMEMBER_ME_KEY, String(globalState.rememberMe));
  } catch (e) {
    console.error('Storage sync error:', e);
  }

  notifyListeners();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return globalState;
}

export function useAuthStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // 1. Real-time Login (Only verified accounts)
  const login = async (
    email: string,
    password: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string; user?: User; requiresVerification?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email ID.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Attempt secure server-side login
    const apiRes = await loginViaAPI(cleanEmail, cleanPassword);
    if (apiRes.success && apiRes.user) {
      setGlobalState(prev => ({
        ...prev,
        rememberMe: remember,
        currentUser: apiRes.user!,
      }));
      return { success: true, user: apiRes.user };
    }
    if (apiRes.error && (apiRes.error.includes('suspended') || apiRes.error.includes('Incorrect password') || apiRes.error.includes('pending activation'))) {
      return { success: false, error: apiRes.error };
    }

    // Check specific Admin credentials fallback
    if (cleanEmail === ADMIN_EMAIL) {
      if (cleanPassword === ADMIN_PASSWORD) {
        setGlobalState(prev => ({
          ...prev,
          rememberMe: remember,
          currentUser: ADMIN_USER,
        }));
        return { success: true, user: ADMIN_USER };
      } else {
        return {
          success: false,
          error: 'Incorrect admin password. Please try again.',
        };
      }
    }

    // Check specific Super Admin credentials fallback
    if (cleanEmail === SUPER_ADMIN_EMAIL) {
      if (cleanPassword === SUPER_ADMIN_PASSWORD) {
        setGlobalState(prev => ({
          ...prev,
          rememberMe: remember,
          currentUser: SUPER_ADMIN_USER,
        }));
        return { success: true, user: SUPER_ADMIN_USER };
      } else {
        return {
          success: false,
          error: 'Incorrect Super Admin password. Please try again.',
        };
      }
    }

    let found = globalState.users.find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );

    // Attempt live fetch from Supabase DB if not in local memory
    if (!found) {
      const dbUsers = await fetchUsersFromDB();
      if (dbUsers && Array.isArray(dbUsers)) {
        setGlobalState(prev => ({
          ...prev,
          users: dbUsers,
        }));
        found = dbUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
      }
    }

    if (!found) {
      // Check if there is a pending unverified registration for this email
      if (globalState.pendingVerifications[cleanEmail]) {
        return {
          success: false,
          requiresVerification: true,
          error: 'Your account is pending verification. Please enter the verification code sent to your email.',
        };
      }
      return {
        success: false,
        error: `No verified account found for "${cleanEmail}". Please create an account.`,
      };
    }

    if (found.passwordHash !== cleanPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please try again or reset your password.',
      };
    }

    const authUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      registrationNumber: found.registrationNumber,
      isGuest: false,
      isVerified: true,
    };

    setGlobalState(prev => ({
      ...prev,
      rememberMe: remember,
      currentUser: authUser,
    }));

    return { success: true, user: authUser };
  };

  // 2. Initiate Real-time Sign-up (Dispatches 6-digit verification code via SMTP)
  const initiateSignup = async (
    name: string,
    registrationNumber: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; email?: string }> => {
    const cleanName = name.trim();
    const cleanReg = registrationNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanReg) {
      return { success: false, error: 'Please enter your registration number.' };
    }
    if (cleanReg.length !== 8) {
      return {
        success: false,
        error: 'Register number must be exactly 8 characters (e.g. 22BCE104).',
      };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email ID.' };
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
      };
    }

    // Check if account already exists and is verified
    const existing = globalState.users.find(
      u => u.email.trim().toLowerCase() === cleanEmail
    );
    if (existing) {
      return {
        success: false,
        error: `An active account with "${cleanEmail}" already exists. Please log in.`,
      };
    }

    // Check if an account with this Register Number already exists
    const existingReg = globalState.users.find(
      u =>
        u.registrationNumber &&
        u.registrationNumber.trim().toUpperCase() === cleanReg
    );
    if (existingReg) {
      return {
        success: false,
        error: `An account with Register Number "${cleanReg}" already exists.`,
      };
    }

    // Check if a pending registration with this Register Number is already in progress
    const pendingReg = Object.values(globalState.pendingVerifications).find(
      p =>
        p.registrationNumber &&
        p.registrationNumber.trim().toUpperCase() === cleanReg &&
        p.email !== cleanEmail
    );
    if (pendingReg) {
      return {
        success: false,
        error: `An account registration for Register Number "${cleanReg}" is already pending verification.`,
      };
    }

    // Initiate Real-time Sign-up via hardened server API
    const apiRes = await initiateSignupViaAPI(cleanName, cleanReg, cleanEmail, cleanPassword);
    if (!apiRes.success && apiRes.error) {
      return { success: false, error: apiRes.error };
    }

    const pendingData: PendingVerification = {
      name: cleanName,
      registrationNumber: cleanReg,
      email: cleanEmail,
      passwordHash: '', // never stored on client
      code: 'SERVER_MANAGED',
      expiresAt: Date.now() + 10 * 60 * 1000,
      sentAt: Date.now(),
    };

    setGlobalState(prev => ({
      ...prev,
      pendingVerifications: {
        ...prev.pendingVerifications,
        [cleanEmail]: pendingData,
      },
    }));

    return { success: true, email: cleanEmail };
  };

  // 3. Verify Code and Complete Registration via hardened server API
  const verifySignup = async (
    email: string,
    enteredCode: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = enteredCode.trim();

    if (!cleanCode) {
      return { success: false, error: 'Please enter the verification code.' };
    }

    const apiRes = await verifySignupViaAPI(cleanEmail, cleanCode);
    if (apiRes.success && apiRes.user) {
      setGlobalState(prev => {
        const nextPending = { ...prev.pendingVerifications };
        delete nextPending[cleanEmail];
        return {
          ...prev,
          pendingVerifications: nextPending,
          currentUser: apiRes.user!,
        };
      });
      return { success: true, user: apiRes.user };
    }

    return {
      success: false,
      error: apiRes.error || 'Failed to verify signup code.',
    };
  };

  // 4. Resend Verification Code via hardened server API
  const resendVerificationCode = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const apiRes = await resendVerificationCodeViaAPI(cleanEmail);
    if (apiRes.success) {
      return {
        success: true,
        message: apiRes.message || `A new verification code was sent to ${cleanEmail}.`,
      };
    }
    return {
      success: false,
      error: apiRes.error || 'Failed to resend verification code.',
    };
  };

  // 5. Continue As Guest
  const continueAsGuest = (): User => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: '',
      registrationNumber: '',
      isGuest: true,
      isVerified: true,
      organizationId: DEFAULT_ORGANIZATION_ID,
    };

    setGlobalState(prev => ({
      ...prev,
      currentUser: guestUser,
    }));

    return guestUser;
  };

  const logout = () => {
    logoutViaAPI();
    setGlobalState(prev => ({
      ...prev,
      currentUser: null,
    }));
  };

  const setRememberMe = (remember: boolean) => {
    setGlobalState(prev => ({
      ...prev,
      rememberMe: remember,
    }));
  };

  // 6. Reset Password via hardened server API
  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const apiRes = await requestPasswordResetViaAPI(cleanEmail);
    if (apiRes.success) {
      return {
        success: true,
        message: apiRes.message || `If an account exists for ${cleanEmail}, a reset code has been sent.`,
      };
    }
    return {
      success: false,
      error: apiRes.error || 'Failed to request password reset.',
    };
  };

  // 7. Verify Password Reset via hardened server API
  const verifyPasswordReset = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const apiRes = await verifyPasswordResetViaAPI(cleanEmail, cleanCode, newPassword);
    if (apiRes.success) {
      return {
        success: true,
        message: apiRes.message || 'Password reset successfully.',
      };
    }
    return {
      success: false,
      error: apiRes.error || 'Failed to reset password.',
    };
  };

  return {
    currentUser: state.currentUser,
    users: state.users,
    pendingVerifications: state.pendingVerifications,
    rememberMe: state.rememberMe,
    setRememberMe,
    login,
    initiateSignup,
    verifySignup,
    resendVerificationCode,
    continueAsGuest,
    logout,
    requestPasswordReset,
    verifyPasswordReset,
  };
}
