import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

type Role = 'USER' | 'ADMIN' | string;

type UserClaims = {
    sub: string;
    username?: string;
    roles?: Role[];
    exp?: number;
    iat?: number;
};

type AuthContextType = {
    token: string | null;
    user?: UserClaims | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: Role) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserClaims | null>(null);

    useEffect(() => {
        (async () => {
            const t = await AsyncStorage.getItem('auth_token');
            if (t) {
                setToken(t);
                try {
                    setUser(jwtDecode<UserClaims>(t));
                } catch {
                }
            }
        })();
    }, []);

    const login = async (t: string) => {
        await AsyncStorage.setItem('auth_token', t);
        setToken(t);
        try {
            setUser(jwtDecode<UserClaims>(t));
        } catch {
            setUser(null);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    const hasRole = (role: Role) => user?.roles?.includes(role) ?? false;

    return <AuthContext.Provider value={{token, user, login, logout, hasRole}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
