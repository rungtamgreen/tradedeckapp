import { ReactNode } from 'react';

interface QuickActionProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'accent';
}

export function QuickAction({ label, icon, onClick, variant = 'primary' }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`touch-target flex flex-col items-center justify-center gap-2 rounded-xl p-3 font-bold text-[13px] transition-all active:scale-95 ${
        variant === 'accent'
          ? 'bg-accent text-accent-foreground'
          : 'bg-primary text-primary-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}