import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import axios from "axios";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Login with Supabase
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      // Send token to backend to set up session cookie
      await axios.post(
        `${API_URL}/auth/session`,
        { token: data.session.access_token },
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setUser(data.user);
    }
  };

  // Logout from Supabase and clear backend session
  const logout = async () => {
    await supabase.auth.signOut();
    // Clear backend session
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
    setUser(null);
    // Redirect to login page
    window.location.href = "/";
  };

  // Check authentication status from backend session
  const checkAuth = async () => {
    try {
      // First check Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Verify with backend
        const response = await axios.get(`${API_URL}/auth/status`, {
          withCredentials: true,
        });

        if (response.data.status === "authenticated") {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          // Session invalid on backend, log out
          await logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
