import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Dumbbell, Apple, TrendingUp, Target, Check, ChevronRight } from 'lucide-react';
import { notificationsApi } from '../api/client';
import { AppNotification } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../utils/format';

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsApi.getNotifications();
      setUnreadCount(res.unreadCount);
      setRecentNotifs(res.notifications.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 45s
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setRecentNotifs((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />;
      case 'nutrition':
        return <Apple className="w-3.5 h-3.5 text-emerald-400" />;
      case 'progress':
        return <TrendingUp className="w-3.5 h-3.5 text-[#C6FF3A]" />;
      case 'goal':
        return <Target className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs();
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-xl bg-[#0F1622] hover:bg-[#16202E] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C6FF3A] px-1 text-[10px] font-bold text-black ring-2 ring-[#080C10] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F1622]/95 backdrop-blur-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-slate-800/80 bg-[#131B2A]/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#C6FF3A]/20 text-[#C6FF3A] text-[10px] font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#C6FF3A] hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
              {recentNotifs.length === 0 ? (
                <div className="py-8 px-4 text-center text-xs text-slate-500">
                  No notifications yet
                </div>
              ) : (
                recentNotifs.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n._id, {} as React.MouseEvent);
                      setIsOpen(false);
                      navigate('/notifications');
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                      !n.isRead ? 'bg-[#152132]/40' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h5 className={`text-xs font-medium truncate ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(n._id, e)}
                        title="Mark as read"
                        className="p-1 text-slate-500 hover:text-[#C6FF3A] shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
