# Fitness Tracker — Backend (Aptech eProject)

MERN stack backend for the Fitness Tracker application. Built with Node.js, Express, MongoDB (Mongoose), and JWT authentication.

---

## 1. Setup Instructions (User Guide)

### Prerequisites
- Node.js (v18+)
- MongoDB running locally, or a MongoDB Atlas cloud connection string
- MongoDB Compass (optional, for viewing the database)

### Steps
1. Extract this folder and open a terminal inside it.
2. Install dependencies:
   ```
   npm install
   ```
3. Open `.env` and set your MongoDB connection string:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fitness-tracker
   JWT_SECRET=your_jwt_secret_key_change_this
   ```
   - If using MongoDB Atlas, replace `MONGO_URI` with your `mongodb+srv://...` connection string.
   - Change `JWT_SECRET` to any random string before final submission.
4. Start the server:
   ```
   npm run dev
   ```
   You should see:
   ```
   Server running on port 5000
   MongoDB Connected: <host>
   ```
5. Test the APIs using Postman or Thunder Client (VS Code extension). Start with `POST /api/auth/register` — the database and its collections will be created automatically in MongoDB the first time data is inserted (MongoDB lazy-creation behaviour).

---

## 2. Project Structure (Developer Guide)

```
fitness-tracker-backend/
├── config/
│   └── db.js                    # MongoDB connection
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── Workout.js
│   ├── NutritionLog.js
│   ├── ProgressEntry.js
│   ├── Notification.js
│   ├── Reminder.js
│   └── Feedback.js
├── controllers/                 # Business logic
│   ├── authController.js
│   ├── workoutController.js
│   ├── nutritionController.js
│   ├── progressController.js
│   ├── dashboardController.js
│   ├── notificationController.js
│   ├── reminderController.js
│   ├── feedbackController.js
│   ├── exportController.js
│   ├── settingsController.js
│   └── userController.js
├── routes/                      # Express routers
├── middleware/
│   ├── authMiddleware.js        # JWT protect
│   ├── validateMiddleware.js    # express-validator result handler
│   └── errorMiddleware.js       # 404 + centralized error handler
├── validators/                  # express-validator rule sets per resource
├── utils/
│   └── csvHelper.js             # JSON -> CSV conversion (no external dep)
├── .env
├── index.js                     # App entry point
└── package.json
```

---

## 3. Full API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```
The token is returned by `/api/auth/register` and `/api/auth/login`.

### Auth — `/api/auth`
| Method | Route | Protected | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Create account (`name`, `email`, `password`) |
| POST | `/login` | ❌ | Login (`email`, `password`) → returns JWT |
| GET | `/profile` | ✅ | Get current user profile |
| PUT | `/profile` | ✅ | Update name / profile picture / preferences / password |

### Workouts — `/api/workouts`
| Method | Route | Protected | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create workout (`title`, `category`, `exercises[]`, `date`, `tags`) |
| GET | `/?category=&search=` | ✅ | List workouts, filter by category / search title |
| GET | `/:id` | ✅ | Get single workout |
| PUT | `/:id` | ✅ | Update workout |
| DELETE | `/:id` | ✅ | Delete workout |

### Nutrition — `/api/nutrition`
| Method | Route | Protected | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create log (`mealType`, `foodItems[]`, `date`) |
| GET | `/?mealType=&date=` | ✅ | List logs, filter by meal type / date |
| GET | `/:id` | ✅ | Get single log |
| PUT | `/:id` | ✅ | Update log |
| DELETE | `/:id` | ✅ | Delete log |

### Progress — `/api/progress`
| Method | Route | Protected | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create entry (`weight`, `bodyMeasurements`, `performanceMetrics`, `date`) |
| GET | `/` | ✅ | List progress entries |
| GET | `/:id` | ✅ | Get single entry |
| PUT | `/:id` | ✅ | Update entry |
| DELETE | `/:id` | ✅ | Delete entry |

### Dashboard & Analytics — `/api/dashboard`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Recent workouts, nutrition logs, latest progress, totals |
| GET | `/workout-analytics` | Category breakdown + workouts over time (for charts) |
| GET | `/nutrition-analytics` | Daily calorie/macro totals (for charts) |

### Notifications — `/api/notifications`
| Method | Route | Description |
|---|---|---|
| GET | `/?isRead=true/false` | List notifications + unread count |
| PUT | `/:id/read` | Mark one as read |
| PUT | `/read-all` | Mark all as read |
| DELETE | `/:id` | Delete a notification |

Notifications are auto-created when a workout is logged or a progress entry is added.

### Reminders — `/api/reminders`
| Method | Route | Description |
|---|---|---|
| POST | `/` | Create reminder (`type`: workout/meal/goal, `title`, `scheduledTime`, `repeat`) |
| GET | `/?type=&isActive=` | List reminders |
| GET | `/due` | Reminders whose `scheduledTime` has passed |
| PUT | `/:id` | Update reminder |
| DELETE | `/:id` | Delete reminder |

> Note: This is a data layer for reminders (CRUD + "due" check). Actual push/email delivery would require a background scheduler (e.g. `node-cron`) and a notification channel (email/push), which is outside the scope of this eProject backend and can be added later on the frontend by polling `/due`.

### Reports Export — `/api/export`
| Method | Route | Description |
|---|---|---|
| GET | `/workouts?format=csv\|pdf` | Export all workouts as CSV or PDF |
| GET | `/nutrition?format=csv\|pdf` | Export all nutrition logs as CSV or PDF |
| GET | `/progress?format=csv\|pdf` | Export all progress entries as CSV or PDF |

### Settings — `/api/settings`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get preferences (unit, theme, notificationsEnabled) |
| PUT | `/` | Update preferences |

### Feedback / Support — `/api/feedback`
| Method | Route | Description |
|---|---|---|
| POST | `/` | Submit feedback / bug report / support request |
| GET | `/` | View your own submitted feedback |

### Users — `/api/users`
| Method | Route | Description |
|---|---|---|
| GET | `/search?q=` | Search other users by name (returns name + profile picture only) |

---

## 4. Requirement Coverage Summary

| PDF Requirement | Implemented As |
|---|---|
| User Registration / Login / Profile | `/api/auth/*` |
| Workout Tracking (CRUD) | `/api/workouts/*` |
| Nutrition Tracking (CRUD) | `/api/nutrition/*` |
| Progress Tracking (CRUD) | `/api/progress/*` |
| Dashboard | `/api/dashboard` |
| Workout / Nutrition Analytics | `/api/dashboard/workout-analytics`, `/nutrition-analytics` |
| Activity Notifications | `/api/notifications/*` (auto-triggered on workout/progress creation) |
| Search and Filtering | `?search=` on workouts, `?mealType=&date=` on nutrition, `/api/users/search` |
| Mobile Compatibility | Frontend concern — backend returns JSON, no platform constraint |
| Reporting and Export (PDF/CSV) | `/api/export/*` |
| Alerts and Reminders | `/api/reminders/*` |
| Settings and Preferences | `/api/settings/*` |
| Feedback and Support | `/api/feedback/*` |
| Data Encryption (passwords) | bcrypt hashing in `authController.js` |
| Authentication / Authorization | JWT (`authMiddleware.js`), all data scoped to `req.userId` |
| Input Validation | `express-validator` rule sets in `/validators` |
| Logging / Monitoring | `morgan` request logging in `index.js` |
| Security Headers | `helmet` in `index.js` |
| Rate Limiting | `express-rate-limit` (300 req / 15 min per IP) |
| Error Handling | `middleware/errorMiddleware.js` (404 + centralized handler) |
| Documentation | This README |

**Not implemented in backend (frontend/infra concerns, noted for transparency):**
- Real-time push notifications (would need `node-cron` + a delivery channel — data layer is ready via `/api/reminders/due`)
- Automated test suite (unit/integration/e2e) — can be added with Jest + Supertest if required for submission
- File upload for profile pictures — currently accepts a URL string; can be extended with `multer` if actual image upload is needed

---

## 5. Testing Checklist (Postman / Thunder Client)

1. `POST /api/auth/register` → copy the `token` from the response
2. Add header `Authorization: Bearer <token>` to all further requests
3. Test each CRUD module: workouts → nutrition → progress
4. Check `GET /api/dashboard` — should reflect the data you just created
5. Check `GET /api/notifications` — should show auto-generated entries
6. Check `GET /api/export/workouts?format=csv` — should download a CSV file
7. Open MongoDB Compass — `fitness-tracker` database and all collections should now be visible
