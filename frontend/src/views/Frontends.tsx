import React, { useState } from "react";

interface Frontend {
  id: string;
  name: string;
  status: string;
  url: string;
}

interface FrontendsProps {
  data: Frontend[];
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Frontends: React.FC<FrontendsProps> = ({ data }) => {
  const [frontends, setFrontends] = useState<Frontend[]>(data);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    files: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

    if (!formData.name || !formData.domain || !formData.files) {
      setError("Please fill all fields and provide a zip file");
      return;
    }

    // In a real implementation, we would upload the file and create the frontend
    setLoading(true);
    setError(null);

    // Example of what API call would look like
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append("name", formData.name);
      uploadData.append("domain", formData.domain);
      uploadData.append("file", formData.files);

      // For MVP, we'll just simulate the API call
      // const response = await axios.post(`${API_URL}/frontends`, uploadData);

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add mock frontend to list
      const newFrontend: Frontend = {
        id: `frontend${Date.now()}`,
        name: formData.name,
        status: "running",
        url: `https://${formData.domain}`,
      };

      setFrontends((prev) => [...prev, newFrontend]);
      setShowModal(false);
      setFormData({
        name: "",
        domain: "",
        files: null,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create frontend");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    // In a real implementation, we would call the API to start/stop the frontend
    // For MVP, we'll just update the state
    setFrontends((prev) =>
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
        <h1 className="text-2xl font-bold">Frontend Sites</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Site
        </button>
      </div>

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
                      className={`mr-2 ${
                        site.status === "running"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {site.status === "running" ? "Stop" : "Start"}
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-800 mr-2">
                      Edit
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

      {/* Add Site Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Frontend Site</h2>
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
                  Site Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="My Website"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="domain"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="mysite.example.com"
                  disabled={loading}
                />
              </div>

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
                  Upload a ZIP file containing your website files (index.html,
                  assets, etc.)
                </p>
              </div>

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
                  {loading ? "Uploading..." : "Upload & Deploy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Frontends;
