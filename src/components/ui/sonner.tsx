'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast font-sans bg-white text-slate-900 border border-slate-200 shadow-[0_2px_8px_rgb(15_23_42/0.08)] rounded-lg text-sm',
          description: 'text-slate-600 text-xs',
          actionButton:
            'bg-primary text-white hover:bg-primary/90 font-medium text-xs rounded-md px-3 py-1.5 transition-colors',
          cancelButton:
            'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-md px-3 py-1.5 transition-colors',
          error: 'border-red-200 bg-red-50 text-red-900',
          success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
          warning: 'border-amber-200 bg-amber-50 text-amber-900',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
