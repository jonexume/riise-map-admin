import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  BookOpen,
  GitBranch,
  DollarSign,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/UserContext";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Funding Sources", href: "/funding-sources", icon: DollarSign },
  { label: "Programs", href: "/programs", icon: BookOpen },
  { label: "Pathways", href: "/pathways", icon: GitBranch },
  { label: "Learners", href: "/learners", icon: Users },
  { label: "Impact & Reporting", href: "/impact", icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useUser();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-30 flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-sidebar-border/50 flex items-center justify-center">
              <img src="/logo.png" alt="RiiseMap" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground leading-tight">RiiseMap</div>
              <div className="text-[10px] text-sidebar-foreground/50 leading-tight">Admin</div>
            </div>
          </div>
          <button className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    active ? "bg-sidebar-primary/20 text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={12} className="text-sidebar-primary" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile + logout */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-sidebar-primary">
                {user.firstName?.[0] || user.email?.[0] || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate" data-testid="sidebar-profile-name">
                {loading ? <span className="inline-block h-4 w-24 bg-sidebar-accent rounded animate-pulse" /> : user.fullName}
              </div>
              <div className="text-[11px] text-sidebar-foreground/50 truncate">
                {loading ? <span className="inline-block h-3 w-20 bg-sidebar-accent rounded animate-pulse mt-1" /> : user.orgName}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
              title="Sign out"
              data-testid="logout-button"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden lg:flex items-center justify-end px-5 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {loading ? <span className="inline-block h-4 w-28 bg-muted rounded animate-pulse" /> : <span className="text-sm font-semibold text-foreground">{user.orgName}</span>}
          </div>
        </div>

        <div className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-foreground/60 hover:text-foreground">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="RiiseMap" className="w-6 h-6 object-contain" />
              <span className="font-semibold text-sm">RiiseMap</span>
            </div>
          </div>
          {loading ? <span className="inline-block h-4 w-24 bg-muted rounded animate-pulse" /> : <span className="text-sm font-medium text-foreground">{user.orgName}</span>}
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
