import React, { useState } from "react";
import axios from "axios";

interface StaticSiteFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const StaticSiteForm: React.FC<StaticSiteFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
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

      if (!siteName) {
        setSiteName(file.name.split(".")[0]);
      }

      if (!domain) {
        throw new Error("Please enter a domain");
      }

      // Upload the file
      const formData = new FormData();
      formData.append("siteZip", file);
      formData.append("name", siteName);

      const uploadResponse = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/upload/static`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadSuccess(true);

      // Deploy the site
      const deployResponse = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/deploy/static`,
        {
          siteName,
          domain,
          extractPath: uploadResponse.data.extractPath,
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
      <h2 className="text-xl font-bold mb-4">Deploy Static Site</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="siteName"
          >
            Site Name
          </label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="My Awesome Site"
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
            placeholder="example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This domain should be configured in Cloudflare DNS and point to your
            tunnel.
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
            The ZIP file should contain your static website files (index.html,
            assets, etc.)
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
            {isLoading ? "Uploading..." : "Deploy Site"}
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

export default StaticSiteForm;
