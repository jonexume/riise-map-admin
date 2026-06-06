import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, User, BookOpen, FolderKanban, Calendar,
  FileText, BarChart3, Activity, Plus, Flag, CheckSquare,
  Clock, ChevronRight, CheckCircle2, Circle, AlertCircle, Check,
  Upload, Edit, Trash2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useGetLearner, useUpdateLearner, type Learner,
  useGetLearnerRoadmaps, useGetLearnerProjects, useGetLearnerEvents,
  useGetLearnerNotes, useCreateLearnerNote, useUpdateLearnerNote, useDeleteLearnerNote,
  useGetLearnerReadiness, useGetLearnerActivities
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function LearnerDetail() {
  const { id } = useParams<{ id: string }>();
  const learnerId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const { data: learner, isLoading } = useGetLearner(learnerId);
  const updateLearnerMutation = useUpdateLearner({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/learners/${learnerId}`] }) } });
  const { data: roadmap = [] } = useGetLearnerRoadmaps(learnerId);
  const { data: projects = [] } = useGetLearnerProjects(learnerId);
  const { data: events = [] } = useGetLearnerEvents(learnerId);
  const { data: notes = [] } = useGetLearnerNotes(learnerId);
  const { data: readiness = [] } = useGetLearnerReadiness(learnerId);
  const { data: activity = [] } = useGetLearnerActivities(learnerId);
  const createNoteMutation = useCreateLearnerNote(learnerId);
  const updateNoteMutation = useUpdateLearnerNote(learnerId);
  const deleteNoteMutation = useDeleteLearnerNote(learnerId);
  const [newNote, setNewNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        updateLearnerMutation.mutate({ id: learnerId, data: { ...learner!, photo: photoUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading learner details...</p>
        </div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Learner not found</p>
          <Link href="/learners">
            <Button variant="outline" size="sm" className="mt-4">
              Back to Learners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const strengths: string[] = typeof learner.strengths === 'string' ? JSON.parse(learner.strengths) : learner.strengths || [];
  const risks: string[] = typeof learner.risks === 'string' ? JSON.parse(learner.risks) : learner.risks || [];

  function handleFlag() {
    updateLearnerMutation.mutate({ id: learnerId, data: { ...learner!, flaggedForSupport: !learner!.flaggedForSupport } });
  }

  function handleSaveNote() {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    createNoteMutation.mutate(
      { author: "Denise Carter", date: new Date().toISOString().split("T")[0], content: trimmed },
      { onSuccess: () => { setNewNote(""); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); } }
    );
  }

  const milestoneIcon = (state: string) => {
    if (state === "completed") return <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
    if (state === "in-progress") return <Clock size={16} className="text-blue-500 flex-shrink-0" />;
    if (state === "overdue") return <AlertCircle size={16} className="text-red-500 flex-shrink-0" />;
    return <Circle size={16} className="text-muted-foreground/40 flex-shrink-0" />;
  };

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/learners">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft size={14} />
          Back to Learners
        </button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {learner.photo
              ? <img src={learner.photo} alt={learner.name} className="w-full h-full object-cover" />
              : <Upload size={24} className="text-primary/60" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground" data-testid="learner-name">{learner.name}</h1>
              <StatusBadge status={learner.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{learner.pathway} · Coach: {learner.coach}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="text-xs h-8" data-testid="btn-add-note" onClick={() => setActiveTab("notes")}>
            <Plus size={12} className="mr-1.5" /> Add Note
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className={cn("text-xs h-8", learner.flaggedForSupport && "border-amber-300 bg-amber-50")}
              onClick={handleFlag}
              data-testid="btn-flag"
            >
              {learner.flaggedForSupport
                ? <><Flag size={12} className="mr-1.5 text-amber-600" /><span className="text-amber-700">Flagged for Support</span></>
                : <><Flag size={12} className="mr-1.5" /> Flag for Support</>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Readiness Score</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5" data-testid="readiness-score">{learner.readiness}</p>
          <p className="text-xs text-muted-foreground">out of 100</p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Roadmap Progress</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{learner.progress}%</p>
          <Progress value={learner.progress} className="h-1 mt-1.5" />
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Profile Strength</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">{learner.profileStrength || 0}%</p>
          <Progress value={learner.profileStrength || 0} className="h-1 mt-1.5" />
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Last Active</p>
          <p className="text-sm font-semibold text-foreground mt-1">{learner.lastActive}</p>
          <p className="text-xs text-muted-foreground">Joined {learner.joinDate}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs"><User size={12} className="mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs"><FileText size={12} className="mr-1" />Notes</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-card-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm">About</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{learner.background || "Background information not yet added."}</p>
                {strengths.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-foreground mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {strengths.map(s => (
                        <span key={s} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-card-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Next Recommended Action</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">{learner.nextAction}</p>
                </div>
                {risks.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-foreground mb-2">Attention Areas</p>
                    <div className="space-y-1.5">
                      {risks.map(r => (
                        <div key={r} className="flex items-center gap-2 text-xs text-amber-700">
                          <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roadmap */}
        <TabsContent value="roadmap">
          <Card className="border-card-border">
            <CardContent className="pt-5">
              {roadmap.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Roadmap milestones not yet configured.</p>
              ) : (
                <div className="space-y-2">
                  {(["completed", "in-progress", "overdue", "upcoming"] as const).map(state => {
                    const items = roadmap.filter(m => m.state === state);
                    if (items.length === 0) return null;
                    const labels = { completed: "Completed", "in-progress": "In Progress", overdue: "Overdue", upcoming: "Upcoming" };
                    return (
                      <div key={state} className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{labels[state]}</p>
                        <div className="space-y-2">
                          {items.map(m => (
                            <div key={m.id} className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border",
                              state === "completed" ? "bg-emerald-50/50 border-emerald-100" :
                              state === "in-progress" ? "bg-blue-50/50 border-blue-100" :
                              state === "overdue" ? "bg-red-50/50 border-red-100" :
                              "bg-muted/30 border-border"
                            )}>
                              {milestoneIcon(state)}
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{m.title}</p>
                                <p className="text-xs text-muted-foreground">Due {m.dueDate}</p>
                              </div>
                              {state !== "completed" && state !== "upcoming" && (
                                <Button size="sm" variant="outline" className="text-xs h-7 px-2.5" data-testid={`milestone-action-${m.id}`}>
                                  {state === "overdue" ? "Mark complete" : "Update"}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects">
          <div className="space-y-3">
            {projects.length === 0 ? (
              <Card className="border-card-border"><CardContent className="py-8 text-center text-sm text-muted-foreground">No projects assigned yet.</CardContent></Card>
            ) : projects.map(p => (
              <Card key={p.id} className="border-card-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FolderKanban size={14} className="text-primary" />
                      <p className="text-sm font-medium text-foreground">{p.title}</p>
                    </div>
                    <StatusBadge status={p.status === "completed" ? "On Track" : p.status === "in-progress" ? "Needs Support" : "New Learner"} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={p.completion} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{p.completion}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events">
          <div className="space-y-2">
            {events.length === 0 ? (
              <Card className="border-card-border"><CardContent className="py-8 text-center text-sm text-muted-foreground">No events recorded yet.</CardContent></Card>
            ) : events.map(e => (
              <div key={e.id} className={cn(
                "flex items-center gap-3 p-3.5 rounded-lg border",
                e.status === "attended" ? "bg-emerald-50/40 border-emerald-100" :
                e.status === "upcoming" ? "bg-blue-50/40 border-blue-100" :
                "bg-red-50/30 border-red-100"
              )}>
                <Calendar size={14} className={cn(
                  e.status === "attended" ? "text-emerald-600" :
                  e.status === "upcoming" ? "text-blue-600" : "text-red-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  e.status === "attended" ? "bg-emerald-100 text-emerald-700" :
                  e.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Readiness */}
        <TabsContent value="readiness">
          <Card className="border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Readiness Dimensions</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              {readiness.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Readiness data not yet available.</p>
              ) : readiness.map(r => (
                <div key={r.dimension}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium">{r.dimension}</span>
                    <span className={cn(
                      "font-semibold",
                      r.score >= 80 ? "text-emerald-600" : r.score >= 60 ? "text-blue-600" : "text-amber-600"
                    )}>{r.score}</span>
                  </div>
                  <Progress value={r.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card className="border-card-border">
            <CardContent className="pt-5">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activity recorded yet.</p>
              ) : (
                <div className="space-y-0">
                  {activity.map((a, i) => {
                    const icons: Record<string, typeof Activity> = {
                      milestone: CheckSquare, event: Calendar,
                      note: FileText, login: User, project: FolderKanban,
                    };
                    const Icon = icons[a.type] ?? Activity;
                    return (
                      <div key={a.id} className="flex gap-4 pb-4">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon size={12} className="text-primary" />
                          </div>
                          {i < activity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-1 pt-1">
                          <p className="text-sm text-foreground">{a.event}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <div className="space-y-4">
            <Card className="border-card-border">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Add a note</p>
                <Textarea
                  placeholder="Share an observation, update, or next step for this learner..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="text-sm min-h-20 resize-none"
                  data-testid="add-note-input"
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  {noteSaved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <Check size={12} /> Saved
                    </span>
                  )}
                  <Button size="sm" className="text-xs h-8" disabled={!newNote.trim()} onClick={handleSaveNote} data-testid="save-note-btn">
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
            {notes.map(n => (
              <Card key={n.id} className="border-card-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{n.author.split(" ").map(x => x[0]).join("")}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{n.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{n.date}</span>
                      {editingNoteId !== n.id && (
                        <>
                          <button onClick={() => { setEditingNoteId(n.id); setEditingContent(n.content); }} className="text-muted-foreground hover:text-foreground"><Edit size={12} /></button>
                          <button onClick={() => deleteNoteMutation.mutate(n.id)} className="text-muted-foreground hover:text-red-600"><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingNoteId === n.id ? (
                    <div>
                      <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="text-sm min-h-16 resize-none" />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setEditingNoteId(null)}><X size={12} className="mr-1" />Cancel</Button>
                        <Button size="sm" className="text-xs h-7" onClick={() => updateNoteMutation.mutate({ noteId: n.id, content: editingContent }, { onSuccess: () => setEditingNoteId(null) })}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{n.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
