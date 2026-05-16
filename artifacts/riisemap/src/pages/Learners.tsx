import { useState } from "react";
import { Link } from "wouter";
import { Search, LayoutGrid, List, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { learners } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Learners() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCoach, setFilterCoach] = useState("all");
  const [filterPathway, setFilterPathway] = useState("all");

  const filtered = learners.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.pathway.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchCoach = filterCoach === "all" || l.coach === filterCoach;
    const matchPathway = filterPathway === "all" || l.pathway === filterPathway;
    return matchSearch && matchStatus && matchCoach && matchPathway;
  });

  const coaches = [...new Set(learners.map(l => l.coach))];
  const pathways = [...new Set(learners.map(l => l.pathway))];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Learners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{learners.length} learners enrolled across 3 programs</p>
        </div>
        <Button size="sm" data-testid="invite-learners-btn">
          Invite Learners
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
            {coaches.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPathway} onValueChange={setFilterPathway}>
          <SelectTrigger className="w-52 h-9 text-sm" data-testid="filter-pathway">
            <SelectValue placeholder="Pathway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pathways</SelectItem>
            {pathways.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        Showing {filtered.length} of {learners.length} learners
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
                  {filtered.map((learner, i) => (
                    <tr
                      key={learner.id}
                      data-testid={`learner-row-${learner.id}`}
                      className={cn("hover:bg-muted/20 transition-colors", i !== filtered.length - 1 && "border-b")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {learner.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{learner.name}</div>
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
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            learner.readiness >= 80 ? "bg-emerald-100 text-emerald-700" :
                            learner.readiness >= 60 ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {learner.readiness}
                          </div>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((learner) => (
            <Link key={learner.id} href={`/learners/${learner.id}`}>
              <Card
                data-testid={`learner-card-${learner.id}`}
                className="border-card-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {learner.name.split(" ").map(n => n[0]).join("")}
                        </span>
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
          ))}
        </div>
      )}
    </div>
  );
}
