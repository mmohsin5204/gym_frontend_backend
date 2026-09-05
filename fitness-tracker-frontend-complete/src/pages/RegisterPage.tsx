import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Flame, ArrowRight, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AxiosError } from 'axios';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      setFieldErrors({});
      await register(name, email, password, profilePicture || undefined);
      success('Account created successfully! Welcome to FitTrack.', 'Welcome Aboard');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: { field: string; message: string }[] }>;
      if (axiosErr.response?.data?.errors) {
        const mapped: Record<string, string> = {};
        axiosErr.response.data.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
        toastError(axiosErr.response.data.message || 'Validation failed. Please check the inputs.');
      } else {
        toastError('Registration could not be completed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C10] flex flex-col lg:flex-row">
      {/* LEFT COLUMN: Animated Visual Panel */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 p-12 overflow-hidden bg-gradient-to-br from-[#0B1017] via-[#0F1622] to-[#080C10] border-r border-slate-800">
        {/* Animated Background Geometric Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -35, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#C6FF3A] blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-cyan-500 blur-3xl pointer-events-none"
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#C6FF3A]/10 border border-[#C6FF3A]/40 flex items-center justify-center text-[#C6FF3A] shadow-[0_0_25px_rgba(198,255,58,0.25)]">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              Fit<span className="text-[#C6FF3A]">Track</span>
            </span>
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold block">
              Precision Fitness Intelligence
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C6FF3A]/10 border border-[#C6FF3A]/30 text-[#C6FF3A] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Start Your 30-Day Transformation
            </div>
            <h2 className="text-4xl font-bold font-display text-white tracking-tight leading-tight mb-4">
              Your Personal Athletic Operating System.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Everything you need in one dark, distraction-free environment: volume calculations, macro targets, and detailed visual telemetry.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0F1622]/80 border border-slate-800">
                <span className="text-xl font-bold text-[#C6FF3A] font-display">100%</span>
                <p className="text-xs text-slate-400 mt-0.5">Private Biometrics</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0F1622]/80 border border-slate-800">
                <span className="text-xl font-bold text-[#C6FF3A] font-display">Instant</span>
                <p className="text-xs text-slate-400 mt-0.5">PDF & CSV Reports</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure athlete registry
          </span>
          <span>FitTrack OS</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Register Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#C6FF3A]/10 border border-[#C6FF3A]/30 flex items-center justify-center text-[#C6FF3A]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Fit<span className="text-[#C6FF3A]">Track</span>
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Join FitTrack to start logging workouts and nutrition.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Jordan Smith"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="jordan@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password (min 6 characters)"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              error={fieldErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              error={fieldErrors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />

            <Input
              label="Profile Picture URL (optional)"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              helperText="Paste a direct image URL or leave blank"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </form>

          {/* Switch to Login */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#C6FF3A] hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
