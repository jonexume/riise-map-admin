import { useState } from "react";
import {
  Users, Clock, ChevronRight, ArrowLeft, CheckCircle2,
  Edit, Plus, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetPathways, type Pathway } from "@workspace/api-client-react";

type View = "list" | "detail" | "add";

interface PathwayData {
  id: string;
  name: string;
  description: string;
  targetProfile: string;
  estimatedWeeks: number;
  activeLearners: number;
  skills: string[];
  milestones: string[];
  projects: string[];
  readinessCriteria: string[];
}

interface FormState {
  name: string;
  description: string;
  targetProfile: string;
  estimatedWeeks: string;
  programCategory: string;
  skills: string[];
  milestones: string[];
  projects: string[];
  readinessCriteria: string[];
}

const BLANK: FormState = {
  name: "",
  description: "",
  targetProfile: "",
  estimatedWeeks: "",
  programCategory: "",
  skills: [],
  milestones: [],
  projects: [],
  readinessCriteria: [],
};

const STEPS = ["Pathway Basics", "Skills & Milestones", "Projects & Criteria"];

function TagInput({
  label,
  hint,
  items,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  hint?: string;
  items: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5 mb-2">{hint}</p>}
      <div className="flex gap-2 mt-1.5">
        <Input
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAdd())}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
        <Button type="button" variant="outline" size="sm" className="h-9 px-3 flex-shrink-0" onClick={onAdd}>
          <Plus size={14} />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/15 px-2.5 py-1 rounded-full">
              {item}
              <button onClick={() => onRemove(i)} className="ml-0.5 hover:text-primary/60 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pathways() {
  const { data: pathways = [], isLoading: pathwaysLoading } = useGetPathways();
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(BLANK);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [skillInput, setSkillInput] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [criteriaInput, setCriteriaInput] = useState("");

  if (pathwaysLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading pathways...</p>
        </div>
      </div>
    );
  }

  const pathway = pathways.find(p => p.id === selectedId);

  const set = (field: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const addTag = (field: "skills" | "milestones" | "projects" | "readinessCriteria", val: string, setter: (v: string) => void) => {
    if (!val.trim()) return;
    setForm(f => ({ ...f, [field]: [...f[field], val.trim()] }));
    setter("");
  };

  const removeTag = (field: "skills" | "milestones" | "projects" | "readinessCriteria", i: number) =>
    setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const validateStep = () => {
    if (step === 0) {
      const e: typeof errors = {};
      if (!form.name.trim()) e.name = "Pathway name is required";
      if (!form.description.trim()) e.description = "Description is required";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = () => {
    const newP: PathwayData = {
      id: String(Date.now()),
      name: form.name,
      description: form.description,
      targetProfile: form.targetProfile || "Career changers and motivated learners",
      estimatedWeeks: parseInt(form.estimatedWeeks) || 16,
      activeLearners: 0,
      skills: form.skills,
      milestones: form.milestones,
      projects: form.projects,
      readinessCriteria: form.readinessCriteria,
    };
    setPathways(prev => [...prev, newP]);
    setSubmitted(true);
  };

  const resetAdd = () => {
    setForm(BLANK);
    setStep(0);
    setSubmitted(false);
    setSkillInput(""); setMilestoneInput(""); setProjectInput(""); setCriteriaInput("");
    setErrors({});
  };

  /* ── Detail view ─────────────────────────────────────────── */
  if (view === "detail" && pathway) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <button
          onClick={() => { setView("list"); setSelectedId(null); }}
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
              {pathway.skills.length > 0
                ? pathway.skills.map(s => (
                    <span key={s} className="text-xs bg-primary/8 text-primary border border-primary/15 px-2.5 py-1 rounded-full">{s}</span>
                  ))
                : <p className="text-xs text-muted-foreground">No skills defined yet</p>
              }
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Required Milestones</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.milestones.length > 0
                ? pathway.milestones.map(m => (
                    <div key={m} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-foreground">{m}</span>
                    </div>
                  ))
                : <p className="text-xs text-muted-foreground">No milestones defined yet</p>
              }
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Recommended Projects</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.projects.length > 0
                ? pathway.projects.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-foreground">{p}</span>
                    </div>
                  ))
                : <p className="text-xs text-muted-foreground">No projects defined yet</p>
              }
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Readiness Criteria</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {pathway.readinessCriteria.length > 0
                ? pathway.readinessCriteria.map(r => (
                    <div key={r} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
                      <span className="text-foreground">{r}</span>
                    </div>
                  ))
                : <p className="text-xs text-muted-foreground">No readiness criteria defined yet</p>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Add Pathway — Confirmation ──────────────────────────── */
  if (view === "add" && submitted) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <Check size={30} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Pathway created</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            <span className="font-medium text-foreground">{form.name}</span> has been added to your career pathways. You can now assign learners and configure milestones.
          </p>

          <div className="w-full bg-muted/40 border border-border rounded-xl p-5 text-left mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pathway name</span>
              <span className="font-medium text-foreground">{form.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">{form.estimatedWeeks || "16"} weeks</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Skills defined</span>
              <span className="font-medium text-foreground">{form.skills.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Milestones</span>
              <span className="font-medium text-foreground">{form.milestones.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium text-foreground">{form.projects.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Learners</span>
              <span className="font-medium text-foreground">0 (newly created)</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => {
              setView("list");
              resetAdd();
            }}>
              Back to Pathways
            </Button>
            <Button className="flex-1" onClick={() => {
              resetAdd();
            }}>
              Add Another Pathway
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Add Pathway — Multi-step form ───────────────────────── */
  if (view === "add") {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => { setView("list"); resetAdd(); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Pathways
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Add Career Pathway</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define a new pathway for learners to follow toward a tech career</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step ? "bg-primary text-primary-foreground" :
                  i === step ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-card-border shadow-sm">
          <CardContent className="p-6">

            {/* Step 1 — Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-foreground">Pathway Name <span className="text-destructive">*</span></Label>
                  <Input
                    className={`mt-1.5 h-10 text-sm ${errors.name ? "border-destructive" : ""}`}
                    placeholder="e.g. Cloud Operations Specialist"
                    value={form.name}
                    onChange={e => { set("name", e.target.value); setErrors(er => ({ ...er, name: "" })); }}
                    data-testid="pathway-name-input"
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    className={`mt-1.5 text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                    rows={3}
                    placeholder="Describe what learners will gain from this pathway and what roles it prepares them for..."
                    value={form.description}
                    onChange={e => { set("description", e.target.value); setErrors(er => ({ ...er, description: "" })); }}
                    data-testid="pathway-description-input"
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Target Learner Profile</Label>
                  <Input
                    className="mt-1.5 h-10 text-sm"
                    placeholder="e.g. Career changers with customer-facing experience"
                    value={form.targetProfile}
                    onChange={e => set("targetProfile", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Estimated Duration</Label>
                    <Select value={form.estimatedWeeks} onValueChange={v => set("estimatedWeeks", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue placeholder="Select weeks..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[8, 10, 12, 14, 16, 18, 20, 22, 24].map(w => (
                          <SelectItem key={w} value={String(w)}>{w} weeks</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Associated Program</Label>
                    <Select value={form.programCategory} onValueChange={v => set("programCategory", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue placeholder="Select program..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Tech Career Launch</SelectItem>
                        <SelectItem value="cs">Customer Success Accelerator</SelectItem>
                        <SelectItem value="data">Data Operations Starter</SelectItem>
                        <SelectItem value="standalone">Standalone Pathway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Skills & Milestones */}
            {step === 1 && (
              <div className="space-y-6">
                <TagInput
                  label="Key Skills"
                  hint="Skills learners will develop. Press Enter or click + to add each one."
                  items={form.skills}
                  inputValue={skillInput}
                  onInputChange={setSkillInput}
                  onAdd={() => addTag("skills", skillInput, setSkillInput)}
                  onRemove={i => removeTag("skills", i)}
                  placeholder="e.g. CRM platforms, Python basics..."
                />

                <div className="border-t border-border pt-5">
                  <TagInput
                    label="Required Milestones"
                    hint="Key checkpoints a learner must complete to progress through this pathway."
                    items={form.milestones}
                    inputValue={milestoneInput}
                    onInputChange={setMilestoneInput}
                    onAdd={() => addTag("milestones", milestoneInput, setMilestoneInput)}
                    onRemove={i => removeTag("milestones", i)}
                    placeholder="e.g. Career readiness assessment, Resume review..."
                  />
                </div>
              </div>
            )}

            {/* Step 3 — Projects & Readiness Criteria */}
            {step === 2 && (
              <div className="space-y-6">
                <TagInput
                  label="Recommended Projects"
                  hint="Applied learning projects that demonstrate skill mastery for this pathway."
                  items={form.projects}
                  inputValue={projectInput}
                  onInputChange={setProjectInput}
                  onAdd={() => addTag("projects", projectInput, setProjectInput)}
                  onRemove={i => removeTag("projects", i)}
                  placeholder="e.g. Customer Onboarding Simulation..."
                />

                <div className="border-t border-border pt-5">
                  <TagInput
                    label="Readiness Criteria"
                    hint="Conditions a learner must meet before they are considered placement-ready."
                    items={form.readinessCriteria}
                    inputValue={criteriaInput}
                    onInputChange={setCriteriaInput}
                    onAdd={() => addTag("readinessCriteria", criteriaInput, setCriteriaInput)}
                    onRemove={i => removeTag("readinessCriteria", i)}
                    placeholder="e.g. Resume reviewed by coach, Mock interview attended..."
                  />
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Review Summary</p>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium text-foreground">{form.name || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">{form.estimatedWeeks ? `${form.estimatedWeeks} weeks` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="font-medium text-foreground">{form.skills.length} added</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="font-medium text-foreground">{form.milestones.length} added</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium text-foreground">{form.projects.length} added</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Readiness criteria</span>
                      <span className="font-medium text-foreground">{form.readinessCriteria.length} added</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <Button onClick={next} data-testid="pathway-next-btn">
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} data-testid="pathway-submit-btn">
              Create Pathway
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ── List view ───────────────────────────────────────────── */
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Career Pathways</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pathways.length} pathways guiding {pathways.reduce((a, p) => a + p.activeLearners, 0)} learners toward tech careers
          </p>
        </div>
        <Button size="sm" onClick={() => { resetAdd(); setView("add"); }} data-testid="add-pathway-btn">
          <Plus size={13} className="mr-1.5" /> Add Pathway
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pathways.map(p => (
          <Card key={p.id} data-testid={`pathway-card-${p.id}`} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
                {p.activeLearners === 0 && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-2 flex-shrink-0">New</span>
                )}
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
                {p.skills.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic">No skills added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm" className="text-xs h-7 px-3"
                  onClick={() => { setSelectedId(p.id); setView("detail"); }}
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
