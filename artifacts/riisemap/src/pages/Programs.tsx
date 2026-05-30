import { useState } from "react";
import { ArrowLeft, Users, TrendingUp, Calendar, Star, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useGetPrograms, useGetLearners, useCreateProgram, type Program, type Learner } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  description: "",
  pathwayCategory: "",
  cohort: "",
  startDate: "",
  endDate: "",
  funderTag: "",
  pathways: "",
};

export default function Programs() {
  const queryClient = useQueryClient();
  const { data: programData, isLoading: programsLoading } = useGetPrograms();
  const { data: learners = [] } = useGetLearners();
  const createProgramMutation = useCreateProgram({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      },
    },
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const programList = Array.isArray(programData) ? programData : [];
  const program = programList.find(p => p.id === selected);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Program name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.cohort.trim()) errs.cohort = "Cohort name is required";
    if (!form.startDate.trim()) errs.startDate = "Start date is required";
    if (!form.endDate.trim()) errs.endDate = "End date is required";
    if (!form.funderTag.trim()) errs.funderTag = "Funder is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    await createProgramMutation.mutateAsync({
      data: {
        ...form,
        // These are placeholders and should be calculated or fetched
        activeLearners: 0,
        completionRate: 0,
        readinessScore: 0,
        eventParticipation: 0,
        placementReady: 0,
        pathways: form.pathways.split(",").map(p => p.trim()).filter(p => p),
      },
    });

    setShowCreate(false);
    setForm(emptyForm);
  };

  if (programsLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

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
              {program.pathways.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pathways assigned yet.</p>
              ) : program.pathways.map(p => (
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
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {l.photo
                        ? <img src={l.photo} alt={l.name} className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-primary">{l.name.split(" ").map(n => n[0]).join("")}</span>
                      }
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
          <p className="text-sm text-muted-foreground mt-0.5">{programList.length} programs across Atlanta Workforce Tech Alliance</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} data-testid="create-program-btn">
          <Plus size={14} className="mr-1.5" /> Create Program
        </Button>
      </div>

      <div className="space-y-4">
        {programList.map(p => (
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

      {/* Create Program Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowCreate(false)}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create Program</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a new workforce program to the platform.</p>
              </div>
              <button onClick={() => { setShowCreate(false); setFormErrors({}); setForm(emptyForm); }} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <Label className="text-sm font-medium">Program name</Label>
                <Input
                  className={cn("mt-1.5 h-10 text-sm", formErrors.name && "border-destructive")}
                  placeholder="e.g. Cloud Operations Starter"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  className={cn("mt-1.5 text-sm resize-none", formErrors.description && "border-destructive")}
                  rows={3}
                  placeholder="Describe the program's goals, structure, and target learner..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                {formErrors.description && <p className="text-xs text-destructive mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cohort name</Label>
                  <Input
                    className={cn("mt-1.5 h-10 text-sm", formErrors.cohort && "border-destructive")}
                    placeholder="e.g. Summer 2025"
                    value={form.cohort}
                    onChange={e => setForm(f => ({ ...f, cohort: e.target.value }))}
                  />
                  {formErrors.cohort && <p className="text-xs text-destructive mt-1">{formErrors.cohort}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Funder / sponsor</Label>
                  <Input
                    className={cn("mt-1.5 h-10 text-sm", formErrors.funderTag && "border-destructive")}
                    placeholder="e.g. City Workforce Grant"
                    value={form.funderTag}
                    onChange={e => setForm(f => ({ ...f, funderTag: e.target.value }))}
                  />
                  {formErrors.funderTag && <p className="text-xs text-destructive mt-1">{formErrors.funderTag}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Start date</Label>
                  <Input
                    type="date"
                    className={cn("mt-1.5 h-10 text-sm", formErrors.startDate && "border-destructive")}
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                  {formErrors.startDate && <p className="text-xs text-destructive mt-1">{formErrors.startDate}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">End date</Label>
                  <Input
                    type="date"
                    className={cn("mt-1.5 h-10 text-sm", formErrors.endDate && "border-destructive")}
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                  {formErrors.endDate && <p className="text-xs text-destructive mt-1">{formErrors.endDate}</p>}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Linked pathways</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Separate multiple pathways with commas.</p>
                <Input
                  className="h-10 text-sm"
                  placeholder="e.g. Customer Success Associate, IT Support Specialist"
                  value={form.pathways}
                  onChange={e => setForm(f => ({ ...f, pathways: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setForm(emptyForm); setFormErrors({}); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreate} data-testid="submit-program-btn">
                Create Program
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
