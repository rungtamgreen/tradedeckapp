import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

export function AppLayout({ children, title, action }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {action}
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto animate-slide-up">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
