import { useState } from "react";
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
import { recentMomentum, impactMetrics } from "@/data/mockData";
import { cn } from "@/lib/utils";

const priorities = [
  { id: 1, text: "3 learners may need support this week", action: "Review learners", href: "/learners", urgency: "high" },
  { id: 2, text: "2 milestones are overdue", action: "View milestones", href: "/learners?status=Stalled,Needs Support", urgency: "medium" },
  { id: 3, text: "Customer Success cohort engagement is down 8%", action: "Open cohort", href: "/programs", urgency: "medium" },
  { id: 5, text: "Quarterly funder report is due in 12 days", action: "Start report", href: "/impact", urgency: "low" },
];

const quickActions = [
  { label: "Invite Learners", icon: UserPlus, href: "/learners", color: "text-primary" },
  { label: "Review At-Risk Learners", icon: Flag, href: "/learners?status=Stalled,Needs Support", color: "text-amber-600" },
  { label: "Export Report", icon: FileText, href: "/impact", color: "text-indigo-600" },
  { label: "Create Impact Story", icon: Sparkles, href: "/impact", color: "text-purple-600" },
];

export default function Home() {
  const [dismissedPriorities, setDismissedPriorities] = useState<number[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const metrics = [
    { label: "Active Learners", value: impactMetrics.activeLearners, icon: Users, iconColor: "bg-primary/10", subtitle: "Across 3 programs" },
    { label: "Learners At Risk", value: impactMetrics.activeLearners > 0 ? 8 : 0, icon: AlertTriangle, iconColor: "bg-amber-50", subtitle: "Need attention soon" },
    { label: "Avg Readiness Score", value: 68, icon: Star, iconColor: "bg-emerald-50", subtitle: "Out of 100" },
    { label: "Roadmap Completion", value: `${impactMetrics.roadmapCompletion}%`, icon: CheckSquare, iconColor: "bg-blue-50", subtitle: "Avg across cohorts" },
    { label: "Event Participation", value: `${impactMetrics.eventParticipationRate}%`, icon: Calendar, iconColor: "bg-purple-50", subtitle: "Last 30 days" },
    { label: "Placement-Ready", value: impactMetrics.placementReadyLearners, icon: TrendingUp, iconColor: "bg-teal-50", subtitle: "Ready for job search" },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="greeting-header">
          {greeting}, Denise
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what needs your attention today — May 16, 2026
        </p>
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
              {priorities.filter(p => !dismissedPriorities.includes(p.id)).map((p) => (
                <div
                  key={p.id}
                  data-testid={`priority-item-${p.id}`}
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
                      data-testid={`priority-action-${p.id}`}
                    >
                      {p.action}
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
                return (
                  <Link key={action.label} href={action.href}>
                    <button
                      data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                    >
                      <Icon size={15} className={cn("flex-shrink-0", action.color)} />
                      <span className="text-sm text-foreground">{action.label}</span>
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
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Program Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value}
              subtitle={m.subtitle}
              icon={m.icon}
              iconColor={m.iconColor}
            />
          ))}
        </div>
      </div>

      {/* Recent Momentum */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Momentum</h2>
        <Card className="border-card-border shadow-sm">
          <CardContent className="pt-4 pb-2">
            <div className="space-y-1">
              {recentMomentum.map((item) => (
                <div
                  key={item.id}
                  data-testid={`momentum-item-${item.id}`}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    item.positive ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{item.learner}</span>
                    <span className="text-sm text-muted-foreground"> — {item.event}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Learner Snapshot</h2>
          <Link href="/learners">
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7">
              View all learners <ChevronRight size={12} className="ml-1" />
            </Button>
          </Link>
        </div>
        <Card className="border-card-border shadow-sm">
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { name: "Maya Thompson", pathway: "Customer Success Associate", progress: 64, status: "On Track" as const, photo: "/maya.jpg" },
                { name: "Tasha Green", pathway: "Junior Data Operations Analyst", progress: 81, status: "Placement Ready" as const },
                { name: "Jordan Ellis", pathway: "IT Support Specialist", progress: 38, status: "Needs Support" as const },
                { name: "Marcus Reed", pathway: "Technical Support Associate", progress: 22, status: "Stalled" as const },
              ].map((learner) => (
                <div key={learner.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {"photo" in learner && learner.photo
                      ? <img src={learner.photo} alt={learner.name} className="w-full h-full object-cover" />
                      : <span className="text-xs font-semibold text-primary">{learner.name.split(" ").map(n => n[0]).join("")}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{learner.name}</span>
                      <StatusBadge status={learner.status} className="ml-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={learner.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{learner.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
