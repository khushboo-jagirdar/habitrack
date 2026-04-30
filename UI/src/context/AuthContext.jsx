import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

function normalizeUser(userData) {
  if (!userData) return null;
  // Always ensure id is set (MongoDB returns _id)
  return {
    ...userData,
    id: userData.id || userData._id || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = useCallback((userData, token) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("token", token);
    setUser(normalized);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = normalizeUser({ ...prev, ...updatedData });
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
