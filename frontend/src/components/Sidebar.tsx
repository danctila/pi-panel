import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Frontend Sites", path: "/dashboard/frontends", icon: "🌐" },
    { name: "Backend Services", path: "/dashboard/backends", icon: "⚙️" },
    { name: "Docker Containers", path: "/dashboard/docker", icon: "🐳" },
    { name: "Nginx Config", path: "/dashboard/nginx", icon: "📝" },
    { name: "Cloudflare Tunnel", path: "/dashboard/cloudflare", icon: "☁️" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-800 text-white w-64 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">PiPanel</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-sm ${
                  isActive(item.path)
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={logout}
          className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 w-full rounded"
        >
          <span className="mr-3 text-xl">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
