import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCheck, 
  Trash2, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { notificationsApi } from '../api/client';
import { AppNotification, NotificationType } from '../types';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeTime, formatDateTime } from '../utils/format';

export const NotificationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationsApi.getNotifications(
        activeFilter === 'unread' ? false : undefined
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toastError('Could not load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, toastError]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toastError('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      success('Notification removed');
    } catch (err) {
      console.error('Delete error:', err);
      toastError('Failed to delete notification');
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-indigo-400" />;
      case 'nutrition':
        return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-[#C6FF3A]" />;
      case 'goal':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Activity & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            System activity, automated session logs, and schedule alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllAsRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-[#C6FF3A]" />}
            className="self-start sm:self-auto"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0F1622] border border-slate-800 w-fit">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#C6FF3A] text-black shadow-[0_0_12px_rgba(198,255,58,0.2)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-[#C6FF3A] text-black shadow-[0_0_12px_rgba(198,255,58,0.2)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[#C6FF3A] text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-[#C6FF3A]" />}
          title="No Notifications"
          description={
            activeFilter === 'unread'
              ? 'You are all caught up! No unread notifications right now.'
              : 'Activity alerts and schedule updates will appear here automatically.'
          }
        />
      ) : (
        <motion.div layout className="space-y-2.5">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (!notif.isRead) handleMarkAsRead(notif._id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-gradient-to-r from-[#121E2E] to-[#0F1622] border-l-4 border-l-[#C6FF3A] border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-[#0F1622]/60 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.isRead
                        ? 'bg-[#C6FF3A]/15 border border-[#C6FF3A]/30'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          !notif.isRead ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-[#C6FF3A] rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(notif._id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
