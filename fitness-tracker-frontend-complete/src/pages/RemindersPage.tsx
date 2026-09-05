import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Plus, 
  Dumbbell, 
  Apple, 
  Target, 
  Repeat, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { remindersApi } from '../api/client';
import { Reminder, ReminderType, ReminderRepeat } from '../types';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime } from '../utils/format';
import { AxiosError } from 'axios';

const REMINDER_TYPES: { id: ReminderType; label: string; icon: React.ReactNode }[] = [
  { id: 'workout', label: 'Workout', icon: <Dumbbell className="w-4 h-4 text-indigo-400" /> },
  { id: 'meal', label: 'Meal & Nutrition', icon: <Apple className="w-4 h-4 text-emerald-400" /> },
  { id: 'goal', label: 'Goal / Biometrics', icon: <Target className="w-4 h-4 text-amber-400" /> },
];

export const RemindersPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ReminderType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [formType, setFormType] = useState<ReminderType>('workout');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formScheduledTime, setFormScheduledTime] = useState('');
  const [formRepeat, setFormRepeat] = useState<ReminderRepeat>('none');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await remindersApi.getReminders(
        selectedTypeFilter === 'all' ? undefined : selectedTypeFilter
      );
      setReminders(data);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      toastError('Could not load scheduled reminders');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTypeFilter, toastError]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Default next hour for datetime picker
  const getDefaultFutureDateTime = () => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingReminder(null);
    setFormType('workout');
    setFormTitle('');
    setFormMessage('');
    setFormScheduledTime(getDefaultFutureDateTime());
    setFormRepeat('none');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormType(reminder.type);
    setFormTitle(reminder.title);
    setFormMessage(reminder.message || '');
    const d = new Date(reminder.scheduledTime);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormScheduledTime(localISOTime);
    setFormRepeat(reminder.repeat || 'none');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Toggle Active switch
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isActive: newStatus } : r))
      );
      await remindersApi.updateReminder(id, { isActive: newStatus });
      success(newStatus ? 'Reminder enabled' : 'Reminder deactivated');
    } catch (err) {
      console.error('Failed to update status:', err);
      toastError('Could not update reminder status');
      fetchReminders(); // revert
    }
  };

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formTitle.trim()) errs.title = 'Reminder title is required';
    if (!formScheduledTime) errs.scheduledTime = 'Scheduled date and time required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmitReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const payload = {
        type: formType,
        title: formTitle.trim(),
        message: formMessage.trim() || undefined,
        scheduledTime: new Date(formScheduledTime).toISOString(),
        repeat: formRepeat,
      };

      if (editingReminder) {
        await remindersApi.updateReminder(editingReminder._id, payload);
        success('Reminder updated successfully!');
      } else {
        await remindersApi.createReminder(payload);
        success('Reminder scheduled successfully!', 'Reminder Created');
      }

      setIsFormModalOpen(false);
      fetchReminders();
    } catch (err: unknown) {
      console.error('Save reminder error:', err);
      toastError('Failed to save reminder.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingReminderId) return;
    try {
      setIsDeleting(true);
      await remindersApi.deleteReminder(deletingReminderId);
      success('Reminder removed');
      setReminders((prev) => prev.filter((r) => r._id !== deletingReminderId));
      setDeletingReminderId(null);
    } catch (err) {
      console.error('Delete error:', err);
      toastError('Failed to delete reminder');
    } finally {
      setIsDeleting(false);
    }
  };

  const getIcon = (type: ReminderType) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="w-5 h-5 text-indigo-400" />;
      case 'meal':
        return <Apple className="w-5 h-5 text-emerald-400" />;
      default:
        return <Target className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Schedule & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Set intelligent alerts for training times, protein feedings, and weekly weigh-ins.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="glow-accent self-start sm:self-auto"
        >
          New Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0F1622] border border-slate-800 w-fit overflow-x-auto">
        <button
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedTypeFilter === 'all'
              ? 'bg-[#C6FF3A] text-black shadow-[0_0_12px_rgba(198,255,58,0.2)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Reminders
        </button>
        {REMINDER_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTypeFilter(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedTypeFilter === t.id
                ? 'bg-[#C6FF3A] text-black shadow-[0_0_12px_rgba(198,255,58,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-[#C6FF3A]" />}
          title="No Scheduled Reminders"
          description="Create scheduled alerts to stay consistent with your workout timetable and meal plans."
          actionLabel="Create First Reminder"
          onAction={handleOpenCreate}
        />
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {reminders.map((rem) => {
              const isPastDue = new Date(rem.scheduledTime).getTime() <= Date.now();
              return (
                <motion.div
                  key={rem._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    variant="glass"
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 transition-all ${
                      !rem.isActive
                        ? 'opacity-50 grayscale'
                        : isPastDue
                        ? 'border-amber-500/40 bg-[#121A28]'
                        : 'hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#141E2E] border border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(rem.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-semibold text-white truncate">
                            {rem.title}
                          </h3>
                          {rem.repeat && rem.repeat !== 'none' && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-[#C6FF3A] border border-slate-700">
                              <Repeat className="w-3 h-3" /> {rem.repeat.toUpperCase()}
                            </span>
                          )}
                          {isPastDue && rem.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                              DUE NOW
                            </span>
                          )}
                        </div>

                        {rem.message && (
                          <p className="text-xs text-slate-300 mb-2 leading-relaxed max-w-xl">
                            {rem.message}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-[#C6FF3A]" />
                          <span>{formatDateTime(rem.scheduledTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Switch */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      {/* Active Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rem.isActive}
                          onChange={() => handleToggleActive(rem._id, rem.isActive)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6FF3A]"></div>
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rem)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit reminder"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingReminderId(rem._id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ================= CREATE / EDIT MODAL ================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingReminder ? 'Edit Reminder' : 'Schedule Reminder'}
        subtitle="Set scheduled alert times and recurrence for key fitness tasks"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitReminder} className="space-y-4">
          {/* Type Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_TYPES.map((t) => {
                const isSelected = formType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormType(t.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C6FF3A]/15 border-[#C6FF3A] text-[#C6FF3A]'
                        : 'bg-[#121A28] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Title"
            placeholder="e.g. Evening Leg Workout or Creatine Timing"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={formErrors.title}
            required
          />

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Instructions / Message (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Remember to warm up shoulders for 10 minutes..."
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              className="w-full rounded-xl bg-[#0F1622] border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6FF3A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              value={formScheduledTime}
              onChange={(e) => setFormScheduledTime(e.target.value)}
              error={formErrors.scheduledTime}
              required
            />

            <Select
              label="Repeat Schedule"
              value={formRepeat}
              onChange={(e) => setFormRepeat(e.target.value as ReminderRepeat)}
              options={[
                { value: 'none', label: 'None (One-time alert)' },
                { value: 'daily', label: 'Daily Recurrence' },
                { value: 'weekly', label: 'Weekly Recurrence' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {editingReminder ? 'Save Changes' : 'Schedule Reminder'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingReminderId)}
        onClose={() => setDeletingReminderId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Reminder?"
        description="Are you sure you want to remove this reminder? You will no longer receive alerts for it."
        confirmLabel="Delete Reminder"
        isLoading={isDeleting}
      />
    </div>
  );
};
