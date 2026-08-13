import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* =====================================================
     INITIAL USER
  ===================================================== */

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to load saved user:", error);
      return null;
    }
  });

  /* =====================================================
     INITIAL TOKEN
  ===================================================== */

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  /* =====================================================
     LOADING
  ===================================================== */

  // If a token already exists, validate it before allowing
  // protected pages to make decisions.
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  /* =====================================================
     LOGIN
  ===================================================== */

  const login = useCallback(({ user, token }) => {
    if (!token) {
      console.error("Login failed: token is missing.");
      return;
    }

    setUser(user || null);
    setToken(token);

    localStorage.setItem("token", token);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLoading(false);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  /* =====================================================
     UPDATE USER
  ===================================================== */

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    if (updatedUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  /* =====================================================
     VALIDATE TOKEN
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      // No token means the user is not authenticated.
      if (!token) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
        }

        console.log("Validating authentication token...");

        /*
         * getProfile() uses the Render backend URL
         * configured in services/api.js.
         */
        const data = await getProfile();

        console.log("Token validation response:", data);

        if (!isMounted) {
          return;
        }

        /*
         * Your backend profile response should contain:
         *
         * {
         *   success: true,
         *   user: {...}
         * }
         */
        if (data?.user) {
          setUser(data.user);

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

          console.log("Authentication validated successfully.");
        }
      } catch (error) {
        console.error(
          "Token validation failed:",
          error
        );

        /*
         * Do not immediately destroy authentication state
         * for every network/API error.
         *
         * The existing local token/user can remain available
         * if the backend temporarily cannot be reached.
         *
         * If your API explicitly returns 401/403, then logout
         * should be handled based on that response.
         */
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  /* =====================================================
     AUTHENTICATION STATUS
  ===================================================== */

  const isAuthenticated = Boolean(
    token && user
  );

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,

      login,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
    ]
  );

  /* =====================================================
     PROVIDER
  ===================================================== */

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   USE AUTH
===================================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}