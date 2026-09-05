export type UnitPreference = 'metric' | 'imperial';
export type ThemePreference = 'dark' | 'light';

export interface UserPreferences {
  unit: UnitPreference;
  theme: ThemePreference;
  notificationsEnabled: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  preferences: UserPreferences;
  createdAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  preferences: UserPreferences;
  token: string;
}

export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'other';

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface Workout {
  _id: string;
  title: string;
  category: WorkoutCategory;
  exercises: Exercise[];
  date: string;
  tags?: string[];
  createdAt?: string;
  userId?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Macros {
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  macros?: Macros;
}

export interface NutritionLog {
  _id: string;
  mealType: MealType;
  foodItems: FoodItem[];
  date: string;
  createdAt?: string;
  userId?: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export interface PerformanceMetrics {
  runTimeMinutes?: number;
  maxLiftWeight?: number;
  customNote?: string;
}

export interface ProgressEntry {
  _id: string;
  weight?: number;
  bodyMeasurements?: BodyMeasurements;
  performanceMetrics?: PerformanceMetrics;
  date: string;
  createdAt?: string;
  userId?: string;
}

export type NotificationType = 'workout' | 'nutrition' | 'progress' | 'goal' | 'reminder' | 'general';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
}

export type ReminderType = 'workout' | 'meal' | 'goal';
export type ReminderRepeat = 'none' | 'daily' | 'weekly';

export interface Reminder {
  _id: string;
  type: ReminderType;
  title: string;
  message?: string;
  scheduledTime: string;
  repeat?: ReminderRepeat;
  isActive: boolean;
  createdAt?: string;
  userId?: string;
}

export type FeedbackType = 'bug' | 'feedback' | 'support';
export type FeedbackStatus = 'open' | 'in-progress' | 'resolved';

export interface Feedback {
  _id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  userId?: string;
}

export interface DashboardData {
  recentWorkouts: Workout[];
  recentNutritionLogs: NutritionLog[];
  latestProgress: ProgressEntry | null;
  stats: {
    totalWorkouts: number;
    totalNutritionLogs: number;
  };
}

export interface WorkoutAnalytics {
  categoryBreakdown: { _id: WorkoutCategory; count: number }[];
  workoutsOverTime: {
    title: string;
    date: string;
    category: WorkoutCategory;
    exercises: Exercise[];
  }[];
}

export interface NutritionAnalytics {
  dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fats: number }>;
}

export interface ApiErrorResponse {
  message: string;
  errors?: { field: string; message: string }[];
}
