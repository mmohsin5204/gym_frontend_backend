import { 
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
import { 
  INITIAL_USER, 
  INITIAL_WORKOUTS, 
  INITIAL_NUTRITION, 
  INITIAL_PROGRESS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REMINDERS, 
  INITIAL_FEEDBACK 
} from './mockData';

const STORAGE_KEYS = {
  USER: 'fittrack_mock_user',
  WORKOUTS: 'fittrack_mock_workouts',
  NUTRITION: 'fittrack_mock_nutrition',
  PROGRESS: 'fittrack_mock_progress',
  NOTIFICATIONS: 'fittrack_mock_notifications',
  REMINDERS: 'fittrack_mock_reminders',
  FEEDBACK: 'fittrack_mock_feedback',
};

// Safe storage helpers
export const getStored = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage save error:', err);
  }
};

// Initialize if empty
export const initMockStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) setStored(STORAGE_KEYS.USER, INITIAL_USER);
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUTS)) setStored(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
  if (!localStorage.getItem(STORAGE_KEYS.NUTRITION)) setStored(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) setStored(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) setStored(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
  if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) setStored(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
};

export const mockApi = {
  // Auth
  login: (email: string, password?: string) => {
    initMockStore();
    const user = getStored<User>(STORAGE_KEYS.USER, INITIAL_USER);
    const token = 'mock_jwt_token_' + Date.now();
    return { ...user, token };
  },

  register: (name: string, email: string, profilePicture?: string) => {
    initMockStore();
    const user: User = {
      _id: 'user_' + Date.now(),
      name,
      email,
      profilePicture: profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      preferences: { unit: 'metric', theme: 'dark', notificationsEnabled: true },
      createdAt: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.USER, user);
    const token = 'mock_jwt_token_' + Date.now();
    return { ...user, token };
  },

  getProfile: () => {
    initMockStore();
    return getStored<User>(STORAGE_KEYS.USER, INITIAL_USER);
  },

  updateProfile: (updates: Partial<User> & { password?: string }) => {
    initMockStore();
    const user = getStored<User>(STORAGE_KEYS.USER, INITIAL_USER);
    const updatedUser = {
      ...user,
      ...updates,
      preferences: {
        ...user.preferences,
        ...(updates.preferences || {})
      }
    };
    setStored(STORAGE_KEYS.USER, updatedUser);
    return updatedUser;
  },

  getSettings: () => {
    initMockStore();
    const user = getStored<User>(STORAGE_KEYS.USER, INITIAL_USER);
    return user.preferences;
  },

  updateSettings: (prefs: Partial<User['preferences']>) => {
    initMockStore();
    const user = getStored<User>(STORAGE_KEYS.USER, INITIAL_USER);
    user.preferences = { ...user.preferences, ...prefs };
    setStored(STORAGE_KEYS.USER, user);
    return user.preferences;
  },

  // Dashboard
  getDashboard: (): DashboardData => {
    initMockStore();
    const workouts = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    const nutrition = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    const progress = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);

    // Sort by date descending
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedNutrition = [...nutrition].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedProgress = [...progress].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      recentWorkouts: sortedWorkouts.slice(0, 5),
      recentNutritionLogs: sortedNutrition.slice(0, 5),
      latestProgress: sortedProgress.length > 0 ? sortedProgress[0] : null,
      stats: {
        totalWorkouts: workouts.length,
        totalNutritionLogs: nutrition.length
      }
    };
  },

  getWorkoutAnalytics: (): WorkoutAnalytics => {
    initMockStore();
    const workouts = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    
    const counts: Record<string, number> = { strength: 0, cardio: 0, flexibility: 0, other: 0 };
    workouts.forEach(w => {
      if (counts[w.category] !== undefined) {
        counts[w.category]++;
      } else {
        counts.other++;
      }
    });

    const categoryBreakdown = Object.entries(counts).map(([cat, count]) => ({
      _id: cat as Workout['category'],
      count
    }));

    return {
      categoryBreakdown,
      workoutsOverTime: workouts.map(w => ({
        title: w.title,
        date: w.date,
        category: w.category,
        exercises: w.exercises
      }))
    };
  },

  getNutritionAnalytics: (): NutritionAnalytics => {
    initMockStore();
    const logs = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    const dailyTotals: NutritionAnalytics['dailyTotals'] = {};

    logs.forEach(log => {
      const dateKey = log.date.includes('T') ? log.date.split('T')[0] : log.date;
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      log.foodItems.forEach(item => {
        dailyTotals[dateKey].calories += item.calories || 0;
        dailyTotals[dateKey].protein += item.macros?.protein || 0;
        dailyTotals[dateKey].carbs += item.macros?.carbs || 0;
        dailyTotals[dateKey].fats += item.macros?.fats || 0;
      });
    });

    return { dailyTotals };
  },

  // Workouts
  getWorkouts: (category?: string, search?: string) => {
    initMockStore();
    let list = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    if (category && category !== 'all') {
      list = list.filter(w => w.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.tags?.some(t => t.toLowerCase().includes(q)) ||
        w.exercises.some(e => e.name.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getWorkoutById: (id: string) => {
    initMockStore();
    const list = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    return list.find(w => w._id === id);
  },

  createWorkout: (data: Omit<Workout, '_id' | 'createdAt'>) => {
    initMockStore();
    const list = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    const newWorkout: Workout = {
      ...data,
      _id: 'w_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newWorkout);
    setStored(STORAGE_KEYS.WORKOUTS, list);

    // Auto-create notification
    mockApi.addNotification({
      type: 'workout',
      title: 'Workout Logged',
      message: `You recorded "${newWorkout.title}" with ${newWorkout.exercises.length} exercises.`
    });

    return newWorkout;
  },

  updateWorkout: (id: string, data: Partial<Workout>) => {
    initMockStore();
    let list = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    let updated: Workout | undefined;
    list = list.map(w => {
      if (w._id === id) {
        updated = { ...w, ...data };
        return updated;
      }
      return w;
    });
    setStored(STORAGE_KEYS.WORKOUTS, list);
    return updated;
  },

  deleteWorkout: (id: string) => {
    initMockStore();
    let list = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
    list = list.filter(w => w._id !== id);
    setStored(STORAGE_KEYS.WORKOUTS, list);
    return { message: 'Workout deleted successfully' };
  },

  // Nutrition
  getNutrition: (mealType?: string, date?: string) => {
    initMockStore();
    let list = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    if (mealType && mealType !== 'all') {
      list = list.filter(n => n.mealType === mealType);
    }
    if (date) {
      list = list.filter(n => n.date.startsWith(date));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createNutrition: (data: Omit<NutritionLog, '_id' | 'createdAt'>) => {
    initMockStore();
    const list = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    const newLog: NutritionLog = {
      ...data,
      _id: 'n_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newLog);
    setStored(STORAGE_KEYS.NUTRITION, list);

    const totalCals = newLog.foodItems.reduce((acc, f) => acc + (f.calories || 0), 0);
    mockApi.addNotification({
      type: 'nutrition',
      title: 'Nutrition Logged',
      message: `Logged ${newLog.mealType} meal (${totalCals} kcal).`
    });

    return newLog;
  },

  updateNutrition: (id: string, data: Partial<NutritionLog>) => {
    initMockStore();
    let list = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    let updated: NutritionLog | undefined;
    list = list.map(n => {
      if (n._id === id) {
        updated = { ...n, ...data };
        return updated;
      }
      return n;
    });
    setStored(STORAGE_KEYS.NUTRITION, list);
    return updated;
  },

  deleteNutrition: (id: string) => {
    initMockStore();
    let list = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
    list = list.filter(n => n._id !== id);
    setStored(STORAGE_KEYS.NUTRITION, list);
    return { message: 'Nutrition log deleted' };
  },

  // Progress
  getProgress: () => {
    initMockStore();
    const list = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createProgress: (data: Omit<ProgressEntry, '_id' | 'createdAt'>) => {
    initMockStore();
    const list = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    const newEntry: ProgressEntry = {
      ...data,
      _id: 'p_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    setStored(STORAGE_KEYS.PROGRESS, list);

    mockApi.addNotification({
      type: 'progress',
      title: 'Progress Milestone Logged',
      message: newEntry.weight ? `Recorded weight of ${newEntry.weight} kg.` : 'Body measurements and notes updated.'
    });

    return newEntry;
  },

  updateProgress: (id: string, data: Partial<ProgressEntry>) => {
    initMockStore();
    let list = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    let updated: ProgressEntry | undefined;
    list = list.map(p => {
      if (p._id === id) {
        updated = { ...p, ...data };
        return updated;
      }
      return p;
    });
    setStored(STORAGE_KEYS.PROGRESS, list);
    return updated;
  },

  deleteProgress: (id: string) => {
    initMockStore();
    let list = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    list = list.filter(p => p._id !== id);
    setStored(STORAGE_KEYS.PROGRESS, list);
    return { message: 'Progress entry deleted' };
  },

  // Notifications
  getNotifications: (isRead?: boolean) => {
    initMockStore();
    let list = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (typeof isRead === 'boolean') {
      list = list.filter(n => n.isRead === isRead);
    }
    const unreadCount = list.filter(n => !n.isRead).length;
    return {
      notifications: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      unreadCount
    };
  },

  markNotificationRead: (id: string) => {
    initMockStore();
    let list = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    let updated: AppNotification | undefined;
    list = list.map(n => {
      if (n._id === id) {
        updated = { ...n, isRead: true };
        return updated;
      }
      return n;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return updated;
  },

  markAllNotificationsRead: () => {
    initMockStore();
    let list = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list = list.map(n => ({ ...n, isRead: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return { message: 'All notifications marked as read' };
  },

  deleteNotification: (id: string) => {
    initMockStore();
    let list = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list = list.filter(n => n._id !== id);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return { message: 'Notification deleted' };
  },

  addNotification: (data: { type: AppNotification['type']; title: string; message: string }) => {
    initMockStore();
    const list = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      _id: 'notif_' + Date.now(),
      ...data,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  },

  // Reminders
  getReminders: (type?: string, isActive?: boolean) => {
    initMockStore();
    let list = getStored<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    if (type && type !== 'all') {
      list = list.filter(r => r.type === type);
    }
    if (typeof isActive === 'boolean') {
      list = list.filter(r => r.isActive === isActive);
    }
    return list.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  },

  getDueReminders: () => {
    initMockStore();
    const list = getStored<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    const now = new Date().getTime();
    return list.filter(r => r.isActive && new Date(r.scheduledTime).getTime() <= now);
  },

  createReminder: (data: Omit<Reminder, '_id' | 'createdAt' | 'isActive'>) => {
    initMockStore();
    const list = getStored<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    const newReminder: Reminder = {
      ...data,
      _id: 'rem_' + Date.now(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    list.push(newReminder);
    setStored(STORAGE_KEYS.REMINDERS, list);
    return newReminder;
  },

  updateReminder: (id: string, data: Partial<Reminder>) => {
    initMockStore();
    let list = getStored<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    let updated: Reminder | undefined;
    list = list.map(r => {
      if (r._id === id) {
        updated = { ...r, ...data };
        return updated;
      }
      return r;
    });
    setStored(STORAGE_KEYS.REMINDERS, list);
    return updated;
  },

  deleteReminder: (id: string) => {
    initMockStore();
    let list = getStored<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    list = list.filter(r => r._id !== id);
    setStored(STORAGE_KEYS.REMINDERS, list);
    return { message: 'Reminder deleted' };
  },

  // Feedback
  getFeedback: () => {
    initMockStore();
    const list = getStored<Feedback[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createFeedback: (data: { type?: Feedback['type']; subject: string; message: string }) => {
    initMockStore();
    const list = getStored<Feedback[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    const newFeedback: Feedback = {
      _id: 'fb_' + Date.now(),
      type: data.type || 'feedback',
      subject: data.subject,
      message: data.message,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    list.unshift(newFeedback);
    setStored(STORAGE_KEYS.FEEDBACK, list);
    return newFeedback;
  },

  // Exports (Blob generator)
  generateExportBlob: (type: 'workouts' | 'nutrition' | 'progress', format: 'csv' | 'pdf'): Blob => {
    initMockStore();
    if (format === 'csv') {
      let csvContent = '';
      if (type === 'workouts') {
        const workouts = getStored<Workout[]>(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS);
        csvContent = 'ID,Date,Title,Category,ExercisesCount,Tags\n';
        workouts.forEach(w => {
          csvContent += `"${w._id}","${w.date}","${w.title}","${w.category}",${w.exercises.length},"${(w.tags || []).join(';')}"\n`;
        });
      } else if (type === 'nutrition') {
        const logs = getStored<NutritionLog[]>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
        csvContent = 'ID,Date,MealType,TotalCalories,FoodItems\n';
        logs.forEach(l => {
          const totalCals = l.foodItems.reduce((acc, f) => acc + (f.calories || 0), 0);
          const itemsStr = l.foodItems.map(f => `${f.name} (${f.quantity})`).join('; ');
          csvContent += `"${l._id}","${l.date}","${l.mealType}",${totalCals},"${itemsStr}"\n`;
        });
      } else {
        const progress = getStored<ProgressEntry[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
        csvContent = 'ID,Date,Weight(kg),Chest,Waist,Hips,Arms,Thighs,RunTime(min),MaxLift(kg),Notes\n';
        progress.forEach(p => {
          csvContent += `"${p._id}","${p.date}",${p.weight || ''},${p.bodyMeasurements?.chest || ''},${p.bodyMeasurements?.waist || ''},${p.bodyMeasurements?.hips || ''},${p.bodyMeasurements?.arms || ''},${p.bodyMeasurements?.thighs || ''},${p.performanceMetrics?.runTimeMinutes || ''},${p.performanceMetrics?.maxLiftWeight || ''},"${p.performanceMetrics?.customNote || ''}"\n`;
        });
      }
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } else {
      // Return a text-based styled PDF / printable document container
      const summaryText = `FitTrack Performance Report - ${type.toUpperCase()}\nGenerated on: ${new Date().toLocaleString()}\n\n` + 
        JSON.stringify(
          type === 'workouts' 
            ? getStored(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS) 
            : type === 'nutrition' 
              ? getStored(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION) 
              : getStored(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS),
          null,
          2
        );
      return new Blob([summaryText], { type: 'application/pdf' });
    }
  }
};
