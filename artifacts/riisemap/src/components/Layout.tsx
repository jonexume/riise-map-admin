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
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PHOTO = "/denise.jpg";
const DEFAULT_ORG_LOGO = "/blueworkforce-logo.png";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Learners", href: "/learners", icon: Users },
  { label: "Programs", href: "/programs", icon: BookOpen },
  { label: "Pathways", href: "/pathways", icon: GitBranch },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Coaches", href: "/coaches", icon: UserCheck },
  { label: "Alerts", href: "/alerts", icon: Bell, badge: 4 },
  { label: "Impact & Reporting", href: "/impact", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function getProfilePhoto(): string {
  return localStorage.getItem("riisemap_profile_photo") || DEFAULT_PHOTO;
}

function getOrgLogo(): string {
  return localStorage.getItem("riisemap_org_logo") || DEFAULT_ORG_LOGO;
}

function getOrgData(): { name: string; title: string; role: string; profileName: string } {
  try {
    const data = localStorage.getItem("riisemap_onboarding");
    if (data) {
      const parsed = JSON.parse(data);
      return {
        name: parsed.name || "Denise Carter",
        title: parsed.title || "Program Manager",
        role: parsed.role || "admin",
        profileName: parsed.name || "Denise Carter",
      };
    }
  } catch {}
  return { name: "Denise Carter", title: "Program Manager", role: "admin", profileName: "Denise Carter" };
}

function getOrgName(): string {
  return localStorage.getItem("riisemap_org_name") || "BlueWorkforce";
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profilePhoto = getProfilePhoto();
  const orgLogo = getOrgLogo();
  const orgName = getOrgName();
  const { profileName, title, role } = getOrgData();

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-sidebar-border/50 flex items-center justify-center">
              <img src={orgLogo} alt={orgName} className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground leading-tight truncate max-w-[130px]">{orgName}</div>
              <div className="text-[10px] text-sidebar-foreground/50 leading-tight">
                {role === "admin" ? "Admin" : "Viewer"}
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

        {/* User profile */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Link href="/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors group">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-sidebar-primary/30 group-hover:ring-sidebar-primary/60 transition-all">
                <img
                  src={profilePhoto}
                  alt={profileName}
                  className="w-full h-full object-cover"
                  data-testid="sidebar-profile-photo"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate" data-testid="sidebar-profile-name">
                  {profileName}
                </div>
                <div className="text-[11px] text-sidebar-foreground/50 truncate">{title}</div>
              </div>
            </div>
          </Link>
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
