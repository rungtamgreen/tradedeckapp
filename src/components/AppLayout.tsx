import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
  back?: boolean;
}

export function AppLayout({ children, title, action, back }: AppLayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {back && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </div>
        {action}
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto animate-slide-up">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
