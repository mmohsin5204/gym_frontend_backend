import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Dumbbell, Apple, TrendingUp, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportApi } from '../api/client';
import { useToast } from '../context/ToastContext';

export interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleDownload = async (type: 'workouts' | 'nutrition' | 'progress', format: 'csv' | 'pdf') => {
    const key = `${type}_${format}`;
    try {
      setDownloading(key);
      const blob = await exportApi.exportData(type, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'csv' ? 'csv' : 'pdf';
      link.setAttribute('download', `fittrack_${type}_export_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      success(`Successfully generated and downloaded ${type} ${format.toUpperCase()}`, 'Export Complete');
    } catch (err) {
      console.error('Export failed:', err);
      error(`Failed to export ${type} data. Please try again.`, 'Export Failed');
    } finally {
      setDownloading(null);
    }
  };

  const sections = [
    {
      type: 'workouts' as const,
      title: 'Workouts & Exercises',
      description: 'Full history of completed training sessions, exercises, sets, reps, and weights.',
      icon: <Dumbbell className="w-5 h-5 text-indigo-400" />,
      badge: 'Training Data',
    },
    {
      type: 'nutrition' as const,
      title: 'Nutrition & Daily Food Logs',
      description: 'Daily caloric intake, meal categories, and macronutrient breakdowns (protein, carbs, fats).',
      icon: <Apple className="w-5 h-5 text-emerald-400" />,
      badge: 'Dietary Data',
    },
    {
      type: 'progress' as const,
      title: 'Progress & Body Measurements',
      description: 'Weight trend logs, chest/waist/hips circumference, run times, and personal records.',
      icon: <TrendingUp className="w-5 h-5 text-[#C6FF3A]" />,
      badge: 'Biometrics',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reports & Data Export"
      subtitle="Download structured CSV datasets or formatted PDF performance summaries"
      maxWidth="xl"
    >
      <div className="space-y-4 pt-1">
        {sections.map((sec) => (
          <div
            key={sec.type}
            className="p-4 rounded-xl bg-[#131B2A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0F1622] border border-slate-700/60 flex items-center justify-center shrink-0">
                {sec.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white">{sec.title}</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sec.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">{sec.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(sec.type, 'csv')}
                isLoading={downloading === `${sec.type}_csv`}
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(sec.type, 'pdf')}
                isLoading={downloading === `${sec.type}_pdf`}
                leftIcon={<FileText className="w-3.5 h-3.5 text-rose-400" />}
              >
                PDF
              </Button>
            </div>
          </div>
        ))}

        <div className="p-3.5 rounded-xl bg-[#080C10]/60 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Download className="w-4 h-4 text-[#C6FF3A] shrink-0" />
          <span>All exports are generated with your current authenticated user data.</span>
        </div>
      </div>
    </Modal>
  );
};
