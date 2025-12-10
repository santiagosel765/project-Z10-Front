
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { User as BackendUser, Role, UserRole } from "@/types";

/**
 * Tipo de usuario enriquecido que combina datos del backend con campos computados
 * para compatibilidad con la UI existente
 */
export type User = BackendUser & {
  name: string;          // firstName + lastName (requerido)
  role?: UserRole;       // roles[0].name mapeado a UserRole
  avatar?: string;       // alias de profilePhotoUrl
  token?: string;        // accessToken (guardado para referencia, pero auth usa cookies)
  username?: string;     // Para compatibilidad con código legacy
};

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("zenit-user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("zenit-user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("zenit-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("zenit-user");
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedData };
        localStorage.setItem("zenit-user", JSON.stringify(newUser));
        return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
