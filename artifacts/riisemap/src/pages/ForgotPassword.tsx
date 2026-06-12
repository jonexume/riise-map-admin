import { useState } from "react";
import { resetPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordProps {
  onCodeSent: (email: string) => void;
  onGoToLogin: () => void;
}

export default function ForgotPassword({ onCodeSent, onGoToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email.trim());
      onCodeSent(email.trim());
    } catch (err: any) {
      // Don't reveal whether account exists
      onCodeSent(email.trim());
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

        <h1 className="text-2xl font-semibold text-foreground mb-1">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send a reset code.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" className="mt-1.5 h-10 text-sm" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          <button type="button" onClick={onGoToLogin} className="text-primary hover:underline font-medium">Back to sign in</button>
        </p>
      </div>
    </div>
  );
}
