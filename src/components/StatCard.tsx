import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'destructive';
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-3">
      <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
