import { Link } from "wouter";
import { UserPlus, Calendar, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { coaches, learners } from "@/data/mockData";

export default function Coaches() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Coaches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">3 coaches supporting {learners.length} learners</p>
        </div>
        <Button size="sm" data-testid="add-coach-btn">
          <UserPlus size={14} className="mr-1.5" /> Add Coach
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {coaches.map(coach => (
          <Card key={coach.id} data-testid={`coach-card-${coach.id}`} className="border-card-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{coach.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{coach.name}</p>
                    <p className="text-xs text-muted-foreground">{coach.role}</p>
                  </div>
                </div>
                <StatusBadge status={coach.workload} />
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Users size={12} />Assigned Learners</span>
                  <span className="font-semibold text-foreground">{coach.learnersCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-amber-600"><AlertTriangle size={12} />At-Risk Learners</span>
                  <span className={`font-semibold ${coach.atRisk > 0 ? "text-amber-600" : "text-emerald-600"}`}>{coach.atRisk}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar size={12} />Upcoming Check-ins</span>
                  <span className="font-semibold text-foreground">{coach.upcomingCheckIns}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 size={12} />Overdue Check-ins</span>
                  <span className={`font-semibold ${coach.overdueCheckIns > 0 ? "text-red-600" : "text-emerald-600"}`}>{coach.overdueCheckIns}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Caseload</p>
                <div className="space-y-1">
                  {coach.assignedLearners.map(name => {
                    const learner = learners.find(l => l.name === name);
                    return (
                      <Link key={name} href={learner ? `/learners/${learner.id}` : "#"}>
                        <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary">{name.split(" ").map(n => n[0]).join("")}</span>
                            </div>
                            <span className="text-xs text-foreground">{name}</span>
                          </div>
                          {learner && <StatusBadge status={learner.status} />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7 flex-1" data-testid={`assign-learners-${coach.id}`}>Assign</Button>
                <Button size="sm" className="text-xs h-7 flex-1" data-testid={`schedule-checkin-${coach.id}`}>Schedule</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workload summary */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Caseload Overview</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-2xl font-semibold text-emerald-700">{coaches.filter(c => c.workload === "Healthy").length}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Healthy Workload</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-2xl font-semibold text-amber-700">{coaches.filter(c => c.workload === "Near Capacity").length}</p>
            <p className="text-xs text-amber-600 mt-0.5">Near Capacity</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-2xl font-semibold text-red-700">{coaches.filter(c => c.workload === "Overloaded").length}</p>
            <p className="text-xs text-red-600 mt-0.5">Overloaded</p>
          </div>
        </div>
      </div>
    </div>
  );
}
