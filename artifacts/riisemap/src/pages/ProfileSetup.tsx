import { useState } from "react";
import { updateUserAttributes } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSetupProps {
  onComplete: () => void;
}

const ORG_TYPES = ["School/University", "Corporation", "Workforce Development"] as const;

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateUserAttributes({
        given_name: firstName.trim(),
        family_name: lastName.trim(),
        "custom:org_name": orgName.trim(),
        "custom:org_type": orgType,
      });
      onComplete();
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">
            <img src="/logo.png" alt="RiiseMap" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-semibold text-foreground">RiiseMap</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-1">Complete Your Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Tell us about yourself and your organization.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">First Name</Label>
            <Input type="text" className="mt-1.5 h-10 text-sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <Label className="text-sm font-medium">Last Name</Label>
            <Input type="text" className="mt-1.5 h-10 text-sm" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <Label className="text-sm font-medium">Organization Name</Label>
            <Input type="text" className="mt-1.5 h-10 text-sm" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
          </div>
          <div>
            <Label className="text-sm font-medium">Organization Type</Label>
            <select
              className="mt-1.5 h-10 text-sm w-full rounded-md border border-input bg-background px-3"
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              required
            >
              <option value="" disabled>Select type...</option>
              {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
