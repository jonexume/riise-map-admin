import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/auth-fetch";

export default function SettingsPage() {
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await authFetch(`${baseUrl}/api/reset-workspace`, { method: "POST" });
      if (res.ok) { setResetDone(true); setResetConfirm(""); }
    } catch {}
    finally { setResetting(false); }
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace</p>
      </div>

      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-destructive">Reset Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Clear the current organization's workspace and start fresh. This will permanently delete all Learners, Pathways, Programs, and Funding Sources.</p>
          <div className="flex items-center gap-3">
            <Input
              placeholder='Type "RESET" to confirm'
              value={resetConfirm}
              onChange={e => setResetConfirm(e.target.value)}
              className="w-60 text-sm"
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={resetConfirm !== "RESET" || resetting}
              onClick={handleReset}
            >
              {resetting ? "Resetting..." : "Reset Workspace"}
            </Button>
          </div>
          {resetDone && <p className="text-sm text-emerald-600 font-medium">Workspace reset successfully.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
