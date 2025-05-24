import React, { useState, useCallback } from "react";
import BaseDeploymentForm from "./BaseDeploymentForm";

interface DockerContainerFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const DockerContainerForm: React.FC<DockerContainerFormProps> = ({
  onSuccess,
  onError,
  onCancel,
}) => {
  const [port, setPort] = useState<string>("");

  const getAdditionalData = useCallback(() => {
    return {
      port: port ? parseInt(port, 10) : undefined,
    };
  }, [port]);

  return (
    <BaseDeploymentForm
      formType="docker"
      formTitle="Deploy Docker Container"
      nameLabel="Container Name"
      namePlaceholder="my-container"
      fileLabel="Upload ZIP File"
      fileDescription="The ZIP file should contain a Dockerfile or docker-compose.yml and any necessary application files."
      onSuccess={onSuccess}
      onError={onError}
      onCancel={onCancel}
      redirectPath="/dashboard/docker"
      getAdditionalData={getAdditionalData}
    >
      {/* Add docker-specific form fields */}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="port"
        >
          External Port (Optional)
        </label>
        <input
          id="port"
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="8080"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to auto-assign a port. This is the port exposed on the
          host.
        </p>
      </div>
    </BaseDeploymentForm>
  );
};

export default DockerContainerForm;
