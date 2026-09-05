import React from 'react';

export type BadgeVariant =
  | 'accent'
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'other'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'open'
  | 'in-progress'
  | 'resolved'
  | 'neutral'
  | 'success'
  | 'danger'
  | 'warning';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    accent: 'bg-[#C6FF3A]/15 text-[#C6FF3A] border-[#C6FF3A]/30',
    strength: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    cardio: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    flexibility: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    other: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    breakfast: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    lunch: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dinner: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    snack: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    open: 'bg-[#C6FF3A]/15 text-[#C6FF3A] border-[#C6FF3A]/30',
    'in-progress': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  const dotColors: Record<BadgeVariant, string> = {
    accent: 'bg-[#C6FF3A]',
    strength: 'bg-indigo-400',
    cardio: 'bg-amber-400',
    flexibility: 'bg-emerald-400',
    other: 'bg-purple-400',
    breakfast: 'bg-amber-400',
    lunch: 'bg-sky-400',
    dinner: 'bg-indigo-400',
    snack: 'bg-emerald-400',
    open: 'bg-[#C6FF3A]',
    'in-progress': 'bg-amber-400',
    resolved: 'bg-emerald-400',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400',
    danger: 'bg-rose-400',
    warning: 'bg-amber-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border uppercase tracking-wider ${
        variantStyles[variant] || variantStyles.neutral
      } ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-slate-400'}`} />}
      {children}
    </span>
  );
};
