import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Plus, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  Calendar, 
  Pencil, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Flame,
  PieChart as PieIcon
} from 'lucide-react';
import { nutritionApi } from '../api/client';
import { NutritionLog, MealType, FoodItem } from '../types';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CountUp } from '../components/ui/CountUp';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';
import { AxiosError } from 'axios';

const MEAL_TYPES: { id: MealType; label: string; icon: React.ReactNode }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-400" /> },
  { id: 'lunch', label: 'Lunch', icon: <Sun className="w-4 h-4 text-sky-400" /> },
  { id: 'dinner', label: 'Dinner', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  { id: 'snack', label: 'Snack', icon: <Cookie className="w-4 h-4 text-emerald-400" /> },
];

export const NutritionPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMealFilter, setSelectedMealFilter] = useState<MealType | 'all'>('all');
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<NutritionLog | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formMealType, setFormMealType] = useState<MealType>('breakfast');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formFoodItems, setFormFoodItems] = useState<
    { name: string; quantity: string; calories: number; protein?: number; carbs?: number; fats?: number; showMacros?: boolean }[]
  >([{ name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0, showMacros: false }]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchNutrition = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await nutritionApi.getNutrition(
        selectedMealFilter === 'all' ? undefined : selectedMealFilter,
        selectedDate
      );
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch nutrition logs:', err);
      toastError('Could not load nutrition logs.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMealFilter, selectedDate, toastError]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  // Compute Daily Summary totals for selectedDate
  const dailySummary = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    logs.forEach((log) => {
      log.foodItems.forEach((item) => {
        totalCalories += item.calories || 0;
        totalProtein += item.macros?.protein || 0;
        totalCarbs += item.macros?.carbs || 0;
        totalFats += item.macros?.fats || 0;
      });
    });

    const macroSum = totalProtein * 4 + totalCarbs * 4 + totalFats * 9;
    const proteinPct = macroSum > 0 ? Math.round(((totalProtein * 4) / macroSum) * 100) : 0;
    const carbsPct = macroSum > 0 ? Math.round(((totalCarbs * 4) / macroSum) * 100) : 0;
    const fatsPct = macroSum > 0 ? Math.round(((totalFats * 9) / macroSum) * 100) : 0;

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      proteinPct,
      carbsPct,
      fatsPct,
    };
  }, [logs]);

  // Live running total for the modal form
  const formTotalCalories = useMemo(() => {
    return formFoodItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  }, [formFoodItems]);

  // Open Create Modal
  const handleOpenCreate = (prefillType?: MealType) => {
    setEditingLog(null);
    setFormMealType(prefillType || 'breakfast');
    setFormDate(selectedDate || new Date().toISOString().split('T')[0]);
    setFormFoodItems([
      { name: '', quantity: '1 serving', calories: 250, protein: 15, carbs: 20, fats: 5, showMacros: false },
    ]);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (log: NutritionLog) => {
    setEditingLog(log);
    setFormMealType(log.mealType);
    setFormDate(log.date.includes('T') ? log.date.split('T')[0] : log.date);
    setFormFoodItems(
      log.foodItems.map((f) => ({
        name: f.name,
        quantity: f.quantity,
        calories: f.calories,
        protein: f.macros?.protein || 0,
        carbs: f.macros?.carbs || 0,
        fats: f.macros?.fats || 0,
        showMacros: Boolean(f.macros && (f.macros.protein || f.macros.carbs || f.macros.fats)),
      }))
    );
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Food Item Handlers
  const handleAddFoodItem = () => {
    setFormFoodItems([
      ...formFoodItems,
      { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0, showMacros: false },
    ]);
  };

  const handleUpdateFoodItem = (index: number, field: string, value: any) => {
    const updated = [...formFoodItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormFoodItems(updated);
  };

  const handleRemoveFoodItem = (index: number) => {
    if (formFoodItems.length <= 1) {
      toastError('At least one food item is required.');
      return;
    }
    setFormFoodItems(formFoodItems.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formDate) errs.date = 'Date is required';

    if (formFoodItems.length === 0) {
      errs.items = 'Add at least one food item';
    } else {
      formFoodItems.forEach((f, i) => {
        if (!f.name.trim()) errs[`food_name_${i}`] = 'Food item name required';
        if (!f.quantity.trim()) errs[`food_qty_${i}`] = 'Quantity required (e.g. 200g)';
        if (isNaN(f.calories) || Number(f.calories) < 0) errs[`food_cals_${i}`] = 'Enter valid calories';
      });
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmitNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const payload = {
        mealType: formMealType,
        date: new Date(formDate).toISOString(),
        foodItems: formFoodItems.map((f) => ({
          name: f.name.trim(),
          quantity: f.quantity.trim(),
          calories: Number(f.calories) || 0,
          macros: {
            protein: Number(f.protein) || 0,
            carbs: Number(f.carbs) || 0,
            fats: Number(f.fats) || 0,
          },
        })),
      };

      if (editingLog) {
        await nutritionApi.updateNutritionLog(editingLog._id, payload);
        success('Nutrition log updated!');
      } else {
        await nutritionApi.createNutritionLog(payload);
        success('Meal logged successfully!', 'Dietary Entry Added');
      }

      setIsFormModalOpen(false);
      fetchNutrition();
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
        toastError('Failed to save nutrition log.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingLogId) return;
    try {
      setIsDeleting(true);
      await nutritionApi.deleteNutritionLog(deletingLogId);
      success('Meal log deleted');
      setLogs((prev) => prev.filter((l) => l._id !== deletingLogId));
      setDeletingLogId(null);
    } catch (err) {
      console.error('Delete error:', err);
      toastError('Failed to delete meal log');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Nutrition & Macro Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Log your daily fuel, track protein targets, and monitor energy balance.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenCreate()}
          leftIcon={<Plus className="w-4 h-4" />}
          className="glow-accent self-start sm:self-auto"
        >
          Log Meal
        </Button>
      </div>

      {/* Date & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0F1622] border border-slate-800">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C6FF3A] shrink-0 ml-1" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#131B29] border border-slate-800 text-sm text-white rounded-xl px-3 py-1.5 focus:border-[#C6FF3A] focus:outline-none cursor-pointer"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs text-[#C6FF3A] hover:underline px-2 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Meal Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedMealFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedMealFilter === 'all'
                ? 'bg-[#C6FF3A] text-black font-semibold shadow-[0_0_12px_rgba(198,255,58,0.2)]'
                : 'bg-[#131B29] text-slate-400 hover:text-white'
            }`}
          >
            All Meals
          </button>
          {MEAL_TYPES.map((m) => {
            const isSelected = selectedMealFilter === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMealFilter(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#C6FF3A] text-black font-semibold shadow-[0_0_12px_rgba(198,255,58,0.2)]'
                    : 'bg-[#131B29] text-slate-400 hover:text-white'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Summary Glass Card */}
      <Card variant="glass" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Calorie Stat CountUp */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#C6FF3A]" /> Daily Total Intake ({formatDate(selectedDate)})
            </span>
            <div className="text-3xl sm:text-4xl font-bold font-display text-white mt-1">
              <CountUp value={dailySummary.totalCalories} />
              <span className="text-sm font-normal text-slate-400 ml-2">kcal</span>
            </div>
          </div>

          {/* Macro Breakdown Stats */}
          <div className="flex-1 max-w-xl">
            <div className="grid grid-cols-3 gap-3 mb-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#131B29] border border-slate-800">
                <span className="text-slate-400 block">Protein</span>
                <span className="text-sm font-bold text-indigo-400 font-display">
                  {dailySummary.totalProtein}g
                </span>
                <span className="text-[10px] text-slate-500 block">({dailySummary.proteinPct}%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#131B29] border border-slate-800">
                <span className="text-slate-400 block">Carbohydrates</span>
                <span className="text-sm font-bold text-amber-400 font-display">
                  {dailySummary.totalCarbs}g
                </span>
                <span className="text-[10px] text-slate-500 block">({dailySummary.carbsPct}%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#131B29] border border-slate-800">
                <span className="text-slate-400 block">Healthy Fats</span>
                <span className="text-sm font-bold text-emerald-400 font-display">
                  {dailySummary.totalFats}g
                </span>
                <span className="text-[10px] text-slate-500 block">({dailySummary.fatsPct}%)</span>
              </div>
            </div>

            {/* Macro Proportion Bar */}
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${dailySummary.proteinPct}%` }}
                className="bg-indigo-500 h-full transition-all"
                title={`Protein: ${dailySummary.proteinPct}%`}
              />
              <div
                style={{ width: `${dailySummary.carbsPct}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Carbs: ${dailySummary.carbsPct}%`}
              />
              <div
                style={{ width: `${dailySummary.fatsPct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Fats: ${dailySummary.fatsPct}%`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Logs Grouped by Meal Type */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {MEAL_TYPES.filter(
            (m) => selectedMealFilter === 'all' || selectedMealFilter === m.id
          ).map((m) => {
            const mealLogs = logs.filter((l) => l.mealType === m.id);
            const totalMealCalories = mealLogs.reduce(
              (sum, l) => sum + l.foodItems.reduce((acc, f) => acc + (f.calories || 0), 0),
              0
            );

            return (
              <Card key={m.id} variant="glass" className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#131B29] border border-slate-800">
                      {m.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{m.label}</h3>
                      <span className="text-xs text-slate-400">
                        {totalMealCalories} kcal total
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenCreate(m.id)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Add to {m.label}
                  </Button>
                </div>

                {/* Meal Items */}
                {mealLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic">
                    No items recorded for {m.label.toLowerCase()} on this date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mealLogs.map((log) => {
                      const logCalories = log.foodItems.reduce(
                        (acc, f) => acc + (f.calories || 0),
                        0
                      );
                      const logProtein = log.foodItems.reduce(
                        (acc, f) => acc + (f.macros?.protein || 0),
                        0
                      );
                      const logCarbs = log.foodItems.reduce(
                        (acc, f) => acc + (f.macros?.carbs || 0),
                        0
                      );
                      const logFats = log.foodItems.reduce(
                        (acc, f) => acc + (f.macros?.fats || 0),
                        0
                      );

                      return (
                        <div
                          key={log._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800/80 hover:border-slate-700 transition-all gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {log.foodItems.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-sm font-semibold text-white flex items-center gap-1.5"
                                >
                                  {f.name}
                                  <span className="text-xs text-slate-400 font-normal">
                                    ({f.quantity})
                                  </span>
                                  {i < log.foodItems.length - 1 && (
                                    <span className="text-slate-600">•</span>
                                  )}
                                </span>
                              ))}
                            </div>

                            {/* Macro Badges */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>P: <strong className="text-indigo-300">{logProtein}g</strong></span>
                              <span>C: <strong className="text-amber-300">{logCarbs}g</strong></span>
                              <span>F: <strong className="text-emerald-300">{logFats}g</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                            <span className="text-base font-bold font-display text-[#C6FF3A]">
                              {logCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(log)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit meal log"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingLogId(log._id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete meal log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ================= NUTRITION CREATE / EDIT MODAL ================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingLog ? 'Edit Meal Log' : 'Log Meal & Nutrition'}
        subtitle="Record food items, portions, calories, and macronutrients"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitNutrition} className="space-y-5">
          {/* Meal Type Buttons */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Meal Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => {
                const isSelected = formMealType === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormMealType(m.id)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C6FF3A]/15 border-[#C6FF3A] text-[#C6FF3A] shadow-[0_0_15px_rgba(198,255,58,0.15)]'
                        : 'bg-[#121A28] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              error={formErrors.date}
              required
            />
          </div>

          {/* Dynamic Food Items */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Food Items & Servings
              </h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddFoodItem}
                leftIcon={<Plus className="w-3.5 h-3.5 text-[#C6FF3A]" />}
              >
                Add Food Item
              </Button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <AnimatePresence>
                {formFoodItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-[#121A28] border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#C6FF3A]">
                        Item #{idx + 1}
                      </span>
                      {formFoodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Food name (e.g. Oatmeal with Whey)"
                          value={item.name}
                          onChange={(e) => handleUpdateFoodItem(idx, 'name', e.target.value)}
                          error={formErrors[`food_name_${idx}`]}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Portion (e.g. 1 bowl / 200g)"
                          value={item.quantity}
                          onChange={(e) => handleUpdateFoodItem(idx, 'quantity', e.target.value)}
                          error={formErrors[`food_qty_${idx}`]}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Calories"
                          value={item.calories || ''}
                          onChange={(e) =>
                            handleUpdateFoodItem(idx, 'calories', parseInt(e.target.value) || 0)
                          }
                          error={formErrors[`food_cals_${idx}`]}
                          required
                        />
                      </div>
                    </div>

                    {/* Expandable Macros */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleUpdateFoodItem(idx, 'showMacros', !item.showMacros)}
                        className="text-xs text-slate-400 hover:text-[#C6FF3A] flex items-center gap-1 cursor-pointer"
                      >
                        {item.showMacros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{item.showMacros ? 'Hide Macros' : 'Add Protein / Carbs / Fats'}</span>
                      </button>

                      {item.showMacros && (
                        <div className="grid grid-cols-3 gap-2.5 mt-2 p-2.5 rounded-lg bg-[#0F1622] border border-slate-800">
                          <Input
                            type="number"
                            min={0}
                            label="Protein (g)"
                            value={item.protein || ''}
                            onChange={(e) =>
                              handleUpdateFoodItem(idx, 'protein', parseFloat(e.target.value) || 0)
                            }
                          />
                          <Input
                            type="number"
                            min={0}
                            label="Carbs (g)"
                            value={item.carbs || ''}
                            onChange={(e) =>
                              handleUpdateFoodItem(idx, 'carbs', parseFloat(e.target.value) || 0)
                            }
                          />
                          <Input
                            type="number"
                            min={0}
                            label="Fats (g)"
                            value={item.fats || ''}
                            onChange={(e) =>
                              handleUpdateFoodItem(idx, 'fats', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Running Total & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Entry Total:{' '}
              <strong className="text-base text-[#C6FF3A] font-display ml-1">
                {formTotalCalories} kcal
              </strong>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
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
                {editingLog ? 'Save Changes' : 'Log Meal'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingLogId)}
        onClose={() => setDeletingLogId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Nutrition Log?"
        description="Are you sure you want to remove this meal entry from your nutrition log?"
        confirmLabel="Delete Meal"
        isLoading={isDeleting}
      />
    </div>
  );
};
