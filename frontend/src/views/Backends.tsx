import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceManager } from "../services/serviceManager";

interface Backend {
  id: string;
  name: string;
  status: string;
  port: number;
}

interface BackendsProps {
  data: Backend[];
}

const Backends: React.FC<BackendsProps> = ({ data }) => {
  const navigate = useNavigate();
  const {
    services: backends,
    loading,
    error,
    toggleStatus,
    restartService,
    deleteService,
    viewLogs,
  } = useServiceManager(data, "backends");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Backend Services</h1>
        <button
          onClick={() => navigate("/dashboard/backends/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Backend
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Backends List */}
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
                Port
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backends.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No backend services found. Add a new backend to get started.
                </td>
              </tr>
            ) : (
              backends.map((backend) => (
                <tr key={backend.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {backend.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        backend.status === "running"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {backend.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">:{backend.port}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleStatus(backend.id, backend.status)}
                      disabled={loading[backend.id]}
                      className={`mr-2 ${
                        backend.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      } ${loading[backend.id] ? "opacity-50 cursor-wait" : ""}`}
                    >
                      {loading[backend.id] && loading[backend.id] === true
                        ? "..."
                        : backend.status === "running"
                        ? "Stop"
                        : "Start"}
                    </button>
                    <button
                      onClick={() => viewLogs(backend.id, backend.name)}
                      disabled={loading[backend.id]}
                      className={`text-indigo-600 hover:text-indigo-800 mr-2 ${
                        loading[backend.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => restartService(backend.id)}
                      disabled={loading[backend.id]}
                      className={`text-yellow-600 hover:text-yellow-800 mr-2 ${
                        loading[backend.id] ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => deleteService(backend.id, backend.name)}
                      disabled={loading[backend.id]}
                      className={`text-red-600 hover:text-red-800 ${
                        loading[backend.id] ? "opacity-50 cursor-wait" : ""
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

export default Backends;
