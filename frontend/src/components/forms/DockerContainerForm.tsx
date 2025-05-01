import React, { useState } from "react";
import axios from "axios";

interface DockerContainerFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const DockerContainerForm: React.FC<DockerContainerFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [containerName, setContainerName] = useState("");
  const [domain, setDomain] = useState("");
  const [port, setPort] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Please select a file to upload");
      }

      if (!containerName) {
        setContainerName(file.name.split(".")[0]);
      }

      if (!domain) {
        throw new Error("Please enter a domain");
      }

      // Upload the file
      const formData = new FormData();
      formData.append("containerZip", file);
      formData.append("name", containerName);

      const uploadResponse = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/upload/docker`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadSuccess(true);

      // Deploy the Docker container
      const deployResponse = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/deploy/docker`,
        {
          containerName,
          domain,
          extractPath: uploadResponse.data.extractPath,
          port: port ? parseInt(port, 10) : undefined,
        }
      );

      setDeploySuccess(true);

      if (onSuccess) {
        onSuccess(deployResponse.data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Deploy Docker Container</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="containerName"
          >
            Container Name
          </label>
          <input
            id="containerName"
            type="text"
            value={containerName}
            onChange={(e) => setContainerName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="my-container"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="domain"
          >
            Domain
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="app.example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This domain should be configured in Cloudflare DNS and point to your
            tunnel.
          </p>
        </div>

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

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="fileUpload"
          >
            Upload ZIP File
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The ZIP file should contain a Dockerfile or docker-compose.yml and
            any necessary application files.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Uploading..." : "Deploy Container"}
          </button>

          {uploadSuccess && (
            <span className="text-green-500 ml-3">
              {deploySuccess
                ? "Deployed successfully!"
                : "Uploaded successfully!"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default DockerContainerForm;
