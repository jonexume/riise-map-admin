import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";
import {
  Download, Copy, Share2, Sparkles, FileText, CheckCircle2,
  Mail, X, Send, Paperclip, Check, Plus, Trash2
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
import { useGetLearners, useGetFundingSources, useGetPrograms, useGetPathways } from "@workspace/api-client-react";
import {
  impactMetrics, engagementTrend, readinessTrend,
  cohortCompletion, placementReadyTrend
} from "@/data/mockData";
import { Users, TrendingUp, Star, Calendar, BookOpen, Briefcase, Printer } from "lucide-react";

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

  const [copied, setCopied] = useState(false);
  const [grantCopied, setGrantCopied] = useState(false);

  const [storyList, setStoryList] = useState<any[]>([]);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyLearner, setStoryLearner] = useState("");
  const [storyLearnerId, setStoryLearnerId] = useState("");
  const [storyHeadline, setStoryHeadline] = useState("");
  const [storyPathway, setStoryPathway] = useState("");
  const [storyNarrative, setStoryNarrative] = useState("");
  const [storyDataPoints, setStoryDataPoints] = useState<string[]>([""]);
  const [storyTags, setStoryTags] = useState<string[]>([""]);
  const [storySaved, setStorySaved] = useState(false);

  const { data: learners = [] } = useGetLearners();
  const { data: fundingSources = [] } = useGetFundingSources();
  const { data: programs = [] } = useGetPrograms();
  const { data: pathways = [] } = useGetPathways();
  const baseUrl = import.meta.env.VITE_API_URL || "";

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/success-stories`);
      if (res.ok) setStoryList(await res.json());
    } catch { /* ignore */ }
  }, [baseUrl]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  async function handleSaveStory() {
    if (!storyLearner.trim() || !storyNarrative.trim()) return;
    try {
      await fetch(`${baseUrl}/api/success-stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: storyLearnerId ? Number(storyLearnerId) : null,
          learnerName: storyLearner.trim(),
          headline: storyHeadline.trim() || "Success Story",
          story: storyNarrative.trim(),
          dataPoints: storyDataPoints.filter(d => d.trim()),
          tags: storyTags.filter(t => t.trim()),
        }),
      });
      fetchStories();
      setShowCreateStory(false);
      setStoryLearner(""); setStoryLearnerId(""); setStoryHeadline(""); setStoryPathway("");
      setStoryNarrative(""); setStoryDataPoints([""]); setStoryTags([""]);
      setStorySaved(true);
      setTimeout(() => setStorySaved(false), 3000);
    } catch { /* ignore */ }
  }

  async function handleDeleteStory(id: number) {
    await fetch(`${baseUrl}/api/success-stories/${id}`, { method: "DELETE" });
    fetchStories();
  }

  async function handleSelectLearner(learnerId: string) {
    setStoryLearnerId(learnerId);
    if (!learnerId) return;
    try {
      const res = await fetch(`${baseUrl}/api/learners/${learnerId}/summary`);
      if (res.ok) {
        const summary = await res.json();
        setStoryLearner(summary.learnerName);
        setStoryPathway(summary.pathway);
        setStoryDataPoints(summary.dataPoints);
      }
    } catch { /* ignore */ }
  }

  function closeCreateStory() {
    setShowCreateStory(false);
    setStoryLearner(""); setStoryHeadline(""); setStoryPathway("");
    setStoryNarrative(""); setStoryDataPoints([""]); setStoryTags([""]);
  }

  const handleCopyNarrative = () => {
    const text = "This quarter, Atlanta Workforce Tech Alliance supported 50 learners across three technology pathways. Learners completed 63% of assigned roadmap milestones, participated in 18 career development events, and 5 learners reached placement-ready status. Average readiness score improved to 68/100, with 34 job applications submitted and 9 placements achieved.";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyGrantNarrative = () => {
    const text = buildReportText(includeStories);
    navigator.clipboard.writeText(text).then(() => {
      setGrantCopied(true);
      setTimeout(() => setGrantCopied(false), 2500);
    });
  };

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
    { label: "Total Learners Served", value: impactMetrics.totalLearnersServed, icon: Users, href: "/learners" },
    { label: "Active Learners", value: impactMetrics.activeLearners, icon: Users, href: "/learners" },
    { label: "Roadmap Completion", value: `${impactMetrics.roadmapCompletion}%`, icon: BookOpen, href: "/learners" },
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

      <Tabs defaultValue="funding-report">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="funding-report" className="text-xs">Funding Report</TabsTrigger>
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
                <Button
                  variant="outline" size="sm" className="text-xs h-8"
                  onClick={handleCopyNarrative}
                  data-testid="copy-narrative-btn"
                >
                  {copied
                    ? <><Check size={12} className="mr-1.5 text-emerald-600" /><span className="text-emerald-600">Copied</span></>
                    : <><Copy size={12} className="mr-1.5" /> Copy Narrative</>
                  }
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
              <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} href={m.href} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
            {metrics.slice(6).map(m => (
              <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} href={m.href} />
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

        {/* Funding Report */}
        <TabsContent value="funding-report">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Funding Source Report</h2>
                <p className="text-sm text-muted-foreground">Funding Sources → Programs → Pathways → Learners</p>
              </div>
              <Button size="sm" onClick={() => window.print()}>
                <Printer size={14} className="mr-1.5" /> Print Report
              </Button>
            </div>

            <div id="funding-report-content" className="space-y-6 print:space-y-4">
              {fundingSources.map((fs: any) => {
                const relatedPrograms = programs.filter((p: any) => p.funderTag === fs.name);
                return (
                  <Card key={fs.id} className="border-card-border shadow-sm print:shadow-none print:border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Briefcase size={16} className="text-primary" />
                        {fs.name}
                      </CardTitle>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        {fs.amount && <span>Amount: ${Number(fs.amount).toLocaleString()}</span>}
                        {fs.startDate && <span>Start: {fs.startDate}</span>}
                        {fs.endDate && <span>End: {fs.endDate}</span>}
                        {fs.learnerCount && <span>Target: {fs.learnerCount} learners</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {relatedPrograms.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No programs linked to this funding source.</p>
                      ) : (
                        <div className="space-y-4">
                          {relatedPrograms.map((prog: any) => {
                            const relatedPathways = pathways.filter((pw: any) => pw.programCategory === prog.name);
                            const relatedLearners = learners.filter((l: any) => l.program === prog.name);
                            return (
                              <div key={prog.id} className="ml-4 border-l-2 border-primary/20 pl-4">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <BookOpen size={14} className="text-blue-600" />
                                  {prog.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">{prog.description}</p>

                                {relatedPathways.length > 0 && (
                                  <div className="ml-4 mb-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pathways</p>
                                    <div className="space-y-1">
                                      {relatedPathways.map((pw: any) => (
                                        <div key={pw.id} className="text-xs text-foreground flex items-center gap-1.5">
                                          <TrendingUp size={10} className="text-emerald-500" />
                                          {pw.name} <span className="text-muted-foreground">({pw.estimatedWeeks} weeks)</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {relatedLearners.length > 0 && (
                                  <div className="ml-4">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Learners ({relatedLearners.length})</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                      {relatedLearners.map((l: any) => (
                                        <div key={l.id} className="text-xs text-foreground flex items-center gap-1.5">
                                          <Users size={10} className="text-primary" />
                                          {l.name} <span className="text-muted-foreground">— {l.pathway}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleCopyGrantNarrative} data-testid="copy-narrative">
                        {grantCopied
                          ? <><Check size={12} className="mr-1.5 text-emerald-600" /><span className="text-emerald-600">Copied</span></>
                          : <><Copy size={12} className="mr-1.5" />Copy Narrative</>
                        }
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

        {/* Success Stories */}
        <TabsContent value="stories">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Success Stories</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real learner journeys for grant reporting and community storytelling</p>
            </div>
            <div className="flex items-center gap-2">
              {storySaved && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={12} /> Story saved
                </span>
              )}
              <Button size="sm" data-testid="create-story-btn" onClick={() => setShowCreateStory(true)}>
                <Sparkles size={13} className="mr-1.5" /> Create Story
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {storyList.map(story => (
              <Card key={story.id} data-testid={`story-card-${story.id}`} className="border-card-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{(story.learnerName || story.learner || "").split(" ").map((n: string) => n[0]).join("")}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{story.learnerName || story.learner}</p>
                        <p className="text-xs text-muted-foreground">{story.headline}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2.5"><Copy size={11} /></Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 text-destructive hover:text-destructive" onClick={() => handleDeleteStory(story.id)}>
                        <Trash2 size={11} />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Data Points</p>
                      <div className="space-y-1.5">
                        {story.dataPoints.map((d: string) => (
                          <div key={d} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-foreground">{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {story.tags.map((t: string) => (
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

      </Tabs>

      {/* Create Story Modal */}
      {showCreateStory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={closeCreateStory}>
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h2 className="text-base font-semibold text-foreground">Create Success Story</h2>
              </div>
              <button onClick={closeCreateStory} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Learner <span className="text-destructive">*</span></label>
                  <Select value={storyLearnerId} onValueChange={handleSelectLearner}>
                    <SelectTrigger className="h-9 text-sm" data-testid="story-learner-input">
                      <SelectValue placeholder="Choose a learner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {learners.map((l: any) => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Headline</label>
                <Input
                  placeholder="e.g. From retail to tech in 12 weeks"
                  value={storyHeadline}
                  onChange={e => setStoryHeadline(e.target.value)}
                  className="text-sm h-9"
                  data-testid="story-headline-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Story Narrative <span className="text-destructive">*</span></label>
                <Textarea
                  placeholder="Describe this learner's journey, growth, and outcomes in 2–4 sentences..."
                  value={storyNarrative}
                  onChange={e => setStoryNarrative(e.target.value)}
                  className="text-sm min-h-28 resize-none"
                  data-testid="story-narrative-input"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground">Data Points</label>
                  <button
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={() => setStoryDataPoints(prev => [...prev, ""])}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {storyDataPoints.map((dp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder={`e.g. Readiness score improved from 42 to 72`}
                        value={dp}
                        onChange={e => setStoryDataPoints(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                        className="text-sm h-8 flex-1"
                      />
                      {storyDataPoints.length > 1 && (
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          onClick={() => setStoryDataPoints(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground">Tags</label>
                  <button
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={() => setStoryTags(prev => [...prev, ""])}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {storyTags.map((tag, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Input
                        placeholder="e.g. Career Transition"
                        value={tag}
                        onChange={e => setStoryTags(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                        className="text-sm h-7 w-40"
                      />
                      {storyTags.length > 1 && (
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => setStoryTags(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={closeCreateStory}>Cancel</Button>
              <Button
                size="sm" className="text-xs h-8"
                disabled={!storyLearner.trim() || !storyNarrative.trim()}
                onClick={handleSaveStory}
                data-testid="save-story-btn"
              >
                <Check size={12} className="mr-1.5" /> Save Story
              </Button>
            </div>
          </div>
        </div>
      )}

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
