import { useState } from 'react';
import apiService from './api';

export type ServiceType = 'frontends' | 'backends' | 'docker';

// Hook for managing services in views
export const useServiceManager = <T extends { id: string; status: string; name: string }>(
  initialServices: T[],
  serviceType: ServiceType
) => {
  const [services, setServices] = useState<T[]>(initialServices);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      setLoading({ ...loading, [id]: true });
      setError(null);

      if (currentStatus === "running") {
        await apiService.stopService(serviceType, id);
      } else {
        await apiService.startService(serviceType, id);
      }

      // Update local state for immediate UI feedback
      setServices((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: currentStatus === "running" ? "stopped" : "running",
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(`Failed to toggle ${serviceType} status:`, err);
      setError(
        `Failed to ${currentStatus === "running" ? "stop" : "start"} service: ${
          err.message
        }`
      );
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const restartService = async (id: string) => {
    try {
      setLoading({ ...loading, [id]: true });
      setError(null);

      await apiService.restartService(serviceType, id);

      // Update local state
      setServices((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "running", // Restarted service is now running
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(`Failed to restart ${serviceType}:`, err);
      setError(`Failed to restart service: ${err.message}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const deleteService = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading({ ...loading, [id]: true });
      setError(null);

      await apiService.deleteService(serviceType, id);

      // Remove from local state
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error(`Failed to delete ${serviceType}:`, err);
      setError(`Failed to delete service: ${err.message}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const viewLogs = async (id: string, name: string) => {
    try {
      setLoading({ ...loading, [id]: true });

      const response = await apiService.getServiceLogs(serviceType, id);

      // In a real application, we would open a modal or navigate to a logs page
      console.log(`Logs for ${name}:`, response.data);
      alert(`Logs for ${name} retrieved. Check console for details.`);
    } catch (err: any) {
      console.error(`Failed to fetch ${serviceType} logs:`, err);
      setError(`Failed to fetch logs: ${err.message}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  return {
    services,
    setServices,
    loading,
    error,
    toggleStatus,
    restartService,
    deleteService,
    viewLogs,
  };
}; 