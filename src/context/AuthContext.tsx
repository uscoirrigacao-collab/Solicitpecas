"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Persist login state across page reloads
    try {
      const storedIsAdmin = sessionStorage.getItem("isAdmin") === "true";
      if (storedIsAdmin) {
        setIsAdmin(true);
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = (password: string) => {
    // Simple authentication logic
    if (password === "admin000") {
      setIsAdmin(true);
      try {
        sessionStorage.setItem("isAdmin", "true");
      } catch (error) {
        console.error("Could not access session storage:", error);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem("isAdmin");
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    router.push("/login");
  };

  const value = { isAdmin, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
