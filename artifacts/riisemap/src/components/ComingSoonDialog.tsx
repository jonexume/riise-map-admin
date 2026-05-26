// /Users/batman/Downloads/ReplitExport-JonExume/Riise-Map-Admin/artifacts/riisemap/src/components/ComingSoonDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
}

export function ComingSoonDialog({ open, onOpenChange, featureName }: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            {featureName} Coming Soon
          </DialogTitle>
          <DialogDescription>
            This feature is currently under development and will be available in a future update!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            We're working hard to bring you this functionality. Stay tuned for updates!
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}