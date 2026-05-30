import { useState } from "react";
import { Link } from "wouter";
import {
  Users, AlertTriangle, TrendingUp, CheckSquare, Calendar, Star,
  ArrowRight, UserPlus, Plus, Flag, FileText, Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { recentMomentum, impactMetrics } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Home() {
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
          Here's a snapshot of your programs and learners.
        </p>
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
