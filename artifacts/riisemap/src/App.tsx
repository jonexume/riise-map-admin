import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Learners from "@/pages/Learners";
import LearnerDetail from "@/pages/LearnerDetail";
import Programs from "@/pages/Programs";
import Pathways from "@/pages/Pathways";
import Impact from "@/pages/Impact";
import FundingSources from "@/pages/FundingSources";
import SettingsPage from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import { isAuthenticated, getAccessToken, onAuthStateChange } from "@/lib/auth";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

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
        <Route path="/impact" component={Impact} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [onboarded, setOnboarded] = useState<boolean>(
    () => !!localStorage.getItem("riisemap_onboarding")
  );

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    setBaseUrl(baseUrl);
    setAuthTokenGetter(getAccessToken);

    isAuthenticated().then(setAuthed);

    const { unsubscribe } = onAuthStateChange(setAuthed);
    return () => unsubscribe();
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!authed ? (
          <Login onLogin={() => setAuthed(true)} />
        ) : !onboarded ? (
          <Onboarding onComplete={() => setOnboarded(true)} />
        ) : (
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
