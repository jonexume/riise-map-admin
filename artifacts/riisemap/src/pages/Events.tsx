import { useState } from "react";
import {
  Plus, List, CalendarDays, MapPin, Users, Clock,
  X, Mail, Check, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { events, learners } from "@/data/mockData";
import { cn } from "@/lib/utils";

type Event = typeof events[number];

/* ── Mock attendee generation ──────────────────────────────
   Pulls a deterministic slice of learners for each event,
   filtered by pathway when possible, then fills from the
   general pool to match the registered count.
────────────────────────────────────────────────────────── */
function getAttendees(event: Event) {
  const isUpcoming = event.attendanceRate === 0;

  // Prefer learners whose pathway matches the event
  const pathwayMatch = event.pathway === "All Pathways"
    ? learners
    : learners.filter(l => l.pathway === event.pathway);

  const rest = learners.filter(l => !pathwayMatch.includes(l));
  const pool = [...pathwayMatch, ...rest];

  // Deterministic offset so each event gets a different slice
  const offset = parseInt(event.id) * 7;
  const count  = event.registered;
  const slice  = pool.slice(offset % pool.length).concat(pool).slice(0, count);

  return slice.map((l, i) => {
    let status: "Attended" | "Absent" | "Registered";
    if (isUpcoming) {
      status = "Registered";
    } else {
      // Use attendanceRate to determine proportion attended
      const attendedCount = Math.round((event.attendanceRate / 100) * count);
      status = i < attendedCount ? "Attended" : "Absent";
    }
    return { ...l, attendanceStatus: status };
  });
}

function AttendanceBadge({ status }: { status: "Attended" | "Absent" | "Registered" }) {
  if (status === "Attended")
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={10} /> Attended
      </span>
    );
  if (status === "Absent")
    return (
      <span className="flex items-center gap-1 text-[11px] text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
        <XCircle size={10} /> Absent
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
      <AlertCircle size={10} /> Registered
    </span>
  );
}

export default function Events() {
  const [view, setView] = useState<"list" | "calendar">("list");

  // Attendance panel state
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null);

  // Message modal state
  const [messageEvent, setMessageEvent] = useState<Event | null>(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody]       = useState("");
  const [msgSent, setMsgSent]       = useState(false);

  const upcomingEvents = events.filter(e => e.attendanceRate === 0);
  const pastEvents     = events.filter(e => e.attendanceRate > 0);

  const openAttendance = (event: Event) => setAttendanceEvent(event);
  const closeAttendance = () => setAttendanceEvent(null);

  const openMessage = (event: Event) => {
    setMessageEvent(event);
    setMsgSubject(`Follow-up: ${event.title}`);
    setMsgBody(
      `Hi everyone,\n\nThank you for ${event.attendanceRate > 0 ? "joining us at" : "registering for"} ${event.title} on ${event.date}.\n\n${
        event.attendanceRate > 0
          ? "We hope it was a valuable experience. Please don't hesitate to reach out if you have any follow-up questions or need support with next steps."
          : "We're looking forward to seeing you there. Please confirm your attendance and reach out if you have any questions before the event."
      }\n\nBest,\nDenise Carter\nProgram Manager, Atlanta Workforce Tech Alliance`
    );
    setMsgSent(false);
  };

  const closeMessage = () => {
    setMessageEvent(null);
    setMsgSent(false);
  };

  const handleSendMessage = () => setMsgSent(true);

  const attendees = attendanceEvent ? getAttendees(attendanceEvent) : [];
  const msgAttendees = messageEvent ? getAttendees(messageEvent) : [];
  const msgAttendedCount = msgAttendees.filter(a => a.attendanceStatus === "Attended").length;

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
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              data-testid="view-calendar-events"
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                view === "calendar" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
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
                  <EventCard
                    key={e.id}
                    event={e}
                    upcoming
                    onViewAttendance={() => openAttendance(e)}
                    onMessage={() => openMessage(e)}
                  />
                ))}
              </div>
            </div>
          )}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Events</h2>
              <div className="space-y-3">
                {pastEvents.map(e => (
                  <EventCard
                    key={e.id}
                    event={e}
                    upcoming={false}
                    onViewAttendance={() => openAttendance(e)}
                    onMessage={() => openMessage(e)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Attendance Panel ─────────────────────────────────── */}
      {attendanceEvent && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center md:px-4"
          onClick={closeAttendance}
        >
          <div
            className="bg-background rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-foreground">{attendanceEvent.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {attendanceEvent.date} · {attendanceEvent.location}
                </p>
              </div>
              <button
                onClick={closeAttendance}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-px bg-border flex-shrink-0">
              {attendanceEvent.attendanceRate > 0 ? (
                <>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{attendees.filter(a => a.attendanceStatus === "Attended").length}</p>
                    <p className="text-xs text-muted-foreground">Attended</p>
                  </div>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{attendees.filter(a => a.attendanceStatus === "Absent").length}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-emerald-600">{attendanceEvent.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Attendance rate</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{attendanceEvent.registered}</p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </div>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{attendanceEvent.capacity}</p>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                  </div>
                  <div className="bg-background px-5 py-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{attendanceEvent.capacity - attendanceEvent.registered}</p>
                    <p className="text-xs text-muted-foreground">Spots left</p>
                  </div>
                </>
              )}
            </div>

            {/* Attendee list */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="space-y-2">
                {attendees.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {a.photo
                        ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-primary">{a.name.split(" ").map(n => n[0]).join("")}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.pathway}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">{a.coach}</span>
                      <AttendanceBadge status={a.attendanceStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-muted-foreground">{attendees.length} learners listed</p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm" className="text-xs h-8"
                  onClick={() => { closeAttendance(); openMessage(attendanceEvent); }}
                >
                  <Mail size={12} className="mr-1.5" /> Message Attendees
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={closeAttendance}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Modal ────────────────────────────────────── */}
      {messageEvent && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={closeMessage}
        >
          <div
            className="bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {msgSent ? (
              /* Confirmation */
              <div className="flex flex-col items-center text-center px-8 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check size={30} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Message sent</h2>
                <p className="text-sm text-muted-foreground mb-7 max-w-xs">
                  Your message was emailed to{" "}
                  <span className="font-medium text-foreground">
                    {messageEvent.attendanceRate > 0 ? msgAttendedCount : messageEvent.registered} learners
                  </span>{" "}
                  who {messageEvent.attendanceRate > 0 ? "attended" : "are registered for"}{" "}
                  <span className="font-medium text-foreground">{messageEvent.title}</span>.
                </p>

                <div className="w-full bg-muted/40 border border-border rounded-xl p-4 text-left mb-7 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium text-foreground">{messageEvent.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="font-medium text-foreground">
                      {messageEvent.attendanceRate > 0 ? msgAttendedCount : messageEvent.registered} learners
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium text-foreground truncate ml-4">{msgSubject}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-border text-xs">
                    <Mail size={11} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Email delivered successfully</span>
                  </div>
                </div>

                <Button className="w-full" onClick={closeMessage}>Done</Button>
              </div>
            ) : (
              /* Compose */
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Message Attendees</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{messageEvent.title}</p>
                  </div>
                  <button onClick={closeMessage} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* To field */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">To</Label>
                    <div className="mt-1.5 h-10 px-3 flex items-center bg-muted/40 border border-border rounded-lg text-sm text-muted-foreground">
                      <Users size={13} className="mr-2 flex-shrink-0" />
                      {messageEvent.attendanceRate > 0
                        ? `All attendees (${msgAttendedCount} learners who attended)`
                        : `All registrants (${messageEvent.registered} learners registered)`
                      }
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Subject</Label>
                    <Input
                      className="mt-1.5 h-10 text-sm"
                      value={msgSubject}
                      onChange={e => setMsgSubject(e.target.value)}
                      data-testid="msg-subject-input"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <Label className="text-sm font-medium text-foreground">Message</Label>
                    <Textarea
                      className="mt-1.5 text-sm resize-none"
                      rows={10}
                      value={msgBody}
                      onChange={e => setMsgBody(e.target.value)}
                      data-testid="msg-body-input"
                    />
                  </div>

                  {/* Pathway note */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg px-3 py-2.5">
                    <Clock size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      This message will be sent from <strong>denise@atltechalliance.org</strong> and
                      delivered to each learner's registered email address.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <Button variant="outline" onClick={closeMessage}>Cancel</Button>
                  <Button
                    className="flex-1"
                    onClick={handleSendMessage}
                    data-testid="send-msg-btn"
                    disabled={!msgSubject.trim() || !msgBody.trim()}
                  >
                    <Mail size={13} className="mr-2" /> Send Message
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

/* ── Event Card ──────────────────────────────────────────── */
function EventCard({
  event,
  upcoming,
  onViewAttendance,
  onMessage,
}: {
  event: Event;
  upcoming: boolean;
  onViewAttendance: () => void;
  onMessage: () => void;
}) {
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
            <Button
              variant="outline" size="sm" className="text-xs h-8"
              onClick={onViewAttendance}
              data-testid={`event-attendance-${event.id}`}
            >
              View Attendance
            </Button>
            <Button
              variant="ghost" size="sm" className="text-xs h-8"
              onClick={onMessage}
              data-testid={`event-message-${event.id}`}
            >
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
