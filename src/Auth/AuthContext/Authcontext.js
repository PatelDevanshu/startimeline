import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const Auth = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (localStorage.getItem("isAuthenticated") === "true") {
                setIsAuthenticated(true);
            }
            else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        }
        checkAuth();
    }, [])

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", true);
    }

    const logout = () => {
        localStorage.setItem("isAuthenticated", false);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
    }

    return (
        <AuthContext.Provider value={{ login, logout, isAuthenticated, user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};