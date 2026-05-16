import { useState } from "react";
import {
  ArrowLeft, Plus, Briefcase, MapPin, Clock, DollarSign,
  CheckCircle, Mail, ChevronRight, X, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jobs as initialJobs, Job, learners } from "@/data/mockData";
import { cn } from "@/lib/utils";

type View = "list" | "create" | "detail" | "invite" | "confirmed";

const maya = learners.find(l => l.name === "Maya Thompson")!;

const statusColors: Record<Job["status"], string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Filled: "bg-blue-50 text-blue-700 border-blue-100",
  Expired: "bg-muted text-muted-foreground border-border",
};

const typeColors: Record<Job["type"], string> = {
  "Full-time": "bg-primary/8 text-primary border-primary/20",
  "Part-time": "bg-amber-50 text-amber-700 border-amber-100",
  Contract: "bg-purple-50 text-purple-700 border-purple-100",
  Internship: "bg-sky-50 text-sky-700 border-sky-100",
};

const emptyForm = {
  title: "",
  employer: "",
  location: "",
  type: "Full-time" as Job["type"],
  salary: "",
  pathway: "",
  description: "",
  requirements: "",
};

export default function Jobs() {
  const [view, setView] = useState<View>("list");
  const [jobList, setJobList] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [inviteNote, setInviteNote] = useState(
    "Hi Maya — based on your progress in the Customer Success pathway, I think this could be a great fit for you. I'd love to chat about it at our next session."
  );

  const openDetail = (job: Job) => {
    setSelectedJob(job);
    setView("detail");
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Job title is required";
    if (!form.employer.trim()) errs.employer = "Employer name is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.salary.trim()) errs.salary = "Salary range is required";
    if (!form.pathway.trim()) errs.pathway = "Linked pathway is required";
    if (!form.description.trim()) errs.description = "Job description is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateJob = () => {
    if (!validateForm()) return;
    const newJob: Job = {
      id: String(Date.now()),
      title: form.title,
      employer: form.employer,
      location: form.location,
      type: form.type,
      salary: form.salary,
      pathway: form.pathway,
      description: form.description,
      requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
      skills: [],
      posted: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Open",
    };
    setJobList(prev => [newJob, ...prev]);
    setSelectedJob(newJob);
    setForm(emptyForm);
    setView("detail");
  };

  const handleSendInvite = () => {
    setView("confirmed");
  };

  if (view === "confirmed" && selectedJob) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto flex flex-col items-center text-center pt-20">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Invitation sent</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm">
          Maya Thompson has been invited to apply for <strong>{selectedJob.title}</strong> at {selectedJob.employer}. She will receive a notification with your message.
        </p>

        <div className="w-full bg-card border border-card-border rounded-xl p-5 text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
              <img src={maya.photo} alt={maya.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{maya.name}</p>
              <p className="text-xs text-muted-foreground">{maya.pathway} · {maya.program}</p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Your message</p>
            <p className="text-sm text-foreground">{inviteNote}</p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={12} />
            <span>Sent to {maya.email}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setView("list"); setSelectedJob(null); }}>
            Back to Jobs
          </Button>
          <Button onClick={() => setView("detail")}>
            View Job Posting
          </Button>
        </div>
      </div>
    );
  }

  if (view === "invite" && selectedJob) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => setView("detail")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Job
        </button>

        <h1 className="text-2xl font-semibold text-foreground mb-1">Invite learner to apply</h1>
        <p className="text-sm text-muted-foreground mb-7">
          Send a personal invitation to Maya Thompson for <strong>{selectedJob.title}</strong> at {selectedJob.employer}.
        </p>

        <div className="bg-card border border-card-border rounded-xl p-5 mb-5">
          <p className="text-xs font-medium text-muted-foreground mb-3">Learner</p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
              <img src={maya.photo} alt={maya.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{maya.name}</p>
              <p className="text-xs text-muted-foreground">{maya.pathway} · Readiness {maya.readiness}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold text-foreground">{maya.progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 mb-5">
          <p className="text-xs font-medium text-muted-foreground mb-3">Role</p>
          <p className="text-sm font-semibold text-foreground">{selectedJob.title}</p>
          <p className="text-xs text-muted-foreground">{selectedJob.employer} · {selectedJob.location}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{selectedJob.salary}</p>
        </div>

        <div className="mb-6">
          <Label className="text-sm font-medium text-foreground mb-1.5 block">Personal message</Label>
          <Textarea
            value={inviteNote}
            onChange={(e) => setInviteNote(e.target.value)}
            rows={4}
            className="text-sm resize-none"
            placeholder="Write a short message to Maya about why this role is a good fit..."
          />
          <p className="text-xs text-muted-foreground mt-1.5">This message will be included in Maya's invitation email.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView("detail")}>Cancel</Button>
          <Button onClick={handleSendInvite} className="flex-1">
            <Send size={14} className="mr-2" /> Send Invitation
          </Button>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedJob) {
    return (
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Jobs
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-semibold text-foreground">{selectedJob.title}</h1>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border", statusColors[selectedJob.status])}>
                {selectedJob.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{selectedJob.employer}</p>
          </div>
          {selectedJob.status === "Open" && (
            <Button
              onClick={() => setView("invite")}
              className="flex-shrink-0"
              data-testid="invite-maya-btn"
            >
              <Mail size={14} className="mr-2" /> Invite Maya to Apply
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: MapPin, label: "Location", value: selectedJob.location },
            { icon: Clock, label: "Type", value: selectedJob.type },
            { icon: DollarSign, label: "Salary", value: selectedJob.salary },
            { icon: Briefcase, label: "Posted", value: selectedJob.posted },
          ].map(m => (
            <div key={m.label} className="bg-card border border-card-border rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <m.icon size={12} />
                <p className="text-xs">{m.label}</p>
              </div>
              <p className="text-sm font-medium text-foreground">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="border-card-border">
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Job Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedJob.description}</p>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Requirements</h3>
              <ul className="space-y-2">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {selectedJob.skills.length > 0 && (
            <Card className="border-card-border">
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Skills Aligned</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map(s => (
                    <span key={s} className="text-xs bg-primary/8 text-primary border border-primary/20 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Linked pathway: <span className="font-medium text-foreground">{selectedJob.pathway}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {selectedJob.status === "Open" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                  <img src={maya.photo} alt={maya.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Maya Thompson looks like a strong match</p>
                  <p className="text-xs text-muted-foreground">Readiness {maya.readiness} · {maya.progress}% pathway complete · {maya.status}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setView("invite")} className="flex-shrink-0">
                <Mail size={13} className="mr-1.5" /> Invite to Apply
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <button
          onClick={() => { setView("list"); setFormErrors({}); setForm(emptyForm); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Jobs
        </button>

        <h1 className="text-2xl font-semibold text-foreground mb-1">Create a job posting</h1>
        <p className="text-sm text-muted-foreground mb-7">Add a new employer opportunity to match with placement-ready learners.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Job title</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.title && "border-destructive")}
                placeholder="e.g. Customer Success Associate"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              {formErrors.title && <p className="text-xs text-destructive mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Employer</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.employer && "border-destructive")}
                placeholder="e.g. Brightpath SaaS"
                value={form.employer}
                onChange={e => setForm(f => ({ ...f, employer: e.target.value }))}
              />
              {formErrors.employer && <p className="text-xs text-destructive mt-1">{formErrors.employer}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.location && "border-destructive")}
                placeholder="e.g. Atlanta, GA (Hybrid)"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
              {formErrors.location && <p className="text-xs text-destructive mt-1">{formErrors.location}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Employment type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as Job["type"] }))}>
                <SelectTrigger className="mt-1.5 h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Salary range</Label>
              <Input
                className={cn("mt-1.5 h-10 text-sm", formErrors.salary && "border-destructive")}
                placeholder="e.g. $42,000 – $50,000"
                value={form.salary}
                onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
              />
              {formErrors.salary && <p className="text-xs text-destructive mt-1">{formErrors.salary}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Linked pathway</Label>
              <Select value={form.pathway} onValueChange={v => setForm(f => ({ ...f, pathway: v }))}>
                <SelectTrigger className={cn("mt-1.5 h-10 text-sm", formErrors.pathway && "border-destructive")}>
                  <SelectValue placeholder="Select pathway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Success Associate">Customer Success Associate</SelectItem>
                  <SelectItem value="IT Support Specialist">IT Support Specialist</SelectItem>
                  <SelectItem value="Junior Data Operations Analyst">Junior Data Operations Analyst</SelectItem>
                  <SelectItem value="Project Coordinator">Project Coordinator</SelectItem>
                  <SelectItem value="Technical Support Associate">Technical Support Associate</SelectItem>
                  <SelectItem value="All Pathways">All Pathways</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.pathway && <p className="text-xs text-destructive mt-1">{formErrors.pathway}</p>}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Job description</Label>
            <Textarea
              className={cn("mt-1.5 text-sm resize-none", formErrors.description && "border-destructive")}
              rows={5}
              placeholder="Describe the role, day-to-day responsibilities, and what makes this a good opportunity for learners..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            {formErrors.description && <p className="text-xs text-destructive mt-1">{formErrors.description}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">Requirements</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Enter one requirement per line.</p>
            <Textarea
              className="text-sm resize-none"
              rows={5}
              placeholder={"Experience in a customer-facing role\nStrong written and verbal communication\nAbility to learn new software quickly"}
              value={form.requirements}
              onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => { setView("list"); setForm(emptyForm); setFormErrors({}); }}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCreateJob} data-testid="submit-job-btn">
            <Plus size={14} className="mr-1.5" /> Create Job Posting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobList.filter(j => j.status === "Open").length} open roles matched to Atlanta Workforce Tech Alliance pathways
          </p>
        </div>
        <Button size="sm" onClick={() => setView("create")} data-testid="create-job-btn">
          <Plus size={14} className="mr-1.5" /> Create Job Posting
        </Button>
      </div>

      <div className="space-y-4">
        {jobList.map(job => (
          <Card key={job.id} data-testid={`job-card-${job.id}`} className="border-card-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-base font-semibold text-foreground">{job.title}</h2>
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", statusColors[job.status])}>
                      {job.status}
                    </span>
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", typeColors[job.type])}>
                      {job.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{job.employer}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={11} />{job.salary}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} />Posted {job.posted}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline" size="sm" className="text-xs h-8"
                    onClick={() => openDetail(job)}
                    data-testid={`view-job-${job.id}`}
                  >
                    View <ChevronRight size={12} className="ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
