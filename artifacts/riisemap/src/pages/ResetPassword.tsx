import { useState } from "react";
import { confirmResetPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordProps {
  email: string;
  onReset: () => void;
  onGoToLogin: () => void;
}

export default function ResetPassword({ email, onReset, onGoToLogin }: ResetPasswordProps) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmResetPassword(email, code.trim(), newPassword);
      onReset();
    } catch (err: any) {
      setError(err?.message || "Reset failed");
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

        <h1 className="text-2xl font-semibold text-foreground mb-1">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the code sent to <strong>{email}</strong> and your new password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Verification Code</Label>
            <Input type="text" className="mt-1.5 h-10 text-sm" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div>
            <Label className="text-sm font-medium">New Password</Label>
            <Input type="password" className="mt-1.5 h-10 text-sm" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            <p className="text-xs text-muted-foreground mt-1">Min 8 chars, uppercase, lowercase, number, special character</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          <button type="button" onClick={onGoToLogin} className="text-primary hover:underline font-medium">Back to sign in</button>
        </p>
      </div>
    </div>
  );
}
