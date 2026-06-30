import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Users, AlertTriangle, TrendingUp, CheckSquare, Calendar, Star,
  ArrowRight, UserPlus, Flag, FileText, Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { authFetch } from "@/lib/auth-fetch";
import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Invite Learners", icon: UserPlus, href: "/learners", color: "text-primary" },
  { label: "Review At-Risk Learners", icon: Flag, href: "/learners?sort=readiness&dir=asc", color: "text-amber-600", countKey: "atRisk" as const },
  { label: "Print Impact Report", icon: FileText, href: "/impact", color: "text-indigo-600" },
  { label: "Add Funding Source", icon: Sparkles, href: "/funding-sources", color: "text-purple-600" },
];

export default function Home() {
  const [dismissedPriorities, setDismissedPriorities] = useState<number[]>([]);
  const [priorities, setPriorities] = useState<{ text: string; href: string; urgency: string }[]>([]);
  const [counts, setCounts] = useState<{ learners: number; atRisk: number; programs: number; fundingSources: number }>({ learners: 0, atRisk: 0, programs: 0, fundingSources: 0 });
  const { user } = useUser();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    authFetch(`${baseUrl}/api/dashboard-priorities`).then(r => r.ok ? r.json() : []).then(setPriorities).catch(() => {});
    authFetch(`${baseUrl}/api/learners`).then(r => r.ok ? r.json() : []).then((learners: any[]) => {
      setCounts(c => ({ ...c, learners: learners.length, atRisk: learners.filter(l => l.readiness < 25 || l.flaggedForSupport).length }));
    }).catch(() => {});
    authFetch(`${baseUrl}/api/programs`).then(r => r.ok ? r.json() : []).then((d: any[]) => setCounts(c => ({ ...c, programs: d.length }))).catch(() => {});
    authFetch(`${baseUrl}/api/funding-sources`).then(r => r.ok ? r.json() : []).then((d: any[]) => setCounts(c => ({ ...c, fundingSources: d.length }))).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground" data-testid="greeting-header">
          {greeting}{user.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's a snapshot of your programs and learners.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Total Learners</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{counts.learners}</p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Active Programs</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{counts.programs}</p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Funding Sources</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{counts.fundingSources}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Priorities */}
        <div className="xl:col-span-2">
          <Card className="border-card-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <Flag size={11} className="text-primary" />
                </div>
                Today's Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {priorities.filter((_, i) => !dismissedPriorities.includes(i)).map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-lg border",
                    p.urgency === "high" ? "border-red-100 bg-red-50/50" :
                    p.urgency === "medium" ? "border-amber-100 bg-amber-50/50" :
                    "border-border bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5",
                    p.urgency === "high" ? "bg-red-500" :
                    p.urgency === "medium" ? "bg-amber-500" :
                    "bg-blue-400"
                  )} />
                  <span className="text-sm text-foreground flex-1">{p.text}</span>
                  <Link href={p.href}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-3 shrink-0"
                    >
                      View
                      <ChevronRight size={12} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border-card-border shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const count = action.countKey ? counts[action.countKey] : null;
                return (
                  <Link key={action.label} href={action.href}>
                    <button
                      data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                    >
                      <Icon size={15} className={cn("flex-shrink-0", action.color)} />
                      <span className="text-sm text-foreground">{action.label}</span>
                      {count != null && count > 0 && (
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{count}</span>
                      )}
                      <ArrowRight size={13} className="ml-auto text-muted-foreground/50" />
                    </button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metrics */}
    </div>
  );
}
