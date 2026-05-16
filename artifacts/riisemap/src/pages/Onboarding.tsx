import { useState } from "react";
import { ArrowRight, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [name, setName] = useState("Denise Carter");
  const [email, setEmail] = useState("denise@atltechalliance.org");
  const [phone, setPhone] = useState("");
  const [orgType, setOrgType] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Please enter your name";
    if (!email.trim()) newErrors.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    if (!phone.trim()) newErrors.phone = "Please enter your phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      JSON.stringify({ name, email, phone, orgType, completedAt: new Date().toISOString() })
    );
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">RM</span>
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
            <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome to RiiseMap</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Let's get your account set up. This takes about a minute.
            </p>

            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={cn("mt-1.5 h-10 text-sm", errors.name && "border-destructive")}
                  data-testid="onboarding-name"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className={cn("mt-1.5 h-10 text-sm", errors.email && "border-destructive")}
                  data-testid="onboarding-email"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={cn("mt-1.5 h-10 text-sm", errors.phone && "border-destructive")}
                  data-testid="onboarding-phone"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>

            <Button
              className="w-full h-10 mt-8 text-sm"
              onClick={handleNext}
              data-testid="onboarding-next"
            >
              Continue
              <ArrowRight size={15} className="ml-2" />
            </Button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">What describes your organization?</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Select the option that best fits your work. This helps us tailor your RiiseMap experience.
            </p>

            <div className="space-y-3">
              {orgTypes.map((type) => {
                const isSelected = orgType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setOrgType(type.id);
                      setErrors({});
                    }}
                    data-testid={`onboarding-org-${type.id}`}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-150",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex-shrink-0 transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground/40"
                      )}>
                        {isSelected
                          ? <CheckSquare size={18} />
                          : <Square size={18} />
                        }
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-semibold transition-colors",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {type.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.orgType && (
              <p className="text-xs text-destructive mt-3">{errors.orgType}</p>
            )}

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="h-10 text-sm"
                onClick={() => setStep(1)}
                data-testid="onboarding-back"
              >
                Back
              </Button>
              <Button
                className="flex-1 h-10 text-sm"
                onClick={handleComplete}
                data-testid="onboarding-complete"
              >
                Get started
                <ArrowRight size={15} className="ml-2" />
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
