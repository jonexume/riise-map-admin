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
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ConfirmSignup from "@/pages/ConfirmSignup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ProfileSetup from "@/pages/ProfileSetup";
import { isAuthenticated, getAccessToken, onAuthStateChange, fetchUserAttributes } from "@/lib/auth";
import { UserProvider } from "@/lib/UserContext";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

const queryClient = new QueryClient();

type AuthState =
  | { status: "loading" }
  | { status: "login" }
  | { status: "signup" }
  | { status: "confirm_signup"; email: string }
  | { status: "forgot_password" }
  | { status: "reset_password"; email: string }
  | { status: "needs_profile" }
  | { status: "authenticated" };

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
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    setBaseUrl(baseUrl);
    setAuthTokenGetter(getAccessToken);

    checkAuth();

    const { unsubscribe } = onAuthStateChange((authenticated) => {
      if (authenticated) {
        checkProfile();
      } else {
        setAuthState({ status: "login" });
      }
    });
    return () => unsubscribe();
  }, []);

  async function checkAuth() {
    const authed = await isAuthenticated();
    if (!authed) {
      setAuthState({ status: "login" });
      return;
    }
    await checkProfile();
  }

  async function checkProfile() {
    try {
      const attrs = await fetchUserAttributes();
      if (!attrs.given_name) {
        setAuthState({ status: "needs_profile" });
      } else {
        setAuthState({ status: "authenticated" });
      }
    } catch {
      // Can't fetch attributes — user session isn't valid
      setAuthState({ status: "login" });
    }
  }

  if (authState.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  function renderAuthPage() {
    switch (authState.status) {
      case "login":
        return (
          <Login
            onLogin={() => checkProfile()}
            onGoToSignup={() => setAuthState({ status: "signup" })}
            onGoToForgotPassword={() => setAuthState({ status: "forgot_password" })}
          />
        );
      case "signup":
        return (
          <Signup
            onNeedConfirmation={(email) => setAuthState({ status: "confirm_signup", email })}
            onGoToLogin={() => setAuthState({ status: "login" })}
          />
        );
      case "confirm_signup":
        return (
          <ConfirmSignup
            email={authState.email}
            onConfirmed={() => setAuthState({ status: "login" })}
            onGoToLogin={() => setAuthState({ status: "login" })}
          />
        );
      case "forgot_password":
        return (
          <ForgotPassword
            onCodeSent={(email) => setAuthState({ status: "reset_password", email })}
            onGoToLogin={() => setAuthState({ status: "login" })}
          />
        );
      case "reset_password":
        return (
          <ResetPassword
            email={authState.email}
            onReset={() => setAuthState({ status: "login" })}
            onGoToLogin={() => setAuthState({ status: "login" })}
          />
        );
      case "needs_profile":
        return <ProfileSetup onComplete={() => setAuthState({ status: "authenticated" })} />;
      default:
        return null;
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {authState.status !== "authenticated" ? (
          renderAuthPage()
        ) : (
          <UserProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </UserProvider>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
