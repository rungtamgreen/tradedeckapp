import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLockProvider, useAppLock } from "@/hooks/useAppLock";
import { LockScreen } from "@/components/LockScreen";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import NewCustomerPage from "./pages/NewCustomerPage";
import QuotesPage from "./pages/QuotesPage";
import NewQuotePage from "./pages/NewQuotePage";
import JobsPage from "./pages/JobsPage";
import NewJobPage from "./pages/NewJobPage";
import InvoicesPage from "./pages/InvoicesPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import SecurityPage from "./pages/SecurityPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import InstallPage from "./pages/InstallPage";
import AcceptQuotePage from "./pages/AcceptQuotePage";
import PricingPage from "./pages/PricingPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isLocked, isLoading: lockLoading } = useAppLock();

  if (loading || lockLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (isLocked) return <LockScreen />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLockProvider>
            <SubscriptionProvider>
              <Routes>
                <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/customers/new" element={<ProtectedRoute><NewCustomerPage /></ProtectedRoute>} />
                <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
                <Route path="/quotes" element={<ProtectedRoute><QuotesPage /></ProtectedRoute>} />
                <Route path="/quotes/:id" element={<ProtectedRoute><QuoteDetailPage /></ProtectedRoute>} />
                <Route path="/quotes/new" element={<ProtectedRoute><NewQuotePage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/jobs/new" element={<ProtectedRoute><NewJobPage /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                <Route path="/invoices/new" element={<ProtectedRoute><NewInvoicePage /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
                <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/accept-quote" element={<AcceptQuotePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubscriptionProvider>
          </AppLockProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
