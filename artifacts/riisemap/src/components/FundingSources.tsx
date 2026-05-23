/Users/batman/Downloads/ReplitExport-JonExume/Riise-Map-Admin/artifacts/riisemap/src/pages/FundingSources.tsx
import { useState } from "react";
import { ArrowLeft, DollarSign, Users, BookOpen, GitBranch, Calendar, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  fundingSources as initialFundingSources,
  learners,
  programs,
  pathways,
  FundingSource,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

type View = "list" | "detail" | "create" | "edit";

interface FormData {
  name: string;
  objectives: string;
  startDate: string;
  endDate: string;
  amount: string;
  learnerCount: string;
  associatedLearners: string[];
  associatedPrograms: string[];
  associatedPathways: string[];
}

const EMPTY_FORM: FormData = {
  name: "",
  objectives: "",
  startDate: "",
  endDate: "",
  amount: "",
  learnerCount: "",
  associatedLearners: [],
  associatedPrograms: [],
  associatedPathways: [],
};

export default function FundingSources() {
  const [fundingList, setFundingList] = useState<FundingSource[]>(initialFundingSources);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedFunding = fundingList.find(f => f.id === selectedId);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (view === "create") {
      const newFunding: FundingSource = {
        id: String(Date.now()),
        name: form.name,
        objectives: form.objectives || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        learnerCount: form.learnerCount ? parseInt(form.learnerCount) : undefined,
        createdAt: now,
        updatedAt: now,
        associatedLearners: form.associatedLearners,
        associatedPrograms: form.associatedPrograms,
        associatedPathways: form.associatedPathways,
      };
      setFundingList(prev => [...prev, newFunding]);
    } else if (view === "edit" && selectedFunding) {
      setFundingList(prev => prev.map(f => {
        if (f.id === selectedId) {
          return {
            ...f,
            name: form.name,
            objectives: form.objectives || undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            amount: form.amount ? parseFloat(form.amount) : undefined,
            learnerCount: form.learnerCount ? parseInt(form.learnerCount) : undefined,
            updatedAt: now,
            associatedLearners: form.associatedLearners,
            associatedPrograms: form.associatedPrograms,
            associatedPathways: form.associatedPathways,
          };
        }
        return f;
      }));
    }
    setShowModal(false);
    setView("list");
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleCreate = () => {
    setView("create");
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (id: string) => {
    const funding = fundingList.find(f => f.id === id);
    if (funding) {
      setView("edit");
      setSelectedId(id);
      setForm({
        name: funding.name,
        objectives: funding.objectives || "",
        startDate: funding.startDate || "",
        endDate: funding.endDate || "",
        amount: funding.amount ? String(funding.amount) : "",
        learnerCount: funding.learnerCount ? String(funding.learnerCount) : "",
        associatedLearners: funding.associatedLearners,
        associatedPrograms: funding.associatedPrograms,
        associatedPathways: funding.associatedPathways,
      });
      setShowModal(true);
    }
  };

  const handleDetail = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const toggleAssociation = (type: "associatedLearners" | "associatedPrograms" | "associatedPathways", id: string) => {
    setForm(prev => {
      const current = prev[type];
      if (current.includes(id)) {
        return { ...prev, [type]: current.filter(item => item !== id) };
      } else {
        return { ...prev, [type]: [...current, id] };
      }
    });
  };

  if (view === "detail" && selectedFunding) {
    const associatedLearners = learners.filter(l => selectedFunding.associatedLearners.includes(l.id));
    const associatedPrograms = programs.filter(p => selectedFunding.associatedPrograms.includes(p.id));
    const associatedPathways = pathways.filter(p => selectedFunding.associatedPathways.includes(p.id));

    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Funding Sources
        </button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{selectedFunding.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedFunding.objectives}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => handleEdit(selectedFunding.id)}>Edit</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Amount", value: selectedFunding.amount ? `$${selectedFunding.amount.toLocaleString()}` : "—", icon: DollarSign },
            { label: "Learner Count", value: selectedFunding.learnerCount || 0, icon: Users },
            { label: "Associated Learners", value: associatedLearners.length, icon: Users },
            { label: "Associated Programs", value: associatedPrograms.length, icon: BookOpen },
          ].map((m, i) => (
            <div key={i} className="bg-card border border-card-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <m.icon size={16} className="text-primary" />
                {m.value}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Funding Details</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{selectedFunding.startDate || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{selectedFunding.endDate || "—"}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Associated Pathways</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {associatedPathways.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pathways associated yet.</p>
              ) : associatedPathways.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{p.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-card-border md:col-span-2">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Associated Programs</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              {associatedPrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No programs associated yet.</p>
              ) : associatedPrograms.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{p.name}</span>
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
          <h1 className="text-2xl font-semibold text-foreground">Funding Sources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {fundingList.length} funding sources managing {fundingList.reduce((a, f) => a + (f.learnerCount || 0), 0)} learners
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus size={14} className="mr-1.5" /> Create Funding Source
        </Button>
      </div>
      <div className="space-y-4">
        {fundingList.map(f => (
          <Card key={f.id} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground mb-1">{f.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{f.objectives}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                        <DollarSign size={14} className="text-primary" />
                        {f.amount ? `$${f.amount.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Calendar size={14} className="text-primary" />
                        {f.startDate && f.endDate ? `${f.startDate} - ${f.endDate}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Learner Count</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                        <Users size={14} className="text-primary" />
                        {f.learnerCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Associated Learners</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                        <Users size={14} className="text-primary" />
                        {f.associatedLearners.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Associated Programs</p>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                        <BookOpen size={14} className="text-primary" />
                        {f.associatedPrograms.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => handleDetail(f.id)}>
                    View <ChevronRight size={12} className="ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => handleEdit(f.id)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {view === "create" ? "Create Funding Source" : "Edit Funding Source"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {view === "create" ? "Add a new funding source to the platform." : "Update an existing funding source."}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); setView("list"); setForm(EMPTY_FORM); setFormErrors({}); }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Name <span className="text-destructive">*</span></Label>
                  <Input
                    className={cn("mt-1.5 h-10 text-sm", formErrors.name && "border-destructive")}
                    placeholder="e.g. City Workforce Grant"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Objectives</Label>
                  <Textarea
                    className="mt-1.5 text-sm resize-none"
                    rows={3}
                    placeholder="Describe the funding source's goals and objectives..."
                    value={form.objectives}
                    onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      className="mt-1.5 h-10 text-sm"
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      className="mt-1.5 h-10 text-sm"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <Input
                      type="number"
                      className="mt-1.5 h-10 text-sm"
                      placeholder="e.g. 250000"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Number of Learners</Label>
                    <Input
                      type="number"
                      className="mt-1.5 h-10 text-sm"
                      placeholder="e.g. 22"
                      value={form.learnerCount}
                      onChange={e => setForm(f => ({ ...f, learnerCount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Associations */}
              <div className="border-t border-border pt-6 space-y-6">
                <div>
                  <Label className="text-sm font-medium">Associated Learners</Label>
                  <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {learners.map(learner => (
                      <label key={learner.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={form.associatedLearners.includes(learner.id)}
                          onChange={() => toggleAssociation("associatedLearners", learner.id)}
                          className="rounded border-border"
                        />
                        <span className="text-foreground">{learner.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Associated Programs</Label>
                  <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {programs.map(program => (
                      <label key={program.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={form.associatedPrograms.includes(program.id)}
                          onChange={() => toggleAssociation("associatedPrograms", program.id)}
                          className="rounded border-border"
                        />
                        <span className="text-foreground">{program.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Associated Pathways</Label>
                  <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {pathways.map(pathway => (
                      <label key={pathway.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={form.associatedPathways.includes(pathway.id)}
                          onChange={() => toggleAssociation("associatedPathways", pathway.id)}
                          className="rounded border-border"
                        />
                        <span className="text-foreground">{pathway.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowModal(false); setView("list"); setForm(EMPTY_FORM); setFormErrors({}); }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {view === "create" ? "Create Funding Source" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}