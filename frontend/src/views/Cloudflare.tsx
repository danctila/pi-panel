import React, { useState } from "react";

interface TunnelRoute {
  id: string;
  hostname: string;
  service: string;
  status: "connected" | "error";
}

const Cloudflare: React.FC = () => {
  const [tunnelRoutes, setTunnelRoutes] = useState<TunnelRoute[]>([
    {
      id: "route1",
      hostname: "blog.example.com",
      service: "frontend-blog",
      status: "connected",
    },
    {
      id: "route2",
      hostname: "api.example.com",
      service: "backend-api",
      status: "connected",
    },
    {
      id: "route3",
      hostname: "admin.example.com",
      service: "frontend-admin",
      status: "error",
    },
  ]);

  const [tunnelConnected, setTunnelConnected] = useState(true);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    hostname: "",
    service: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRoute((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addRoute = () => {
    if (!newRoute.hostname || !newRoute.service) return;

    const route: TunnelRoute = {
      id: `route${Date.now()}`,
      hostname: newRoute.hostname,
      service: newRoute.service,
      status: "connected",
    };

    setTunnelRoutes((prev) => [...prev, route]);
    setNewRoute({ hostname: "", service: "" });
    setShowAddRoute(false);
  };

  const toggleTunnel = () => {
    setTunnelConnected((prev) => !prev);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cloudflare Tunnel</h1>
        <div>
          <button
            onClick={toggleTunnel}
            className={`mr-2 px-4 py-2 rounded-md ${
              tunnelConnected
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {tunnelConnected ? "Stop Tunnel" : "Start Tunnel"}
          </button>
          <button
            onClick={() => setShowAddRoute(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Route
          </button>
        </div>
      </div>

      {/* Tunnel Status */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full mr-3 ${
              tunnelConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h2 className="text-lg font-semibold">
            Tunnel Status:{" "}
            <span
              className={tunnelConnected ? "text-green-600" : "text-red-600"}
            >
              {tunnelConnected ? "Connected" : "Disconnected"}
            </span>
          </h2>
        </div>
        <p className="mt-2 text-gray-600">
          {tunnelConnected
            ? "Your tunnel is connected and routing traffic through Cloudflare."
            : "Your tunnel is disconnected. Start the tunnel to route traffic."}
        </p>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Domain Routes</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hostname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
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
            {tunnelRoutes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No routes configured. Add a route to get started.
                </td>
              </tr>
            ) : (
              tunnelRoutes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {route.hostname}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{route.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        route.status === "connected"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

      {/* Add Route Modal */}
      {showAddRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Route</h2>
              <button
                onClick={() => setShowAddRoute(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="hostname"
                className="block text-gray-700 font-medium mb-2"
              >
                Hostname
              </label>
              <input
                type="text"
                id="hostname"
                name="hostname"
                value={newRoute.hostname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="app.example.com"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="service"
                className="block text-gray-700 font-medium mb-2"
              >
                Service
              </label>
              <input
                type="text"
                id="service"
                name="service"
                value={newRoute.service}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="frontend-app"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddRoute(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addRoute}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cloudflare;
