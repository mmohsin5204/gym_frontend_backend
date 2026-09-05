import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'elevated' | 'outline' | 'stat';
  hoverEffect?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', hoverEffect = false, glow = false, className = '', children, ...props }, ref) => {
    const variantStyles = {
      glass:
        'bg-[#0F1622]/80 backdrop-blur-xl border border-slate-800/80 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.5)]',
      elevated:
        'bg-[#141E2D] border border-slate-700/60 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.6)]',
      outline:
        'bg-transparent border border-slate-800 hover:border-slate-700',
      stat:
        'bg-gradient-to-b from-[#111927]/90 to-[#0C121D]/90 backdrop-blur-xl border border-slate-800/80 shadow-lg relative overflow-hidden',
    };

    const hoverClass = hoverEffect
      ? 'transition-all duration-200 hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xl'
      : '';

    const glowClass = glow
      ? 'border-[#C6FF3A]/30 shadow-[0_0_24px_rgba(198,255,58,0.12)]'
      : '';

    return (
      <motion.div
        ref={ref}
        className={`rounded-2xl p-5 ${variantStyles[variant]} ${hoverClass} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
