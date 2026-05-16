import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
  href?: string;
}

export function MetricCard({ label, value, subtitle, icon: Icon, iconColor, trend, className, href }: MetricCardProps) {
  const inner = (
    <div className={cn(
      "bg-card border border-card-border rounded-xl p-5 shadow-sm",
      href && "cursor-pointer hover:shadow-md hover:border-primary/30 transition-all",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-semibold text-foreground mt-1 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs mt-1.5 font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
              {trend.positive ? "+" : ""}{trend.value}% from last quarter
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", iconColor ?? "bg-primary/10")}>
            <Icon size={17} className={iconColor ? "text-white" : "text-primary"} />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
