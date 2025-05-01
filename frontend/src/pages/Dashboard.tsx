import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

// Views
import DashboardHome from "../views/DashboardHome";
import Frontends from "../views/Frontends";
import Backends from "../views/Backends";
import Docker from "../views/Docker";
import Nginx from "../views/Nginx";
import Cloudflare from "../views/Cloudflare";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Mock data for development
const mockDashboardData = {
  system: {
    hostname: "PiPanel",
    uptime: "2 days, 3 hours",
    cpu: "23%",
    memory: "1.2 GB / 4 GB",
    storage: "12 GB / 32 GB",
  },
  services: {
    frontends: [
      { id: "frontend1", name: "Personal Blog", status: "running" },
      { id: "frontend2", name: "Photo Gallery", status: "stopped" },
    ],
    backends: [
      { id: "backend1", name: "API Server", status: "running" },
      { id: "backend2", name: "Auth Service", status: "running" },
    ],
    docker: [
      { id: "docker1", name: "PostgreSQL", status: "running" },
      { id: "docker2", name: "Redis", status: "stopped" },
    ],
  },
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/dashboard`);
        setDashboardData(response.data);
        setError(null);
      } catch (err: any) {
        // For MVP/development, use mock data on API failure
        console.warn("Using mock data due to API error:", err);
        setDashboardData(mockDashboardData);
        // Still set the error in case we want to display it
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading dashboard data...</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<DashboardHome data={dashboardData} />}
              />
              <Route
                path="/frontends"
                element={
                  <Frontends data={dashboardData?.services?.frontends || []} />
                }
              />
              <Route
                path="/backends"
                element={
                  <Backends data={dashboardData?.services?.backends || []} />
                }
              />
              <Route
                path="/docker"
                element={
                  <Docker data={dashboardData?.services?.docker || []} />
                }
              />
              <Route path="/nginx" element={<Nginx />} />
              <Route path="/cloudflare" element={<Cloudflare />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          )}
          {error && !loading && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 text-sm">
              <p className="text-yellow-700">
                Note: Using mock data. Backend connection error: {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
