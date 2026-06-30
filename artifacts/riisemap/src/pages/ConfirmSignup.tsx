import { useState } from "react";
import { confirmSignUp, resendSignUpCode } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmSignupProps {
  email: string;
  onConfirmed: () => void;
  onGoToLogin: () => void;
}

export default function ConfirmSignup({ email, onConfirmed, onGoToLogin }: ConfirmSignupProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp(email, code.trim());
      onConfirmed();
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendSignUpCode(email);
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code");
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

        <h1 className="text-2xl font-semibold text-foreground mb-1">Verify Email</h1>
        <p className="text-sm text-muted-foreground mb-6">We sent a code to <strong>{email}</strong>. Enter it below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Verification Code</Label>
            <Input type="text" className="mt-1.5 h-10 text-sm" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button type="button" onClick={handleResend} className="text-sm text-primary hover:underline font-medium">
            {resent ? "Code sent!" : "Resend code"}
          </button>
          <p className="text-sm text-muted-foreground">
            <button type="button" onClick={onGoToLogin} className="text-primary hover:underline font-medium">Back to sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
