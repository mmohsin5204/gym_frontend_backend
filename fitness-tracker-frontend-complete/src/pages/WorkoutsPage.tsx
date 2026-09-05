import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Calendar, 
  Tag, 
  X, 
  Layers, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { workoutsApi } from '../api/client';
import { Workout, WorkoutCategory, Exercise } from '../types';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, formatRelativeTime } from '../utils/format';
import { AxiosError } from 'axios';

const CATEGORIES: { id: WorkoutCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Routines' },
  { id: 'strength', label: 'Strength' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'flexibility', label: 'Flexibility' },
  { id: 'other', label: 'Other / HIIT' },
];

export const WorkoutsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [detailWorkout, setDetailWorkout] = useState<Workout | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<WorkoutCategory>('strength');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formExercises, setFormExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, weight: 0, notes: '' },
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch workouts
  const fetchWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workoutsApi.getWorkouts(selectedCategory, debouncedSearch);
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
      toastError('Could not load workouts.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedSearch, toastError]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingWorkout(null);
    setFormTitle('');
    setFormCategory('strength');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTags([]);
    setFormTagInput('');
    setFormExercises([{ name: '', sets: 3, reps: 10, weight: 0, notes: '' }]);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormTitle(workout.title);
    setFormCategory(workout.category);
    setFormDate(workout.date.includes('T') ? workout.date.split('T')[0] : workout.date);
    setFormTags(workout.tags || []);
    setFormTagInput('');
    setFormExercises(
      workout.exercises.length > 0
        ? JSON.parse(JSON.stringify(workout.exercises))
        : [{ name: '', sets: 3, reps: 10, weight: 0, notes: '' }]
    );
    setFormErrors({});
    setDetailWorkout(null); // close detail if opened
    setIsFormModalOpen(true);
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && formTagInput.trim()) {
      e.preventDefault();
      const cleanTag = formTagInput.trim().replace(/^,|,$/g, '').toLowerCase();
      if (cleanTag && !formTags.includes(cleanTag)) {
        setFormTags([...formTags, cleanTag]);
      }
      setFormTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Dynamic Exercise Rows
  const handleAddExerciseRow = () => {
    setFormExercises([
      ...formExercises,
      { name: '', sets: 3, reps: 10, weight: 0, notes: '' },
    ]);
  };

  const handleUpdateExercise = (index: number, field: keyof Exercise, val: string | number) => {
    const updated = [...formExercises];
    updated[index] = { ...updated[index], [field]: val };
    setFormExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    if (formExercises.length <= 1) {
      toastError('At least 1 exercise is required in a workout.');
      return;
    }
    setFormExercises(formExercises.filter((_, i) => i !== index));
  };

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formTitle.trim()) errs.title = 'Workout title is required';
    if (!formDate) errs.date = 'Date is required';

    if (formExercises.length === 0) {
      errs.exercises = 'Add at least one exercise';
    } else {
      formExercises.forEach((ex, i) => {
        if (!ex.name.trim()) errs[`ex_name_${i}`] = 'Exercise name required';
        if (isNaN(ex.sets) || Number(ex.sets) <= 0) errs[`ex_sets_${i}`] = 'Invalid sets';
        if (isNaN(ex.reps) || Number(ex.reps) <= 0) errs[`ex_reps_${i}`] = 'Invalid reps';
      });
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Workout (Create / Edit)
  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        date: new Date(formDate).toISOString(),
        tags: formTags,
        exercises: formExercises.map((e) => ({
          name: e.name.trim(),
          sets: Number(e.sets),
          reps: Number(e.reps),
          weight: Number(e.weight) || 0,
          notes: e.notes?.trim() || '',
        })),
      };

      if (editingWorkout) {
        await workoutsApi.updateWorkout(editingWorkout._id, payload);
        success('Workout updated successfully!');
      } else {
        await workoutsApi.createWorkout(payload);
        success('Workout logged successfully!', 'Session Recorded');
      }

      setIsFormModalOpen(false);
      fetchWorkouts();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: { field: string; message: string }[] }>;
      if (axiosErr.response?.data?.errors) {
        const mapped: Record<string, string> = {};
        axiosErr.response.data.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFormErrors(mapped);
        toastError(axiosErr.response.data.message || 'Validation error');
      } else {
        toastError('Failed to save workout. Please check your data.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Workout
  const handleConfirmDelete = async () => {
    if (!deletingWorkoutId) return;
    try {
      setIsDeleting(true);
      await workoutsApi.deleteWorkout(deletingWorkoutId);
      success('Workout removed');
      setWorkouts((prev) => prev.filter((w) => w._id !== deletingWorkoutId));
      setDeletingWorkoutId(null);
      setDetailWorkout(null);
    } catch (err) {
      console.error('Delete error:', err);
      toastError('Failed to delete workout');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Workouts & Routines
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Log exercises, track set volumes, and organize your training history.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="glow-accent self-start sm:self-auto"
        >
          New Workout
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0F1622] border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search workouts, tags, exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#131B29]"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#C6FF3A] text-black font-semibold shadow-[0_0_15px_rgba(198,255,58,0.2)]'
                    : 'bg-[#131B29] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workout Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8 text-[#C6FF3A]" />}
          title="No Workouts Found"
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Try changing your search query or category filter.'
              : 'You have not recorded any workouts yet. Create your first session now!'
          }
          actionLabel="Log New Workout"
          onAction={handleOpenCreate}
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {workouts.map((workout) => (
              <motion.div
                key={workout._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  variant="glass"
                  hoverEffect
                  onClick={() => setDetailWorkout(workout)}
                  className="cursor-pointer group relative flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Top Row: Category & Date */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant={workout.category} size="sm">
                        {workout.category}
                      </Badge>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(workout.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-white group-hover:text-[#C6FF3A] transition-colors mb-2 line-clamp-1">
                      {workout.title}
                    </h3>

                    {/* Exercise previews */}
                    <div className="space-y-1 mb-4">
                      {workout.exercises.slice(0, 2).map((ex, idx) => (
                        <p key={idx} className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-500" />
                          <span className="text-slate-300 font-medium">{ex.name}</span>
                          <span>({ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''})</span>
                        </p>
                      ))}
                      {workout.exercises.length > 2 && (
                        <p className="text-[11px] text-slate-500 italic">
                          +{workout.exercises.length - 2} more exercises
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Exercise count, Tags, Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-xs font-semibold text-slate-300">
                        {workout.exercises.length} {workout.exercises.length === 1 ? 'Exercise' : 'Exercises'}
                      </span>
                      {workout.tags?.slice(0, 1).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 truncate">
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(workout);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Workout"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingWorkoutId(workout._id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Workout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ================= WORKOUT DETAIL MODAL ================= */}
      <Modal
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
        title={detailWorkout?.title}
        subtitle={detailWorkout ? `${formatDate(detailWorkout.date)} • ${detailWorkout.category.toUpperCase()}` : ''}
        maxWidth="2xl"
      >
        {detailWorkout && (
          <div className="space-y-6">
            {/* Tags if present */}
            {detailWorkout.tags && detailWorkout.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {detailWorkout.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-[#141E2E] text-slate-300 border border-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Exercises Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Exercise Breakdown
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#121A28] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Exercise</th>
                      <th className="py-2.5 px-3">Sets</th>
                      <th className="py-2.5 px-3">Reps</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#0F1622]">
                    {detailWorkout.exercises.map((ex, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-500">{i + 1}</td>
                        <td className="py-3 px-3 font-semibold text-white">{ex.name}</td>
                        <td className="py-3 px-3 text-slate-300">{ex.sets}</td>
                        <td className="py-3 px-3 text-slate-300">{ex.reps}</td>
                        <td className="py-3 px-3 text-[#C6FF3A] font-medium">
                          {ex.weight ? `${ex.weight} kg` : '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-xs italic">{ex.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions Inside Detail Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeletingWorkoutId(detailWorkout._id)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDetailWorkout(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenEdit(detailWorkout)}
                  leftIcon={<Pencil className="w-4 h-4" />}
                >
                  Edit Workout
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= WORKOUT CREATE / EDIT FORM MODAL ================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingWorkout ? 'Edit Workout' : 'Log New Workout'}
        subtitle="Specify session details and add individual exercise sets"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitWorkout} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Workout Title"
                placeholder="e.g. Chest & Triceps Blast"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                error={formErrors.title}
                required
              />
            </div>
            <div>
              <Select
                label="Category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as WorkoutCategory)}
                options={[
                  { value: 'strength', label: 'Strength' },
                  { value: 'cardio', label: 'Cardio' },
                  { value: 'flexibility', label: 'Flexibility' },
                  { value: 'other', label: 'Other / HIIT' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                error={formErrors.date}
                required
              />
            </div>

            {/* Tags Chips Input */}
            <div>
              <Input
                label="Tags (press Enter or comma)"
                placeholder="chest, hypertrophy, push"
                value={formTagInput}
                onChange={(e) => setFormTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {formTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {formTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#16202E] border border-slate-700 text-slate-200"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Exercises List */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Exercises & Sets
              </h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddExerciseRow}
                leftIcon={<Plus className="w-3.5 h-3.5 text-[#C6FF3A]" />}
              >
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {formExercises.map((ex, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-[#121A28] border border-slate-800 relative space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#C6FF3A]">
                        #{idx + 1}
                      </span>
                      {formExercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                          title="Remove exercise"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Exercise Name (e.g. Barbell Squat)"
                          value={ex.name}
                          onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                          error={formErrors[`ex_name_${idx}`]}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Sets"
                          value={ex.sets}
                          onChange={(e) => handleUpdateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                          error={formErrors[`ex_sets_${idx}`]}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Reps"
                          value={ex.reps}
                          onChange={(e) => handleUpdateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                          error={formErrors[`ex_reps_${idx}`]}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="Weight (kg / lbs) - optional"
                        value={ex.weight || ''}
                        onChange={(e) => handleUpdateExercise(idx, 'weight', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Notes / cues (optional)"
                        value={ex.notes || ''}
                        onChange={(e) => handleUpdateExercise(idx, 'notes', e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
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
              {editingWorkout ? 'Save Changes' : 'Record Workout'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <ConfirmModal
        isOpen={Boolean(deletingWorkoutId)}
        onClose={() => setDeletingWorkoutId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Workout?"
        description="Are you sure you want to delete this workout entry? This action cannot be undone."
        confirmLabel="Delete Workout"
        isLoading={isDeleting}
      />
    </div>
  );
};
