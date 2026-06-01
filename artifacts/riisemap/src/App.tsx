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
import SettingsPage from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import { supabase } from "@/lib/supabase";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import type { Session } from "@supabase/supabase-js";

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
        <Route path="/impact" component={Impact} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean>(
    () => !!localStorage.getItem("riisemap_onboarding")
  );

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    setBaseUrl(baseUrl);
    setAuthTokenGetter(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!session ? (
          <Login onLogin={() => {}} />
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
