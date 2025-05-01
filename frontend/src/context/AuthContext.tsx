import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  checkAuth: async () => {},
  logout: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status (Based on Tailscale IP auth)
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`);
      if (response.data.status === "authenticated") {
        setIsAuthenticated(true);
        setUser(response.data.user || "Tailscale User");
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function (for UI purposes only - actual auth handled by Tailscale)
  const logout = async () => {
    // In Tailscale IP auth, we don't need to clear tokens
    // This is just for the UI state
    setIsAuthenticated(false);
    setUser(null);
    // Redirect to login page or home
    window.location.href = "/";
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
