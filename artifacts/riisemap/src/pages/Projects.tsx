import { useState } from "react";
import { Plus, X, CheckCircle, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { projects, projectSubmissions, ProjectSubmission } from "@/data/mockData";
import { cn } from "@/lib/utils";

const pathwayOptions = [...new Set(projects.map(p => p.pathway))];

const submissionStatusConfig: Record<ProjectSubmission["status"], { label: string; color: string; icon: typeof CheckCircle }> = {
  Approved: { label: "Approved", color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  Reviewed: { label: "Reviewed", color: "text-blue-700 bg-blue-50 border-blue-100", icon: Clock },
  Submitted: { label: "Submitted", color: "text-amber-700 bg-amber-50 border-amber-100", icon: Clock },
  "Needs Revision": { label: "Needs Revision", color: "text-orange-700 bg-orange-50 border-orange-100", icon: AlertCircle },
};

export default function Projects() {
  const [filterPathway, setFilterPathway] = useState("all");
  const [filterRequired, setFilterRequired] = useState("all");
  const [submissionsProject, setSubmissionsProject] = useState<(typeof projects)[number] | null>(null);

  const filtered = projects.filter(p => {
    const matchPathway = filterPathway === "all" || p.pathway === filterPathway;
    const matchRequired = filterRequired === "all" ||
      (filterRequired === "required" && p.required) ||
      (filterRequired === "optional" && !p.required);
    return matchPathway && matchRequired;
  });

  const submissions = submissionsProject
    ? projectSubmissions.filter(s => s.projectId === submissionsProject.id)
    : [];

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
        {filtered.map(p => {
          const subCount = projectSubmissions.filter(s => s.projectId === p.id).length;
          return (
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
                    <Button
                      variant="ghost" size="sm"
                      className="text-xs h-8"
                      onClick={() => setSubmissionsProject(p)}
                      data-testid={`view-submissions-${p.id}`}
                    >
                      View Submissions {subCount > 0 && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">{subCount}</span>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submissions Panel */}
      {submissionsProject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center md:px-4" onClick={() => setSubmissionsProject(null)}>
          <div
            className="bg-background rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div>
                <h2 className="text-base font-semibold text-foreground">{submissionsProject.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {submissions.length} submission{submissions.length !== 1 ? "s" : ""} &middot; {submissionsProject.pathway}
                </p>
              </div>
              <button onClick={() => setSubmissionsProject(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4">
              {submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No submissions yet for this project.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map(sub => {
                    const cfg = submissionStatusConfig[sub.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={sub.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {sub.learnerPhoto
                              ? <img src={sub.learnerPhoto} alt={sub.learnerName} className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-primary">{sub.learnerName.split(" ").map(n => n[0]).join("")}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">{sub.learnerName}</p>
                              <span className={cn("text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0", cfg.color)}>
                                <Icon size={10} />
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <span>Submitted {sub.submittedAt}</span>
                              {sub.score !== undefined && (
                                <span className={cn(
                                  "font-semibold",
                                  sub.score >= 80 ? "text-emerald-600" : sub.score >= 65 ? "text-amber-600" : "text-orange-600"
                                )}>Score: {sub.score}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{sub.notes}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex justify-between items-center border-t border-border pt-4">
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-600" />{submissions.filter(s => s.status === "Approved").length} Approved</span>
                <span className="flex items-center gap-1"><Clock size={11} className="text-blue-600" />{submissions.filter(s => s.status === "Reviewed" || s.status === "Submitted").length} Pending</span>
                <span className="flex items-center gap-1"><RotateCcw size={11} className="text-orange-600" />{submissions.filter(s => s.status === "Needs Revision").length} Needs Revision</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSubmissionsProject(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
