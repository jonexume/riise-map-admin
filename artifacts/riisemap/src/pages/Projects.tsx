import { useState } from "react";
import {
  Plus, X, CheckCircle, Clock, AlertCircle,
  RotateCcw, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { projects as seedProjects, projectSubmissions, ProjectSubmission } from "@/data/mockData";
import { cn } from "@/lib/utils";

type Project = typeof seedProjects[number];

const pathwayOptions = [...new Set(seedProjects.map(p => p.pathway))];

const submissionStatusConfig: Record<ProjectSubmission["status"], { label: string; color: string; icon: typeof CheckCircle }> = {
  Approved:       { label: "Approved",       color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  Reviewed:       { label: "Reviewed",       color: "text-blue-700 bg-blue-50 border-blue-100",         icon: Clock },
  Submitted:      { label: "Submitted",      color: "text-amber-700 bg-amber-50 border-amber-100",      icon: Clock },
  "Needs Revision": { label: "Needs Revision", color: "text-orange-700 bg-orange-50 border-orange-100", icon: AlertCircle },
};

interface CreateForm {
  title: string;
  description: string;
  pathway: string;
  required: string;
  estimatedHours: string;
  status: string;
  skillInput: string;
  skills: string[];
}

const BLANK: CreateForm = {
  title: "",
  description: "",
  pathway: "",
  required: "required",
  estimatedHours: "",
  status: "Active",
  skillInput: "",
  skills: [],
};

export default function Projects() {
  const [allProjects, setAllProjects] = useState<Project[]>(seedProjects);
  const [filterPathway, setFilterPathway] = useState("all");
  const [filterRequired, setFilterRequired] = useState("all");
  const [submissionsProject, setSubmissionsProject] = useState<Project | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<"form" | "confirm">("form");
  const [form, setForm] = useState<CreateForm>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<"title" | "description" | "pathway" | "estimatedHours", string>>>({});
  const [newProjectId, setNewProjectId] = useState("");

  const filtered = allProjects.filter(p => {
    const matchPathway  = filterPathway  === "all" || p.pathway === filterPathway;
    const matchRequired = filterRequired === "all"
      || (filterRequired === "required" && p.required)
      || (filterRequired === "optional" && !p.required);
    return matchPathway && matchRequired;
  });

  const submissions = submissionsProject
    ? projectSubmissions.filter(s => s.projectId === submissionsProject.id)
    : [];

  const setField = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k !== "skillInput" && k !== "skills") {
      setErrors(e => ({ ...e, [k]: "" }));
    }
  };

  const addSkill = () => {
    const val = form.skillInput.trim();
    if (!val) return;
    setForm(f => ({ ...f, skills: [...f.skills, val], skillInput: "" }));
  };

  const removeSkill = (i: number) =>
    setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim())         e.title         = "Project title is required";
    if (!form.description.trim())   e.description   = "Description is required";
    if (!form.pathway)              e.pathway        = "Please select a pathway";
    if (!form.estimatedHours)       e.estimatedHours = "Please select estimated hours";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const id = String(Date.now());
    const newProject: Project = {
      id,
      title:            form.title.trim(),
      description:      form.description.trim(),
      pathway:          form.pathway,
      required:         form.required === "required",
      estimatedHours:   parseInt(form.estimatedHours),
      status:           form.status as Project["status"],
      completion:       0,
      readinessSkills:  form.skills,
      evidenceRequired: "To be defined by coach",
    };
    setAllProjects(prev => [newProject, ...prev]);
    setNewProjectId(id);
    setCreateStep("confirm");
  };

  const closeCreate = () => {
    setShowCreate(false);
    setTimeout(() => {
      setForm(BLANK);
      setErrors({});
      setCreateStep("form");
      setNewProjectId("");
    }, 300);
  };

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{allProjects.length} applied learning projects across all pathways</p>
        </div>
        <Button size="sm" data-testid="create-project-btn" onClick={() => { setCreateStep("form"); setShowCreate(true); }}>
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
          const isNew = p.id === newProjectId;
          return (
            <Card
              key={p.id}
              data-testid={`project-card-${p.id}`}
              className={cn("border-card-border shadow-sm transition-shadow", isNew && "ring-2 ring-primary/30")}
            >
              <CardContent className="p-5">
                {isNew && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-3">
                    <Check size={12} /> Newly created
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h2 className="text-sm font-semibold text-foreground">{p.title}</h2>
                      <StatusBadge status={p.status} />
                      {p.required
                        ? <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Required</span>
                        : <span className="text-[11px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">Optional</span>
                      }
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
                        {p.readinessSkills.length > 0
                          ? p.readinessSkills.map(s => (
                              <span key={s} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                            ))
                          : <span className="text-[11px] text-muted-foreground italic">No skills defined</span>
                        }
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
                      View Submissions {subCount > 0 && (
                        <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">{subCount}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Create Project Modal ─────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={closeCreate}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {createStep === "confirm" ? (
              /* ── Confirmation ── */
              <div className="flex flex-col items-center text-center px-8 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check size={30} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Project created</h2>
                <p className="text-sm text-muted-foreground mb-7 max-w-xs">
                  <span className="font-medium text-foreground">{form.title}</span> has been added to your projects list and is now visible to coaches and learners.
                </p>

                <div className="w-full bg-muted/40 border border-border rounded-xl p-4 text-left mb-7 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium text-foreground">{form.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pathway</span>
                    <span className="font-medium text-foreground">{form.pathway}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground capitalize">{form.required === "required" ? "Required" : "Optional"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated time</span>
                    <span className="font-medium text-foreground">{form.estimatedHours} hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-foreground">{form.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skills defined</span>
                    <span className="font-medium text-foreground">{form.skills.length}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={closeCreate}>Back to Projects</Button>
                  <Button className="flex-1" onClick={() => { setForm(BLANK); setErrors({}); setCreateStep("form"); setNewProjectId(""); }}>
                    Create Another
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Create Project</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Add an applied learning project to a career pathway</p>
                  </div>
                  <button onClick={closeCreate} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Title */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Project Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className={`mt-1.5 h-10 text-sm ${errors.title ? "border-destructive" : ""}`}
                      placeholder="e.g. Customer Onboarding Simulation"
                      value={form.title}
                      onChange={e => setField("title", e.target.value)}
                      data-testid="project-title-input"
                    />
                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      className={`mt-1.5 text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                      rows={3}
                      placeholder="Describe what learners will build or do, and what skills it demonstrates..."
                      value={form.description}
                      onChange={e => setField("description", e.target.value)}
                      data-testid="project-description-input"
                    />
                    {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                  </div>

                  {/* Pathway */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Career Pathway <span className="text-destructive">*</span>
                    </Label>
                    <Select value={form.pathway} onValueChange={v => setField("pathway", v)}>
                      <SelectTrigger className={`mt-1.5 h-10 text-sm ${errors.pathway ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Assign to a pathway..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pathwayOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        <SelectItem value="IT Support Specialist">IT Support Specialist</SelectItem>
                        <SelectItem value="Customer Success Associate">Customer Success Associate</SelectItem>
                        <SelectItem value="Junior Data Operations Analyst">Junior Data Operations Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.pathway && <p className="text-xs text-destructive mt-1">{errors.pathway}</p>}
                  </div>

                  {/* Required + Hours */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Project Type</Label>
                      <Select value={form.required} onValueChange={v => setField("required", v)}>
                        <SelectTrigger className="mt-1.5 h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Estimated Hours <span className="text-destructive">*</span>
                      </Label>
                      <Select value={form.estimatedHours} onValueChange={v => setField("estimatedHours", v)}>
                        <SelectTrigger className={`mt-1.5 h-10 text-sm ${errors.estimatedHours ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map(h => (
                            <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.estimatedHours && <p className="text-xs text-destructive mt-1">{errors.estimatedHours}</p>}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Status</Label>
                    <Select value={form.status} onValueChange={v => setField("status", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Readiness Skills */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Readiness Skills Measured</Label>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">Skills this project demonstrates. Press Enter or click + to add each one.</p>
                    <div className="flex gap-2">
                      <Input
                        className="h-9 text-sm"
                        placeholder="e.g. Active listening, CRM platforms..."
                        value={form.skillInput}
                        onChange={e => setField("skillInput", e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" variant="outline" size="sm" className="h-9 px-3 flex-shrink-0" onClick={addSkill}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    {form.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {form.skills.map((s, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                            {s}
                            <button onClick={() => removeSkill(i)} className="ml-0.5 hover:text-emerald-500 transition-colors">
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <Button variant="outline" onClick={closeCreate}>Cancel</Button>
                  <Button className="flex-1" onClick={handleCreate} data-testid="submit-create-project-btn">
                    Create Project
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Submissions Panel ────────────────────────────────── */}
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
