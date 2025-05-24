import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceManager } from "../services/serviceManager";

interface DockerContainer {
  id: string;
  name: string;
  status: string;
  port: number;
  image: string;
}

interface DockerProps {
  data: DockerContainer[];
}

const Docker: React.FC<DockerProps> = ({ data }) => {
  const navigate = useNavigate();
  const {
    services: containers,
    loading,
    error,
    toggleStatus,
    restartService,
    deleteService,
    viewLogs,
  } = useServiceManager(data, "docker");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Docker Containers</h1>
        <button
          onClick={() => navigate("/dashboard/docker/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Container
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Containers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Port
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {containers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No Docker containers found. Add a new container to get
                  started.
                </td>
              </tr>
            ) : (
              containers.map((container) => (
                <tr key={container.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {container.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        container.status === "running"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {container.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {container.image}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {container.port ? `:${container.port}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() =>
                        toggleStatus(container.id, container.status)
                      }
                      disabled={loading[container.id]}
                      className={`mr-2 ${
                        container.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      } ${
                        loading[container.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      {loading[container.id]
                        ? "..."
                        : container.status === "running"
                        ? "Stop"
                        : "Start"}
                    </button>
                    <button
                      onClick={() => viewLogs(container.id, container.name)}
                      disabled={loading[container.id]}
                      className={`text-indigo-600 hover:text-indigo-800 mr-2 ${
                        loading[container.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => restartService(container.id)}
                      disabled={loading[container.id]}
                      className={`text-yellow-600 hover:text-yellow-800 mr-2 ${
                        loading[container.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      Restart
                    </button>
                    <button
                      onClick={() =>
                        deleteService(container.id, container.name)
                      }
                      disabled={loading[container.id]}
                      className={`text-red-600 hover:text-red-800 ${
                        loading[container.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Docker;
