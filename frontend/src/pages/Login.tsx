import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, checkAuth } = useAuth();

  // Check auth status and redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">PiPanel Login</h1>

        <div className="mb-6">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>
            Sign in with your Supabase email and password to access the admin
            panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
