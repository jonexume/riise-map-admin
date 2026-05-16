import { useState, useRef } from "react";
import { ArrowRight, CheckSquare, Square, Camera, Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DEFAULT_PHOTO = "/denise.jpg";
const DEFAULT_ORG_LOGO = "/blueworkforce-logo.png";
const DEFAULT_ORG_NAME = "BlueWorkforce";

const titleOptions = [
  "Program Manager",
  "Executive Director",
  "HR Administrator",
  "Director of Workforce",
  "Career Coach",
  "Operations Manager",
  "Coordinator",
  "Data Analyst",
  "Other",
];

const roleOptions = [
  { id: "admin", label: "Admin", description: "Full access to all features, settings, and data" },
  { id: "viewer", label: "Viewer", description: "Read-only access — can view dashboards and reports" },
];

const orgTypes = [
  {
    id: "school",
    label: "School / University",
    description: "Academic institutions running workforce or career readiness programs",
  },
  {
    id: "corporation",
    label: "Corporation",
    description: "Companies building internal talent pipelines or upskilling programs",
  },
  {
    id: "workforce",
    label: "Workforce Development",
    description: "Nonprofits, agencies, and community organizations supporting career mobility",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [photo, setPhoto] = useState<string>(DEFAULT_PHOTO);
  const [name, setName] = useState("Denise Carter");
  const [title, setTitle] = useState("Program Manager");
  const [role, setRole] = useState<"admin" | "viewer">("admin");
  const [email, setEmail] = useState("denise@atltechalliance.org");
  const [phone, setPhone] = useState("");

  const [orgLogo, setOrgLogo] = useState<string>(DEFAULT_ORG_LOGO);
  const [orgName, setOrgName] = useState(DEFAULT_ORG_NAME);
  const [orgType, setOrgType] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your name";
    if (!title) errs.title = "Please select a title";
    if (!email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
    if (!phone.trim()) errs.phone = "Please enter your phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleComplete = () => {
    if (!orgType) {
      setErrors({ orgType: "Please select an organization type" });
      return;
    }
    localStorage.setItem(
      "riisemap_onboarding",
      JSON.stringify({ name, email, phone, title, role, orgType, orgName, completedAt: new Date().toISOString() })
    );
    localStorage.setItem("riisemap_profile_photo", photo);
    localStorage.setItem("riisemap_org_logo", orgLogo);
    localStorage.setItem("riisemap_org_name", orgName);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">
            <img src="/logo.png" alt="RiiseMap" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-semibold text-foreground">RiiseMap</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
            step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}>1</div>
          <div className={cn("flex-1 h-px transition-colors", step >= 2 ? "bg-primary" : "bg-border")} />
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
            step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}>2</div>
        </div>

        {step === 1 ? (
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Your profile</h1>
            <p className="text-sm text-muted-foreground mb-7">
              Let's get your account set up. This takes about a minute.
            </p>

            {/* Profile photo */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md ring-2 ring-primary/20">
                  <img src={photo} alt="Profile photo" className="w-full h-full object-cover" data-testid="profile-photo-preview" />
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors border-2 border-background"
                >
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-2.5 text-xs text-primary hover:underline font-medium">
                Change photo
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileRead(e, setPhoto)} />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Full name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className={cn("mt-1.5 h-10 text-sm", errors.name && "border-destructive")}
                  data-testid="onboarding-name"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Title</Label>
                  <Select value={title} onValueChange={setTitle}>
                    <SelectTrigger className={cn("mt-1.5 h-10 text-sm", errors.title && "border-destructive")}>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {titleOptions.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Role</Label>
                  <Select value={role} onValueChange={v => setRole(v as "admin" | "viewer")}>
                    <SelectTrigger className="mt-1.5 h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role description */}
              <div className="bg-muted/40 rounded-lg px-3 py-2 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{roleOptions.find(r => r.id === role)?.label}:</span>{" "}
                  {roleOptions.find(r => r.id === role)?.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Work email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className={cn("mt-1.5 h-10 text-sm", errors.email && "border-destructive")}
                  data-testid="onboarding-email"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Phone number</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={cn("mt-1.5 h-10 text-sm", errors.phone && "border-destructive")}
                  data-testid="onboarding-phone"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>

            <Button className="w-full h-10 mt-8 text-sm" onClick={handleNext} data-testid="onboarding-next">
              Continue <ArrowRight size={15} className="ml-2" />
            </Button>
          </div>

        ) : (
          <div>
            {/* Profile recap */}
            <div className="flex items-center gap-3 mb-7 p-3.5 bg-muted/40 rounded-xl border border-border">
              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{title} · {role === "admin" ? "Admin" : "Viewer"}</p>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-foreground mb-1">Your organization</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Add your organization details and select your org type.
            </p>

            {/* Company logo upload */}
            <div className="mb-5">
              <Label className="text-sm font-medium text-foreground mb-2 block">Company logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl border-2 border-border bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  {orgLogo ? (
                    <img src={orgLogo} alt="Company logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 size={24} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                  >
                    <Upload size={13} />
                    {orgLogo === DEFAULT_ORG_LOGO ? "Change logo" : orgLogo ? "Change logo" : "Upload logo"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG recommended. Shown in your sidebar.</p>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileRead(e, setOrgLogo)} />
              </div>
            </div>

            {/* Org name */}
            <div className="mb-5">
              <Label className="text-sm font-medium text-foreground">Organization name</Label>
              <Input
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Your organization name"
                className="mt-1.5 h-10 text-sm"
              />
            </div>

            {/* Org type */}
            <div className="space-y-3 mb-5">
              <Label className="text-sm font-medium text-foreground block">Organization type</Label>
              {orgTypes.map((type) => {
                const isSelected = orgType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => { setOrgType(type.id); setErrors({}); }}
                    data-testid={`onboarding-org-${type.id}`}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-150",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5 flex-shrink-0 transition-colors", isSelected ? "text-primary" : "text-muted-foreground/40")}>
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold transition-colors", isSelected ? "text-primary" : "text-foreground")}>{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.orgType && <p className="text-xs text-destructive mb-3">{errors.orgType}</p>}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="h-10 text-sm" onClick={() => setStep(1)} data-testid="onboarding-back">
                Back
              </Button>
              <Button className="flex-1 h-10 text-sm" onClick={handleComplete} data-testid="onboarding-complete">
                Get started <ArrowRight size={15} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8">
          Your information is only used to personalize your RiiseMap experience.
        </p>
      </div>
    </div>
  );
}
