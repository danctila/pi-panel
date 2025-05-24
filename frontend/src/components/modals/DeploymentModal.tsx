import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export type DeploymentType = "static" | "backend" | "docker" | null;

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSelectType = (type: DeploymentType) => {
    if (type === "static") {
      navigate("/dashboard/frontends/new");
    } else if (type === "backend") {
      navigate("/dashboard/backends/new");
    } else if (type === "docker") {
      navigate("/dashboard/docker/new");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Deploy New Project
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              onClick={() => handleSelectType("static")}
            >
              <h3 className="text-lg font-semibold mb-2">Static Site</h3>
              <p className="text-gray-600 text-sm">
                Deploy a static website, React app, or HTML/CSS/JS site.
              </p>
            </div>

            <div
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              onClick={() => handleSelectType("backend")}
            >
              <h3 className="text-lg font-semibold mb-2">Backend Service</h3>
              <p className="text-gray-600 text-sm">
                Deploy a Node.js, Python, or other backend API service.
              </p>
            </div>

            <div
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              onClick={() => handleSelectType("docker")}
            >
              <h3 className="text-lg font-semibold mb-2">Docker Container</h3>
              <p className="text-gray-600 text-sm">
                Deploy a containerized application with Docker.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
