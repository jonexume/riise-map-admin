import { useState } from "react";
import { Link } from "wouter";
import {
  Search, LayoutGrid, List, ChevronRight, X,
  Check, Mail, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { useGetLearners, useCreateLearner, type Learner } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  pathway: string;
  coach: string;
  message: string;
}

const BLANK_INVITE: InviteForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  program: "",
  pathway: "",
  coach: "",
  message:
    "Hi,\n\nYou've been invited to join the Atlanta Workforce Tech Alliance's workforce development program.\n\nThrough RiiseMap, you'll have access to career pathways, coaching, projects, and events designed to help you break into tech.\n\nClick the link below to get started.\n\nLooking forward to supporting your journey,\nDenise Carter\nProgram Manager, Atlanta Workforce Tech Alliance",
};

const PATHWAYS_BY_PROGRAM: Record<string, string[]> = {
  tech: ["IT Support Specialist", "Technical Support Associate", "Project Coordinator"],
  cs: ["Customer Success Associate"],
  data: ["Junior Data Operations Analyst"],
};

const PROGRAM_LABELS: Record<string, string> = {
  tech: "Tech Career Launch",
  cs: "Customer Success Accelerator",
  data: "Data Operations Starter",
};

export default function Learners() {
  const queryClient = useQueryClient();
  const { data: allLearners = [], isLoading } = useGetLearners();
  const createLearnerMutation = useCreateLearner({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/learners'] });
      }
    }
  });
  const [newLearnerId, setNewLearnerId] = useState<string | null>(null);

  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCoach, setFilterCoach] = useState("all");
  const [filterPathway, setFilterPathway] = useState("all");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteStep, setInviteStep] = useState<0 | 1>(0);
  const [inviteForm, setInviteForm] = useState<InviteForm>(BLANK_INVITE);
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<keyof InviteForm, string>>>({});

  const filtered = allLearners.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.pathway.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchCoach = filterCoach === "all" || l.coach === filterCoach;
    const matchPathway = filterPathway === "all" || l.pathway === filterPathway;
    return matchSearch && matchStatus && matchCoach && matchPathway;
  });

  const coaches = [...new Set(allLearners.map((l) => l.coach))];
  const pathwayOptions = [...new Set(allLearners.map((l) => l.pathway))];

  const setField = (field: keyof InviteForm, value: string) => {
    setInviteForm((f) => ({ ...f, [field]: value }));
    setInviteErrors((e) => ({ ...e, [field]: "" }));
    if (field === "program") setInviteForm((f) => ({ ...f, program: value, pathway: "" }));
  };

  const validateInvite = () => {
    const e: typeof inviteErrors = {};
    if (!inviteForm.firstName.trim()) e.firstName = "First name is required";
    if (!inviteForm.lastName.trim()) e.lastName = "Last name is required";
    if (!inviteForm.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email.trim()))
      e.email = "Please enter a valid email address";
    setInviteErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendInvite = () => {
    if (!validateInvite()) return;

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    createLearnerMutation.mutate({
      data: {
        name: `${inviteForm.firstName.trim()} ${inviteForm.lastName.trim()}`,
        pathway: inviteForm.pathway || "Not yet assigned",
        program: inviteForm.program ? PROGRAM_LABELS[inviteForm.program] : "Not yet enrolled",
        coach: inviteForm.coach || "Unassigned",
        progress: 0,
        readiness: 0,
        status: "New Learner",
        lastActive: "Just invited",
        nextAction: "Complete onboarding and career assessment",
        joinDate: today,
        email: inviteForm.email.trim(),
      }
    }, {
      onSuccess: (newLearner) => {
        setNewLearnerId(String(newLearner.id));
        setInviteStep(1);
      }
    });
  };

  const closeInvite = () => {
    setShowInvite(false);
    setTimeout(() => {
      setInviteStep(0);
      setInviteForm(BLANK_INVITE);
      setInviteErrors({});
    }, 300);
  };

  const availablePathways =
    inviteForm.program && PATHWAYS_BY_PROGRAM[inviteForm.program]
      ? PATHWAYS_BY_PROGRAM[inviteForm.program]
      : pathwayOptions;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Learners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading..." : `${allLearners.length} learners enrolled across 3 programs`}
          </p>
        </div>
        <Button
          size="sm"
          data-testid="invite-learners-btn"
          onClick={() => { setInviteStep(0); setShowInvite(true); }}
        >
          <UserPlus size={13} className="mr-1.5" /> Invite Learners
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
            data-testid="search-learners"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="On Track">On Track</SelectItem>
            <SelectItem value="Needs Support">Needs Support</SelectItem>
            <SelectItem value="Stalled">Stalled</SelectItem>
            <SelectItem value="Placement Ready">Placement Ready</SelectItem>
            <SelectItem value="New Learner">New Learner</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCoach} onValueChange={setFilterCoach}>
          <SelectTrigger className="w-40 h-9 text-sm" data-testid="filter-coach">
            <SelectValue placeholder="Coach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coaches</SelectItem>
            {coaches.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPathway} onValueChange={setFilterPathway}>
          <SelectTrigger className="w-52 h-9 text-sm" data-testid="filter-pathway">
            <SelectValue placeholder="Pathway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pathways</SelectItem>
            {pathwayOptions.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <button
            onClick={() => setView("list")}
            data-testid="view-list"
            className={cn("p-1.5 rounded", view === "list" ? "bg-muted" : "hover:bg-muted/50")}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setView("grid")}
            data-testid="view-grid"
            className={cn("p-1.5 rounded", view === "grid" ? "bg-muted" : "hover:bg-muted/50")}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Showing {filtered.length} of {allLearners.length} learners
      </p>

      {view === "list" ? (
        <Card className="border-card-border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Learner</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pathway</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coach</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Progress</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Readiness</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((learner, i) => {
                    const isNew = learner.id === newLearnerId;
                    return (
                      <tr
                        key={learner.id}
                        data-testid={`learner-row-${learner.id}`}
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          i !== filtered.length - 1 && "border-b",
                          isNew && "bg-primary/5 ring-inset ring-1 ring-primary/20"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {learner.photo
                                ? <img src={learner.photo} alt={learner.name} className="w-full h-full object-cover" />
                                : <span className="text-xs font-semibold text-primary">{learner.name.split(" ").map((n) => n[0]).join("")}</span>
                              }
                            </div>
                            <div>
                              <div className="font-medium text-foreground flex items-center gap-1.5">
                                {learner.name}
                                {isNew && (
                                  <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">New</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{learner.program}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">{learner.pathway}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{learner.coach}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={learner.progress} className="h-1.5 w-20" />
                            <span className="text-xs text-muted-foreground">{learner.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            learner.readiness >= 80 ? "bg-emerald-100 text-emerald-700" :
                            learner.readiness >= 60 ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {learner.readiness}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={learner.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{learner.lastActive}</td>
                        <td className="px-4 py-3">
                          <Link href={`/learners/${learner.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" data-testid={`view-learner-${learner.id}`}>
                              View <ChevronRight size={12} className="ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((learner) => {
            const isNew = learner.id === newLearnerId;
            return (
              <Link key={learner.id} href={`/learners/${learner.id}`}>
                <Card
                  data-testid={`learner-card-${learner.id}`}
                  className={cn(
                    "border-card-border shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                    isNew && "ring-2 ring-primary/30"
                  )}
                >
                  <CardContent className="p-5">
                    {isNew && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2">
                        <Check size={11} /> Newly added
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {learner.photo
                            ? <img src={learner.photo} alt={learner.name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-semibold text-primary">{learner.name.split(" ").map((n) => n[0]).join("")}</span>
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">{learner.name}</div>
                          <div className="text-xs text-muted-foreground">{learner.coach}</div>
                        </div>
                      </div>
                      <StatusBadge status={learner.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 truncate">{learner.pathway}</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Roadmap progress</span>
                          <span className="font-medium">{learner.progress}%</span>
                        </div>
                        <Progress value={learner.progress} className="h-1.5" />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Readiness score</span>
                        <span className="font-medium text-foreground">{learner.readiness}/100</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Active {learner.lastActive}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Invite Learner Modal ─────────────────────────────── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={closeInvite}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {inviteStep === 1 ? (
              /* ── Confirmation ── */
              <div className="flex flex-col items-center text-center px-8 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check size={30} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Learner added</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  <span className="font-medium text-foreground">
                    {inviteForm.firstName} {inviteForm.lastName}
                  </span>{" "}
                  has been added to your learner list and an invitation email has been sent to{" "}
                  <span className="font-medium text-foreground">{inviteForm.email}</span>.
                </p>

                <div className="w-full bg-muted/40 border border-border rounded-xl p-4 text-left mb-7 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{inviteForm.firstName} {inviteForm.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{inviteForm.email}</span>
                  </div>
                  {inviteForm.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium text-foreground">{inviteForm.phone}</span>
                    </div>
                  )}
                  {inviteForm.program && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-medium text-foreground">{PROGRAM_LABELS[inviteForm.program]}</span>
                    </div>
                  )}
                  {inviteForm.pathway && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pathway</span>
                      <span className="font-medium text-foreground">{inviteForm.pathway}</span>
                    </div>
                  )}
                  {inviteForm.coach && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Assigned coach</span>
                      <span className="font-medium text-foreground">{inviteForm.coach}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-foreground">New Learner</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-border text-xs mt-1">
                    <Mail size={11} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Invitation email delivered · Learner record created</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={closeInvite}>View Learner List</Button>
                  <Button className="flex-1" onClick={() => {
                    setInviteForm(BLANK_INVITE);
                    setInviteStep(0);
                    setInviteErrors({});
                  }}>
                    Invite Another
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Compose invitation ── */
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Invite a Learner</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Add them to the program and send a personal invitation</p>
                  </div>
                  <button onClick={closeInvite} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        First name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={`mt-1.5 h-10 text-sm ${inviteErrors.firstName ? "border-destructive" : ""}`}
                        placeholder="First name"
                        value={inviteForm.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                        data-testid="invite-first-name"
                      />
                      {inviteErrors.firstName && <p className="text-xs text-destructive mt-1">{inviteErrors.firstName}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Last name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={`mt-1.5 h-10 text-sm ${inviteErrors.lastName ? "border-destructive" : ""}`}
                        placeholder="Last name"
                        value={inviteForm.lastName}
                        onChange={(e) => setField("lastName", e.target.value)}
                        data-testid="invite-last-name"
                      />
                      {inviteErrors.lastName && <p className="text-xs text-destructive mt-1">{inviteErrors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email & phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Email address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        className={`mt-1.5 h-10 text-sm ${inviteErrors.email ? "border-destructive" : ""}`}
                        placeholder="learner@email.com"
                        value={inviteForm.email}
                        onChange={(e) => setField("email", e.target.value)}
                        data-testid="invite-email"
                      />
                      {inviteErrors.email && <p className="text-xs text-destructive mt-1">{inviteErrors.email}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Phone <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        type="tel"
                        className="mt-1.5 h-10 text-sm"
                        placeholder="(404) 555-0100"
                        value={inviteForm.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Program & Pathway */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Program</Label>
                      <Select
                        value={inviteForm.program}
                        onValueChange={(v) => {
                          setInviteForm((f) => ({ ...f, program: v, pathway: "" }));
                        }}
                      >
                        <SelectTrigger className="mt-1.5 h-10 text-sm">
                          <SelectValue placeholder="Select program..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Tech Career Launch</SelectItem>
                          <SelectItem value="cs">Customer Success Accelerator</SelectItem>
                          <SelectItem value="data">Data Operations Starter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">Pathway</Label>
                      <Select
                        value={inviteForm.pathway}
                        onValueChange={(v) => setField("pathway", v)}
                        disabled={!inviteForm.program}
                      >
                        <SelectTrigger className="mt-1.5 h-10 text-sm">
                          <SelectValue placeholder={inviteForm.program ? "Select pathway..." : "Select program first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePathways.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Coach */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Assign Coach</Label>
                    <Select value={inviteForm.coach} onValueChange={(v) => setField("coach", v)}>
                      <SelectTrigger className="mt-1.5 h-10 text-sm">
                        <SelectValue placeholder="Select a coach..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Denise Carter">Denise Carter — Program Manager</SelectItem>
                        <SelectItem value="Raymond Brooks">Raymond Brooks — Career Coach</SelectItem>
                        <SelectItem value="Alicia Monroe">Alicia Monroe — Career Coach</SelectItem>
                        <SelectItem value="Marcus Webb">Marcus Webb — Career Coach</SelectItem>
                        <SelectItem value="Tonya Fleming">Tonya Fleming — Career Coach</SelectItem>
                        <SelectItem value="David Park">David Park — Career Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Personal message */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Personal Message</Label>
                    <Textarea
                      className="mt-1.5 text-sm resize-none"
                      rows={6}
                      value={inviteForm.message}
                      onChange={(e) => setField("message", e.target.value)}
                      data-testid="invite-message"
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <Button variant="outline" onClick={closeInvite}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSendInvite} data-testid="send-invite-btn">
                    <Mail size={13} className="mr-2" /> Add Learner & Send Invitation
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
