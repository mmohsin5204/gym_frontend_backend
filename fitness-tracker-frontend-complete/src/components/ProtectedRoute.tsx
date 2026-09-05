import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/Spinner';
import { Activity } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C10] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#C6FF3A]/10 border border-[#C6FF3A]/30 flex items-center justify-center text-[#C6FF3A]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Fit<span className="text-[#C6FF3A]">Track</span>
          </span>
        </div>
        <Spinner size="md" label="Loading your dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
