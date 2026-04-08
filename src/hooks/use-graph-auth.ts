import { useState, useEffect, useCallback } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { graphService } from '@/lib/graph-service';
import type { Position } from '@/data/positions';

export function useGraphAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await graphService.initialize();
        
        // Handle redirect response
        const response = await graphService.handleRedirectResponse();
        if (response) {
          setIsLoggedIn(true);
          setAccount(response.account);
        } else {
          setIsLoggedIn(graphService.isLoggedIn());
          setAccount(graphService.getActiveAccount());
        }
        
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Initialization failed');
      }
    };

    initialize();
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect-based login doesn't return immediately
      await graphService.login();
      // The page will redirect, so we don't need to update state here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await graphService.logout();
      setIsLoggedIn(false);
      setAccount(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isInitialized,
    isLoggedIn,
    account,
    isLoading,
    error,
    login,
    logout,
  };
}

export function useExcelSync(onDataUpdate: (positions: Position[]) => void) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setSyncError(null);
      const positions = await graphService.fetchExcelData();
      onDataUpdate(positions);
      setLastSync(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    }
  }, [onDataUpdate]);

  const checkForUpdates = useCallback(async () => {
    try {
      const hasUpdates = await graphService.checkForUpdates();
      if (hasUpdates) {
        await fetchData();
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Update check failed');
    }
  }, [fetchData]);

  const startPolling = useCallback((intervalMs: number = 30000) => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    const interval = setInterval(checkForUpdates, intervalMs);
    
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [isPolling, fetchData, checkForUpdates]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    isPolling,
    lastSync,
    syncError,
    fetchData,
    startPolling,
    stopPolling,
  };
}