import { JourneyPauseGate } from "@/components/journey-pause-gate";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";
import { StageProvider, useStages } from "@/lib/stage-context";
import { isDemoMode } from "@/lib/demo-mode";
import { DemoBanner } from "@/components/demo-banner";
import { ProcessGate } from "@/components/process-gate";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import AuthCallback from "@/pages/auth-callback";
import EgoIntro from "@/pages/ego-intro";
import Portal from "@/pages/portal";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Reflection from "@/pages/reflection";
import Progress from "@/pages/progress";
import Journey from "@/pages/journey";
import StageDetail from "@/pages/stage-detail";
import DemoActivate from "@/pages/demo-activate";

const queryClient = new QueryClient();

const AuthRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();
  const demo = isDemoMode();

  if (isAuthenticated && demo) return <Redirect to="/onboarding" />;
  if (isAuthenticated && !onboardingComplete) return <Redirect to="/onboarding" />;
  if (isAuthenticated && onboardingComplete) return <Redirect to="/dashboard" />;

  return <Component />;
};

const OnboardingRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();
  const demo = isDemoMode();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!demo && onboardingComplete) return <Redirect to="/dashboard" />;

  return <Component />;
};

const IntroRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete, portalComplete } = useAuth();
  const demo = isDemoMode();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!onboardingComplete && !demo) return <Redirect to="/onboarding" />;
  if (portalComplete && !demo) return <Redirect to="/dashboard" />;

  return <Component />;
};

const DashboardRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete } = useAuth();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!onboardingComplete) return <Redirect to="/onboarding" />;

  return (
    <StoreProvider>
      <StageProvider>
        <Component />
      </StageProvider>
    </StoreProvider>
  );
};

function ProcessContent({ component: Component }: { component: React.ComponentType }) {
  const { pause } = useStages();
  const [location] = useLocation();
  if (location.startsWith("/journey")) {
    return <JourneyPauseGate pause={pause}><Component /></JourneyPauseGate>;
  }
  return <Component />;
}

const ProcessRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, onboardingComplete, portalComplete } = useAuth();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!onboardingComplete) return <Redirect to="/onboarding" />;

  if (!portalComplete) {
    return (
      <StoreProvider>
        <ProcessGate />
      </StoreProvider>
    );
  }

  return (
    <StoreProvider>
      <StageProvider>
        <ProcessContent component={Component} />
      </StageProvider>
    </StoreProvider>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login"><AuthRoute component={Login} /></Route>
      <Route path="/register"><AuthRoute component={Register} /></Route>
      <Route path="/onboarding"><OnboardingRoute component={Onboarding} /></Route>
      <Route path="/auth/callback" component={AuthCallback} />

      <Route path="/ego-intro"><IntroRoute component={EgoIntro} /></Route>
      <Route path="/portal"><IntroRoute component={Portal} /></Route>

      <Route path="/dashboard"><DashboardRoute component={Dashboard} /></Route>
      <Route path="/chat"><ProcessRoute component={Chat} /></Route>
      <Route path="/reflection"><ProcessRoute component={Reflection} /></Route>
      <Route path="/progress"><ProcessRoute component={Progress} /></Route>
      <Route path="/journey"><ProcessRoute component={Journey} /></Route>
      <Route path="/journey/:stageNumber">{(params) => <ProcessRoute component={() => <StageDetail stageNumber={Number(params.stageNumber)} />} />}</Route>

      <Route path="/demo" component={DemoActivate} />
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
            <DemoBanner />
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
