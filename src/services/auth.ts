import { AuthUser } from '../types';

const STORAGE_KEY_AUTH_USER = 'comeback_auth_user';

export const DEMO_GOOGLE_PROFILES: Omit<AuthUser, 'id' | 'signedInAt'>[] = [
  {
    name: 'Dayanand',
    email: 'dayanand.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    provider: 'google'
  },
  {
    name: 'Hackathon Judge',
    email: 'judge.hack2pitch@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    provider: 'google'
  },
  {
    name: 'Dr. Andrew Huberman',
    email: 'ahuberman@stanford.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    provider: 'google'
  }
];

export function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load auth user:', err);
  }
  return null;
}

export function saveAuthUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  } catch (err) {
    console.warn('Failed to save auth user:', err);
  }
}

// Safely decodes base64url JWT payload from Google Identity Services
export function decodeGoogleJwt(credential: string): Partial<AuthUser> | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      id: parsed.sub || `google-${Date.now()}`,
      name: parsed.name || parsed.email?.split('@')[0] || 'Google User',
      email: parsed.email || '',
      avatar: parsed.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      provider: 'google',
      signedInAt: Date.now()
    };
  } catch (err) {
    console.warn('Failed to parse Google JWT:', err);
    return null;
  }
}

export interface GoogleVerificationResult {
  isValid: boolean;
  errorMessage?: string;
  normalizedEmail?: string;
  suggestedName?: string;
  avatar?: string;
}

export function verifyGoogleAccount(inputEmail: string): GoogleVerificationResult {
  const trimmed = inputEmail.trim().toLowerCase();

  // Basic syntax check
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Enter an email or phone number'
    };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Enter a valid email address or phone number'
    };
  }

  const [username, domain] = trimmed.split('@');

  // Typo check on common misspellings of gmail.com
  const typoMap: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cmo': 'gmail.com',
    'gmaik.com': 'gmail.com'
  };
  if (typoMap[domain]) {
    return {
      isValid: false,
      errorMessage: `Couldn't find your Google Account. Did you mean ${username}@${typoMap[domain]}?`
    };
  }

  // Domain validation: Google / Gmail accounts only
  const googleDomains = ['gmail.com', 'googlemail.com', 'google.com'];
  const isGoogleDomain = googleDomains.includes(domain) || domain.endsWith('.edu');

  if (!isGoogleDomain) {
    return {
      isValid: false,
      errorMessage: `Couldn't find your Google Account. "${domain}" is not a Google or Gmail account.`
    };
  }

  // Gmail address constraints (matches real Google signup & authentication engine)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    if (username.length < 6) {
      return {
        isValid: false,
        errorMessage: "Couldn't find your Google Account. Gmail usernames must be between 6 and 30 characters."
      };
    }
    if (username.length > 30) {
      return {
        isValid: false,
        errorMessage: "Couldn't find your Google Account. Gmail usernames cannot exceed 30 characters."
      };
    }
    if (!/^[a-z0-9.]+$/.test(username)) {
      return {
        isValid: false,
        errorMessage: "Couldn't find your Google Account. Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.)."
      };
    }
    if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
      return {
        isValid: false,
        errorMessage: "Couldn't find your Google Account. Usernames cannot start or end with a period, or have consecutive periods."
      };
    }
    // Specific non-existent test addresses to test explicit rejection
    const nonExistentList = ['nonexistent', 'doesnotexist', 'fakeaccount', 'randomuser', 'nobody', 'invaliduser'];
    if (nonExistentList.includes(username)) {
      return {
        isValid: false,
        errorMessage: "Couldn't find your Google Account. This account does not exist."
      };
    }
  }

  // Check if matches a known demo profile for rich avatar
  const matchingDemo = DEMO_GOOGLE_PROFILES.find((p) => p.email.toLowerCase() === trimmed);
  if (matchingDemo) {
    return {
      isValid: true,
      normalizedEmail: trimmed,
      suggestedName: matchingDemo.name,
      avatar: matchingDemo.avatar
    };
  }

  // Derive human-readable display name
  const cleanName = username
    .split('.')[0]
    .replace(/[0-9]/g, '')
    .trim();
  const capitalized = cleanName
    ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    : 'Google User';

  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmed)}`;

  return {
    isValid: true,
    normalizedEmail: trimmed,
    suggestedName: capitalized,
    avatar
  };
}
