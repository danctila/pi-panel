import React, { useState } from "react";

interface DockerContainer {
  id: string;
  name: string;
  status: string;
}

interface DockerProps {
  data: DockerContainer[];
}

const Docker: React.FC<DockerProps> = ({ data }) => {
  const [containers, setContainers] = useState<DockerContainer[]>(data);

  const toggleStatus = async (id: string, currentStatus: string) => {
    // In a real implementation, we would call the API to start/stop the container
    // For MVP, we'll just update the state
    setContainers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: currentStatus === "running" ? "stopped" : "running",
            }
          : item
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Docker Containers</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Container
        </button>
      </div>

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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {containers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No containers found. Add a new container to get started.
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() =>
                        toggleStatus(container.id, container.status)
                      }
                      className={`mr-2 ${
                        container.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {container.status === "running" ? "Stop" : "Start"}
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-800 mr-2">
                      Logs
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800 mr-2">
                      Restart
                    </button>
                    <button className="text-red-600 hover:text-red-800">
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
