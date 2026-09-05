import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X, Check, Dumbbell, Apple, Target } from 'lucide-react';
import { remindersApi } from '../api/client';
import { Reminder } from '../types';
import { useToast } from '../context/ToastContext';

export const DueRemindersBanner: React.FC = () => {
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const { success } = useToast();

  const checkDue = async () => {
    try {
      const due = await remindersApi.getDueReminders();
      setDueReminders(due);
    } catch (err) {
      console.error('Failed to check due reminders:', err);
    }
  };

  useEffect(() => {
    checkDue();
    const interval = setInterval(checkDue, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      await remindersApi.updateReminder(id, { isActive: false });
      setDueReminders((prev) => prev.filter((r) => r._id !== id));
      success('Reminder dismissed and marked complete');
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  if (dueReminders.length === 0) return null;

  return (
    <aside aria-label="Due Reminders" className="space-y-2 mb-6">
      <AnimatePresence>
        {dueReminders.map((reminder) => (
          <motion.div
            key={reminder._id}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#0F1622] to-amber-500/10 border border-amber-500/30 text-slate-100 shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-bounce">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Due Reminder</span>
                  <span className="text-xs font-bold text-white truncate">{reminder.title}</span>
                </div>
                {reminder.message && (
                  <p className="text-xs text-slate-300 truncate mt-0.5">{reminder.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDismiss(reminder._id)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Dismiss
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
};
