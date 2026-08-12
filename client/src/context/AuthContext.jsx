import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN
  ========================= */

  const login = ({ user, token }) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /* =========================
     UPDATE USER
  ========================= */

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /* =========================
     VALIDATE TOKEN
  ========================= */

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);

        // IMPORTANT:
        // getProfile() already uses the Render API URL
        // from services/api.js
        const data = await getProfile();

        if (data?.user) {
          setUser(data.user);

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }
      } catch (error) {
        console.error("Token validation failed:", error);

        // Only logout when the Render API confirms
        // that the token is invalid/expired.
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* =========================
     AUTH CONTEXT VALUE
  ========================= */

  const value = useMemo(
    () => ({
      user,
      token,
      loading,

      isAuthenticated: Boolean(token && user),

      login,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   USE AUTH
========================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}