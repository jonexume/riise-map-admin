import { useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginProps {
  onLogin: (nextStep?: string) => void;
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
}

export default function Login({ onLogin, onGoToSignup, onGoToForgotPassword }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      onLogin(result.nextStep?.signInStep);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">
            <img src="/logo.png" alt="RiiseMap" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-semibold text-foreground">RiiseMap</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Funding impact, clearly tracked.</p>

        <h1 className="text-2xl font-semibold text-foreground mb-1">Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access the platform.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" className="mt-1.5 h-10 text-sm" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Password</Label>
              <button type="button" onClick={onGoToForgotPassword} className="text-xs text-primary hover:underline">Forgot password?</button>
            </div>
            <Input type="password" className="mt-1.5 h-10 text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Don't have an account?{" "}
          <button type="button" onClick={onGoToSignup} className="text-primary hover:underline font-medium">Create one</button>
        </p>
      </div>
    </div>
  );
}
