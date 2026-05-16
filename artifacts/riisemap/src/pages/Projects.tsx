import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { projects } from "@/data/mockData";

const pathwayOptions = [...new Set(projects.map(p => p.pathway))];

export default function Projects() {
  const [filterPathway, setFilterPathway] = useState("all");
  const [filterRequired, setFilterRequired] = useState("all");

  const filtered = projects.filter(p => {
    const matchPathway = filterPathway === "all" || p.pathway === filterPathway;
    const matchRequired = filterRequired === "all" ||
      (filterRequired === "required" && p.required) ||
      (filterRequired === "optional" && !p.required);
    return matchPathway && matchRequired;
  });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} applied learning projects across all pathways</p>
        </div>
        <Button size="sm" data-testid="create-project-btn">
          <Plus size={14} className="mr-1.5" /> Create Project
        </Button>
      </div>

      <div className="flex gap-3 mb-5">
        <Select value={filterPathway} onValueChange={setFilterPathway}>
          <SelectTrigger className="w-52 h-9 text-sm" data-testid="filter-project-pathway">
            <SelectValue placeholder="All Pathways" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pathways</SelectItem>
            {pathwayOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRequired} onValueChange={setFilterRequired}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-project-required">
            <SelectValue placeholder="Required" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="required">Required</SelectItem>
            <SelectItem value="optional">Optional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(p => (
          <Card key={p.id} data-testid={`project-card-${p.id}`} className="border-card-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h2 className="text-sm font-semibold text-foreground">{p.title}</h2>
                    <StatusBadge status={p.status} />
                    {p.required && (
                      <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Required</span>
                    )}
                    {!p.required && (
                      <span className="text-[11px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">Optional</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={p.completion} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium">{p.completion}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
                      <p className="text-sm text-foreground">{p.estimatedHours} hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pathway</p>
                      <p className="text-sm text-foreground">{p.pathway}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Readiness Skills Measured</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.readinessSkills.map(s => (
                        <span key={s} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-8" data-testid={`edit-project-${p.id}`}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">View Submissions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
