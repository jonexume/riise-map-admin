import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, DollarSign, Calendar, Users, ChevronRight, Plus, X, Check, Circle, Loader2, Trash2, Edit, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetFundingSources, useCreateFundingSource, useUpdateFundingSource, type FundingSource } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Goal {
  id: number;
  fundingSourceId: number;
  title: string;
  note: string | null;
  status: string;
  documentFileName: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", icon: Circle, color: "text-muted-foreground" },
  { value: "in_progress", label: "In Progress", icon: Loader2, color: "text-amber-500" },
  { value: "completed", label: "Completed", icon: Check, color: "text-emerald-500" },
];

const emptyForm = {
  name: "",
  objectives: "",
  narrative: "",
  startDate: "",
  endDate: "",
  amount: "",
  learnerCount: "",
};

export default function FundingSources() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: sources = [], isLoading } = useGetFundingSources();
  const createMutation = useCreateFundingSource({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/funding-sources"] }) } });
  const updateMutation = useUpdateFundingSource({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/funding-sources"] }) } });

  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingSource, setEditingSource] = useState<FundingSource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editGoalForm, setEditGoalForm] = useState({ title: "", note: "", status: "" });
  // Narrative state
  const [narrativeText, setNarrativeText] = useState("");
  const [narrativeDirty, setNarrativeDirty] = useState(false);
  const [narrativeFileName, setNarrativeFileName] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const fetchGoals = useCallback(async (fundingSourceId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/funding-sources/${fundingSourceId}/goals`);
      if (res.ok) setGoals(await res.json());
    } catch { /* ignore */ }
  }, [baseUrl]);

  useEffect(() => {
    if (selected) {
      fetchGoals(selected);
      const s = sources.find((x: FundingSource) => x.id === selected);
      setNarrativeText((s as any)?.narrative || "");
      setNarrativeFileName((s as any)?.narrativeFileName || null);
      setNarrativeDirty(false);
    }
  }, [selected, sources, fetchGoals]);

  const source = sources.find((s: FundingSource) => s.id === selected);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length > 150) errs.name = "Must be 150 characters or less";
    if (form.objectives.length > 1000) errs.objectives = "Must be 1000 characters or less";
    if (form.amount && isNaN(Number(form.amount))) errs.amount = "Must be a valid number";
    if (form.learnerCount && isNaN(Number(form.learnerCount))) errs.learnerCount = "Must be a valid number";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await createMutation.mutateAsync({
        data: {
          name: form.name.trim(),
          objectives: form.objectives.trim() || null,
          narrative: form.narrative.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          amount: form.amount ? Number(form.amount) : null,
          learnerCount: form.learnerCount ? Number(form.learnerCount) : null,
        },
      });
      toast({ title: "Funding Source Created", description: `${form.name} has been added.` });
      setShowCreate(false);
      setForm(emptyForm);
      setFormErrors({});
    } catch {
      toast({ title: "Error", description: "Failed to create funding source.", variant: "destructive" });
    }
  };

  const openEdit = (s: FundingSource) => {
    setEditingSource(s);
    setForm({
      name: s.name,
      objectives: s.objectives || "",
      narrative: (s as any).narrative || "",
      startDate: s.startDate || "",
      endDate: s.endDate || "",
      amount: s.amount != null ? String(s.amount) : "",
      learnerCount: s.learnerCount != null ? String(s.learnerCount) : "",
    });
    setFormErrors({});
  };

  const handleEdit = async () => {
    if (!validateForm() || !editingSource) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSource.id,
        data: {
          name: form.name.trim(),
          objectives: form.objectives.trim() || null,
          narrative: form.narrative.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          amount: form.amount ? Number(form.amount) : null,
          learnerCount: form.learnerCount ? Number(form.learnerCount) : null,
        },
      });
      toast({ title: "Funding Source Updated", description: `${form.name} has been updated.` });
      setEditingSource(null);
      setForm(emptyForm);
      setFormErrors({});
    } catch {
      toast({ title: "Error", description: "Failed to update funding source.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/api/funding-sources/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({ title: "Error", description: data?.error || "Failed to delete funding source.", variant: "destructive" });
        setDeleteTarget(null);
        setDeleteConfirmText("");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/funding-sources"] });
      toast({ title: "Funding Source Deleted", description: `${deleteTarget.name} has been removed.` });
      setSelected(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete funding source.", variant: "destructive" });
    }
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12"><p className="text-muted-foreground">Loading funding sources...</p></div>
      </div>
    );
  }

  /* ── Detail view ─────────────────────────────────────────── */
  if (selected && source) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Funding Sources
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{source.name}</h1>
            {source.objectives && <p className="text-sm text-muted-foreground mt-1">{source.objectives}</p>}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { openEdit(source); setSelected(null); }}>Edit</Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ id: source.id, name: source.name })}>Delete</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-semibold text-foreground">{source.amount != null ? `$${Number(source.amount).toLocaleString()}` : "—"}</p>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Learner Count</p>
            <p className="text-2xl font-semibold text-foreground">{source.learnerCount ?? "—"}</p>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground mt-1">{source.startDate || "—"}</p>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-medium text-foreground mt-1">{source.endDate || "—"}</p>
          </div>
        </div>

        {/* Grant Narrative */}
        <Card className="border-card-border mb-5">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Grant Narrative</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Textarea
              className="text-sm resize-none min-h-[120px]"
              placeholder="Enter the grant narrative text here..."
              value={narrativeText}
              onChange={e => { setNarrativeText(e.target.value); setNarrativeDirty(true); }}
            />
            {narrativeDirty && (
              <Button
                size="sm"
                className="mt-3 text-xs h-8"
                onClick={async () => {
                  try {
                    await updateMutation.mutateAsync({ id: source.id, data: { narrative: narrativeText.trim() || null } });
                    setNarrativeDirty(false);
                    toast({ title: "Saved", description: "Narrative updated." });
                  } catch {
                    toast({ title: "Error", description: "Failed to save narrative.", variant: "destructive" });
                  }
                }}
              >
                Save Narrative
              </Button>
            )}

            {/* Narrative file attachment */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Narrative Document</p>
              {narrativeFileName ? (
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{narrativeFileName}</span>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2 ml-auto" onClick={() => {
                    window.open(`${baseUrl}/api/funding-sources/${source.id}/narrative-file`, "_blank");
                  }}>Download</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2 text-destructive hover:text-destructive" onClick={async () => {
                    await fetch(`${baseUrl}/api/funding-sources/${source.id}/narrative-file`, { method: "DELETE" });
                    setNarrativeFileName(null);
                    await queryClient.invalidateQueries({ queryKey: ["/api/funding-sources"] });
                    toast({ title: "Removed", description: "Narrative file removed." });
                  }}>Remove</Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip size={14} />
                  <span>Attach PDF or Word document (max 5MB)</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { toast({ title: "Error", description: "File must be under 5MB.", variant: "destructive" }); return; }
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = (reader.result as string).split(",")[1];
                      try {
                        const res = await fetch(`${baseUrl}/api/funding-sources/${source.id}/narrative-file`, {
                          method: "PUT", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ fileName: file.name, fileData: base64 }),
                        });
                        if (!res.ok) { const d = await res.json().catch(() => null); toast({ title: "Error", description: d?.error || "Upload failed.", variant: "destructive" }); return; }
                        setNarrativeFileName(file.name);
                        await queryClient.invalidateQueries({ queryKey: ["/api/funding-sources"] });
                        toast({ title: "Uploaded", description: `${file.name} attached.` });
                      } catch { toast({ title: "Error", description: "Upload failed.", variant: "destructive" }); }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="border-card-border mb-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Grant Goals</CardTitle>
              <span className="text-xs text-muted-foreground">{goals.filter(g => g.status === "completed").length}/{goals.length} completed</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {goals.map(goal => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === goal.status) || STATUS_OPTIONS[0];
              const StatusIcon = statusInfo.icon;

              if (editingGoal?.id === goal.id) {
                return (
                  <div key={goal.id} className="border border-border rounded-lg p-3 space-y-2">
                    <Input className="h-9 text-sm" value={editGoalForm.title} onChange={e => setEditGoalForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" />
                    <Textarea className="text-sm resize-none" rows={2} value={editGoalForm.note} onChange={e => setEditGoalForm(f => ({ ...f, note: e.target.value }))} placeholder="Note..." />
                    <Select value={editGoalForm.status} onValueChange={v => setEditGoalForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger className="h-9 text-sm w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs h-7" onClick={async () => {
                        try {
                          await fetch(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editGoalForm) });
                          setEditingGoal(null);
                          fetchGoals(selected!);
                        } catch { toast({ title: "Error", description: "Failed to update goal.", variant: "destructive" }); }
                      }}>Save</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setEditingGoal(null)}>Cancel</Button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={goal.id} className="flex items-start gap-3 border border-border rounded-lg p-3 group">
                  <button
                    className="mt-0.5 flex-shrink-0"
                    onClick={async () => {
                      const next = goal.status === "completed" ? "not_started" : "completed";
                      await fetch(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: goal.title, note: goal.note, status: next }) });
                      fetchGoals(selected!);
                    }}
                  >
                    <StatusIcon size={16} className={statusInfo.color} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", goal.status === "completed" && "line-through text-muted-foreground")}>{goal.title}</p>
                    {goal.note && <p className="text-xs text-muted-foreground mt-0.5">{goal.note}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn("text-[10px] font-medium", statusInfo.color)}>{statusInfo.label}</span>
                      {goal.documentFileName ? (
                        <span className="flex items-center gap-1 text-[10px] text-primary">
                          <Paperclip size={10} />
                          <button className="hover:underline" onClick={() => window.open(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}/document`, "_blank")}>{goal.documentFileName}</button>
                          <button className="text-destructive ml-1 hover:text-destructive/70" onClick={async () => {
                            await fetch(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}/document`, { method: "DELETE" });
                            fetchGoals(selected!);
                          }}><X size={10} /></button>
                        </span>
                      ) : (
                        <label className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                          <Paperclip size={10} />
                          <span>Attach</span>
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { toast({ title: "Error", description: "File must be under 5MB.", variant: "destructive" }); return; }
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const base64 = (reader.result as string).split(",")[1];
                              await fetch(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}/document`, {
                                method: "PUT", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ fileName: file.name, fileData: base64 }),
                              });
                              fetchGoals(selected!);
                            };
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-muted rounded" onClick={() => { setEditingGoal(goal); setEditGoalForm({ title: goal.title, note: goal.note || "", status: goal.status }); }}><Edit size={12} /></button>
                    <button className="p-1 hover:bg-muted rounded text-destructive" onClick={async () => {
                      await fetch(`${baseUrl}/api/funding-sources/${selected}/goals/${goal.id}`, { method: "DELETE" });
                      fetchGoals(selected!);
                    }}><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}

            {/* Add goal inline */}
            <div className="flex gap-2">
              <Input
                className="h-9 text-sm flex-1"
                placeholder="Add a new goal..."
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newGoalTitle.trim()) {
                    e.preventDefault();
                    (async () => {
                      await fetch(`${baseUrl}/api/funding-sources/${selected}/goals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newGoalTitle.trim() }) });
                      setNewGoalTitle("");
                      fetchGoals(selected!);
                    })();
                  }
                }}
              />
              <Button variant="outline" size="sm" className="h-9 px-3" disabled={!newGoalTitle.trim()} onClick={async () => {
                await fetch(`${baseUrl}/api/funding-sources/${selected}/goals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newGoalTitle.trim() }) });
                setNewGoalTitle("");
                fetchGoals(selected!);
              }}><Plus size={14} /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Delete Funding Source</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete <span className="font-medium text-foreground">{deleteTarget.name}</span> and cannot be undone.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Type <span className="font-mono font-medium text-foreground">{deleteTarget.name}</span> to confirm:
              </p>
              <Input className="h-10 text-sm mb-4" placeholder="Type name to confirm..." value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} autoFocus />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>Cancel</Button>
                <Button variant="destructive" className="flex-1" disabled={deleteConfirmText !== deleteTarget.name} onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Form modal (shared for create/edit) ─────────────────── */
  const formModal = (showCreate || editingSource) && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{editingSource ? "Edit Funding Source" : "Add Funding Source"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{editingSource ? "Update funding source details." : "Add a new funding source to track grants and budgets."}</p>
          </div>
          <button onClick={() => { setShowCreate(false); setEditingSource(null); setForm(emptyForm); setFormErrors({}); }} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <Label className="text-sm font-medium">Name <span className="text-destructive">*</span></Label>
            <Input
              className={cn("mt-1.5 h-10 text-sm", formErrors.name && "border-destructive")}
              placeholder="e.g. City Workforce Development Grant"
              maxLength={150}
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: "" })); }}
            />
            {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">Objectives</Label>
            <Textarea
              className={cn("mt-1.5 text-sm resize-none", formErrors.objectives && "border-destructive")}
              rows={3}
              maxLength={1000}
              placeholder="Describe the goals and objectives of this funding..."
              value={form.objectives}
              onChange={e => { setForm(f => ({ ...f, objectives: e.target.value })); setFormErrors(er => ({ ...er, objectives: "" })); }}
            />
            <div className="flex justify-end mt-1"><span className="text-xs text-muted-foreground">{form.objectives.length}/1000</span></div>
          </div>

          <div>
            <Label className="text-sm font-medium">Grant Narrative</Label>
            <Textarea
              className="mt-1.5 text-sm resize-none"
              rows={4}
              placeholder="Enter the full grant narrative text..."
              value={form.narrative}
              onChange={e => setForm(f => ({ ...f, narrative: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Amount ($)</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.amount && "border-destructive")}
                placeholder="e.g. 250000"
                value={form.amount}
                onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setFormErrors(er => ({ ...er, amount: "" })); }}
              />
              {formErrors.amount && <p className="text-xs text-destructive mt-1">{formErrors.amount}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Learner Count</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.learnerCount && "border-destructive")}
                placeholder="e.g. 50"
                value={form.learnerCount}
                onChange={e => { setForm(f => ({ ...f, learnerCount: e.target.value })); setFormErrors(er => ({ ...er, learnerCount: "" })); }}
              />
              {formErrors.learnerCount && <p className="text-xs text-destructive mt-1">{formErrors.learnerCount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <Input type="date" className="mt-1.5 h-10 text-sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm font-medium">End Date</Label>
              <Input type="date" className="mt-1.5 h-10 text-sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setEditingSource(null); setForm(emptyForm); setFormErrors({}); }}>Cancel</Button>
          <Button className="flex-1" onClick={editingSource ? handleEdit : handleCreate}>
            {editingSource ? "Save Changes" : "Create Funding Source"}
          </Button>
        </div>
      </div>
    </div>
  );

  /* ── List view ───────────────────────────────────────────── */
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Funding Sources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sources.length} funding source{sources.length !== 1 ? "s" : ""} tracking ${sources.reduce((a: number, s: FundingSource) => a + (Number(s.amount) || 0), 0).toLocaleString()} in total funding
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} className="mr-1.5" /> Add Funding Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card className="border-card-border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Funding Sources Yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Add your first funding source to track grants, budgets, and learner allocations.
            </p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={13} className="mr-1.5" /> Add Your First Funding Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sources.map((s: FundingSource) => (
            <Card key={s.id} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-foreground mb-1">{s.name}</h2>
                    {s.objectives && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{s.objectives}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                          <DollarSign size={14} className="text-primary" />
                          {s.amount != null ? Number(s.amount).toLocaleString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Learners</p>
                        <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                          <Users size={14} className="text-emerald-500" />
                          {s.learnerCount ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Calendar size={12} className="text-muted-foreground" />
                          {s.startDate || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Calendar size={12} className="text-muted-foreground" />
                          {s.endDate || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSelected(s.id)}>
                      View <ChevronRight size={12} className="ml-1" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openEdit(s)}>Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {formModal}

      {/* Delete Confirmation Modal */}
      {deleteTarget && !selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Funding Source</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete <span className="font-medium text-foreground">{deleteTarget.name}</span> and cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Type <span className="font-mono font-medium text-foreground">{deleteTarget.name}</span> to confirm:
            </p>
            <Input className="h-10 text-sm mb-4" placeholder="Type name to confirm..." value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} autoFocus />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={deleteConfirmText !== deleteTarget.name} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
