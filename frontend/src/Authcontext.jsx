import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContextObject";

// Simple JWT expiry check (decode payload without verification)
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (userId && token) {
            if (isTokenExpired(token)) {
                // Token expired, clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setCurrentUser(null);
            } else {
                setCurrentUser(userId);
            }
        }
    }, []);

    const login = useCallback((token, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        setCurrentUser(userId);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setCurrentUser(null);
    }, []);

    const value = {
        currentUser,
        setCurrentUser,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
