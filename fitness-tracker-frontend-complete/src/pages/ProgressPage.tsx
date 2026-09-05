import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Plus, 
  Scale, 
  Ruler, 
  Trophy, 
  Calendar, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff,
  Activity,
  Timer,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { progressApi } from '../api/client';
import { ProgressEntry, BodyMeasurements, PerformanceMetrics } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';
import { AxiosError } from 'axios';

interface MeasurementToggleState {
  chest: boolean;
  waist: boolean;
  hips: boolean;
  arms: boolean;
  thighs: boolean;
}

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Measurement Line Visibility Toggles
  const [visibleLines, setVisibleLines] = useState<MeasurementToggleState>({
    chest: true,
    waist: true,
    hips: true,
    arms: true,
    thighs: true,
  });

  // Form State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formWeight, setFormWeight] = useState<string>('');
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [formMeasurements, setFormMeasurements] = useState<BodyMeasurements>({
    chest: undefined,
    waist: undefined,
    hips: undefined,
    arms: undefined,
    thighs: undefined,
  });
  const [showPerformance, setShowPerformance] = useState<boolean>(true);
  const [formPerformance, setFormPerformance] = useState<PerformanceMetrics>({
    runTimeMinutes: undefined,
    maxLiftWeight: undefined,
    customNote: '',
  });

  const unit = user?.preferences?.unit === 'imperial' ? 'lbs' : 'kg';
  const measureUnit = user?.preferences?.unit === 'imperial' ? 'in' : 'cm';

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await progressApi.getProgress();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      toastError('Could not load progress records.');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Format data for Weight Chart (Chronological order)
  const weightChartData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted
      .filter((e) => e.weight !== undefined && e.weight !== null && e.weight > 0)
      .map((e) => ({
        date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: e.weight,
      }));
  }, [entries]);

  // Format data for Body Measurements Multi-Line Chart
  const measurementsChartData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted
      .filter((e) => e.bodyMeasurements && Object.values(e.bodyMeasurements).some((v) => typeof v === 'number' && v > 0))
      .map((e) => ({
        date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        chest: e.bodyMeasurements?.chest,
        waist: e.bodyMeasurements?.waist,
        hips: e.bodyMeasurements?.hips,
        arms: e.bodyMeasurements?.arms,
        thighs: e.bodyMeasurements?.thighs,
      }));
  }, [entries]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingEntry(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    // Pre-populate with last weight if available
    const lastWeight = entries.find((e) => e.weight)?.weight;
    setFormWeight(lastWeight ? String(lastWeight) : '');
    setFormMeasurements({ chest: undefined, waist: undefined, hips: undefined, arms: undefined, thighs: undefined });
    setFormPerformance({ runTimeMinutes: undefined, maxLiftWeight: undefined, customNote: '' });
    setShowMeasurements(true);
    setShowPerformance(true);
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (entry: ProgressEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date.includes('T') ? entry.date.split('T')[0] : entry.date);
    setFormWeight(entry.weight ? String(entry.weight) : '');
    setFormMeasurements(entry.bodyMeasurements || {});
    setFormPerformance(entry.performanceMetrics || { customNote: '' });
    setShowMeasurements(true);
    setShowPerformance(true);
    setIsFormModalOpen(true);
  };

  // Submit Progress Form
  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const payload: Partial<ProgressEntry> = {
        date: new Date(formDate).toISOString(),
        weight: formWeight ? parseFloat(formWeight) : undefined,
        bodyMeasurements: {
          chest: formMeasurements.chest ? Number(formMeasurements.chest) : undefined,
          waist: formMeasurements.waist ? Number(formMeasurements.waist) : undefined,
          hips: formMeasurements.hips ? Number(formMeasurements.hips) : undefined,
          arms: formMeasurements.arms ? Number(formMeasurements.arms) : undefined,
          thighs: formMeasurements.thighs ? Number(formMeasurements.thighs) : undefined,
        },
        performanceMetrics: {
          runTimeMinutes: formPerformance.runTimeMinutes ? Number(formPerformance.runTimeMinutes) : undefined,
          maxLiftWeight: formPerformance.maxLiftWeight ? Number(formPerformance.maxLiftWeight) : undefined,
          customNote: formPerformance.customNote?.trim() || undefined,
        },
      };

      if (editingEntry) {
        await progressApi.updateProgressEntry(editingEntry._id, payload);
        success('Progress entry updated successfully!');
      } else {
        await progressApi.createProgressEntry(payload as any);
        success('Progress logged successfully!', 'Milestone Recorded');
      }

      setIsFormModalOpen(false);
      fetchProgress();
    } catch (err: unknown) {
      console.error('Save progress error:', err);
      toastError('Failed to save progress entry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Progress
  const handleConfirmDelete = async () => {
    if (!deletingEntryId) return;
    try {
      setIsDeleting(true);
      await progressApi.deleteProgressEntry(deletingEntryId);
      success('Progress log removed');
      setEntries((prev) => prev.filter((p) => p._id !== deletingEntryId));
      setDeletingEntryId(null);
    } catch (err) {
      console.error('Delete progress error:', err);
      toastError('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleLine = (key: keyof MeasurementToggleState) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Progress & Biometrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visualize weight curves, circumference dimensions, and performance benchmarks over time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="glow-accent self-start sm:self-auto"
        >
          Log Progress
        </Button>
      </div>

      {/* Visual Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          <div className="h-72 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
        </div>
      ) : entries.length < 2 ? (
        <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center">
          <Activity className="w-10 h-10 text-[#C6FF3A] mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            Log at least 2 entries to see your trend
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Track your biometrics weekly to unlock interactive trajectory charts and body measurement comparisons.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Log Your Next Check-in
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Trend Line Chart */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C6FF3A]" />
                <h3 className="text-sm font-semibold text-white">Weight Trajectory</h3>
              </div>
              <span className="text-xs font-semibold text-[#C6FF3A] px-2 py-0.5 rounded bg-[#C6FF3A]/10">
                Unit: {unit}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F1622',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: number | string | undefined) => [`${val ?? 0} ${unit}`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#C6FF3A"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#C6FF3A', stroke: '#080C10', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#C6FF3A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Body Measurements Multi-Line Chart */}
          <Card variant="glass">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Body Circumference ({measureUnit})</h3>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                {[
                  { key: 'chest' as const, label: 'Chest', color: '#6366F1' },
                  { key: 'waist' as const, label: 'Waist', color: '#EC4899' },
                  { key: 'hips' as const, label: 'Hips', color: '#F59E0B' },
                  { key: 'arms' as const, label: 'Arms', color: '#10B981' },
                  { key: 'thighs' as const, label: 'Thighs', color: '#38BDF8' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleLine(item.key)}
                    style={{
                      borderColor: visibleLines[item.key] ? item.color : '#334155',
                      color: visibleLines[item.key] ? item.color : '#64748B',
                    }}
                    className="px-2 py-0.5 rounded border transition-all cursor-pointer bg-[#121A28]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurementsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F1622',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  {visibleLines.chest && (
                    <Line type="monotone" dataKey="chest" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {visibleLines.waist && (
                    <Line type="monotone" dataKey="waist" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {visibleLines.hips && (
                    <Line type="monotone" dataKey="hips" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {visibleLines.arms && (
                    <Line type="monotone" dataKey="arms" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                  {visibleLines.thighs && (
                    <Line type="monotone" dataKey="thighs" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Progress Timeline / History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C6FF3A]" /> History Timeline
          </h3>
          <span className="text-xs text-slate-400">{entries.length} Check-ins Logged</span>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-8 h-8 text-[#C6FF3A]" />}
            title="No Progress Entries"
            description="Start recording your weight, measurements, or personal bests to build your timeline."
            actionLabel="Log First Check-in"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    variant="glass"
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 group hover:border-slate-700"
                  >
                    {/* Left: Date & Weight */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#141E2E] border border-slate-700/70 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className="text-base font-bold text-white font-display leading-none">
                          {new Date(entry.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold font-display text-white">
                            {entry.weight ? `${entry.weight} ${unit}` : 'No Weight Logged'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Logged Metrics Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                      {entry.bodyMeasurements && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121A28] border border-slate-800 text-[11px]">
                          <Ruler className="w-3.5 h-3.5 text-sky-400" />
                          <span>
                            {Object.entries(entry.bodyMeasurements)
                              .filter(([_, v]) => v)
                              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                              .join(' | ') || 'No measurements'}
                          </span>
                        </div>
                      )}

                      {entry.performanceMetrics?.runTimeMinutes && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                          <Timer className="w-3 h-3" /> {entry.performanceMetrics.runTimeMinutes}m run
                        </span>
                      )}

                      {entry.performanceMetrics?.maxLiftWeight && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                          <Trophy className="w-3 h-3" /> {entry.performanceMetrics.maxLiftWeight}kg PR
                        </span>
                      )}

                      {entry.performanceMetrics?.customNote && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 italic max-w-xs truncate">
                          <FileText className="w-3 h-3 shrink-0" /> "{entry.performanceMetrics.customNote}"
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingEntryId(entry._id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ================= LOG PROGRESS MODAL ================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEntry ? 'Edit Progress Entry' : 'Log Biometrics & Progress'}
        subtitle="Record your body weight, tape measurements, and athletic benchmarks"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitProgress} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
            <Input
              label={`Body Weight (${unit})`}
              type="number"
              step="0.1"
              min={0}
              placeholder={`e.g. ${unit === 'kg' ? '78.5' : '172.5'}`}
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
              leftIcon={<Scale className="w-4 h-4" />}
            />
          </div>

          {/* Collapsible Body Measurements */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-sky-400" /> Body Measurements ({measureUnit}) — Optional
              </span>
              {showMeasurements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMeasurements && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-2 p-3 rounded-xl bg-[#121A28] border border-slate-800">
                <Input
                  label="Chest"
                  type="number"
                  step="0.5"
                  placeholder="cm/in"
                  value={formMeasurements.chest || ''}
                  onChange={(e) =>
                    setFormMeasurements({ ...formMeasurements, chest: parseFloat(e.target.value) || undefined })
                  }
                />
                <Input
                  label="Waist"
                  type="number"
                  step="0.5"
                  placeholder="cm/in"
                  value={formMeasurements.waist || ''}
                  onChange={(e) =>
                    setFormMeasurements({ ...formMeasurements, waist: parseFloat(e.target.value) || undefined })
                  }
                />
                <Input
                  label="Hips"
                  type="number"
                  step="0.5"
                  placeholder="cm/in"
                  value={formMeasurements.hips || ''}
                  onChange={(e) =>
                    setFormMeasurements({ ...formMeasurements, hips: parseFloat(e.target.value) || undefined })
                  }
                />
                <Input
                  label="Arms"
                  type="number"
                  step="0.5"
                  placeholder="cm/in"
                  value={formMeasurements.arms || ''}
                  onChange={(e) =>
                    setFormMeasurements({ ...formMeasurements, arms: parseFloat(e.target.value) || undefined })
                  }
                />
                <Input
                  label="Thighs"
                  type="number"
                  step="0.5"
                  placeholder="cm/in"
                  value={formMeasurements.thighs || ''}
                  onChange={(e) =>
                    setFormMeasurements({ ...formMeasurements, thighs: parseFloat(e.target.value) || undefined })
                  }
                />
              </div>
            )}
          </div>

          {/* Collapsible Performance Metrics */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowPerformance(!showPerformance)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#C6FF3A]" /> Performance & Notes — Optional
              </span>
              {showPerformance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPerformance && (
              <div className="space-y-3 mt-2 p-3 rounded-xl bg-[#121A28] border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Run Time (Minutes)"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 24.5"
                    value={formPerformance.runTimeMinutes || ''}
                    onChange={(e) =>
                      setFormPerformance({
                        ...formPerformance,
                        runTimeMinutes: parseFloat(e.target.value) || undefined,
                      })
                    }
                    leftIcon={<Timer className="w-4 h-4" />}
                  />
                  <Input
                    label="Max Lift PR (kg / lbs)"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 120"
                    value={formPerformance.maxLiftWeight || ''}
                    onChange={(e) =>
                      setFormPerformance({
                        ...formPerformance,
                        maxLiftWeight: parseFloat(e.target.value) || undefined,
                      })
                    }
                    leftIcon={<Trophy className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Custom Note / Reflection
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Felt light on my feet, cut cycle progressing smoothly..."
                    value={formPerformance.customNote || ''}
                    onChange={(e) =>
                      setFormPerformance({ ...formPerformance, customNote: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#0F1622] border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6FF3A] focus:outline-none"
                  />
                </div>
              </div>
            )}
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
              {editingEntry ? 'Save Changes' : 'Record Check-in'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEntryId)}
        onClose={() => setDeletingEntryId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Progress Entry?"
        description="Are you sure you want to delete this biometrics check-in? Historical trends will adjust accordingly."
        confirmLabel="Delete Entry"
        isLoading={isDeleting}
      />
    </div>
  );
};
