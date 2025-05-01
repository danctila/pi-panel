import React, { useState } from "react";

const Nginx: React.FC = () => {
  const [configs, setConfigs] = useState<string[]>([
    "default.conf",
    "frontend-sites.conf",
    "backend-services.conf",
  ]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [configContent, setConfigContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const selectConfig = (configName: string) => {
    setSelectedConfig(configName);
    // Simulate loading config content from API
    const mockContent = `# Configuration for ${configName}
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;
    setConfigContent(mockContent);
    setIsEditing(false);
  };

  const saveConfig = () => {
    // In a real implementation, we would save to API
    // For MVP, just end edit mode
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nginx Configuration</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add New Config
        </button>
      </div>

      <div className="flex gap-6">
        {/* Config files list */}
        <div className="w-1/4 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Configuration Files</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {configs.map((config) => (
              <li key={config}>
                <button
                  onClick={() => selectConfig(config)}
                  className={`w-full text-left px-6 py-3 ${
                    selectedConfig === config
                      ? "bg-indigo-50 text-indigo-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {config}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Config editor */}
        <div className="w-3/4 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {selectedConfig || "Select a configuration file"}
            </h2>
            {selectedConfig && (
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveConfig}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="p-6">
            {selectedConfig ? (
              isEditing ? (
                <textarea
                  value={configContent}
                  onChange={(e) => setConfigContent(e.target.value)}
                  className="w-full h-96 font-mono p-4 border border-gray-300 rounded-md"
                />
              ) : (
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-mono h-96 overflow-auto">
                  {configContent}
                </pre>
              )
            ) : (
              <p className="text-gray-500 italic">
                Select a configuration file to view or edit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nginx;
