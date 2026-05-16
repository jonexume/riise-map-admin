import { useState } from "react";
import { Users, Clock, ChevronRight, ArrowLeft, CheckCircle2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pathways } from "@/data/mockData";

export default function Pathways() {
  const [selected, setSelected] = useState<string | null>(null);
  const pathway = pathways.find(p => p.id === selected);

  if (selected && pathway) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Pathways
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pathway.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{pathway.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" className="text-xs h-8"><Edit size={11} className="mr-1.5" />Edit Pathway</Button>
            <Button size="sm" className="text-xs h-8">View Outcomes</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Active Learners</p>
            <p className="text-2xl font-semibold text-foreground">{pathway.activeLearners}</p>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Estimated Duration</p>
            <p className="text-2xl font-semibold text-foreground">{pathway.estimatedWeeks} wks</p>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Target Profile</p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">{pathway.targetProfile}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Key Skills</CardTitle></CardHeader>
            <CardContent className="pt-0 flex flex-wrap gap-2">
              {pathway.skills.map(s => (
                <span key={s} className="text-xs bg-primary/8 text-primary border border-primary/15 px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Required Milestones</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.milestones.map(m => (
                <div key={m} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-foreground">{m}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Recommended Projects</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.projects.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{p}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Readiness Criteria</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.readinessCriteria.map(r => (
                <div key={r} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
                  <span className="text-foreground">{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Career Pathways</h1>
          <p className="text-sm text-muted-foreground mt-0.5">5 active pathways guiding {pathways.reduce((a, p) => a + p.activeLearners, 0)} learners toward tech careers</p>
        </div>
        <Button size="sm">Add Pathway</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pathways.map(p => (
          <Card key={p.id} data-testid={`pathway-card-${p.id}`} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users size={12} className="text-primary" />{p.activeLearners} learners</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-muted-foreground" />{p.estimatedWeeks} weeks</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.skills.slice(0, 3).map(s => (
                  <span key={s} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {p.skills.length > 3 && (
                  <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{p.skills.length - 3} more</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm" className="text-xs h-7 px-3"
                  onClick={() => setSelected(p.id)}
                  data-testid={`view-pathway-${p.id}`}
                >
                  View Details <ChevronRight size={11} className="ml-1" />
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-3">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
