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
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Reflection from "@/pages/reflection";
import Progress from "@/pages/progress";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <StoreProvider>
      <Component />
    </StoreProvider>
  );
};

// Auth Route Component (redirects to dashboard if already logged in)
const AuthRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
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
