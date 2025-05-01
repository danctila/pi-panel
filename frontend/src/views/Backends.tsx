import React, { useState } from "react";

interface Backend {
  id: string;
  name: string;
  status: string;
  port: number;
}

interface BackendsProps {
  data: Backend[];
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Backends: React.FC<BackendsProps> = ({ data }) => {
  const [backends, setBackends] = useState<Backend[]>(data);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "nodejs",
    port: "",
    gitRepo: "",
    files: null as File | null,
    useGit: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        files: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      (!formData.useGit && !formData.files) ||
      (formData.useGit && !formData.gitRepo)
    ) {
      setError("Please fill all required fields");
      return;
    }

    // In a real implementation, we would upload the file or clone the repo and deploy the backend
    setLoading(true);
    setError(null);

    try {
      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add mock backend to list
      const newBackend: Backend = {
        id: `backend${Date.now()}`,
        name: formData.name,
        status: "running",
        port: formData.port ? parseInt(formData.port) : 3000 + backends.length,
      };

      setBackends((prev) => [...prev, newBackend]);
      setShowModal(false);
      setFormData({
        name: "",
        type: "nodejs",
        port: "",
        gitRepo: "",
        files: null,
        useGit: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create backend");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    // In a real implementation, we would call the API to start/stop the backend
    // For MVP, we'll just update the state
    setBackends((prev) =>
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
        <h1 className="text-2xl font-bold">Backend Services</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Backend
        </button>
      </div>

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
                      className={`mr-2 ${
                        backend.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {backend.status === "running" ? "Stop" : "Start"}
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

      {/* Add Backend Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Backend Service</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Service Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="My API Server"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Service Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="nodejs">Node.js</option>
                  <option value="python">Python (Flask/FastAPI)</option>
                  <option value="go">Go</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="port"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Port (Optional)
                </label>
                <input
                  type="number"
                  id="port"
                  name="port"
                  value={formData.port}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="3000"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty for auto-assignment
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="useGit"
                    checked={formData.useGit}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700">
                    Deploy from Git repository
                  </span>
                </label>
              </div>

              {formData.useGit ? (
                <div className="mb-6">
                  <label
                    htmlFor="gitRepo"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Git Repository URL
                  </label>
                  <input
                    type="text"
                    id="gitRepo"
                    name="gitRepo"
                    value={formData.gitRepo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://github.com/username/repo.git"
                    disabled={loading}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <label
                    htmlFor="files"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Upload Files (ZIP)
                  </label>
                  <input
                    type="file"
                    id="files"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a ZIP file containing your backend code
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Deploying..." : "Deploy Backend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backends;
