import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Reflection from "@/pages/reflection";
import Progress from "@/pages/progress";

const queryClient = new QueryClient();

// Protected Route: requires auth + completed onboarding
const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  return (
    <StoreProvider>
      <Component />
    </StoreProvider>
  );
};

// Auth Route: for login/register — redirect away if already authenticated
const AuthRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();

  if (isAuthenticated && !onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  if (isAuthenticated && onboardingComplete) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
};

// Onboarding Route: requires auth, redirects away if onboarding already done
const OnboardingRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (onboardingComplete) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login"><AuthRoute component={Login} /></Route>
      <Route path="/register"><AuthRoute component={Register} /></Route>
      <Route path="/onboarding"><OnboardingRoute component={Onboarding} /></Route>

      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/chat"><ProtectedRoute component={Chat} /></Route>
      <Route path="/reflection"><ProtectedRoute component={Reflection} /></Route>
      <Route path="/progress"><ProtectedRoute component={Progress} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
