import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/auth-fetch";

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  entityName: string | null;
  userEmail: string | null;
  details: string | null;
  createdAt: string | null;
}

export default function SettingsPage() {
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    authFetch(`${baseUrl}/api/audit-log?limit=50`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAuditLog(data); })
      .catch(() => {})
      .finally(() => setLogLoading(false));
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await authFetch(`${baseUrl}/api/reset-workspace`, { method: "POST" });
      if (res.ok) { setResetDone(true); setResetConfirm(""); }
    } catch {}
    finally { setResetting(false); }
  };

  const actionColor = (action: string) => {
    if (action === "created") return "text-emerald-600 bg-emerald-50";
    if (action === "updated") return "text-blue-600 bg-blue-50";
    if (action === "deleted") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace</p>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLog.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 last:border-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColor(entry.action)}`}>
                    {entry.action}
                  </span>
                  <span className="text-foreground font-medium">{entry.entityType.replace("_", " ")}</span>
                  {entry.entityName && <span className="text-muted-foreground">"{entry.entityName}"</span>}
                  <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                    {entry.userEmail && `${entry.userEmail} · `}
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Workspace */}
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
