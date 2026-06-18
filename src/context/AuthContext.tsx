import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '@/src/lib/auth/tokenStorage';
import { tokenState } from '@/src/lib/auth/tokenState';
import { AuthUser, decodeUser, isTokenExpired, refreshTokens, revokeSession } from '@/src/lib/auth/auth';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveTokens = useCallback(async (newAccessToken: string, newRefreshToken: string) => {
    await Promise.all([
      tokenStorage.setAccessToken(newAccessToken),
      tokenStorage.setRefreshToken(newRefreshToken),
    ]);
    tokenState.set(newAccessToken, newRefreshToken);
    setAccessToken(newAccessToken);
    setUser(decodeUser(newAccessToken));
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenState.getRefreshToken();
    if (refreshToken) {
      revokeSession(refreshToken); // fire-and-forget; don't block local clear
    }
    await tokenStorage.clearTokens();
    tokenState.clear();
    setAccessToken(null);
    setUser(null);
  }, []);

  // Register logout so Axios interceptors can trigger it on unrecoverable 401.
  useEffect(() => {
    tokenState.registerLogout(logout);
  }, [logout]);

  // Restore session from persistent storage on mount.
  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedAccess, storedRefresh] = await Promise.all([
          tokenStorage.getAccessToken(),
          tokenStorage.getRefreshToken(),
        ]);

        if (!storedAccess || !storedRefresh) return;

        if (isTokenExpired(storedAccess)) {
          const tokens = await refreshTokens(storedRefresh);
          await saveTokens(tokens.access_token, tokens.refresh_token);
        } else {
          tokenState.set(storedAccess, storedRefresh);
          setAccessToken(storedAccess);
          setUser(decodeUser(storedAccess));
        }
      } catch {
        await tokenStorage.clearTokens();
        tokenState.clear();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [saveTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken,
        saveTokens,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
