import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'destructive';
  to?: string;
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, icon, color = 'primary', to }: StatCardProps) {
  const navigate = useNavigate();

  const content = (
    <>
      <div className="flex items-center gap-3 flex-1">
        <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {to && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </>
  );

  if (to) {
    return (
      <button
        onClick={() => navigate(to)}
        className="bg-card rounded-lg border border-border p-4 flex items-center gap-3 w-full text-left hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer touch-target"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-3">
      {content}
    </div>
  );
}
