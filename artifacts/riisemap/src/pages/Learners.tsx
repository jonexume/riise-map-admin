import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetLearners, useCreateLearner, getLearners } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, User, ArrowLeft, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGetCoaches } from "@workspace/api-client-react";


type Learner = NonNullable<Awaited<ReturnType<typeof getLearners>>["data"]>[number];

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pathway: string;
  program: string;
  coach: string;
}

const PROGRAM_LABELS: Record<string, string> = {
  "aws-cwi-2024": "AWS CWI Program 2024",
  "google-data-2024": "Google Data Analytics 2024",
  "meta-social-2024": "Meta Social Media Marketing 2024",
};

const BLANK_INVITE: InviteForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  pathway: "",
  program: "",
  coach: "",
};

export default function Learners() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetLearners();
  const allLearners = data?.data || [];
  const { data: coachesData } = useGetCoaches();
  const coaches = coachesData?.data || [];

  const createLearnerMutation = useCreateLearner({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/learners'] });
        toast({
          title: "Success!",
          description: "New learner has been invited.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request. Please try again.",
        });
      }
    }
  });

  const [showInvite, setShowInvite] = useState(false);
  const [inviteStep, setInviteStep] = useState(0);
  const [inviteForm, setInviteForm] = useState<InviteForm>(BLANK_INVITE);
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<keyof InviteForm, string>>>({});
  const [newLearnerId, setNewLearnerId] = useState("");

  const setField = (k: keyof InviteForm, v: string) => {
    setInviteForm((f) => ({ ...f, [k]: v }));
    setInviteErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateInvite = () => {
    const e: typeof inviteErrors = {};
    if (!inviteForm.firstName.trim()) e.firstName = "First name is required";
    if (!inviteForm.lastName.trim()) e.lastName = "Last name is required";
    if (!inviteForm.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(inviteForm.email))
      e.email = "Invalid email format";
    setInviteErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendInvite = async () => {
    if (!validateInvite()) return;

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      const newLearner = await createLearnerMutation.mutateAsync({
        data: {
          name: `${inviteForm.firstName.trim()} ${inviteForm.lastName.trim()}`,
          pathway: inviteForm.pathway || "Not yet assigned",
          program: inviteForm.program ? PROGRAM_LABELS[inviteForm.program] : "Not yet enrolled",
          coach: inviteForm.coach || "Unassigned",
          progress: 0,
          readiness: 0,
          status: "New Learner",
          lastActive: "Just invited",
          nextAction: "Complete onboarding and career assessment",
          joinDate: today,
          email: inviteForm.email.trim(),
        }
      });
      setNewLearnerId(String(newLearner.id));
      setInviteStep(1);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({
          title: "Duplicate Learner",
          description: "A learner with this email already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Creating Learner",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
      console.error("Failed to create learner:", error);
    }
  };

  const closeInvite = () => {
    setShowInvite(false);
    setTimeout(() => {
      setInviteStep(0);
      setInviteForm(BLANK_INVITE);
      setInviteErrors({});
    }, 300);
  };

  const totalLearners = allLearners.length;
  const onTrack = allLearners.filter((l) => l.status === "On Track").length;
  const needsSupport = allLearners.filter(
    (l) => l.status === "Needs Support"
  ).length;
  const atRisk = allLearners.filter((l) => l.status === "At Risk").length;

  return (
    <div className="p-5 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Learners</h1>
          <p className="text-muted-foreground text-sm">
            Manage learner profiles, track progress, and provide support.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <Plus size={16} className="mr-2" />
          Invite a Learner
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Learners
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLearners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <Progress value={(onTrack / totalLearners) * 100} className="w-12 h-1.5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTrack}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Support</CardTitle>
            <Progress
              value={(needsSupport / totalLearners) * 100}
              className="w-12 h-1.5"
              indicatorClassName="bg-yellow-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{needsSupport}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Progress
              value={(atRisk / totalLearners) * 100}
              className="w-12 h-1.5"
              indicatorClassName="bg-destructive"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRisk}</div>
          </CardContent>
        </Card>
      </div>

      {/* Learners list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 font-medium text-left">Name</th>
                  <th className="px-4 py-3 font-medium text-left">Pathway</th>
                  <th className="px-4 py-3 font-medium text-left">Program</th>
                  <th className="px-4 py-3 font-medium text-left">Coach</th>
                  <th className="px-4 py-3 font-medium text-center">Progress</th>
                  <th className="px-4 py-3 font-medium text-center">Readiness</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-left">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      Loading learners...
                    </td>
                  </tr>
                ) : allLearners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No learners have been invited yet.
                    </td>
                  </tr>
                ) : (
                  allLearners.map((learner) => (
                    <tr key={learner.id} className="border-b">
                      <td className="px-4 py-3">
                        <Link href={`/learners/${learner.id}`}>
                          <a className="font-medium text-primary hover:underline">
                            {learner.name}
                          </a>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{learner.pathway}</td>
                      <td className="px-4 py-3 text-muted-foreground">{learner.program}</td>
                      <td className="px-4 py-3 text-muted-foreground">{learner.coach}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={learner.progress} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{learner.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={learner.readiness} className="h-1.5 w-16" />
                           <span className="text-xs text-muted-foreground">{learner.readiness}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={learner.status as any} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{learner.lastActive}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Learner Dialog */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          showInvite ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeInvite}
      />
      <div
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border rounded-xl shadow-lg z-50 w-[90vw] max-w-2xl transition-all duration-300",
          showInvite
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {inviteStep === 0 && (
          <>
            <CardHeader>
              <CardTitle>Invite a New Learner</CardTitle>
              <CardDescription>
                Enter the learner's details to send an invitation to join RiiseMap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    placeholder="e.g. Jane"
                    value={inviteForm.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className={cn(inviteErrors.firstName && "border-destructive")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    placeholder="e.g. Doe"
                    value={inviteForm.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className={cn(inviteErrors.lastName && "border-destructive")}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="e.g. jane.doe@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={cn(inviteErrors.email && "border-destructive")}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Phone Number (optional)</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. (123) 456-7890"
                    value={inviteForm.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label>Assign Pathway</Label>
                    <Select onValueChange={v => setField("pathway", v)} value={inviteForm.pathway}>
                      <SelectTrigger className="border-card-border">
                        <SelectValue placeholder="Select a pathway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws-cloud">AWS Cloud Practitioner</SelectItem>
                        <SelectItem value="google-data">Google Data Analytics</SelectItem>
                        <SelectItem value="meta-social">Meta Social Media Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Enroll in Program</Label>
                     <Select onValueChange={v => setField("program", v)} value={inviteForm.program}>
                      <SelectTrigger className="border-card-border">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws-cwi-2024">AWS CWI Program 2024</SelectItem>
                        <SelectItem value="google-data-2024">Google Data Analytics 2024</SelectItem>
                        <SelectItem value="meta-social-2024">Meta Social Media Marketing 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/*
                  <div className="col-span-2">
                    <Label>Assign Coach</Label>
                    <Select onValueChange={v => setField("coach", v)} value={inviteForm.coach}>
                      <SelectTrigger className="border-card-border">
                        <SelectValue placeholder="Select a coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  */}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeInvite}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>Send Invitation</Button>
              </div>
            </CardContent>
          </>
        )}
        {inviteStep === 1 && (
           <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <User size={24} className="text-green-600" />
            </div>
            <CardTitle className="mb-2">Invitation Sent!</CardTitle>
            <CardDescription className="mb-6 max-w-sm mx-auto">
              {inviteForm.firstName} {inviteForm.lastName} has been invited. You can view their profile or invite another learner.
            </CardDescription>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href={`/learners/${newLearnerId}`}>
                  View Profile
                </Link>
              </Button>
              <Button onClick={() => { setInviteForm(BLANK_INVITE); setInviteStep(0); }}>
                <Plus size={16} className="mr-2" />
                Invite Another
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={closeInvite}>
              <ArrowLeft size={14} className="mr-2" />
              Back to Learners
            </Button>
          </CardContent>
        )}
      </div>
    </div>
  );
}