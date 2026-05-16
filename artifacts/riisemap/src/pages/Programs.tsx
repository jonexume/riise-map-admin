import { useState } from "react";
import { ArrowLeft, Users, TrendingUp, Calendar, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { programs, learners } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export default function Programs() {
  const [selected, setSelected] = useState<string | null>(null);

  const program = programs.find(p => p.id === selected);

  if (selected && program) {
    const programLearners = learners.filter(l => l.program === program.name);
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Programs
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{program.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <Button variant="outline" size="sm" className="text-xs h-8">Edit Program</Button>
            <Button size="sm" className="text-xs h-8">Create Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active Learners", value: program.activeLearners },
            { label: "Completion Rate", value: `${program.completionRate}%` },
            { label: "Readiness Score", value: program.readinessScore },
            { label: "Placement-Ready", value: program.placementReady },
          ].map(m => (
            <div key={m.label} className="bg-card border border-card-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Program Details</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Cohort</span><span className="font-medium">{program.cohort}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span className="font-medium">{program.startDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">End Date</span><span className="font-medium">{program.endDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Funder</span><span className="font-medium">{program.funderTag}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Event Participation</span><span className="font-medium">{program.eventParticipation}%</span></div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Active Pathways</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {program.pathways.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{p}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-card-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Learner Progress</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {programLearners.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No learners currently assigned to this program.</p>
            ) : (
              <div className="space-y-4">
                {programLearners.map(l => (
                  <div key={l.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{l.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{l.name}</span>
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={l.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{l.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Programs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">3 active programs across Atlanta Workforce Tech Alliance</p>
        </div>
        <Button size="sm" data-testid="create-program-btn">Create Program</Button>
      </div>

      <div className="space-y-4">
        {programs.map(p => (
          <Card key={p.id} data-testid={`program-card-${p.id}`} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{p.funderTag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{p.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Learners</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><Users size={14} className="text-primary" />{p.activeLearners}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">{p.completionRate}%</p>
                        <Progress value={p.completionRate} className="h-1.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Readiness Score</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><Star size={14} className="text-amber-500" />{p.readinessScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Event Participation</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><Calendar size={14} className="text-purple-500" />{p.eventParticipation}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Placement-Ready</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1"><TrendingUp size={14} className="text-emerald-500" />{p.placementReady}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline" size="sm" className="text-xs h-8"
                    onClick={() => setSelected(p.id)}
                    data-testid={`view-program-${p.id}`}
                  >
                    View Program <ChevronRight size={12} className="ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
