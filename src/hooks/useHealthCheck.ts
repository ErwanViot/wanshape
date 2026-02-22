import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

const STORAGE_KEY = 'wanshape-health-accepted';

export function isHealthAccepted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function useHealthCheck() {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const guardNavigation = useCallback((path: string) => {
    if (isHealthAccepted()) {
      navigate(path);
    } else {
      setPendingPath(path);
    }
  }, [navigate]);

  const acceptAndNavigate = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [navigate, pendingPath]);

  const cancelDisclaimer = useCallback(() => {
    setPendingPath(null);
  }, []);

  return {
    showDisclaimer: pendingPath !== null,
    guardNavigation,
    acceptAndNavigate,
    cancelDisclaimer,
  };
}
