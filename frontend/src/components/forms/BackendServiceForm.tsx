import React, { useState, useCallback } from "react";
import BaseDeploymentForm from "./BaseDeploymentForm";

interface BackendServiceFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const BackendServiceForm: React.FC<BackendServiceFormProps> = ({
  onSuccess,
  onError,
  onCancel,
}) => {
  const [type, setType] = useState("nodejs");
  const [port, setPort] = useState<string>("");

  const getAdditionalData = useCallback(() => {
    return {
      type,
      port: port ? parseInt(port, 10) : undefined,
    };
  }, [type, port]);

  return (
    <BaseDeploymentForm
      formType="backend"
      formTitle="Deploy Backend Service"
      nameLabel="Service Name"
      namePlaceholder="my-api"
      fileLabel="Upload ZIP File"
      fileDescription="The ZIP file should contain your backend application code (package.json, index.js, etc.)"
      onSuccess={onSuccess}
      onError={onError}
      onCancel={onCancel}
      redirectPath="/dashboard/backends"
      getAdditionalData={getAdditionalData}
    >
      {/* Add backend-specific form fields */}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="serviceType"
        >
          Service Type
        </label>
        <select
          id="serviceType"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="nodejs">Node.js</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="port"
        >
          Port (Optional)
        </label>
        <input
          id="port"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="3000"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to auto-assign a port.
        </p>
      </div>
    </BaseDeploymentForm>
  );
};

export default BackendServiceForm;
