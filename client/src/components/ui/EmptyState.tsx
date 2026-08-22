import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-slate-800 rounded-lg bg-slate-900/50">
      <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-6">
        {icon || <ShieldAlert size={32} />}
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm text-center">{description}</p>
    </div>
  );
}
