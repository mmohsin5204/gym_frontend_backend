import { 
  User, 
  Workout, 
  NutritionLog, 
  ProgressEntry, 
  AppNotification, 
  Reminder, 
  Feedback 
} from '../types';

export const INITIAL_USER: User = {
  _id: 'user_demo_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  preferences: {
    unit: 'metric',
    theme: 'dark',
    notificationsEnabled: true
  },
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
};

export const INITIAL_WORKOUTS: Workout[] = [
  {
    _id: 'w_1',
    title: 'Upper Body Hypertrophy',
    category: 'strength',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    tags: ['chest', 'triceps', 'shoulders'],
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 85, notes: 'Felt strong, paused at bottom' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 28, notes: 'Focus on upper chest squeeze' },
      { name: 'Cable Lateral Raises', sets: 4, reps: 15, weight: 12, notes: 'Controlled eccentric' },
      { name: 'Tricep Rope Pushdowns', sets: 3, reps: 12, weight: 25, notes: 'Drop set on last' }
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    _id: 'w_2',
    title: '5km Morning Tempo Run',
    category: 'cardio',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    tags: ['running', 'endurance', 'morning'],
    exercises: [
      { name: 'Outdoor Interval Run', sets: 1, reps: 5, weight: 0, notes: 'Average pace 4:45 min/km, heart rate avg 158 bpm' }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'w_3',
    title: 'Leg Day & Core Power',
    category: 'strength',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    tags: ['legs', 'squat', 'core'],
    exercises: [
      { name: 'Barbell Back Squats', sets: 5, reps: 5, weight: 120, notes: 'Deep depth, strict form' },
      { name: 'Romanian Deadlifts', sets: 4, reps: 8, weight: 100, notes: 'Hamstring stretch focus' },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 180, notes: 'High foot placement' },
      { name: 'Hanging Leg Raises', sets: 3, reps: 15, weight: 0, notes: 'Strict, no swinging' }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    _id: 'w_4',
    title: 'Mobility & Recovery Flow',
    category: 'flexibility',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ['recovery', 'yoga', 'hips'],
    exercises: [
      { name: 'Pigeon Pose Stretch', sets: 3, reps: 1, weight: 0, notes: '60s hold per side' },
      { name: 'Thoracic Spine Openers', sets: 3, reps: 10, weight: 0, notes: 'Foam roller assist' },
      { name: 'Hamstring Flossing', sets: 2, reps: 12, weight: 0, notes: 'Dynamic release' }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    _id: 'w_5',
    title: 'HIIT Kettlebell Circuit',
    category: 'other',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    tags: ['hiit', 'kettlebell', 'fatburn'],
    exercises: [
      { name: 'Kettlebell Swings', sets: 5, reps: 20, weight: 24, notes: 'Explosive hip drive' },
      { name: 'Goblet Squats', sets: 4, reps: 12, weight: 24, notes: '30s rest between' },
      { name: 'Burpee Over Bell', sets: 4, reps: 10, weight: 0, notes: 'High intensity finish' }
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

export const INITIAL_NUTRITION: NutritionLog[] = [
  {
    _id: 'n_1',
    mealType: 'breakfast',
    date: new Date().toISOString().split('T')[0],
    foodItems: [
      { name: 'Rolled Oats with Whey & Berries', quantity: '1 bowl (80g oats)', calories: 420, macros: { protein: 32, carbs: 58, fats: 8 } },
      { name: 'Black Coffee & Almond Milk', quantity: '300ml', calories: 25, macros: { protein: 1, carbs: 2, fats: 1 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n_2',
    mealType: 'lunch',
    date: new Date().toISOString().split('T')[0],
    foodItems: [
      { name: 'Grilled Chicken Breast & Jasmine Rice', quantity: '200g chicken, 150g rice', calories: 580, macros: { protein: 52, carbs: 64, fats: 9 } },
      { name: 'Steamed Broccoli with Olive Oil', quantity: '120g', calories: 75, macros: { protein: 3, carbs: 6, fats: 4 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n_3',
    mealType: 'snack',
    date: new Date().toISOString().split('T')[0],
    foodItems: [
      { name: 'Greek Yogurt 0% with Honey', quantity: '200g', calories: 180, macros: { protein: 20, carbs: 18, fats: 0 } },
      { name: 'Raw Almonds', quantity: '25g', calories: 145, macros: { protein: 5, carbs: 4, fats: 13 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n_4',
    mealType: 'dinner',
    date: new Date().toISOString().split('T')[0],
    foodItems: [
      { name: 'Pan-Seared Atlantic Salmon', quantity: '180g', calories: 410, macros: { protein: 38, carbs: 0, fats: 26 } },
      { name: 'Roasted Sweet Potato Wedges', quantity: '150g', calories: 190, macros: { protein: 3, carbs: 42, fats: 2 } },
      { name: 'Mixed Green Salad with Lemon Dressing', quantity: '1 bowl', calories: 65, macros: { protein: 2, carbs: 5, fats: 4 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n_5',
    mealType: 'lunch',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    foodItems: [
      { name: 'Grass-Fed Beef Patty Bowl', quantity: '180g beef, 1 cup quinoa', calories: 620, macros: { protein: 44, carbs: 48, fats: 24 } }
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    _id: 'n_6',
    mealType: 'breakfast',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    foodItems: [
      { name: 'Scrambled Eggs (3) with Sourdough Toast', quantity: '2 slices toast, 3 eggs', calories: 480, macros: { protein: 28, carbs: 36, fats: 22 } }
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const INITIAL_PROGRESS: ProgressEntry[] = [
  {
    _id: 'p_1',
    weight: 78.4,
    bodyMeasurements: { chest: 104, waist: 82, hips: 98, arms: 38.5, thighs: 60 },
    performanceMetrics: { runTimeMinutes: 23.5, maxLiftWeight: 120, customNote: 'Hit target body weight and felt lean.' },
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'p_2',
    weight: 79.2,
    bodyMeasurements: { chest: 103.5, waist: 83, hips: 98.5, arms: 38, thighs: 60.5 },
    performanceMetrics: { runTimeMinutes: 24.2, maxLiftWeight: 117.5, customNote: 'Energy levels steady throughout the week.' },
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    _id: 'p_3',
    weight: 80.1,
    bodyMeasurements: { chest: 103, waist: 84, hips: 99, arms: 37.5, thighs: 61 },
    performanceMetrics: { runTimeMinutes: 25.0, maxLiftWeight: 115, customNote: 'Start of cut cycle.' },
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    _id: 'p_4',
    weight: 81.0,
    bodyMeasurements: { chest: 102.5, waist: 85, hips: 100, arms: 37, thighs: 61.5 },
    performanceMetrics: { runTimeMinutes: 26.1, maxLiftWeight: 112.5, customNote: 'Baseline measurement.' },
    date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString()
  },
  {
    _id: 'p_5',
    weight: 81.8,
    bodyMeasurements: { chest: 102, waist: 86, hips: 100.5, arms: 36.5, thighs: 62 },
    performanceMetrics: { runTimeMinutes: 27.0, maxLiftWeight: 110, customNote: 'Initial training kickoff.' },
    date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    _id: 'notif_1',
    type: 'workout',
    title: 'Workout Logged Successfully',
    message: 'You logged Upper Body Hypertrophy with 4 exercises.',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    _id: 'notif_2',
    type: 'reminder',
    title: 'Hydration & Nutrition Check',
    message: 'Time to log your afternoon meal and drink 500ml water.',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    _id: 'notif_3',
    type: 'progress',
    title: 'New Progress Milestone!',
    message: 'You logged a new low weight of 78.4 kg (-0.8 kg this week).',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    _id: 'notif_4',
    type: 'goal',
    title: 'Weekly Target Reached',
    message: '4 out of 4 scheduled workout sessions completed this week!',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    _id: 'rem_1',
    type: 'workout',
    title: 'Upper Body Power Training',
    message: 'Hit the gym at 6:00 PM for bench press and shoulder sets.',
    scheduledTime: new Date(Date.now() + 2 * 3600000).toISOString(),
    repeat: 'daily',
    isActive: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    _id: 'rem_2',
    type: 'meal',
    title: 'Post-Workout Protein Shake',
    message: 'Drink 40g whey protein + 5g creatine right after workout.',
    scheduledTime: new Date(Date.now() - 30 * 60000).toISOString(), // Due now!
    repeat: 'daily',
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    _id: 'rem_3',
    type: 'goal',
    title: 'Sunday Body Measurement Check-in',
    message: 'Weigh in fasted and record waist & chest circumference.',
    scheduledTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    repeat: 'weekly',
    isActive: true,
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString()
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    _id: 'fb_1',
    type: 'feedback',
    subject: 'Love the dark mode and charts!',
    message: 'The calorie trend and body measurement charts are super responsive and helpful. Would love a Garmin sync down the road.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    _id: 'fb_2',
    type: 'support',
    subject: 'Barcode scanner request',
    message: 'Can we have a quick search or barcode lookup for packaged nutrition items?',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];
