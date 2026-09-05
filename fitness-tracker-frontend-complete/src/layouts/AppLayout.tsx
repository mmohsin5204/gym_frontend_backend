import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Bell, 
  Clock, 
  Settings, 
  MessageSquareHeart, 
  LogOut, 
  Download, 
  Menu, 
  X, 
  ChevronRight,
  Activity,
  Flame,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { DueRemindersBanner } from '../components/DueRemindersBanner';
import { ReportsModal } from '../components/ReportsModal';
import { Button } from '../components/ui/Button';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/reminders', label: 'Reminders', icon: Clock },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/feedback', label: 'Feedback', icon: MessageSquareHeart },
  ];

  const mobileBottomNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/reminders', label: 'Reminders', icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const current = navItems.find((n) => n.to === location.pathname);
    return current ? current.label : 'FitTrack';
  };

  return (
    <div className="min-h-screen bg-[#080C10] text-slate-100 flex flex-col md:flex-row overflow-x-hidden">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0B1017] border-r border-slate-800/80 p-5 shrink-0 min-h-screen sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-2 py-3 mb-6">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C6FF3A]/20 to-[#C6FF3A]/5 border border-[#C6FF3A]/40 flex items-center justify-center text-[#C6FF3A] shadow-[0_0_20px_rgba(198,255,58,0.2)] group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center">
                Fit<span className="text-[#C6FF3A]">Track</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400 block -mt-1">
                Elite Performance
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#C6FF3A]/10 text-[#C6FF3A] border border-[#C6FF3A]/30 shadow-[0_0_20px_rgba(198,255,58,0.08)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#131C2A] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#C6FF3A]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#C6FF3A] shadow-[0_0_8px_#C6FF3A]"
                  />
                )}
              </NavLink>
            );
          })}

          {/* Quick Export Trigger in sidebar */}
          <button
            onClick={() => setIsReportsOpen(true)}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-[#131C2A] transition-all cursor-pointer border border-transparent hover:border-slate-800"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="truncate">Export Reports</span>
          </button>
        </nav>

        {/* User Card & Logout at Bottom */}
        <div className="pt-4 border-t border-slate-800/80 mt-2">
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0F1622] border border-slate-800/60">
            <NavLink to="/settings" className="flex items-center gap-3 min-w-0 flex-1 group">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-[#C6FF3A] transition-colors">
                  {user?.name || 'Athlete'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@fittrack.com'}</p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-8 max-w-full overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#080C10]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#0F1622] text-slate-300 border border-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#C6FF3A] shadow-[0_0_10px_#C6FF3A]" />
              <h1 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportsOpen(true)}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#C6FF3A]" />}
              className="hidden sm:inline-flex text-xs"
            >
              Export
            </Button>
            <NotificationBell />
          </div>
        </header>

        {/* Mobile Dropdown Drawer Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0B1017] border-b border-slate-800 px-4 py-3 space-y-1"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-[#C6FF3A]/15 text-[#C6FF3A]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </NavLink>
                );
              })}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Due Reminders Top Banner */}
          <DueRemindersBanner />

          {/* Animated Route Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ================= MOBILE BOTTOM TAB BAR (<768px) ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C10]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#C6FF3A]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#C6FF3A]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Global Reports & Data Export Modal */}
      <ReportsModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
    </div>
  );
};
