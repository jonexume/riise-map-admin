import { useState } from "react";
import {
  Save, Building2, Palette, Users, BarChart3, HelpCircle, Edit,
  Bell, Check, Plus, Trash2, Mail, Globe, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organization } from "@/data/mockData";

const dataDefinitions = [
  { term: "Active Learner", definition: "A learner who has logged in, completed a milestone, attended an event, or interacted with a coach in the last 14 days.", threshold: "14 days" },
  { term: "Roadmap Completion", definition: "Percentage of assigned roadmap milestones marked as complete by the learner or coach.", threshold: "% of milestones" },
  { term: "Readiness Score", definition: "Composite score (0–100) based on profile completion, project completion, milestone progress, event participation, and coach readiness review.", threshold: "Composite of 5 dimensions" },
  { term: "Placement-Ready", definition: "Learner has completed required roadmap milestones, resume review, interview prep, at least one project, and coach approval.", threshold: "All 5 criteria met" },
  { term: "At-Risk Learner", definition: "Learner with inactivity (10+ days), missed milestones, low roadmap progress (<30%), or low confidence check-ins.", threshold: "Any 1 of 4 triggers" },
  { term: "Successful Completion", definition: "Learner has completed 80%+ of roadmap milestones and achieved a readiness score of 70 or higher.", threshold: "80% milestones + score ≥70" },
];

const allStaff = [
  { name: "Denise Carter", role: "Program Manager", email: "denise@blueworkforce.com", status: "Active", access: "Admin" },
  { name: "Raymond Brooks", role: "Career Coach", email: "raymond@blueworkforce.com", status: "Active", access: "Coach" },
  { name: "Alicia Monroe", role: "Career Coach", email: "alicia@blueworkforce.com", status: "Active", access: "Coach" },
  { name: "Marcus Webb", role: "Career Coach", email: "marcus@blueworkforce.com", status: "Active", access: "Coach" },
  { name: "Tonya Fleming", role: "Career Coach", email: "tonya@blueworkforce.com", status: "Active", access: "Coach" },
  { name: "David Park", role: "Career Coach", email: "david@blueworkforce.com", status: "Active", access: "Coach" },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState(organization.name);
  const [orgTagline, setOrgTagline] = useState(organization.tagline);
  const [orgWebsite, setOrgWebsite] = useState(organization.website);
  const [orgLocation, setOrgLocation] = useState(organization.location);
  const [orgPhone, setOrgPhone] = useState("(404) 555-0180");
  const [orgEmail, setOrgEmail] = useState("info@blueworkforce.com");
  const [orgEIN, setOrgEIN] = useState("47-1234567");
  const [orgFiscalYear, setOrgFiscalYear] = useState("january");
  const [orgLinkedIn, setOrgLinkedIn] = useState("linkedin.com/company/blueworkforce");
  const [orgMission, setOrgMission] = useState("We connect residents to technology career pathways through structured learning, coaching, and employer partnerships.");

  const [editingDefinition, setEditingDefinition] = useState<string | null>(null);
  const [staffList, setStaffList] = useState(allStaff.map(s => ({ ...s })));
  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Career Coach");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    setStaffList(prev => [...prev, {
      name: newStaffName.trim(),
      role: newStaffRole,
      email: newStaffEmail.trim(),
      status: "Active",
      access: newStaffRole === "Program Manager" ? "Admin" : "Coach",
    }]);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffRole("Career Coach");
    setAddingStaff(false);
  };

  const handleRemoveStaff = (email: string) => {
    setStaffList(prev => prev.filter(s => s.email !== email));
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your organization, branding, and platform preferences</p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          data-testid="save-settings-btn"
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          {saved ? <Check size={13} className="mr-1.5" /> : <Save size={13} className="mr-1.5" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="org">
        <TabsList className="mb-6 bg-muted/50 flex-wrap h-auto gap-1">
          <TabsTrigger value="org" className="text-xs"><Building2 size={12} className="mr-1" />Organization</TabsTrigger>
          <TabsTrigger value="branding" className="text-xs"><Palette size={12} className="mr-1" />Branding</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs"><Users size={12} className="mr-1" />Staff</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs"><Bell size={12} className="mr-1" />Notifications</TabsTrigger>
          <TabsTrigger value="reporting" className="text-xs"><BarChart3 size={12} className="mr-1" />Reporting</TabsTrigger>
          <TabsTrigger value="definitions" className="text-xs"><HelpCircle size={12} className="mr-1" />Definitions</TabsTrigger>
        </TabsList>

        {/* ── Organization ── */}
        <TabsContent value="org" className="space-y-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Organization Profile</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Organization Name</Label>
                  <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="h-9 text-sm" data-testid="org-name-input" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Tagline</Label>
                  <Input value={orgTagline} onChange={e => setOrgTagline(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Location</Label>
                  <Input value={orgLocation} onChange={e => setOrgLocation(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Website</Label>
                  <div className="relative">
                    <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={orgWebsite} onChange={e => setOrgWebsite(e.target.value)} className="h-9 text-sm pl-8" data-testid="org-website-input" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Phone</Label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} className="h-9 text-sm pl-8" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Contact Email</Label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className="h-9 text-sm pl-8" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">EIN / Tax ID</Label>
                  <Input value={orgEIN} onChange={e => setOrgEIN(e.target.value)} className="h-9 text-sm font-mono" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Fiscal Year Start</Label>
                  <Select value={orgFiscalYear} onValueChange={setOrgFiscalYear}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["january","april","july","october"].map(m => (
                        <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Year Founded</Label>
                  <Input defaultValue={organization.founded} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">LinkedIn</Label>
                  <Input value={orgLinkedIn} onChange={e => setOrgLinkedIn(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Mission Statement</Label>
                <Textarea value={orgMission} onChange={e => setOrgMission(e.target.value)} className="text-sm resize-none min-h-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Program Configuration</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Default Cohort Length</Label>
                  <Select defaultValue="16">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["8","12","16","20","24"].map(w => (
                        <SelectItem key={w} value={w}>{w} weeks</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Max Learners per Coach</Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["10","12","15","18","20"].map(n => (
                        <SelectItem key={n} value={n}>{n} learners</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Check-in Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Inactivity Threshold (days)</Label>
                  <Input defaultValue="10" className="h-9 text-sm" type="number" min="3" max="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Branding ── */}
        <TabsContent value="branding" className="space-y-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Logo & Colors</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Organization Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-xl font-bold text-primary">{organization.logo}</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 block">Upload Logo</Button>
                    <p className="text-[11px] text-muted-foreground">PNG or SVG, min 200×200px recommended</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary border border-border cursor-pointer flex-shrink-0" />
                    <Input defaultValue="#2563EB" className="h-9 text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-500 border border-border cursor-pointer flex-shrink-0" />
                    <Input defaultValue="#14B8A6" className="h-9 text-sm font-mono" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Font Family</Label>
                <Select defaultValue="inter">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (default)</SelectItem>
                    <SelectItem value="geist">Geist</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Report & Export Branding</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Report Header Text</Label>
                <Input defaultValue="BlueWorkforce | Workforce Pathway Impact Report" className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Report Footer Text</Label>
                <Input defaultValue="blueworkforce.com | Confidential — For Grant Reporting Purposes" className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Certificate Style</Label>
                <Select defaultValue="professional">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional (dark border)</SelectItem>
                    <SelectItem value="modern">Modern (accent stripe)</SelectItem>
                    <SelectItem value="minimal">Minimal (clean)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Show logo on exported reports</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Applies to PDF and CSV exports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Use branded email templates</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Learner invitations and report emails</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Staff ── */}
        <TabsContent value="staff">
          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">Staff Accounts</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{staffList.length} active members</p>
              </div>
              <Button size="sm" className="text-xs h-8" onClick={() => setAddingStaff(true)} data-testid="add-staff-btn">
                <Plus size={13} className="mr-1" /> Add Staff Member
              </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {addingStaff && (
                <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 mb-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">New Staff Member</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Full name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="h-9 text-sm" />
                    <Input placeholder="email@blueworkforce.com" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Program Manager">Program Manager</SelectItem>
                      <SelectItem value="Career Coach">Career Coach</SelectItem>
                      <SelectItem value="Workforce Advisor">Workforce Advisor</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="Program Coordinator">Program Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setAddingStaff(false)}>Cancel</Button>
                    <Button size="sm" className="text-xs h-8" onClick={handleAddStaff}>Add Member</Button>
                  </div>
                </div>
              )}

              {staffList.map(staff => (
                <div key={staff.email} data-testid={`staff-row-${staff.email}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{staff.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-muted-foreground hidden md:block">{staff.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      staff.access === "Admin"
                        ? "bg-primary/8 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>{staff.access}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{staff.status}</span>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Edit</Button>
                    {staff.email !== "denise@blueworkforce.com" && (
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        onClick={() => handleRemoveStaff(staff.email)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-card-border mt-5">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Access Levels</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { level: "Admin", desc: "Full access — manage programs, learners, coaches, reports, and settings" },
                { level: "Coach", desc: "Access to assigned learners, check-ins, and coaching tools. No settings access." },
                { level: "Viewer", desc: "Read-only access to impact dashboards and reports. Suitable for funders or board members." },
              ].map(r => (
                <div key={r.level} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <span className="text-xs font-semibold text-foreground w-14 flex-shrink-0 pt-0.5">{r.level}</span>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="space-y-5">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Learner Alerts</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-xs text-muted-foreground">Control which events trigger alerts in your dashboard and inbox.</p>
              {[
                { label: "Learner inactivity (10+ days)", desc: "Alert when a learner has had no activity", default: true },
                { label: "Readiness score drops below 40", desc: "Alert when a learner's readiness falls significantly", default: true },
                { label: "Missed consecutive check-ins", desc: "Alert after 2 missed coach check-ins", default: true },
                { label: "Learner reaches Placement Ready", desc: "Notify when a learner achieves placement-ready status", default: true },
                { label: "New learner completes onboarding", desc: "Notify when a newly invited learner finishes setup", default: false },
                { label: "Overdue milestone (7+ days past due)", desc: "Alert when a milestone is significantly overdue", default: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-xs text-foreground">{item.label}</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Email Digest</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Daily summary email</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sent each morning with priorities and flags</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Digest delivery time</Label>
                <Select defaultValue="8am">
                  <SelectTrigger className="h-9 text-sm w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["7am","8am","9am","10am"].map(t => <SelectItem key={t} value={t}>{t} Eastern</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Weekly impact snapshot</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sent every Monday with program metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Monthly grant report reminder</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Reminder to generate and submit reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-foreground">Coach workload alerts</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Notify when a coach reaches near-capacity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Notification Recipients</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">These email addresses receive platform alerts and digest emails.</p>
              <Input defaultValue="denise@blueworkforce.com" className="h-9 text-sm" />
              <div className="flex items-center gap-2">
                <Input placeholder="Add another recipient..." className="h-9 text-sm" />
                <Button variant="outline" size="sm" className="h-9 text-xs flex-shrink-0"><Plus size={13} className="mr-1" /> Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reporting Defaults ── */}
        <TabsContent value="reporting">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Reporting Defaults</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <p className="text-xs text-muted-foreground">These definitions shape how metrics appear in reports, dashboards, and funder exports.</p>
              {[
                { label: "What counts as roadmap completion?", value: "80% of assigned milestones completed", helper: "Used to determine 'program completion' in grant reports" },
                { label: "What counts as placement-ready?", value: "Readiness score ≥70 + coach approval + resume reviewed", helper: "Determines who is counted as 'placement-ready' in outcome metrics" },
                { label: "What counts as an active learner?", value: "Login, milestone, event, or coach interaction in last 14 days", helper: "Used to calculate active learner counts in all reports" },
                { label: "What counts as successful completion?", value: "80%+ milestones + readiness score ≥70", helper: "Used in funder reporting as 'program completion'" },
                { label: "What counts as intervention resolved?", value: "Coach marks alert as resolved after learner re-engages", helper: "Tracks the effectiveness of your support interventions" },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">{item.label}</Label>
                  <Input defaultValue={item.value} className="h-9 text-sm" />
                  <p className="text-[11px] text-muted-foreground">{item.helper}</p>
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-foreground mb-3">Report Preferences</p>
                <div className="space-y-3">
                  {[
                    { label: "Include demographic breakdowns in impact reports", default: true },
                    { label: "Show readiness score trends by default", default: true },
                    { label: "Include success stories in quarterly exports", default: true },
                    { label: "Use program completion date for cohort tracking", default: true },
                    { label: "Show cost-per-learner in funder exports", default: false },
                    { label: "Auto-generate monthly snapshots", default: false },
                  ].map(pref => (
                    <div key={pref.label} className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">{pref.label}</Label>
                      <Switch defaultChecked={pref.default} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Data Definitions ── */}
        <TabsContent value="definitions">
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg mb-4">
              <p className="text-xs text-primary">
                <strong>Why this matters:</strong> Clear metric definitions create trust with funders, partners, and your own team. These definitions explain exactly what each number means when reporting outcomes.
              </p>
            </div>
            {dataDefinitions.map(def => (
              <Card key={def.term} data-testid={`definition-${def.term.toLowerCase().replace(/\s+/g, "-")}`} className="border-card-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-foreground">{def.term}</p>
                        <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{def.threshold}</span>
                      </div>
                      {editingDefinition === def.term ? (
                        <Textarea defaultValue={def.definition} className="text-sm resize-none min-h-16" autoFocus />
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">{def.definition}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost" size="sm" className="text-xs h-7 px-2 flex-shrink-0"
                      onClick={() => setEditingDefinition(editingDefinition === def.term ? null : def.term)}
                      data-testid={`edit-definition-${def.term.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Edit size={12} className="mr-1" />
                      {editingDefinition === def.term ? "Done" : "Edit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
