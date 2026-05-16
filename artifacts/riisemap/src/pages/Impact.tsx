import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";
import {
  Download, Copy, Share2, Sparkles, FileText, CheckCircle2,
  Mail, X, Send, Paperclip, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/MetricCard";
import {
  impactMetrics, engagementTrend, readinessTrend,
  cohortCompletion, placementReadyTrend, successStories
} from "@/data/mockData";
import { Users, TrendingUp, Star, Calendar, BookOpen, Briefcase } from "lucide-react";

const exportReports = [
  { type: "Quarterly Impact Report", lastGenerated: "Apr 30, 2026", metrics: ["Active learners", "Readiness scores", "Event participation", "Placements"] },
  { type: "Annual Grant Report", lastGenerated: "Jan 15, 2026", metrics: ["All programs", "Cohort outcomes", "Success stories", "Funder metrics"] },
  { type: "Cohort Progress Report", lastGenerated: "May 1, 2026", metrics: ["Roadmap completion", "Milestones", "Projects", "Readiness"] },
  { type: "Learner Readiness Report", lastGenerated: "May 5, 2026", metrics: ["Individual readiness", "6 dimensions", "Coach notes", "Next steps"] },
  { type: "Event Participation Report", lastGenerated: "May 10, 2026", metrics: ["Attendance rates", "Event types", "Pathway coverage"] },
  { type: "Placement Outcomes Report", lastGenerated: "Apr 15, 2026", metrics: ["Applications", "Interviews", "Placements", "Time to placement"] },
  { type: "Funder Summary", lastGenerated: "Apr 30, 2026", metrics: ["Key outcomes", "Grant utilization", "Impact narrative"] },
  { type: "Board Presentation Summary", lastGenerated: "Mar 31, 2026", metrics: ["High-level metrics", "Charts", "Success stories"] },
];

const REPORT_FILENAME = "AWTA_Q2_2026_Impact_Summary.txt";

function buildReportText(includeStories: boolean): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return [
    "ATLANTA WORKFORCE TECH ALLIANCE",
    "Q2 2026 IMPACT SUMMARY REPORT",
    `Generated: ${today}`,
    "=====================================================",
    "",
    "1. EXECUTIVE SUMMARY",
    "---------------------",
    "Atlanta Workforce Tech Alliance delivered technology career programming to 50 learners",
    "during Q2 2026 across three cohort programs. This report documents measurable outcomes",
    "in learner engagement, skill development, workforce readiness, and placement.",
    "",
    "2. LEARNERS SERVED",
    "-------------------",
    `Total Learners Served:          ${impactMetrics.totalLearnersServed}`,
    `Active Learners:                ${impactMetrics.activeLearners}`,
    `Placement-Ready Learners:       ${impactMetrics.placementReadyLearners}`,
    `New Enrollments (Q2):           3`,
    "",
    "3. PROGRAM ACTIVITIES",
    "----------------------",
    "Active Programs:                3",
    "Active Pathways:                5",
    "Career Development Events:      18",
    "Total Event Seats Filled:       50",
    "",
    "Programs delivered:",
    "  - Tech Career Launch",
    "  - Customer Success Accelerator",
    "  - Data Operations Starter",
    "",
    "4. ROADMAP PROGRESS",
    "--------------------",
    `Average Roadmap Completion:     ${impactMetrics.roadmapCompletion}%`,
    `Milestone Completion Rate:      ${impactMetrics.skillMilestoneCompletion}%`,
    "Total Milestones Completed:     478",
    "",
    "5. PROJECT COMPLETION",
    "----------------------",
    `Overall Project Completion:     ${impactMetrics.projectCompletionRate}%`,
    "Applied Learning Projects:      5 active",
    "Highest Completion:             Data Cleanup Challenge (82%)",
    "",
    "6. EVENT PARTICIPATION",
    "-----------------------",
    `Event Participation Rate:       ${impactMetrics.eventParticipationRate}%`,
    "Event Types: Workshops, Mock Interviews, Employer Panels, Office Hours, Networking",
    "Highest Attendance:             Mock Interview Night (91%)",
    "",
    "7. WORKFORCE READINESS",
    "-----------------------",
    "Average Readiness Score:        68 / 100",
    "Resume Readiness:               72",
    "Interview Readiness:            65",
    "Portfolio Readiness:            70",
    `Average Weeks to Readiness:     ${impactMetrics.avgWeeksToReadiness} weeks`,
    "",
    "8. PLACEMENT OUTCOMES",
    "----------------------",
    `Placement-Ready Learners:       ${impactMetrics.placementReadyLearners}`,
    `Job Applications Submitted:     ${impactMetrics.jobApplicationsSubmitted}`,
    `Interviews Completed:           ${impactMetrics.interviewsCompleted}`,
    `Placements Achieved:            ${impactMetrics.placementsAchieved}`,
    "Average Time to Placement:      6 weeks from readiness status",
    "",
    ...(includeStories ? [
      "9. SUCCESS STORIES",
      "-------------------",
      "Maya Thompson — Customer Success Pathway",
      "  A former retail supervisor who improved her readiness score from 42 to 72.",
      "  Completed 3 applied projects and attended 5 professional development events.",
      "",
      "Tasha Green — Data Operations Pathway",
      "  Achieved placement-ready status with a readiness score of 84 after 14 weeks.",
      "  Top-performing learner in her cohort with an 81% roadmap completion rate.",
      "",
    ] : []),
    `${includeStories ? "10" : "9"}. RECOMMENDED NEXT INVESTMENTS`,
    "-----------------------------------",
    "  - Expand Mock Interview Night capacity (currently at 80% registration)",
    "  - Add cohort for Data Operations — highest completion rate at 74%",
    "  - Increase employer panel frequency to build pipeline for Q3 placements",
    "",
    "=====================================================",
    "Atlanta Workforce Tech Alliance | atltechalliance.org",
    `Report generated via RiiseMap on ${today}`,
  ].join("\n");
}

function buildExportReportText(reportType: string): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return [
    "ATLANTA WORKFORCE TECH ALLIANCE",
    reportType.toUpperCase(),
    `Generated: ${today}`,
    "=====================================================",
    "",
    "1. EXECUTIVE SUMMARY",
    "---------------------",
    `This ${reportType} covers Q2 2026 outcomes for Atlanta Workforce Tech Alliance,`,
    "including learner engagement, skill development, and workforce placement data.",
    "",
    "2. KEY METRICS",
    "---------------",
    `Total Learners Served:    ${impactMetrics.totalLearnersServed}`,
    `Active Learners:          ${impactMetrics.activeLearners}`,
    `Roadmap Completion:       ${impactMetrics.roadmapCompletion}%`,
    `Placement-Ready:          ${impactMetrics.placementReadyLearners}`,
    `Placements Achieved:      ${impactMetrics.placementsAchieved}`,
    `Event Participation:      ${impactMetrics.eventParticipationRate}%`,
    `Avg Readiness Score:      68 / 100`,
    "",
    "3. PROGRAM HIGHLIGHTS",
    "----------------------",
    "  Tech Career Launch          — 67% completion rate, 34 learners",
    "  Customer Success Accelerator — 58% completion rate, 28 learners",
    "  Data Operations Starter     — 74% completion rate, 21 learners",
    "",
    "4. OUTCOMES",
    "------------",
    `Applications Submitted:   ${impactMetrics.jobApplicationsSubmitted}`,
    `Interviews Completed:     ${impactMetrics.interviewsCompleted}`,
    `Offers / Placements:      ${impactMetrics.placementsAchieved}`,
    "",
    "=====================================================",
    "Atlanta Workforce Tech Alliance | atltechalliance.org",
    `Report generated via RiiseMap on ${today}`,
  ].join("\n");
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Impact() {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportProgram, setReportProgram] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includeStories, setIncludeStories] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState("Q2 2026 Impact Summary Report — Atlanta Workforce Tech Alliance");
  const [emailMessage, setEmailMessage] = useState(
    "Hi,\n\nPlease find attached the Q2 2026 Impact Summary Report for Atlanta Workforce Tech Alliance.\n\nThis report includes learner engagement metrics, roadmap completion rates, workforce readiness scores, and placement outcomes for the quarter.\n\nLet me know if you have any questions.\n\nBest,\nDenise Carter\nProgram Manager, Atlanta Workforce Tech Alliance"
  );
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const metrics = [
    { label: "Total Learners Served", value: impactMetrics.totalLearnersServed, icon: Users },
    { label: "Active Learners", value: impactMetrics.activeLearners, icon: Users },
    { label: "Roadmap Completion", value: `${impactMetrics.roadmapCompletion}%`, icon: BookOpen },
    { label: "Skill Milestones", value: `${impactMetrics.skillMilestoneCompletion}%`, icon: CheckCircle2 },
    { label: "Project Completion", value: `${impactMetrics.projectCompletionRate}%`, icon: Star },
    { label: "Event Participation", value: `${impactMetrics.eventParticipationRate}%`, icon: Calendar },
    { label: "Placement-Ready", value: impactMetrics.placementReadyLearners, icon: TrendingUp },
    { label: "Applications Submitted", value: impactMetrics.jobApplicationsSubmitted, icon: Briefcase },
    { label: "Interviews Completed", value: impactMetrics.interviewsCompleted, icon: Briefcase },
    { label: "Placements Achieved", value: impactMetrics.placementsAchieved, icon: TrendingUp },
    { label: "Avg Weeks to Readiness", value: `${impactMetrics.avgWeeksToReadiness} wks`, icon: Calendar },
  ];

  const handleExportSummary = () => {
    downloadFile(buildReportText(includeStories), REPORT_FILENAME);
  };

  const handleExportReport = (reportType: string) => {
    const filename = reportType.toLowerCase().replace(/\s+/g, "_") + ".txt";
    downloadFile(buildExportReportText(reportType), filename);
  };

  const handleSendEmail = () => {
    if (!emailTo.trim()) {
      setEmailError("Please enter a recipient email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setEmailSent(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setTimeout(() => {
      setEmailSent(false);
      setEmailError("");
    }, 300);
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Impact & Reporting</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Evidence-based outcomes for funders, leadership, and community partners</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="dashboard" className="text-xs">Impact Dashboard</TabsTrigger>
          <TabsTrigger value="grant" className="text-xs">Grant Report Builder</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs">Outcome Metrics</TabsTrigger>
          <TabsTrigger value="stories" className="text-xs">Success Stories</TabsTrigger>
          <TabsTrigger value="exports" className="text-xs">Exports</TabsTrigger>
        </TabsList>

        {/* Impact Dashboard */}
        <TabsContent value="dashboard">
          <Card className="border-card-border shadow-sm mb-6 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Quarterly Impact Summary — Q2 2026</h2>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-3xl">
                    This quarter, Atlanta Workforce Tech Alliance supported <strong className="text-foreground">50 learners</strong> across three technology pathways. Learners completed <strong className="text-foreground">63% of assigned roadmap milestones</strong>, participated in <strong className="text-foreground">18 career development events</strong>, and <strong className="text-foreground">5 learners reached placement-ready status</strong>.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <Copy size={12} className="mr-1.5" /> Copy Narrative
                </Button>
                <Button
                  variant="outline" size="sm" className="text-xs h-8"
                  onClick={() => { setShowEmailModal(true); setEmailSent(false); }}
                  data-testid="email-report-btn"
                >
                  <Mail size={12} className="mr-1.5" /> Email Report
                </Button>
                <Button
                  size="sm" className="text-xs h-8"
                  onClick={handleExportSummary}
                  data-testid="export-summary-btn"
                >
                  <Download size={12} className="mr-1.5" /> Export Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
            {metrics.slice(0, 6).map(m => (
              <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
            {metrics.slice(6).map(m => (
              <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-card-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Learner Engagement Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={engagementTrend}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(213 65% 46%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(213 65% 46%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(215 20% 88%)" }} />
                    <Area type="monotone" dataKey="active" stroke="hsl(213 65% 46%)" fill="url(#colorActive)" strokeWidth={2} name="Active" />
                    <Area type="monotone" dataKey="engaged" stroke="hsl(168 58% 44%)" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Engaged" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Readiness Score Improvement</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={readinessTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 80]} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(215 20% 88%)" }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(168 58% 44%)" strokeWidth={2.5} dot={{ fill: "hsl(168 58% 44%)", r: 4 }} name="Avg Readiness" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Roadmap Completion by Program</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={cohortCompletion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <YAxis type="category" dataKey="cohort" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(215 20% 88%)" }} formatter={(v) => [`${v}%`]} />
                    <Bar dataKey="completion" fill="hsl(213 65% 46%)" radius={[0, 4, 4, 0]} name="Completion %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Placement-Ready Learners Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={placementReadyTrend}>
                    <defs>
                      <linearGradient id="colorPlacement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(168 58% 44%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(168 58% 44%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(215 20% 88%)" }} />
                    <Area type="monotone" dataKey="count" stroke="hsl(168 58% 44%)" fill="url(#colorPlacement)" strokeWidth={2.5} name="Placement-Ready" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grant Report Builder */}
        <TabsContent value="grant">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="border-card-border sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Program</Label>
                    <Select value={reportProgram} onValueChange={setReportProgram}>
                      <SelectTrigger className="h-9 text-sm" data-testid="grant-program">
                        <SelectValue placeholder="Select program..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        <SelectItem value="tech">Tech Career Launch</SelectItem>
                        <SelectItem value="cs">Customer Success Accelerator</SelectItem>
                        <SelectItem value="data">Data Operations Starter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Grant Category</Label>
                    <Select value={reportCategory} onValueChange={setReportCategory}>
                      <SelectTrigger className="h-9 text-sm" data-testid="grant-category">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workforce">Workforce Readiness</SelectItem>
                        <SelectItem value="digital">Digital Skills Development</SelectItem>
                        <SelectItem value="mobility">Career Mobility</SelectItem>
                        <SelectItem value="economic">Community Economic Development</SelectItem>
                        <SelectItem value="employer">Employer Pipeline Development</SelectItem>
                        <SelectItem value="youth">Youth/Young Adult Career Pathways</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Date Range</Label>
                    <Select defaultValue="q2">
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q1">Q1 2026 (Jan–Mar)</SelectItem>
                        <SelectItem value="q2">Q2 2026 (Apr–Jun)</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                        <SelectItem value="annual">Full Year 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Include Demographics</Label>
                      <Switch checked={includeDemographics} onCheckedChange={setIncludeDemographics} data-testid="toggle-demographics" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Include Success Stories</Label>
                      <Switch checked={includeStories} onCheckedChange={setIncludeStories} data-testid="toggle-stories" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Include Charts</Label>
                      <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} data-testid="toggle-charts" />
                    </div>
                  </div>
                  <Button
                    className="w-full h-9 text-sm"
                    onClick={() => setReportGenerated(true)}
                    data-testid="generate-report-btn"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {!reportGenerated ? (
                <div className="h-80 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl">
                  <FileText size={36} className="text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">Configure and generate your report</p>
                  <p className="text-xs text-muted-foreground mt-1">Select your program and grant category, then click Generate Report</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">Report Preview</h2>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExportSummary} data-testid="export-pdf">
                        <Download size={12} className="mr-1.5" />Export PDF
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExportSummary} data-testid="export-csv">
                        Export CSV
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8" data-testid="copy-narrative">
                        <Copy size={12} className="mr-1.5" />Copy Narrative
                      </Button>
                      <Button size="sm" className="text-xs h-8" onClick={() => { setShowEmailModal(true); setEmailSent(false); }} data-testid="share-report">
                        <Mail size={12} className="mr-1.5" />Email
                      </Button>
                    </div>
                  </div>
                  <Card className="border-card-border shadow-sm">
                    <CardContent className="p-6 space-y-5">
                      {[
                        { num: "1", title: "Executive Summary", content: "Atlanta Workforce Tech Alliance delivered technology career programming to 50 learners during Q2 2026 across three cohort programs. This report documents measurable outcomes in learner engagement, skill development, workforce readiness, and placement." },
                        { num: "2", title: "Learners Served", content: "50 total learners enrolled. 45 active learners (90% active rate). 5 learners achieved placement-ready status. 3 learners enrolled in target quarter." },
                        { num: "3", title: "Program Activities", content: "3 active programs delivered across 5 career pathways. 18 career development events held. 50 total event seats filled. Programs include Tech Career Launch, Customer Success Accelerator, and Data Operations Starter." },
                        { num: "4", title: "Roadmap Progress", content: "Average roadmap completion: 63%. 71% of skill milestones completed. Learners progressed through structured pathway milestones with weekly coach support." },
                        { num: "5", title: "Skill Milestones", content: "478 individual milestones completed across all cohorts. Top milestone categories: CRM proficiency, technical troubleshooting, resume development, and interview preparation." },
                        { num: "6", title: "Project Completion", content: "68% overall project completion rate. 5 applied learning projects active. Highest completion: Data Cleanup Challenge (82%). Projects provide evidence of applied skill mastery." },
                        { num: "7", title: "Event Participation", content: "74% event participation rate. 6 event types delivered: workshops, mock interviews, employer panels, office hours, networking sessions. 91% attendance at Mock Interview Night." },
                        { num: "8", title: "Workforce Readiness", content: "Average readiness score: 68/100. Resume readiness: 72%. Interview readiness: 65%. Portfolio readiness: 70%. Average time to readiness: 14 weeks." },
                        { num: "9", title: "Placement Outcomes", content: "12 learners placement-ready. 34 job applications submitted. 28 interviews completed. 9 placements achieved. Average time to placement: 6 weeks from readiness." },
                        includeStories ? { num: "10", title: "Success Stories", content: "Maya Thompson, a former retail supervisor, improved her readiness score from 42 to 72 through the Customer Success pathway, completing 3 projects and attending 5 professional events. Tasha Green achieved placement-ready status with an 84 readiness score after 14 weeks in the Data Operations program." } : null,
                        { num: includeStories ? "11" : "10", title: "Recommended Next Investments", content: "Expand Mock Interview Night capacity (currently at 80% registration). Add cohort for Data Operations — highest completion rate (74%). Increase employer panel frequency to build pipeline for Q3 placements." },
                      ].filter(Boolean).map((section) => section && (
                        <div key={section.num} className="border-b border-border last:border-0 pb-4 last:pb-0">
                          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{section.num}. {section.title}</h3>
                          <p className="text-sm text-foreground leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Outcome Metrics */}
        <TabsContent value="metrics">
          <div className="flex gap-3 mb-5 flex-wrap">
            {["Program", "Pathway", "Date Range", "Coach"].map(f => (
              <Select key={f} defaultValue="all">
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder={f} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {f}s</SelectItem>
                </SelectContent>
              </Select>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { group: "Engagement", metrics: [{ name: "Active Learners", value: 45, max: 50 }, { name: "Login Consistency", value: 74, max: 100 }, { name: "Event Participation", value: 74, max: 100 }, { name: "Coach Check-ins", value: 82, max: 100 }] },
              { group: "Progress", metrics: [{ name: "Roadmap Completion", value: 63, max: 100 }, { name: "Milestone Completion", value: 71, max: 100 }, { name: "Project Completion", value: 68, max: 100 }, { name: "Profile Completion", value: 76, max: 100 }] },
              { group: "Readiness", metrics: [{ name: "Resume Readiness", value: 72, max: 100 }, { name: "Interview Readiness", value: 65, max: 100 }, { name: "Portfolio Readiness", value: 70, max: 100 }, { name: "Technical Confidence", value: 68, max: 100 }, { name: "Communication Readiness", value: 74, max: 100 }] },
              { group: "Workforce Outcomes", metrics: [{ name: "Applications Submitted", value: 18, max: 45 }, { name: "Interviews Completed", value: 14, max: 18 }, { name: "Offers Received", value: 5, max: 14 }, { name: "Placements Achieved", value: 4, max: 5 }, { name: "Avg Weeks to Placement", value: 6, max: 20 }] },
            ].map(group => (
              <Card key={group.group} className="border-card-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">{group.group}</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {group.metrics.map(m => (
                    <div key={m.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground text-xs">{m.name}</span>
                        <span className="font-semibold text-foreground text-xs">{m.value}</span>
                      </div>
                      <Progress value={(m.value / m.max) * 100} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            <Card className="border-card-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Funding Efficiency</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { label: "Cost per Active Learner", value: "$1,240" },
                  { label: "Cost per Placement-Ready Learner", value: "$8,750" },
                  { label: "Cost per Placement", value: "$13,200" },
                  { label: "Program Retention Rate", value: "87%" },
                  { label: "Completion Rate (CS Pathway)", value: "58%" },
                  { label: "Completion Rate (Data Pathway)", value: "74%" },
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className="text-sm font-semibold text-foreground">{m.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Success Stories */}
        <TabsContent value="stories">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Success Stories</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real learner journeys for grant reporting and community storytelling</p>
            </div>
            <Button size="sm" data-testid="create-story-btn">
              <Sparkles size={13} className="mr-1.5" /> Create Story
            </Button>
          </div>
          <div className="space-y-4">
            {successStories.map(story => (
              <Card key={story.id} data-testid={`story-card-${story.id}`} className="border-card-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{story.learner.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{story.learner}</p>
                        <p className="text-xs text-muted-foreground">{story.headline}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">Edit</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2.5"><Copy size={11} /></Button>
                      <Button size="sm" className="text-xs h-7 px-2.5">Add to Report</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Data Points</p>
                      <div className="space-y-1.5">
                        {story.dataPoints.map(d => (
                          <div key={d} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-foreground">{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {story.tags.map(t => (
                          <span key={t} className="text-[11px] bg-primary/8 text-primary border border-primary/15 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Generated Story</p>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border">{story.story}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Exports */}
        <TabsContent value="exports">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Export Reports</p>
              <p className="text-xs text-muted-foreground mt-0.5">Download formatted reports or send them by email</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { setShowEmailModal(true); setEmailSent(false); }}>
              <Mail size={12} className="mr-1.5" /> Email Report
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportReports.map(report => (
              <Card key={report.type} data-testid={`export-card-${report.type.toLowerCase().replace(/\s+/g, "-")}`} className="border-card-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{report.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Last generated: {report.lastGenerated}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-3">
                      <Button
                        variant="outline" size="sm" className="text-xs h-8"
                        onClick={() => { setEmailSubject(`${report.type} — Atlanta Workforce Tech Alliance`); setShowEmailModal(true); setEmailSent(false); }}
                      >
                        <Mail size={11} className="mr-1" />
                      </Button>
                      <Button
                        size="sm" className="text-xs h-8"
                        onClick={() => handleExportReport(report.type)}
                        data-testid={`export-${report.type.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Download size={12} className="mr-1.5" /> Export
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.metrics.map(m => (
                      <span key={m} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Report Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={closeEmailModal}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {emailSent ? (
              /* Confirmation screen */
              <div className="flex flex-col items-center text-center px-8 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check size={30} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Report sent</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Your impact report was sent to <span className="font-medium text-foreground">{emailTo}</span>.
                </p>

                <div className="w-full bg-muted/40 border border-border rounded-xl p-4 text-left mb-7 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-14 flex-shrink-0">To</span>
                    <span className="font-medium text-foreground">{emailTo}</span>
                  </div>
                  {emailCc && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground w-14 flex-shrink-0">CC</span>
                      <span className="font-medium text-foreground">{emailCc}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-14 flex-shrink-0">Subject</span>
                    <span className="font-medium text-foreground truncate">{emailSubject}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs pt-1 border-t border-border mt-1">
                    <Paperclip size={11} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{REPORT_FILENAME}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={closeEmailModal}>Close</Button>
                  <Button className="flex-1" onClick={() => { setEmailSent(false); setEmailTo(""); setEmailCc(""); }}>
                    Send to Another
                  </Button>
                </div>
              </div>
            ) : (
              /* Compose screen */
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Email Impact Report</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Send the Q2 2026 summary report with a personal message</p>
                  </div>
                  <button onClick={closeEmailModal} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Attachment preview */}
                  <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{REPORT_FILENAME}</p>
                      <p className="text-xs text-muted-foreground">Q2 2026 Impact Summary · Text report</p>
                    </div>
                    <Paperclip size={14} className="text-muted-foreground flex-shrink-0" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">To</Label>
                    <Input
                      type="email"
                      className={`mt-1.5 h-10 text-sm ${emailError ? "border-destructive" : ""}`}
                      placeholder="recipient@organization.org"
                      value={emailTo}
                      onChange={e => { setEmailTo(e.target.value); setEmailError(""); }}
                      data-testid="email-to-input"
                    />
                    {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">CC <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      type="email"
                      className="mt-1.5 h-10 text-sm"
                      placeholder="cc@organization.org"
                      value={emailCc}
                      onChange={e => setEmailCc(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Subject</Label>
                    <Input
                      className="mt-1.5 h-10 text-sm"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Message</Label>
                    <Textarea
                      className="mt-1.5 text-sm resize-none"
                      rows={7}
                      value={emailMessage}
                      onChange={e => setEmailMessage(e.target.value)}
                      data-testid="email-message-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <Button variant="outline" onClick={closeEmailModal}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSendEmail} data-testid="send-email-btn">
                    <Send size={13} className="mr-2" /> Send Report
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
