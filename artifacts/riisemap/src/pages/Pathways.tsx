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
import { useGetPathways, useCreatePathway, useUpdatePathway, type Pathway } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type View = "list" | "detail" | "add" | "edit";

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

const LIMITS = { name: 80, description: 300, targetProfile: 150, tag: 80, maxTags: 15 };
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
  const atLimit = items.length >= LIMITS.maxTags;
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5 mb-2">{hint}</p>}
      <div className="flex gap-2 mt-1.5">
        <Input
          value={inputValue}
          onChange={e => onInputChange(e.target.value.slice(0, LIMITS.tag))}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAdd())}
          placeholder={atLimit ? `Max ${LIMITS.maxTags} items reached` : placeholder}
          className="h-9 text-sm"
          disabled={atLimit}
          maxLength={LIMITS.tag}
        />
        <Button type="button" variant="outline" size="sm" className="h-9 px-3 flex-shrink-0" onClick={onAdd} disabled={atLimit}>
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex justify-between mt-1">
        <span />
        <span className="text-xs text-muted-foreground">{items.length}/{LIMITS.maxTags}</span>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: pathways = [], isLoading: pathwaysLoading } = useGetPathways();
  const createMutation = useCreatePathway({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/pathways'] }) } });
  const updateMutation = useUpdatePathway({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/pathways'] }) } });

  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(BLANK);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [skillInput, setSkillInput] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [criteriaInput, setCriteriaInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  if (pathwaysLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12"><p className="text-muted-foreground">Loading pathways...</p></div>
      </div>
    );
  }

  const pathway = pathways.find(p => p.id === selectedId);

  const set = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validateField = (field: keyof FormState) => {
    const value = form[field];
    let error = "";
    if (field === "name") {
      if (typeof value === "string" && !value.trim()) error = "Pathway name is required";
      else if (typeof value === "string" && value.trim().length > LIMITS.name) error = `Must be ${LIMITS.name} characters or less`;
    } else if (field === "description") {
      if (typeof value === "string" && !value.trim()) error = "Description is required";
      else if (typeof value === "string" && value.trim().length > LIMITS.description) error = `Must be ${LIMITS.description} characters or less`;
    } else if (field === "targetProfile") {
      if (typeof value === "string" && value.trim().length > LIMITS.targetProfile) error = `Must be ${LIMITS.targetProfile} characters or less`;
    }
    setErrors(e => ({ ...e, [field]: error }));
  };

  const addTag = (field: "skills" | "milestones" | "projects" | "readinessCriteria", val: string, setter: (v: string) => void) => {
    if (!val.trim() || form[field].length >= LIMITS.maxTags) return;
    setForm(f => ({ ...f, [field]: [...f[field], val.trim().slice(0, LIMITS.tag)] }));
    setter("");
  };

  const removeTag = (field: "skills" | "milestones" | "projects" | "readinessCriteria", i: number) =>
    setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const validateStep = () => {
    if (step === 0) {
      const e: typeof errors = {};
      if (!form.name.trim()) e.name = "Pathway name is required";
      else if (form.name.trim().length > LIMITS.name) e.name = `Must be ${LIMITS.name} characters or less`;
      if (!form.description.trim()) e.description = "Description is required";
      else if (form.description.trim().length > LIMITS.description) e.description = `Must be ${LIMITS.description} characters or less`;
      if (form.targetProfile.trim().length > LIMITS.targetProfile) e.targetProfile = `Must be ${LIMITS.targetProfile} characters or less`;
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    targetProfile: form.targetProfile.trim() || "Career changers and motivated learners",
    estimatedWeeks: parseInt(form.estimatedWeeks) || 16,
    activeLearners: 0,
    skills: form.skills,
    milestones: form.milestones,
    projects: form.projects,
    readinessCriteria: form.readinessCriteria,
  });

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({ data: buildPayload() });
      setSubmitted(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create pathway. Please try again.", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !validateStep()) return;
    try {
      await updateMutation.mutateAsync({ id: editingId, data: buildPayload() });
      toast({ title: "Pathway Updated", description: `${form.name} has been updated.` });
      setView("list");
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update pathway. Please try again.", variant: "destructive" });
    }
  };

  const openEdit = (p: Pathway) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      targetProfile: p.targetProfile,
      estimatedWeeks: String(p.estimatedWeeks),
      programCategory: "",
      skills: Array.isArray(p.skills) ? p.skills : [],
      milestones: Array.isArray(p.milestones) ? p.milestones : [],
      projects: Array.isArray(p.projects) ? p.projects : [],
      readinessCriteria: Array.isArray(p.readinessCriteria) ? p.readinessCriteria : [],
    });
    setStep(0);
    setErrors({});
    setView("edit");
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/api/pathways/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({ title: "Error", description: data?.error || "Failed to delete pathway.", variant: "destructive" });
        setDeleteTarget(null);
        setDeleteConfirmText("");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['/api/pathways'] });
      toast({ title: "Pathway Deleted", description: `${deleteTarget.name} has been removed.` });
      setView("list");
      setSelectedId(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete pathway.", variant: "destructive" });
    }
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  const resetForm = () => {
    setForm(BLANK);
    setStep(0);
    setSubmitted(false);
    setEditingId(null);
    setSkillInput(""); setMilestoneInput(""); setProjectInput(""); setCriteriaInput("");
    setErrors({});
  };

  /* ── Detail view ─────────────────────────────────────────── */
  if (view === "detail" && pathway) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <button onClick={() => { setView("list"); setSelectedId(null); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Pathways
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{pathway.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{pathway.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { openEdit(pathway); }}><Edit size={11} className="mr-1.5" />Edit Pathway</Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ id: pathway.id, name: pathway.name })}>
              <X size={11} className="mr-1.5" />Delete
            </Button>
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
          {[
            { title: "Key Skills", items: pathway.skills, icon: null, color: "" },
            { title: "Required Milestones", items: pathway.milestones, icon: CheckCircle2, color: "text-emerald-500" },
            { title: "Recommended Projects", items: pathway.projects, icon: null, color: "bg-primary" },
            { title: "Readiness Criteria", items: pathway.readinessCriteria, icon: CheckCircle2, color: "text-blue-500" },
          ].map(section => (
            <Card key={section.title} className="border-card-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm">{section.title}</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                {section.items.length > 0 ? section.items.map((item: string) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    {section.icon ? <section.icon size={13} className={section.color + " flex-shrink-0"} /> : <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                    <span className="text-foreground">{item}</span>
                  </div>
                )) : <p className="text-xs text-muted-foreground">None defined yet</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Delete Pathway</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete <span className="font-medium text-foreground">{deleteTarget.name}</span> and cannot be undone.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Type <span className="font-mono font-medium text-foreground">{deleteTarget.name}</span> to confirm:
              </p>
              <Input
                className="h-10 text-sm mb-4"
                placeholder="Type pathway name to confirm..."
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteConfirmText !== deleteTarget.name}
                  onClick={handleDelete}
                >
                  Delete Pathway
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Confirmation ──────────────────────────────────────────── */
  if (view === "add" && submitted) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <Check size={30} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Pathway Created</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            <span className="font-medium text-foreground">{form.name}</span> has been saved. You can now assign learners and configure milestones.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => { setView("list"); resetForm(); }}>Back to Pathways</Button>
            <Button className="flex-1" onClick={resetForm}>Add Another Pathway</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Add / Edit form ─────────────────────────────────────── */
  if (view === "add" || view === "edit") {
    const isEdit = view === "edit";
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button onClick={() => { setView("list"); resetForm(); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Pathways
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">{isEdit ? "Edit Pathway" : "Add Career Pathway"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isEdit ? "Update this pathway's details" : "Define a new pathway for learners to follow toward a tech career"}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <Card className="border-card-border shadow-sm">
          <CardContent className="p-6">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-foreground">Pathway Name <span className="text-destructive">*</span></Label>
                  <Input
                    className={`mt-1.5 h-10 text-sm ${errors.name ? "border-destructive" : ""}`}
                    placeholder="e.g. Cloud Operations Specialist"
                    maxLength={LIMITS.name}
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    onBlur={() => validateField("name")}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : <span />}
                    <span className="text-xs text-muted-foreground">{form.name.length}/{LIMITS.name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    className={`mt-1.5 text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                    rows={3}
                    maxLength={LIMITS.description}
                    placeholder="Describe what learners will gain from this pathway..."
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    onBlur={() => validateField("description")}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description ? <p className="text-xs text-destructive">{errors.description}</p> : <span />}
                    <span className="text-xs text-muted-foreground">{form.description.length}/{LIMITS.description}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Target Learner Profile</Label>
                  <Input
                    className={`mt-1.5 h-10 text-sm ${errors.targetProfile ? "border-destructive" : ""}`}
                    placeholder="e.g. Career changers with customer-facing experience"
                    maxLength={LIMITS.targetProfile}
                    value={form.targetProfile}
                    onChange={e => set("targetProfile", e.target.value)}
                    onBlur={() => validateField("targetProfile")}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.targetProfile ? <p className="text-xs text-destructive">{errors.targetProfile}</p> : <span />}
                    <span className="text-xs text-muted-foreground">{form.targetProfile.length}/{LIMITS.targetProfile}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Estimated Duration</Label>
                    <Select value={form.estimatedWeeks} onValueChange={v => set("estimatedWeeks", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm"><SelectValue placeholder="Select weeks..." /></SelectTrigger>
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
                      <SelectTrigger className="mt-1.5 h-10 text-sm"><SelectValue placeholder="Select program..." /></SelectTrigger>
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

            {step === 1 && (
              <div className="space-y-6">
                <TagInput label="Key Skills" hint="Skills learners will develop. Press Enter or click + to add." items={form.skills} inputValue={skillInput} onInputChange={setSkillInput} onAdd={() => addTag("skills", skillInput, setSkillInput)} onRemove={i => removeTag("skills", i)} placeholder="e.g. CRM platforms, Python basics..." />
                <div className="border-t border-border pt-5">
                  <TagInput label="Required Milestones" hint="Key checkpoints a learner must complete." items={form.milestones} inputValue={milestoneInput} onInputChange={setMilestoneInput} onAdd={() => addTag("milestones", milestoneInput, setMilestoneInput)} onRemove={i => removeTag("milestones", i)} placeholder="e.g. Career readiness assessment..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <TagInput label="Recommended Projects" hint="Applied learning projects that demonstrate skill mastery." items={form.projects} inputValue={projectInput} onInputChange={setProjectInput} onAdd={() => addTag("projects", projectInput, setProjectInput)} onRemove={i => removeTag("projects", i)} placeholder="e.g. Customer Onboarding Simulation..." />
                <div className="border-t border-border pt-5">
                  <TagInput label="Readiness Criteria" hint="Conditions a learner must meet before placement." items={form.readinessCriteria} inputValue={criteriaInput} onInputChange={setCriteriaInput} onAdd={() => addTag("readinessCriteria", criteriaInput, setCriteriaInput)} onRemove={i => removeTag("readinessCriteria", i)} placeholder="e.g. Resume reviewed by coach..." />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-5">
          {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={isEdit ? handleUpdate : handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? "Save Changes" : "Create Pathway"}
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
        <Button size="sm" onClick={() => { resetForm(); setView("add"); }}>
          <Plus size={13} className="mr-1.5" /> Add Pathway
        </Button>
      </div>
      {pathways.length === 0 ? (
        <Card className="border-card-border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Pathways Yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Create your first career pathway to define the skills, milestones, and projects learners need to become job-ready.
            </p>
            <Button size="sm" onClick={() => { resetForm(); setView("add"); }}>
              <Plus size={13} className="mr-1.5" /> Create Your First Pathway
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pathways.map(p => (
          <Card key={p.id} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-base font-semibold text-foreground">{p.name}</h2>
                {p.activeLearners === 0 && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-2 flex-shrink-0">New</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users size={12} className="text-primary" />{p.activeLearners} learners</span>
                <span className="flex items-center gap-1"><Clock size={12} />{p.estimatedWeeks} weeks</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.skills.slice(0, 3).map(s => (
                  <span key={s} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {p.skills.length > 3 && <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{p.skills.length - 3} more</span>}
                {p.skills.length === 0 && <span className="text-[11px] text-muted-foreground italic">No skills added yet</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7 px-3" onClick={() => { setSelectedId(p.id); setView("detail"); }}>
                  View Details <ChevronRight size={11} className="ml-1" />
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-3" onClick={() => openEdit(p)}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Pathway</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete <span className="font-medium text-foreground">{deleteTarget.name}</span> and cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Type <span className="font-mono font-medium text-foreground">{deleteTarget.name}</span> to confirm:
            </p>
            <Input
              className="h-10 text-sm mb-4"
              placeholder="Type pathway name to confirm..."
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteConfirmText !== deleteTarget.name}
                onClick={handleDelete}
              >
                Delete Pathway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
