import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockApi } from './mockStorage';
import { 
  AuthResponse, 
  User, 
  Workout, 
  NutritionLog, 
  ProgressEntry, 
  AppNotification, 
  Reminder, 
  Feedback,
  DashboardData,
  WorkoutAnalytics,
  NutritionAnalytics
} from '../types';

export const TOKEN_KEY = 'fittrack_token';
export const API_URL_KEY = 'fittrack_api_url';
export const DEMO_MODE_KEY = 'fittrack_demo_mode';

const getBaseUrl = () => {
  return localStorage.getItem(API_URL_KEY) || 'http://localhost:5000/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically update baseURL if changed in settings
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Session Expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('fittrack_auth_expired'));
    }
    return Promise.reject(error);
  }
);

// Helper to check if we should use mock fallback (e.g. backend offline or in demo mode)
const isDemoOrOffline = (error?: unknown) => {
  const forceDemo = localStorage.getItem(DEMO_MODE_KEY) === 'true';
  if (forceDemo) return true;
  if (!error) return false;
  const axiosErr = error as AxiosError;
  return (
    axiosErr.code === 'ERR_NETWORK' ||
    axiosErr.code === 'ECONNABORTED' ||
    axiosErr.message?.includes('Network Error') ||
    axiosErr.code === 'ERR_CONNECTION_REFUSED' ||
    !axiosErr.response
  );
};

// ==================== AUTH API ====================
export const authApi = {
  login: async (credentials: { email: string; password?: string }): Promise<AuthResponse> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.login(credentials.email, credentials.password);
      }
      const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.login(credentials.email, credentials.password);
      }
      throw err;
    }
  },

  register: async (data: { name: string; email: string; password?: string; profilePicture?: string }): Promise<AuthResponse> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.register(data.name, data.email, data.profilePicture);
      }
      const res = await apiClient.post<AuthResponse>('/auth/register', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.register(data.name, data.email, data.profilePicture);
      }
      throw err;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getProfile();
      }
      const res = await apiClient.get<User>('/auth/profile');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getProfile();
      }
      throw err;
    }
  },

  updateProfile: async (data: Partial<User> & { password?: string }): Promise<User> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.updateProfile(data);
      }
      const res = await apiClient.put<User>('/auth/profile', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.updateProfile(data);
      }
      throw err;
    }
  },
};

// ==================== SETTINGS API ====================
export const settingsApi = {
  getSettings: async (): Promise<User['preferences']> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getSettings();
      }
      const res = await apiClient.get<User['preferences']>('/settings');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getSettings();
      }
      throw err;
    }
  },

  updateSettings: async (prefs: Partial<User['preferences']>): Promise<User['preferences']> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.updateSettings(prefs);
      }
      const res = await apiClient.put<User['preferences']>('/settings', prefs);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.updateSettings(prefs);
      }
      throw err;
    }
  },
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getDashboard();
      }
      const res = await apiClient.get<DashboardData>('/dashboard');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getDashboard();
      }
      throw err;
    }
  },

  getWorkoutAnalytics: async (): Promise<WorkoutAnalytics> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getWorkoutAnalytics();
      }
      const res = await apiClient.get<WorkoutAnalytics>('/dashboard/workout-analytics');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getWorkoutAnalytics();
      }
      throw err;
    }
  },

  getNutritionAnalytics: async (): Promise<NutritionAnalytics> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getNutritionAnalytics();
      }
      const res = await apiClient.get<NutritionAnalytics>('/dashboard/nutrition-analytics');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getNutritionAnalytics();
      }
      throw err;
    }
  },
};

// ==================== WORKOUTS API ====================
export const workoutsApi = {
  getWorkouts: async (category?: string, search?: string): Promise<Workout[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getWorkouts(category, search);
      }
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search && search.trim()) params.append('search', search.trim());
      const res = await apiClient.get<Workout[]>(`/workouts?${params.toString()}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getWorkouts(category, search);
      }
      throw err;
    }
  },

  getWorkoutById: async (id: string): Promise<Workout> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const item = mockApi.getWorkoutById(id);
        if (!item) throw new Error('Workout not found');
        return item;
      }
      const res = await apiClient.get<Workout>(`/workouts/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const item = mockApi.getWorkoutById(id);
        if (!item) throw new Error('Workout not found');
        return item;
      }
      throw err;
    }
  },

  createWorkout: async (data: Omit<Workout, '_id' | 'createdAt'>): Promise<Workout> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.createWorkout(data);
      }
      const res = await apiClient.post<Workout>('/workouts', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.createWorkout(data);
      }
      throw err;
    }
  },

  updateWorkout: async (id: string, data: Partial<Workout>): Promise<Workout> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const updated = mockApi.updateWorkout(id, data);
        if (!updated) throw new Error('Workout not found');
        return updated;
      }
      const res = await apiClient.put<Workout>(`/workouts/${id}`, data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const updated = mockApi.updateWorkout(id, data);
        if (!updated) throw new Error('Workout not found');
        return updated;
      }
      throw err;
    }
  },

  deleteWorkout: async (id: string): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.deleteWorkout(id);
      }
      const res = await apiClient.delete<{ message: string }>(`/workouts/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.deleteWorkout(id);
      }
      throw err;
    }
  },
};

// ==================== NUTRITION API ====================
export const nutritionApi = {
  getNutrition: async (mealType?: string, date?: string): Promise<NutritionLog[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getNutrition(mealType, date);
      }
      const params = new URLSearchParams();
      if (mealType && mealType !== 'all') params.append('mealType', mealType);
      if (date) params.append('date', date);
      const res = await apiClient.get<NutritionLog[]>(`/nutrition?${params.toString()}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getNutrition(mealType, date);
      }
      throw err;
    }
  },

  getNutritionLogById: async (id: string): Promise<NutritionLog> => {
    try {
      const res = await apiClient.get<NutritionLog>(`/nutrition/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const item = mockApi.getNutrition().find(n => n._id === id);
        if (!item) throw new Error('Nutrition log not found');
        return item;
      }
      throw err;
    }
  },

  createNutritionLog: async (data: Omit<NutritionLog, '_id' | 'createdAt'>): Promise<NutritionLog> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.createNutrition(data);
      }
      const res = await apiClient.post<NutritionLog>('/nutrition', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.createNutrition(data);
      }
      throw err;
    }
  },

  updateNutritionLog: async (id: string, data: Partial<NutritionLog>): Promise<NutritionLog> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const updated = mockApi.updateNutrition(id, data);
        if (!updated) throw new Error('Nutrition log not found');
        return updated;
      }
      const res = await apiClient.put<NutritionLog>(`/nutrition/${id}`, data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const updated = mockApi.updateNutrition(id, data);
        if (!updated) throw new Error('Nutrition log not found');
        return updated;
      }
      throw err;
    }
  },

  deleteNutritionLog: async (id: string): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.deleteNutrition(id);
      }
      const res = await apiClient.delete<{ message: string }>(`/nutrition/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.deleteNutrition(id);
      }
      throw err;
    }
  },
};

// ==================== PROGRESS API ====================
export const progressApi = {
  getProgress: async (): Promise<ProgressEntry[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getProgress();
      }
      const res = await apiClient.get<ProgressEntry[]>('/progress');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getProgress();
      }
      throw err;
    }
  },

  getProgressById: async (id: string): Promise<ProgressEntry> => {
    try {
      const res = await apiClient.get<ProgressEntry>(`/progress/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const item = mockApi.getProgress().find(p => p._id === id);
        if (!item) throw new Error('Progress entry not found');
        return item;
      }
      throw err;
    }
  },

  createProgressEntry: async (data: Omit<ProgressEntry, '_id' | 'createdAt'>): Promise<ProgressEntry> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.createProgress(data);
      }
      const res = await apiClient.post<ProgressEntry>('/progress', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.createProgress(data);
      }
      throw err;
    }
  },

  updateProgressEntry: async (id: string, data: Partial<ProgressEntry>): Promise<ProgressEntry> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const updated = mockApi.updateProgress(id, data);
        if (!updated) throw new Error('Progress entry not found');
        return updated;
      }
      const res = await apiClient.put<ProgressEntry>(`/progress/${id}`, data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const updated = mockApi.updateProgress(id, data);
        if (!updated) throw new Error('Progress entry not found');
        return updated;
      }
      throw err;
    }
  },

  deleteProgressEntry: async (id: string): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.deleteProgress(id);
      }
      const res = await apiClient.delete<{ message: string }>(`/progress/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.deleteProgress(id);
      }
      throw err;
    }
  },
};

// ==================== NOTIFICATIONS API ====================
export const notificationsApi = {
  getNotifications: async (isRead?: boolean): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getNotifications(isRead);
      }
      const params = typeof isRead === 'boolean' ? `?isRead=${isRead}` : '';
      const res = await apiClient.get<{ notifications: AppNotification[]; unreadCount: number }>(`/notifications${params}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getNotifications(isRead);
      }
      throw err;
    }
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const updated = mockApi.markNotificationRead(id);
        if (!updated) throw new Error('Notification not found');
        return updated;
      }
      const res = await apiClient.put<AppNotification>(`/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const updated = mockApi.markNotificationRead(id);
        if (!updated) throw new Error('Notification not found');
        return updated;
      }
      throw err;
    }
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.markAllNotificationsRead();
      }
      const res = await apiClient.put<{ message: string }>('/notifications/read-all');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.markAllNotificationsRead();
      }
      throw err;
    }
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.deleteNotification(id);
      }
      const res = await apiClient.delete<{ message: string }>(`/notifications/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.deleteNotification(id);
      }
      throw err;
    }
  },
};

// ==================== REMINDERS API ====================
export const remindersApi = {
  getReminders: async (type?: string, isActive?: boolean): Promise<Reminder[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getReminders(type, isActive);
      }
      const params = new URLSearchParams();
      if (type && type !== 'all') params.append('type', type);
      if (typeof isActive === 'boolean') params.append('isActive', String(isActive));
      const res = await apiClient.get<Reminder[]>(`/reminders?${params.toString()}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getReminders(type, isActive);
      }
      throw err;
    }
  },

  getDueReminders: async (): Promise<Reminder[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getDueReminders();
      }
      const res = await apiClient.get<Reminder[]>('/reminders/due');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getDueReminders();
      }
      throw err;
    }
  },

  createReminder: async (data: Omit<Reminder, '_id' | 'createdAt' | 'isActive'>): Promise<Reminder> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.createReminder(data);
      }
      const res = await apiClient.post<Reminder>('/reminders', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.createReminder(data);
      }
      throw err;
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        const updated = mockApi.updateReminder(id, data);
        if (!updated) throw new Error('Reminder not found');
        return updated;
      }
      const res = await apiClient.put<Reminder>(`/reminders/${id}`, data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        const updated = mockApi.updateReminder(id, data);
        if (!updated) throw new Error('Reminder not found');
        return updated;
      }
      throw err;
    }
  },

  deleteReminder: async (id: string): Promise<{ message: string }> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.deleteReminder(id);
      }
      const res = await apiClient.delete<{ message: string }>(`/reminders/${id}`);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.deleteReminder(id);
      }
      throw err;
    }
  },
};

// ==================== FEEDBACK API ====================
export const feedbackApi = {
  getFeedback: async (): Promise<Feedback[]> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.getFeedback();
      }
      const res = await apiClient.get<Feedback[]>('/feedback');
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.getFeedback();
      }
      throw err;
    }
  },

  createFeedback: async (data: { type?: Feedback['type']; subject: string; message: string }): Promise<Feedback> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.createFeedback(data);
      }
      const res = await apiClient.post<Feedback>('/feedback', data);
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.createFeedback(data);
      }
      throw err;
    }
  },
};

// ==================== EXPORT API ====================
export const exportApi = {
  exportData: async (type: 'workouts' | 'nutrition' | 'progress', format: 'csv' | 'pdf'): Promise<Blob> => {
    try {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return mockApi.generateExportBlob(type, format);
      }
      const res = await apiClient.get(`/export/${type}?format=${format}`, {
        responseType: 'blob',
      });
      return res.data;
    } catch (err) {
      if (isDemoOrOffline(err)) {
        return mockApi.generateExportBlob(type, format);
      }
      throw err;
    }
  },
};
