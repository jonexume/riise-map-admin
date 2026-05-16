import { useState } from "react";
import { Link } from "wouter";
import {
  UserPlus, Calendar, AlertTriangle, CheckCircle2,
  Users, X, Check, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { coaches as seedCoaches, learners } from "@/data/mockData";

type Coach = typeof seedCoaches[number];

interface AddForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
}

const BLANK: AddForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "Career Coach",
  specialization: "",
};

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>(seedCoaches);
  const [showAdd, setShowAdd]     = useState(false);
  const [addStep, setAddStep]     = useState<"form" | "confirm">("form");
  const [form, setForm]           = useState<AddForm>(BLANK);
  const [errors, setErrors]       = useState<Partial<Record<keyof AddForm, string>>>({});
  const [newCoachId, setNewCoachId] = useState("");

  const setField = (k: keyof AddForm, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim())     e.email     = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Please enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const id = String(Date.now());
    const newCoach: Coach = {
      id,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      role: form.role,
      email: form.email.trim(),
      learnersCount: 0,
      atRisk: 0,
      workload: "Healthy" as "Healthy" | "Near Capacity" | "At Capacity",
      upcomingCheckIns: 0,
      overdueCheckIns: 0,
      assignedLearners: [],
    };
    setCoaches(prev => [...prev, newCoach]);
    setNewCoachId(id);
    setAddStep("confirm");
  };

  const closeAdd = () => {
    setShowAdd(false);
    setTimeout(() => {
      setForm(BLANK);
      setErrors({});
      setAddStep("form");
      setNewCoachId("");
    }, 300);
  };

  const totalAtRisk = coaches.reduce((sum, c) => sum + c.atRisk, 0);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Coaches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {coaches.length} coaches supporting {learners.length} learners
          </p>
        </div>
        <Button size="sm" data-testid="add-coach-btn" onClick={() => { setAddStep("form"); setShowAdd(true); }}>
          <UserPlus size={14} className="mr-1.5" /> Add Coach
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {coaches.map(coach => {
          const isNew = coach.id === newCoachId;
          return (
            <Card
              key={coach.id}
              data-testid={`coach-card-${coach.id}`}
              className={`border-card-border shadow-sm ${isNew ? "ring-2 ring-primary/30" : ""}`}
            >
              <CardContent className="p-5">
                {isNew && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-3">
                    <Check size={12} /> Newly added
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {coach.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{coach.name}</p>
                      <p className="text-xs text-muted-foreground">{coach.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={coach.workload} />
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users size={12} />Assigned Learners
                    </span>
                    <span className="font-semibold text-foreground">{coach.learnersCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <AlertTriangle size={12} />At-Risk Learners
                    </span>
                    <span className={`font-semibold ${coach.atRisk > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {coach.atRisk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={12} />Upcoming Check-ins
                    </span>
                    <span className="font-semibold text-foreground">{coach.upcomingCheckIns}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 size={12} />Overdue Check-ins
                    </span>
                    <span className={`font-semibold ${coach.overdueCheckIns > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {coach.overdueCheckIns}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Caseload</p>
                  {coach.assignedLearners.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic px-2">No learners assigned yet</p>
                  ) : (
                    <div className="space-y-1">
                      {coach.assignedLearners.map(name => {
                        const learner = learners.find(l => l.name === name);
                        return (
                          <Link key={name} href={learner ? `/learners/${learner.id}` : "#"}>
                            <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40 cursor-pointer transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-primary">
                                    {name.split(" ").map(n => n[0]).join("")}
                                  </span>
                                </div>
                                <span className="text-xs text-foreground">{name}</span>
                              </div>
                              {learner && <StatusBadge status={learner.status} />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7 flex-1" data-testid={`assign-learners-${coach.id}`}>
                    Assign
                  </Button>
                  <Button size="sm" className="text-xs h-7 flex-1" data-testid={`schedule-checkin-${coach.id}`}>
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Caseload overview */}
      <div className="bg-card border border-card-border rounded-xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Caseload Overview</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-2xl font-semibold text-emerald-700">
              {coaches.filter(c => c.workload === "Healthy").length}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">Healthy Workload</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-2xl font-semibold text-amber-700">
              {coaches.filter(c => c.workload === "Near Capacity").length}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Near Capacity</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-2xl font-semibold text-red-700">
              {coaches.filter(c => c.workload === "At Capacity").length}
            </p>
            <p className="text-xs text-red-600 mt-0.5">At Capacity</p>
          </div>
        </div>
      </div>

      {/* Team summary strip */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-2xl font-semibold text-foreground">{coaches.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Coaches</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-2xl font-semibold text-foreground">{learners.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Learners</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className={`text-2xl font-semibold ${totalAtRisk > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {totalAtRisk}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Learners Needing Support</p>
        </div>
      </div>

      {/* ── Add Coach Modal ──────────────────────────────────── */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={closeAdd}
        >
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {addStep === "confirm" ? (
              /* ── Confirmation ── */
              <div className="flex flex-col items-center text-center px-8 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check size={30} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Coach added</h2>
                <p className="text-sm text-muted-foreground mb-7 max-w-xs">
                  <span className="font-medium text-foreground">
                    {form.firstName} {form.lastName}
                  </span>{" "}
                  has been added to your coaching team. You can now assign learners and schedule check-ins.
                </p>

                <div className="w-full bg-muted/40 border border-border rounded-xl p-4 text-left mb-7 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{form.firstName} {form.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium text-foreground">{form.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{form.email}</span>
                  </div>
                  {form.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{form.phone}</span>
                    </div>
                  )}
                  {form.specialization && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Specialization</span>
                      <span className="font-medium text-foreground">{form.specialization}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned Learners</span>
                    <span className="font-medium text-foreground">0 (not yet assigned)</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={closeAdd}>Back to Coaches</Button>
                  <Button className="flex-1" onClick={() => { setForm(BLANK); setErrors({}); setAddStep("form"); setNewCoachId(""); }}>
                    Add Another
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Add Coach</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Add a new coach to your team</p>
                  </div>
                  <button
                    onClick={closeAdd}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        First name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={`mt-1.5 h-10 text-sm ${errors.firstName ? "border-destructive" : ""}`}
                        placeholder="First name"
                        value={form.firstName}
                        onChange={e => setField("firstName", e.target.value)}
                        data-testid="coach-first-name"
                      />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Last name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={`mt-1.5 h-10 text-sm ${errors.lastName ? "border-destructive" : ""}`}
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={e => setField("lastName", e.target.value)}
                        data-testid="coach-last-name"
                      />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Work email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        className={`pl-9 h-10 text-sm ${errors.email ? "border-destructive" : ""}`}
                        placeholder="coach@atltechalliance.org"
                        value={form.email}
                        onChange={e => setField("email", e.target.value)}
                        data-testid="coach-email"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Phone <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        className="pl-9 h-10 text-sm"
                        placeholder="(404) 555-0100"
                        value={form.phone}
                        onChange={e => setField("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Role / Title</Label>
                    <Select value={form.role} onValueChange={v => setField("role", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Career Coach">Career Coach</SelectItem>
                        <SelectItem value="Program Manager & Coach">Program Manager & Coach</SelectItem>
                        <SelectItem value="Workforce Advisor">Workforce Advisor</SelectItem>
                        <SelectItem value="Job Placement Specialist">Job Placement Specialist</SelectItem>
                        <SelectItem value="Academic Advisor">Academic Advisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Pathway Specialization <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Select value={form.specialization} onValueChange={v => setField("specialization", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue placeholder="Select a pathway..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Pathways">All Pathways</SelectItem>
                        <SelectItem value="IT Support Specialist">IT Support Specialist</SelectItem>
                        <SelectItem value="Technical Support Associate">Technical Support Associate</SelectItem>
                        <SelectItem value="Project Coordinator">Project Coordinator</SelectItem>
                        <SelectItem value="Customer Success Associate">Customer Success Associate</SelectItem>
                        <SelectItem value="Junior Data Operations Analyst">Junior Data Operations Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <Button variant="outline" onClick={closeAdd}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAdd} data-testid="submit-add-coach-btn">
                    Add Coach
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
