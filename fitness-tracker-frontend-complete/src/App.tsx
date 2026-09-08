import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProgressPage } from './pages/ProgressPage';
import { RemindersPage } from './pages/RemindersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { Flame, Compass } from 'lucide-react';
import { Button } from './components/ui/Button';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[#080C10] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-16 h-16 rounded-3xl bg-[#C6FF3A]/10 border border-[#C6FF3A]/30 flex items-center justify-center text-[#C6FF3A] mb-6 shadow-[0_0_30px_rgba(198,255,58,0.2)]">
      <Compass className="w-8 h-8" />
    </div>
    <span className="text-xs font-bold text-[#C6FF3A] uppercase tracking-widest mb-2">404 Error</span>
    <h1 className="text-3xl font-bold font-display text-white mb-2">Page Not Found</h1>
    <p className="text-sm text-slate-400 max-w-sm mb-6">
      The coordinates you requested do not exist in the athletic telemetry matrix.
    </p>
    <Link to="/dashboard">
      <Button variant="primary" size="md">
        Back to Dashboard
      </Button>
    </Link>
  </div>
);

export function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary key={location.pathname}>
          <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Route>

          {/* Root Redirect & Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
