import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceManager } from "../services/serviceManager";

interface Frontend {
  id: string;
  name: string;
  status: string;
  url: string;
}

interface FrontendsProps {
  data: Frontend[];
}

const Frontends: React.FC<FrontendsProps> = ({ data }) => {
  const navigate = useNavigate();
  const {
    services: frontends,
    loading,
    error,
    toggleStatus,
    deleteService,
  } = useServiceManager(data, "frontends");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Frontend Sites</h1>
        <button
          onClick={() => navigate("/dashboard/frontends/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Site
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Sites List */}
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
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {frontends.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No frontend sites found. Add a new site to get started.
                </td>
              </tr>
            ) : (
              frontends.map((site) => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {site.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        site.status === "running"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      {site.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleStatus(site.id, site.status)}
                      disabled={loading[site.id]}
                      className={`mr-2 ${
                        site.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      } ${loading[site.id] ? "opacity-50 cursor-wait" : ""}`}
                    >
                      {loading[site.id]
                        ? "..."
                        : site.status === "running"
                        ? "Stop"
                        : "Start"}
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-800 mr-2">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteService(site.id, site.name)}
                      disabled={loading[site.id]}
                      className={`text-red-600 hover:text-red-800 ${
                        loading[site.id] ? "opacity-50 cursor-wait" : ""
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

export default Frontends;
