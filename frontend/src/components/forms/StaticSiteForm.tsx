import React from "react";
import BaseDeploymentForm from "./BaseDeploymentForm";

interface StaticSiteFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const StaticSiteForm: React.FC<StaticSiteFormProps> = ({
  onSuccess,
  onError,
  onCancel,
}) => {
  return (
    <BaseDeploymentForm
      formType="static"
      formTitle="Deploy Static Site"
      nameLabel="Site Name"
      namePlaceholder="My Awesome Site"
      fileLabel="Upload ZIP File"
      fileDescription="The ZIP file should contain your static website files (index.html, assets, etc.)"
      onSuccess={onSuccess}
      onError={onError}
      onCancel={onCancel}
      redirectPath="/dashboard/frontends"
    />
  );
};

export default StaticSiteForm;
