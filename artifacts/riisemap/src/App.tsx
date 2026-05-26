import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AlertProvider } from "@/contexts/AlertContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Learners from "@/pages/Learners";
import LearnerDetail from "@/pages/LearnerDetail";
import Programs from "@/pages/Programs";
import Pathways from "@/pages/Pathways";
import FundingSources from "@/pages/FundingSources";
import Projects from "@/pages/Projects";
import Events from "@/pages/Events";
import Jobs from "@/pages/Jobs";
import Coaches from "@/pages/Coaches";
import Alerts from "@/pages/Alerts";
import Impact from "@/pages/Impact";
import SettingsPage from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import { setBaseUrl } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/learners/:id" component={LearnerDetail} />
        <Route path="/learners" component={Learners} />
        <Route path="/programs" component={Programs} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/funding-sources" component={FundingSources} />
        <Route path="/projects" component={Projects} />
        <Route path="/events" component={Events} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/coaches" component={Coaches} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/impact" component={Impact} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [onboarded, setOnboarded] = useState<boolean>(
    () => !!localStorage.getItem("riisemap_onboarding")
  );

  useEffect(() => {
    // Set API base URL - in production, this should be your deployed API URL
    const baseUrl = import.meta.env.VITE_API_URL || "";
    setBaseUrl(baseUrl);
  }, []);

  const handleOnboardingComplete = () => setOnboarded(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!onboarded ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <AlertProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AlertProvider>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
