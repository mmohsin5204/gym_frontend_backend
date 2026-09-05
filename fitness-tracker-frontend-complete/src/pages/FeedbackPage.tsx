import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquareHeart, 
  Bug, 
  MessageSquare, 
  LifeBuoy, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { feedbackApi } from '../api/client';
import { Feedback, FeedbackType } from '../types';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeTime, formatDate } from '../utils/format';

const FEEDBACK_TYPES: { id: FeedbackType; label: string; icon: React.ReactNode }[] = [
  { id: 'feedback', label: 'Feature Idea', icon: <MessageSquare className="w-4 h-4 text-[#C6FF3A]" /> },
  { id: 'bug', label: 'Bug Report', icon: <Bug className="w-4 h-4 text-rose-400" /> },
  { id: 'support', label: 'Help / Support', icon: <LifeBuoy className="w-4 h-4 text-sky-400" /> },
];

export const FeedbackPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [submissions, setSubmissions] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formType, setFormType] = useState<FeedbackType>('feedback');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await feedbackApi.getFeedback();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      toastError('Could not load feedback history');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formMessage.trim()) {
      toastError('Please fill in both subject and message.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newEntry = await feedbackApi.createFeedback({
        type: formType,
        subject: formSubject.trim(),
        message: formMessage.trim(),
      });

      // Optimistic update
      setSubmissions((prev) => [newEntry, ...prev]);
      setFormSubject('');
      setFormMessage('');
      success('Thank you! Your feedback was submitted successfully.', 'Submission Received');
    } catch (err) {
      console.error('Feedback submit error:', err);
      toastError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C6FF3A] uppercase tracking-wider mb-1">
          <MessageSquareHeart className="w-3.5 h-3.5" /> Community & Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          Feedback & Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Found a bug? Have an idea? Let us know — we read every single message.
        </p>
      </div>

      {/* 1. Submission Form Card */}
      <Card variant="glass" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {FEEDBACK_TYPES.map((t) => {
                const isSelected = formType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormType(t.id)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C6FF3A]/15 border-[#C6FF3A] text-[#C6FF3A] shadow-[0_0_15px_rgba(198,255,58,0.15)]'
                        : 'bg-[#121A28] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Subject"
            placeholder="Brief summary of your topic or issue..."
            value={formSubject}
            onChange={(e) => setFormSubject(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Detailed Message</label>
            <textarea
              rows={4}
              placeholder="Tell us what you experienced, what device you are using, or describe your feature proposal in detail..."
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              className="w-full rounded-xl bg-[#0F1622] border border-slate-800 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6FF3A] focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. User Submission History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C6FF3A]" /> Your Submissions History
          </h3>
          <span className="text-xs text-slate-400">{submissions.length} Total</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#0F1622] skeleton border border-slate-800" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={<HelpCircle className="w-8 h-8 text-[#C6FF3A]" />}
            title="No Submissions Yet"
            description="Any tickets or feature requests you submit will appear here with live resolution status."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {submissions.map((item) => {
                const isExpanded = expandedId === item._id;
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      variant="glass"
                      className="p-4 sm:p-5 transition-all hover:border-slate-700 cursor-pointer"
                      onClick={() => toggleExpand(item._id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.status} size="sm">
                            {item.status}
                          </Badge>
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                            {item.type}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(item.createdAt)} • {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{item.subject}</h4>
                          <p
                            className={`text-xs text-slate-300 leading-relaxed ${
                              !isExpanded ? 'line-clamp-2' : ''
                            }`}
                          >
                            {item.message}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="text-slate-400 p-1 hover:text-white shrink-0 mt-0.5"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
