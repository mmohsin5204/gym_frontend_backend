import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, 
  Utensils, 
  Scale, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Activity, 
  Flame, 
  TrendingUp, 
  PieChart as PieIcon,
  Sparkles,
  Download
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardData, WorkoutAnalytics, NutritionAnalytics, WorkoutCategory } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CountUp } from '../components/ui/CountUp';
import { EmptyState } from '../components/ui/EmptyState';
import { ReportsModal } from '../components/ReportsModal';
import { formatDate, formatRelativeTime } from '../utils/format';

const CATEGORY_COLORS: Record<WorkoutCategory, string> = {
  strength: '#6366F1',   // Indigo
  cardio: '#F59E0B',     // Amber
  flexibility: '#10B981',// Emerald
  other: '#C6FF3A',      // Electric Lime
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [workoutAnalytics, setWorkoutAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [nutritionAnalytics, setNutritionAnalytics] = useState<NutritionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const fetchAllDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dash, wAnalytics, nAnalytics] = await Promise.all([
        dashboardApi.getDashboard(),
        dashboardApi.getWorkoutAnalytics(),
        dashboardApi.getNutritionAnalytics(),
      ]);

      setDashboardData(dash);
      setWorkoutAnalytics(wAnalytics);
      setNutritionAnalytics(nAnalytics);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // Compute "This Week's Workouts"
  const thisWeekCount = React.useMemo(() => {
    if (!workoutAnalytics?.workoutsOverTime) return 0;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    return workoutAnalytics.workoutsOverTime.filter((w) => {
      const d = new Date(w.date);
      return d >= sevenDaysAgo;
    }).length;
  }, [workoutAnalytics]);

  // Format Daily Calorie Trend for Recharts
  const calorieTrendData = React.useMemo(() => {
    if (!nutritionAnalytics?.dailyTotals) return [];
    const entries = Object.entries(nutritionAnalytics.dailyTotals);
    // Sort chronological
    entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    return entries.slice(-10).map(([dateStr, totals]) => {
      const t = totals as { calories: number; protein: number; carbs: number; fats: number };
      return {
        date: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        calories: t?.calories || 0,
        protein: t?.protein || 0,
      };
    });
  }, [nutritionAnalytics]);

  // Format Category breakdown for Recharts Donut
  const pieData = React.useMemo(() => {
    if (!workoutAnalytics?.categoryBreakdown) return [];
    return workoutAnalytics.categoryBreakdown
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count,
        category: item._id,
      }));
  }, [workoutAnalytics]);

  const unitLabel = user?.preferences?.unit === 'imperial' ? 'lbs' : 'kg';

  return (
    <div className="space-y-8">
      {/* Welcome Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C6FF3A] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Performance Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Athlete'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsReportsOpen(true)}
            leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/workouts')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Workout
          </Button>
        </div>
      </div>

      {/* Top Row: 4 Glass Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Workouts */}
          <Card variant="stat" glow className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Workouts
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                <CountUp value={dashboardData?.stats.totalWorkouts || 0} />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="text-[#C6FF3A] font-semibold">+{thisWeekCount}</span> this week
              </p>
            </div>
          </Card>

          {/* Total Nutrition Logs */}
          <Card variant="stat" className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Nutrition Logs
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                <CountUp value={dashboardData?.stats.totalNutritionLogs || 0} />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Tracked meals</p>
            </div>
          </Card>

          {/* Latest Weight */}
          <Card variant="stat" className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Current Weight
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                {dashboardData?.latestProgress?.weight ? (
                  <CountUp
                    value={dashboardData.latestProgress.weight}
                    decimals={1}
                    suffix={` ${unitLabel}`}
                  />
                ) : (
                  '—'
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dashboardData?.latestProgress?.date
                  ? formatDate(dashboardData.latestProgress.date)
                  : 'No weigh-in yet'}
              </p>
            </div>
          </Card>

          {/* Weekly Consistency */}
          <Card variant="stat" className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Weekly Volume
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#C6FF3A]/15 text-[#C6FF3A] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-bold font-display text-[#C6FF3A]">
                <CountUp value={thisWeekCount} /> <span className="text-xs text-slate-400 font-normal">sessions</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Past 7 days frequency</p>
            </div>
          </Card>
        </div>
      )}

      {/* Two Column Layout: Recent Workouts & Recent Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Workouts */}
        <Card variant="glass" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#C6FF3A]" />
                <h2 className="text-base font-semibold text-white">Recent Workouts</h2>
              </div>
              <Link
                to="/workouts"
                className="text-xs text-[#C6FF3A] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#131B2A] skeleton" />
                ))}
              </div>
            ) : !dashboardData?.recentWorkouts?.length ? (
              <EmptyState
                icon={<Dumbbell className="w-6 h-6 text-[#C6FF3A]" />}
                title="No Workouts Logged Yet"
                description="Start logging your training routines to see performance breakdowns."
                actionLabel="Log First Workout"
                onAction={() => navigate('/workouts')}
              />
            ) : (
              <div className="space-y-2.5">
                {dashboardData.recentWorkouts.map((workout) => (
                  <Link
                    key={workout._id}
                    to="/workouts"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800/80 hover:border-slate-700 hover:bg-[#162132] transition-all group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={workout.category} size="sm">
                          {workout.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {formatRelativeTime(workout.date)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#C6FF3A] transition-colors">
                        {workout.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {workout.exercises.length} exercises •{' '}
                        {workout.exercises.map((e) => e.name).slice(0, 2).join(', ')}
                        {workout.exercises.length > 2 && '...'}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#C6FF3A] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right: Recent Nutrition Logs */}
        <Card variant="glass" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Recent Nutrition</h2>
              </div>
              <Link
                to="/nutrition"
                className="text-xs text-[#C6FF3A] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[#131B2A] skeleton" />
                ))}
              </div>
            ) : !dashboardData?.recentNutritionLogs?.length ? (
              <EmptyState
                icon={<Utensils className="w-6 h-6 text-emerald-400" />}
                title="No Nutrition Recorded"
                description="Keep track of your calories, protein, and macros for maximum gains."
                actionLabel="Log A Meal"
                onAction={() => navigate('/nutrition')}
              />
            ) : (
              <div className="space-y-2.5">
                {dashboardData.recentNutritionLogs.map((log) => {
                  const totalCals = log.foodItems.reduce((acc, f) => acc + (f.calories || 0), 0);
                  const totalProtein = log.foodItems.reduce((acc, f) => acc + (f.macros?.protein || 0), 0);
                  return (
                    <Link
                      key={log._id}
                      to="/nutrition"
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800/80 hover:border-slate-700 hover:bg-[#162132] transition-all group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={log.mealType} size="sm">
                            {log.mealType}
                          </Badge>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(log.date)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate">
                          {log.foodItems.map((f) => f.name).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-[#C6FF3A] font-display">
                          {totalCals} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                        </span>
                        {totalProtein > 0 && (
                          <p className="text-[10px] text-slate-400">{totalProtein}g protein</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Row: Category Breakdown Donut & Calorie Trend Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Category Donut Chart (1 col) */}
        <Card variant="glass" className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Workout Categories</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="h-56 rounded-xl bg-[#131B2A] skeleton" />
          ) : pieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              No categories recorded yet
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={CATEGORY_COLORS[entry.category as WorkoutCategory] || '#C6FF3A'}
                          stroke="#080C10"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F1622',
                        borderColor: '#1E293B',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-800/80 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[#131C2A]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[item.category as WorkoutCategory] || '#C6FF3A',
                        }}
                      />
                      <span className="text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Calorie Trend Area Chart (2 cols) */}
        <Card variant="glass" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C6FF3A]" />
              <h2 className="text-sm font-semibold text-white">Daily Calorie Intake Trend</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Recent Days</span>
          </div>

          {isLoading ? (
            <div className="h-64 rounded-xl bg-[#131B2A] skeleton" />
          ) : calorieTrendData.length < 2 ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
              <Activity className="w-6 h-6 text-slate-600" />
              <span>Log at least 2 days of nutrition to view your calorie trajectory.</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={calorieTrendData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6FF3A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C6FF3A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0F1622',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number | string | undefined) => [`${value ?? 0} kcal`, 'Calories']}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#C6FF3A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#calorieGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Reports modal */}
      <ReportsModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
    </div>
  );
};
