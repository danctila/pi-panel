import React from "react";

interface SystemStats {
  hostname: string;
  uptime: string;
  cpu: string;
  memory: string;
  storage: string;
}

interface Service {
  id: string;
  name: string;
  status: string;
}

interface DashboardData {
  system: SystemStats;
  services: {
    frontends: Service[];
    backends: Service[];
    docker: Service[];
  };
}

interface DashboardHomeProps {
  data: DashboardData;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-500">
          No dashboard data available. Please check your connection to the
          backend.
        </p>
      </div>
    );
  }

  // Ensure services object exists with default empty arrays
  const system = data.system || {
    hostname: "Unknown",
    uptime: "Unknown",
    cpu: "Unknown",
    memory: "Unknown",
    storage: "Unknown",
  };

  const services = data.services || { frontends: [], backends: [], docker: [] };
  const frontends = services.frontends || [];
  const backends = services.backends || [];
  const docker = services.docker || [];

  // Count services by status
  const getStatusCounts = (serviceList: Service[]) => {
    return {
      running: serviceList.filter((s) => s.status === "running").length,
      stopped: serviceList.filter((s) => s.status === "stopped").length,
      total: serviceList.length,
    };
  };

  const frontendStats = getStatusCounts(frontends);
  const backendStats = getStatusCounts(backends);
  const dockerStats = getStatusCounts(docker);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* System Stats */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Hostname</div>
              <div className="text-lg font-semibold">{system.hostname}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Uptime</div>
              <div className="text-lg font-semibold">{system.uptime}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">CPU Usage</div>
              <div className="text-lg font-semibold">{system.cpu}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Memory</div>
              <div className="text-lg font-semibold">{system.memory}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Storage</div>
              <div className="text-lg font-semibold">{system.storage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Frontend Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Frontend Sites</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Sites</div>
                <div className="text-2xl font-bold">{frontendStats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Running</div>
                <div className="text-xl font-semibold text-green-500">
                  {frontendStats.running}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Stopped</div>
                <div className="text-xl font-semibold text-red-500">
                  {frontendStats.stopped}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Backend Services</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Services</div>
                <div className="text-2xl font-bold">{backendStats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Running</div>
                <div className="text-xl font-semibold text-green-500">
                  {backendStats.running}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Stopped</div>
                <div className="text-xl font-semibold text-red-500">
                  {backendStats.stopped}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Docker Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Docker Containers</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Containers</div>
                <div className="text-2xl font-bold">{dockerStats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Running</div>
                <div className="text-xl font-semibold text-green-500">
                  {dockerStats.running}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Stopped</div>
                <div className="text-xl font-semibold text-red-500">
                  {dockerStats.stopped}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
