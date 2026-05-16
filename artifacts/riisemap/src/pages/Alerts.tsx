import { useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, Filter, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { alerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

type AlertStatus = "New" | "In Progress" | "Resolved" | "Dismissed";

export default function Alerts() {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [alertStatuses, setAlertStatuses] = useState<Record<string, AlertStatus>>(
    Object.fromEntries(alerts.map(a => [a.id, a.status as AlertStatus]))
  );

  const filtered = alerts.filter(a => {
    const matchSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || alertStatuses[a.id] === filterStatus;
    return matchSeverity && matchStatus;
  });

  const updateStatus = (id: string, status: AlertStatus) => {
    setAlertStatuses(prev => ({ ...prev, [id]: status }));
  };

  const counts = {
    high: alerts.filter(a => a.severity === "High").length,
    new: alerts.filter(a => alertStatuses[a.id] === "New").length,
    inProgress: alerts.filter(a => alertStatuses[a.id] === "In Progress").length,
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Learners who may need your support right now</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-red-700">{counts.high}</p>
          <p className="text-xs text-red-600 mt-0.5">High Severity</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-violet-700">{counts.new}</p>
          <p className="text-xs text-violet-600 mt-0.5">New Alerts</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-blue-700">{counts.inProgress}</p>
          <p className="text-xs text-blue-600 mt-0.5">In Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-alert-severity">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-alert-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(alert => {
          const status = alertStatuses[alert.id];
          const isResolved = status === "Resolved" || status === "Dismissed";
          return (
            <Card
              key={alert.id}
              data-testid={`alert-card-${alert.id}`}
              className={cn(
                "border-card-border shadow-sm transition-opacity",
                isResolved ? "opacity-60" : "",
                alert.severity === "High" && !isResolved ? "border-l-4 border-l-red-400" :
                alert.severity === "Medium" && !isResolved ? "border-l-4 border-l-amber-400" :
                "border-l-4 border-l-sky-300"
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} className={cn(
                          alert.severity === "High" ? "text-red-500" :
                          alert.severity === "Medium" ? "text-amber-500" : "text-sky-500"
                        )} />
                        <Link href={`/learners/${alert.learnerId}`}>
                          <span className="text-sm font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                            {alert.learner}
                          </span>
                        </Link>
                      </div>
                      <StatusBadge status={alert.severity} />
                      <StatusBadge status={status} />
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">{alert.reason}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium">Trigger:</span> {alert.trigger} ·
                      <span className="font-medium ml-1">Coach:</span> {alert.coach} ·
                      <span className="font-medium ml-1">Last activity:</span> {alert.lastActivity}
                    </p>

                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-0.5">Recommended action</p>
                      <p className="text-sm text-blue-700">{alert.recommendedAction}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0 min-w-[120px]">
                    {status === "New" && (
                      <>
                        <Button
                          size="sm" className="text-xs h-8 w-full"
                          onClick={() => updateStatus(alert.id, "In Progress")}
                          data-testid={`alert-start-${alert.id}`}
                        >
                          <Clock size={11} className="mr-1.5" /> Start
                        </Button>
                        <Button
                          variant="outline" size="sm" className="text-xs h-8 w-full"
                          onClick={() => updateStatus(alert.id, "Dismissed")}
                          data-testid={`alert-dismiss-${alert.id}`}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {status === "In Progress" && (
                      <>
                        <Button
                          size="sm" className="text-xs h-8 w-full bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateStatus(alert.id, "Resolved")}
                          data-testid={`alert-resolve-${alert.id}`}
                        >
                          <CheckCircle2 size={11} className="mr-1.5" /> Resolve
                        </Button>
                        <Link href={`/learners/${alert.learnerId}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8 w-full">
                            View Learner <ChevronRight size={11} />
                          </Button>
                        </Link>
                      </>
                    )}
                    {isResolved && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {status === "Resolved" ? <CheckCircle2 size={13} className="text-emerald-500" /> : <XCircle size={13} />}
                        <span>{status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No alerts matching your filters</p>
            <p className="text-xs text-muted-foreground mt-1">All learners are progressing well.</p>
          </div>
        )}
      </div>
    </div>
  );
}
