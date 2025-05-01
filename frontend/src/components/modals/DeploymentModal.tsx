import React, { useState } from "react";
import StaticSiteForm from "../forms/StaticSiteForm";
import BackendServiceForm from "../forms/BackendServiceForm";
import DockerContainerForm from "../forms/DockerContainerForm";

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

type DeploymentType = "static" | "backend" | "docker" | null;

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [deploymentType, setDeploymentType] = useState<DeploymentType>(null);

  const handleSuccess = (data: any) => {
    if (onSuccess) {
      onSuccess(data);
    }
    // We don't close the modal automatically on success to allow the user to see the success message
  };

  const handleReset = () => {
    setDeploymentType(null);
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
              onClick={handleReset}
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

          {deploymentType === null ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                onClick={() => setDeploymentType("static")}
              >
                <h3 className="text-lg font-semibold mb-2">Static Site</h3>
                <p className="text-gray-600 text-sm">
                  Deploy a static website, React app, or HTML/CSS/JS site.
                </p>
              </div>

              <div
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                onClick={() => setDeploymentType("backend")}
              >
                <h3 className="text-lg font-semibold mb-2">Backend Service</h3>
                <p className="text-gray-600 text-sm">
                  Deploy a Node.js, Python, or other backend API service.
                </p>
              </div>

              <div
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                onClick={() => setDeploymentType("docker")}
              >
                <h3 className="text-lg font-semibold mb-2">Docker Container</h3>
                <p className="text-gray-600 text-sm">
                  Deploy a containerized application with Docker.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setDeploymentType(null)}
                className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to project types
              </button>

              {deploymentType === "static" && (
                <StaticSiteForm onSuccess={handleSuccess} />
              )}

              {deploymentType === "backend" && (
                <BackendServiceForm onSuccess={handleSuccess} />
              )}

              {deploymentType === "docker" && (
                <DockerContainerForm onSuccess={handleSuccess} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
