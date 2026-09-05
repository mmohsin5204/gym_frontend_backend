import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Flame, ArrowRight, Zap, CheckCircle2, ShieldCheck, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AxiosError } from 'axios';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
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
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      setFieldErrors({});
      await login(email, password);
      success('Welcome back to FitTrack!', 'Login Successful');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: { field: string; message: string }[] }>;
      if (axiosErr.response?.status === 401) {
        toastError('Invalid email or password', 'Authentication Failed');
      } else if (axiosErr.response?.data?.errors) {
        const mapped: Record<string, string> = {};
        axiosErr.response.data.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
        toastError(axiosErr.response.data.message || 'Please correct the highlighted fields');
      } else {
        toastError('Unable to sign in. Please verify your credentials or server connection.');
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
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#C6FF3A] blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -45, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500 blur-3xl pointer-events-none"
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

        {/* Hero Copy & Key Features */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C6FF3A]/10 border border-[#C6FF3A]/30 text-[#C6FF3A] text-xs font-semibold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" /> High Performance Suite
            </div>
            <h2 className="text-4xl font-bold font-display text-white tracking-tight leading-tight mb-4">
              Turn Daily Sweat Into Measurable Momentum.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Log complex strength workouts, track macros, analyze body composition trajectories, and stay accountable with proactive scheduling.
            </p>

            {/* Feature Pills */}
            <div className="space-y-3">
              {[
                'Real-time Volume & Macro Analytics',
                'Comprehensive Body Metric Trajectories',
                'Automated PDF & CSV Performance Exports',
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-xs text-slate-300 bg-[#0F1622]/60 backdrop-blur-md p-3 rounded-xl border border-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C6FF3A] shrink-0" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-end encrypted biometric vault
          </span>
          <span>v2.4.0</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
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

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Enter your credentials to access your fitness dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
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
              label="Password"
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
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-[#C6FF3A] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Switch to Register */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#C6FF3A] hover:underline">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
