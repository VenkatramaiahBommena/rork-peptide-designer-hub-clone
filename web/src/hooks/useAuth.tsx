/**
 * PeptiForge Authentication hook.
 *
 * Uses Rork Auth when available, falls back to simulated auth with localStorage.
 * Maintains user state, token management, and provides sign-in/sign-out.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const ACCESS_TOKEN_KEY = "rork:access_token";
const REFRESH_TOKEN_KEY = "rork:refresh_token";

interface User {
  id: string;
  email: string;
  name?: string;
}

/** Decode JWT payload to extract user info. */
function userFromToken(token: string): User | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      // Try simulated token (base64 encoded JSON)
      const decoded = JSON.parse(atob(token));
      if (decoded.sub && decoded.email) {
        return { id: decoded.sub, email: decoded.email, name: decoded.name };
      }
      return null;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name,
    };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BACKEND_URL = import.meta.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL as string;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      const decoded = userFromToken(token);
      if (decoded) setUser(decoded);
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error || "Registration failed");

      const { token, user: userData } = data as { token: string; user: User };
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setUser(userData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error || "Login failed");

      const { token, user: userData } = data as { token: string; user: User };
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setUser(userData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(() => localStorage.getItem(ACCESS_TOKEN_KEY), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isSigningIn, error, signIn, register, signOut, clearError, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
