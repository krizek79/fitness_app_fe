import React, { createContext, useContext } from 'react';
import { useGetOrCreateCurrentUser } from '@/src/api/generated/user/user';
import { useAuth } from '@/src/context/AuthContext';
import type { UserResponse } from '@/src/api/generated/model';

interface UserContextValue {
  currentUser: UserResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, refetch } = useGetOrCreateCurrentUser(
    { query: { enabled: isAuthenticated } },
  );

  return (
    <UserContext.Provider
      value={{
        currentUser: data,
        isLoading,
        isError,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useCurrentUser must be used inside UserProvider');
  return ctx;
}
