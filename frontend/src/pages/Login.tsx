import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, checkAuth } = useAuth();

  // Check auth status and redirect if authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      await checkAuth();
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    };

    checkAuthStatus();
    // Auto-check auth every few seconds
    const interval = setInterval(checkAuthStatus, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate, checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">PiPanel Access</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This panel uses Tailscale IP-based authentication. You need to
                be connected to your Tailscale network and have authorized
                access.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600">
          <p className="mb-4">To access this panel:</p>
          <ol className="list-decimal list-inside text-left space-y-2">
            <li>Connect to your Tailscale network</li>
            <li>Ensure your device is authorized to access the Pi</li>
            <li>Your IP will be automatically authenticated</li>
            <li>
              If you're seeing this page and you're connected to Tailscale, your
              IP may not be authorized
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => checkAuth()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Check Authentication Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
