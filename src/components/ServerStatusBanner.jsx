import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

export default function ServerStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      await api.checkHealth();
      if (isOffline) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 3000);
      }
      setIsOffline(false);
      setDismissed(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  }, [isOffline]);

  useEffect(() => {
    // Check initially
    checkStatus();

    // Check periodically
    const interval = setInterval(checkStatus, isOffline ? 5000 : 20000);
    return () => clearInterval(interval);
  }, [checkStatus, isOffline]);

  if (justReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center space-x-2 animate-fade-in shadow-md sticky top-0 z-50">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Connected to Splitwise backend server.</span>
      </div>
    );
  }

  if (!isOffline || dismissed) {
    return null;
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2.5 text-xs font-semibold shadow-lg sticky top-0 z-50 flex items-center justify-between animate-fade-in">
      <div className="flex items-center space-x-2 overflow-hidden">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
        <span className="truncate">
          Backend server offline at <span className="underline font-mono">http://{hostname}:5000</span>. Please run <span className="bg-black/20 px-1.5 py-0.5 rounded font-mono">start.bat</span> on your PC.
        </span>
      </div>
      <div className="flex items-center space-x-2 shrink-0 ml-2">
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] font-bold flex items-center space-x-1 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Retry'}</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-lg transition text-white/80 hover:text-white"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
