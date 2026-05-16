import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  BookOpen,
  GitBranch,
  FolderKanban,
  Calendar,
  UserCheck,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Learners", href: "/learners", icon: Users },
  { label: "Programs", href: "/programs", icon: BookOpen },
  { label: "Pathways", href: "/pathways", icon: GitBranch },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Coaches", href: "/coaches", icon: UserCheck },
  { label: "Alerts", href: "/alerts", icon: Bell, badge: 4 },
  { label: "Impact & Reporting", href: "/impact", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-30 flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-primary-foreground">RM</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-sidebar-foreground leading-tight">RiiseMap</div>
              <div className="text-[10px] text-sidebar-foreground/50 leading-tight truncate max-w-[130px]">
                Atlanta Workforce Tech
              </div>
            </div>
          </div>
          <button
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      active
                        ? "bg-sidebar-primary/20 text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-destructive/80 text-destructive-foreground text-[10px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                    {active && <ChevronRight size={12} className="text-sidebar-primary" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-sidebar-primary">DC</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">Denise Carter</div>
              <div className="text-[11px] text-sidebar-foreground/50 truncate">Program Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-background">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground/60 hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">RiiseMap</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
