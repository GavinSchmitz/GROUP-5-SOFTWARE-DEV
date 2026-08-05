"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { api } from "@/lib/api-client";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/api";
import type {
  SigninResponse,
  SigninUser,
  SignupRequest,
} from "@/types/api";

interface AuthSnapshot {
  user: SigninUser | null;
  token: string | null;
  hydrated: boolean;
}

const EMPTY_SNAPSHOT: AuthSnapshot = { user: null, token: null, hydrated: false };

let currentSnapshot: AuthSnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthSnapshot {
  return currentSnapshot;
}

function setSnapshot(next: AuthSnapshot): void {
  currentSnapshot = next;
  listeners.forEach((listener) => listener());
}

export interface AuthContextValue {
  user: SigninUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<SigninResponse>;
  signUp: (input: SignupRequest) => Promise<SigninResponse>;
  signOut: () => Promise<void>;
  refreshUser: (user: SigninUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_SNAPSHOT
  );

  useEffect(() => {
    if (currentSnapshot.hydrated) return;
    setSnapshot({
      user: getStoredUser<SigninUser>(),
      token: getToken(),
      hydrated: true,
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.post<SigninResponse>("/auth/signin", {
      email,
      password,
    });
    setToken(response.token);
    setStoredUser(response.user);
    setSnapshot({ user: response.user, token: response.token, hydrated: true });
    return response;
  }, []);

  const signUp = useCallback(
    async (input: SignupRequest) => {
      await api.post("/auth/signup", input);
      return signIn(input.email, input.password);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/signout");
    } catch {
      // token may already be invalid — always clear local state
    }
    clearAuth();
    setSnapshot({ user: null, token: null, hydrated: true });
  }, []);

  const refreshUser = useCallback((next: SigninUser) => {
    setStoredUser(next);
    setSnapshot({
      user: next,
      token: currentSnapshot.token,
      hydrated: true,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: !hydrated,
        isAdmin: user?.role === "ADMIN",
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
