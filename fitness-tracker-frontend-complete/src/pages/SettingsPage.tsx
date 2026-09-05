import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  Scale, 
  LogOut, 
  Check, 
  Save, 
  Server, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { API_URL_KEY, DEMO_MODE_KEY } from '../api/client';
import { UnitPreference, ThemePreference } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, updateUserProfile, updateUserPreferences, logout } = useAuth();
  const { success, error: toastError } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences (Auto-save)
  const [unit, setUnit] = useState<UnitPreference>(user?.preferences?.unit || 'metric');
  const [theme, setTheme] = useState<ThemePreference>(user?.preferences?.theme || 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [savedFlash, setSavedFlash] = useState(false);

  // Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Backend API URL Config
  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem(API_URL_KEY) || 'http://localhost:5000/api'
  );
  const [isDemoMode, setIsDemoMode] = useState(
    localStorage.getItem(DEMO_MODE_KEY) === 'true'
  );

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfilePicture(user.profilePicture || '');
      if (user.preferences) {
        setUnit(user.preferences.unit);
        setTheme(user.preferences.theme);
        setNotificationsEnabled(user.preferences.notificationsEnabled);
      }
    }
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Name cannot be empty');
      return;
    }
    try {
      setIsSavingProfile(true);
      await updateUserProfile({
        name: name.trim(),
        profilePicture: profilePicture.trim() || undefined,
      });
      success('Profile updated successfully!', 'Saved');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Trigger Flash indicator for Preferences
  const triggerSavedFlash = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  // Preference Handlers (Auto-Save)
  const handleUnitChange = async (newUnit: UnitPreference) => {
    setUnit(newUnit);
    try {
      await updateUserPreferences({ unit: newUnit });
      triggerSavedFlash();
      success(`Biometric unit changed to ${newUnit === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)'}`);
    } catch (err) {
      console.error('Unit error:', err);
    }
  };

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setTheme(newTheme);
    try {
      await updateUserPreferences({ theme: newTheme });
      triggerSavedFlash();
      success(`Theme set to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
    } catch (err) {
      console.error('Theme error:', err);
    }
  };

  const handleNotificationsToggle = async () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    try {
      await updateUserPreferences({ notificationsEnabled: nextVal });
      triggerSavedFlash();
      success(nextVal ? 'System notifications enabled' : 'System notifications muted');
    } catch (err) {
      console.error('Notification pref error:', err);
    }
  };

  // Password Change Handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsSavingPassword(true);
      await updateUserProfile({ password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      success('Password updated successfully!', 'Security Updated');
    } catch (err) {
      console.error('Password error:', err);
      toastError('Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Save Backend Config
  const handleSaveBackendConfig = () => {
    localStorage.setItem(API_URL_KEY, backendUrl.trim());
    localStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
    success('Backend configuration updated! Reloading app...', 'Configuration Saved');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'FT';
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure your biometrics preferences, profile details, and security parameters.
          </p>
        </div>

        {savedFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C6FF3A]/20 text-[#C6FF3A] border border-[#C6FF3A]/30 text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Saved ✓</span>
          </motion.div>
        )}
      </div>

      {/* 1. Profile Section */}
      <Card variant="glass" className="space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <UserIcon className="w-5 h-5 text-[#C6FF3A]" />
          <div>
            <h3 className="text-base font-semibold text-white">Profile Information</h3>
            <p className="text-xs text-slate-400">Update your identity and display avatar</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center text-lg font-bold text-white shadow-lg shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[#C6FF3A] font-display">{getInitials(name)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Input
                label="Profile Picture URL"
                placeholder="https://images.unsplash.com/..."
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                helperText="Paste direct image link or leave empty to use your initials"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              disabled
              helperText="Managed by account credentials"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingProfile}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Preferences Section (Auto-save) */}
      <Card variant="glass" className="space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-white">App Preferences</h3>
            <p className="text-xs text-slate-400">Customized units, visual themes, and alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Unit Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Measurement Units</h4>
                <p className="text-xs text-slate-400">Kilograms / Centimeters vs Pounds / Inches</p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F1622] border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleUnitChange('metric')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  unit === 'metric'
                    ? 'bg-[#C6FF3A] text-black shadow-[0_0_10px_rgba(198,255,58,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Metric (kg / cm)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('imperial')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  unit === 'imperial'
                    ? 'bg-[#C6FF3A] text-black shadow-[0_0_10px_rgba(198,255,58,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Imperial (lbs / in)
              </button>
            </div>
          </div>

          {/* Theme Segmented Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Interface Theme</h4>
                <p className="text-xs text-slate-400">Dark-first high contrast performance styling</p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F1622] border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#C6FF3A] text-black shadow-[0_0_10px_rgba(198,255,58,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#C6FF3A] text-black shadow-[0_0_10px_rgba(198,255,58,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121A28] border border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">System Notifications</h4>
                <p className="text-xs text-slate-400">Automated milestone alerts and session reminders</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6FF3A]"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* 3. Security & Password Change */}
      <Card variant="glass" className="space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Lock className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Security & Password</h3>
            <p className="text-xs text-slate-400">Update your account authentication credentials</p>
          </div>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordError}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isSavingPassword}
              disabled={!newPassword}
              leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. Backend Connection & Sandbox Settings */}
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Server className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Backend API Connection</h3>
            <p className="text-xs text-slate-400">Configure your local Express or deployed server URL</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="API Base URL"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            helperText="Default: http://localhost:5000/api (or your deployed Render / Railway URL)"
          />

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121A28] border border-slate-800">
            <div>
              <h5 className="text-xs font-semibold text-white">Force Interactive Demo Mode</h5>
              <p className="text-[11px] text-slate-400">
                Uses instant browser-persisted mock database if local port 5000 is not running
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6FF3A]"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveBackendConfig}
            >
              Apply Backend URL
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Danger Zone */}
      <Card variant="outline" className="border-rose-500/30 p-5 bg-rose-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Session Management
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Safely log out of your current session on this device.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Log Out of FitTrack
          </Button>
        </div>
      </Card>
    </div>
  );
};
