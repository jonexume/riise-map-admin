import { useState } from "react";
import { Save, Building2, Palette, Users, BarChart3, BookOpen, HelpCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { organization } from "@/data/mockData";

const dataDefinitions = [
  {
    term: "Active Learner",
    definition: "A learner who has logged in, completed a milestone, attended an event, or interacted with a coach in the last 14 days.",
    threshold: "14 days",
  },
  {
    term: "Roadmap Completion",
    definition: "Percentage of assigned roadmap milestones marked as complete by the learner or coach.",
    threshold: "% of milestones",
  },
  {
    term: "Readiness Score",
    definition: "Composite score (0–100) based on profile completion, project completion, milestone progress, event participation, and coach readiness review.",
    threshold: "Composite of 5 dimensions",
  },
  {
    term: "Placement-Ready",
    definition: "Learner has completed required roadmap milestones, resume review, interview prep, at least one project, and coach approval.",
    threshold: "All 5 criteria met",
  },
  {
    term: "At-Risk Learner",
    definition: "Learner with inactivity (10+ days), missed milestones, low roadmap progress (<30%), or low confidence check-ins.",
    threshold: "Any 1 of 4 triggers",
  },
  {
    term: "Successful Completion",
    definition: "Learner has completed 80%+ of roadmap milestones and achieved a readiness score of 70 or higher.",
    threshold: "80% milestones + score ≥70",
  },
];

const staffAccounts = [
  { name: "Denise Carter", role: "Program Manager", email: "denise@atltechalliance.org", status: "Active" },
  { name: "Raymond Brooks", role: "Career Coach", email: "raymond@atltechalliance.org", status: "Active" },
  { name: "Alicia Monroe", role: "Career Coach", email: "alicia@atltechalliance.org", status: "Active" },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState(organization.name);
  const [orgTagline, setOrgTagline] = useState(organization.tagline);
  const [editingDefinition, setEditingDefinition] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your organization, branding, and reporting defaults</p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          data-testid="save-settings-btn"
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <Save size={13} className="mr-1.5" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="org">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="org" className="text-xs"><Building2 size={12} className="mr-1" />Organization</TabsTrigger>
          <TabsTrigger value="branding" className="text-xs"><Palette size={12} className="mr-1" />Branding</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs"><Users size={12} className="mr-1" />Staff</TabsTrigger>
          <TabsTrigger value="reporting" className="text-xs"><BarChart3 size={12} className="mr-1" />Reporting</TabsTrigger>
          <TabsTrigger value="definitions" className="text-xs"><HelpCircle size={12} className="mr-1" />Definitions</TabsTrigger>
        </TabsList>

        {/* Organization */}
        <TabsContent value="org">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Organization Profile</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Organization Name</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-9 text-sm"
                    data-testid="org-name-input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Tagline</Label>
                  <Input
                    value={orgTagline}
                    onChange={(e) => setOrgTagline(e.target.value)}
                    className="h-9 text-sm"
                    data-testid="org-tagline-input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Location</Label>
                  <Input defaultValue={organization.location} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Website</Label>
                  <Input defaultValue={organization.website} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Year Founded</Label>
                  <Input defaultValue={organization.founded} className="h-9 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Mission Statement</Label>
                <Textarea
                  defaultValue="We connect Atlanta residents to technology career pathways through structured learning, coaching, and employer partnerships."
                  className="text-sm resize-none min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Branding & Appearance</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-xl font-bold text-primary">AWTA</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">Upload Logo</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary border border-border cursor-pointer" />
                    <Input defaultValue="#2563EB" className="h-9 text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-500 border border-border cursor-pointer" />
                    <Input defaultValue="#14B8A6" className="h-9 text-sm font-mono" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Report Header Text</Label>
                <Input defaultValue="Atlanta Workforce Tech Alliance | Workforce Pathway Impact Report" className="h-9 text-sm" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff */}
        <TabsContent value="staff">
          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Staff Accounts</CardTitle>
              <Button size="sm" className="text-xs h-8" data-testid="add-staff-btn">Add Staff Member</Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {staffAccounts.map(staff => (
                  <div key={staff.email} data-testid={`staff-row-${staff.email}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{staff.name.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{staff.role}</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{staff.status}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporting Defaults */}
        <TabsContent value="reporting">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Reporting Defaults</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-5">
              <p className="text-xs text-muted-foreground">These definitions shape how metrics appear in reports, dashboards, and funder exports. Customize them to match your program's standards and grant requirements.</p>
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
                    "Include demographic breakdowns in impact reports",
                    "Show readiness score trends by default",
                    "Include success stories in quarterly exports",
                    "Use program completion date for cohort tracking",
                  ].map(pref => (
                    <div key={pref} className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">{pref}</Label>
                      <Switch defaultChecked={true} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Definitions */}
        <TabsContent value="definitions">
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg mb-4">
              <p className="text-xs text-primary">
                <strong>Why this matters:</strong> Clear metric definitions create trust with funders, partners, and your own team. These definitions explain exactly what each number means when Denise reports outcomes.
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
                        <Textarea
                          defaultValue={def.definition}
                          className="text-sm resize-none min-h-16"
                          autoFocus
                        />
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
