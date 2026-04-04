import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Wrench, Settings } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/quotes', icon: FileText, label: 'Quotes' },
  { to: '/jobs', icon: Wrench, label: 'Jobs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 touch-target transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
