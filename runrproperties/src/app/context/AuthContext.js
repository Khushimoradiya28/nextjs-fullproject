"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  loginUser,
  signupUser,
  logoutUser,
  updateProfile,
  changePassword as changePasswordAPI,
  forgotPassword as forgotPasswordAPI,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.user);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginUser(credentials);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback(async (data) => {
    const result = await signupUser(data);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("/bank-partner")) {
        window.location.href = "/bank-partner/login";
      } else {
        window.location.href = "/";
      }
    }
  }, []);

  const update = useCallback(async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      const updatedUser = result.user || result.data?.user || result.data;
      if (updatedUser) setUser(updatedUser);
      else {
        // Fallback: refetch current user from server
        const fresh = await getCurrentUser();
        if (fresh.success) setUser(fresh.user);
      }
    }
    return result;
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await getCurrentUser();
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const changePass = useCallback(async (data) => {
    return await changePasswordAPI(data);
  }, []);

  const forgotPass = useCallback(async (data) => {
    return await forgotPasswordAPI(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isBankPartner: user?.role === "bank_partner",
        isBuyer: user?.role === "buyer",
        isOwner: user?.role === "owner",
        login,
        signup,
        logout,
        update,
        refreshUser,
        changePass,
        forgotPass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
