import { cn } from "@/lib/utils";
import type { LearnerStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: LearnerStatus | string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "On Track": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Needs Support": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  "Stalled": { bg: "bg-red-50 border border-red-200", text: "text-red-700", dot: "bg-red-500" },
  "Placement Ready": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  "New Learner": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  "High": { bg: "bg-red-50 border border-red-200", text: "text-red-700", dot: "bg-red-500" },
  "Medium": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  "Low": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-700", dot: "bg-sky-500" },
  "New": { bg: "bg-violet-50 border border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
  "In Progress": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  "Resolved": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Dismissed": { bg: "bg-gray-50 border border-gray-200", text: "text-gray-500", dot: "bg-gray-400" },
  "Healthy": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Near Capacity": { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  "Overloaded": { bg: "bg-red-50 border border-red-200", text: "text-red-700", dot: "bg-red-500" },
  "Workshop": { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Mock Interview": { bg: "bg-purple-50 border border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  "Employer Panel": { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  "Office Hours": { bg: "bg-teal-50 border border-teal-200", text: "text-teal-700", dot: "bg-teal-500" },
  "Networking Event": { bg: "bg-sky-50 border border-sky-200", text: "text-sky-700", dot: "bg-sky-500" },
  "Active": { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    bg: "bg-gray-50 border border-gray-200",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
      {status}
    </span>
  );
}
