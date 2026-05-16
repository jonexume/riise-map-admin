import { useState } from "react";
import { Plus, List, CalendarDays, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { events } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Events() {
  const [view, setView] = useState<"list" | "calendar">("list");

  const upcomingEvents = events.filter(e => e.attendanceRate === 0);
  const pastEvents = events.filter(e => e.attendanceRate > 0);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{events.length} events scheduled this month</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              data-testid="view-list-events"
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors", view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              data-testid="view-calendar-events"
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors", view === "calendar" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <CalendarDays size={13} /> Calendar
            </button>
          </div>
          <Button size="sm" data-testid="add-event-btn">
            <Plus size={14} className="mr-1.5" /> Add Event
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <Card className="border-card-border shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">May 2026</h2>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Offset for May starting on Thursday */}
              {[...Array(4)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const dayEvents = events.filter(e => e.date.includes(`May ${day},`));
                const isToday = day === 16;
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[60px] p-1.5 rounded-lg border text-xs",
                      isToday ? "border-primary bg-primary/5" : "border-border/50",
                      dayEvents.length > 0 ? "bg-blue-50/50" : ""
                    )}
                  >
                    <div className={cn("font-semibold mb-1", isToday ? "text-primary" : "text-foreground")}>{day}</div>
                    {dayEvents.map(e => (
                      <div key={e.id} className="text-[10px] bg-primary/10 text-primary rounded px-1 py-0.5 mb-0.5 truncate">{e.title}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Events</h2>
              <div className="space-y-3">
                {upcomingEvents.map(e => (
                  <EventCard key={e.id} event={e} upcoming />
                ))}
              </div>
            </div>
          )}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Events</h2>
              <div className="space-y-3">
                {pastEvents.map(e => (
                  <EventCard key={e.id} event={e} upcoming={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, upcoming }: { event: typeof events[0]; upcoming: boolean }) {
  return (
    <Card data-testid={`event-card-${event.id}`} className="border-card-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
              <StatusBadge status={event.type} />
              {event.date.includes("May 17") && (
                <span className="text-[11px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Tomorrow</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><CalendarDays size={12} />{event.date} · {event.time}</span>
              <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
              <span className="flex items-center gap-1"><Users size={12} />Host: {event.host}</span>
              <span className="flex items-center gap-1">Pathway: {event.pathway}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            <div className="flex items-center gap-5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium">{event.registered}/{event.capacity}</span>
                </div>
                <Progress value={(event.registered / event.capacity) * 100} className="h-1.5 w-28" />
              </div>
              {!upcoming && event.attendanceRate > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Attendance rate: </span>
                  <span className="font-medium text-emerald-600">{event.attendanceRate}%</span>
                </div>
              )}
              {event.linkedMilestone && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Linked milestone: </span>
                  <span className="font-medium text-foreground">{event.linkedMilestone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="text-xs h-8" data-testid={`event-attendance-${event.id}`}>
              View Attendance
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-8">Message</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
