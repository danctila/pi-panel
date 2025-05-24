import React, { useState, useCallback } from "react";
import apiService from "../../services/api";
import { useNavigate } from "react-router-dom";

interface BaseDeploymentFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  formType: "static" | "backend" | "docker";
  formTitle: string;
  fileLabel?: string;
  fileDescription?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  children?: React.ReactNode;
  getAdditionalData?: () => Record<string, any>;
  redirectPath?: string;
}

export interface FormState {
  name: string;
  domain: string;
  file: File | null;
  isLoading: boolean;
  uploadSuccess: boolean;
  deploySuccess: boolean;
  error: string | null;
}

const BaseDeploymentForm: React.FC<BaseDeploymentFormProps> = ({
  onSuccess,
  onError,
  onCancel,
  formType,
  formTitle,
  fileLabel = "Upload ZIP File",
  fileDescription = "The ZIP file should contain your application files",
  nameLabel = "Name",
  namePlaceholder = "my-project",
  children,
  getAdditionalData,
  redirectPath,
}) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>({
    name: "",
    domain: "",
    file: null,
    isLoading: false,
    uploadSuccess: false,
    deploySuccess: false,
    error: null,
  });

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState({ name: e.target.value });
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState({ domain: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateFormState({ file: e.target.files[0] });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate(`/dashboard/${formType}s`);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    updateFormState({ isLoading: true, error: null });

    try {
      if (!formState.file) {
        throw new Error("Please select a file to upload");
      }

      const uploadName = formState.name || formState.file.name.split(".")[0];

      if (!formState.domain) {
        throw new Error("Please enter a domain");
      }

      // Prepare the form data with the appropriate key based on form type
      const formData = new FormData();
      let fileKey = "siteZip"; // Default for static sites

      if (formType === "backend") {
        fileKey = "serviceZip";
      } else if (formType === "docker") {
        fileKey = "dockerZip";
      }

      formData.append(fileKey, formState.file);
      formData.append("name", uploadName);

      // Upload the file
      const uploadResponse = await apiService.uploadFile(
        `upload/${formType}`,
        formData
      );

      updateFormState({ uploadSuccess: true });

      // Deploy the service
      const deployEndpoint = `/deploy/${formType}`;

      // Prepare deploy data based on form type
      let deployData: Record<string, any> = {
        domain: formState.domain,
        extractPath: uploadResponse.data.extractPath,
        zipFilePath: uploadResponse.data.zipFilePath,
      };

      if (formType === "static") {
        deployData.siteName = uploadName;
      } else if (formType === "backend") {
        deployData.serviceName = uploadName;
      } else if (formType === "docker") {
        deployData.containerName = uploadName;
      }

      // Get additional data from child components if available
      if (getAdditionalData) {
        const additionalData = getAdditionalData();
        deployData = {
          ...deployData,
          ...additionalData,
        };
      }

      const deployResponse = await apiService.post(deployEndpoint, deployData);

      updateFormState({ deploySuccess: true });

      if (onSuccess) {
        onSuccess(deployResponse.data);
      } else {
        // Navigate back to the list view after success
        setTimeout(() => {
          navigate(`/dashboard/${formType}s`);
        }, 1000);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      updateFormState({ error: errorMessage });
      if (onError) {
        onError(err);
      }
    } finally {
      updateFormState({ isLoading: false });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{formTitle}</h2>

      {formState.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formState.error}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            {nameLabel}
          </label>
          <input
            id="name"
            type="text"
            value={formState.name}
            onChange={handleNameChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={namePlaceholder}
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
            value={formState.domain}
            onChange={handleDomainChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This domain should be configured in Cloudflare DNS and point to your
            tunnel.
          </p>
        </div>

        {children}

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="fileUpload"
          >
            {fileLabel}
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="text-xs text-gray-500 mt-1">{fileDescription}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formState.isLoading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                formState.isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {formState.isLoading ? "Uploading..." : "Deploy"}
            </button>
          </div>

          {formState.uploadSuccess && (
            <span className="text-green-500 ml-3">
              {formState.deploySuccess
                ? "Deployed successfully!"
                : "Uploaded successfully!"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default BaseDeploymentForm;
