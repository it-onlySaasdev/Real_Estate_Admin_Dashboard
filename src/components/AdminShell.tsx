import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  LogOut,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Metrics", to: "/", icon: LayoutDashboard },
  { label: "Inventory", to: "/inventory", icon: Building2 },
  { label: "Webhook Events", to: "/webhook-events", icon: Webhook },
] as const;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
  pathname: string;
  showCollapseLabel?: boolean;
}

function SidebarNav({ collapsed, onNavigate, pathname }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              "text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground",
              active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground shadow-sm",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "px-3 justify-center")}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-accent)] text-accent-foreground font-bold shadow-md">
        E
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="font-display text-base font-bold text-sidebar-foreground truncate">Estate Admin</div>
          <div className="text-xs text-sidebar-foreground/60 truncate">Sales & Allocations</div>
        </div>
      )}
    </div>
  );
}

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // close mobile modal on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarWidth = collapsed ? "5rem" : "16rem";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          style={{ width: sidebarWidth }}
          className="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-out"
        >
          <SidebarBrand collapsed={collapsed} />
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav collapsed={collapsed} pathname={pathname} />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile popup modal */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-sidebar text-sidebar-foreground shadow-2xl ring-1 ring-sidebar-border overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
              <SidebarBrand collapsed={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-border/40"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="py-4">
              <SidebarNav collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-sidebar-border px-4 py-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-semibold text-sm">AO</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">Idowu Tobi.</div>
                <div className="text-xs text-sidebar-foreground/60 truncate">admin@estate.ng</div>
              </div>
              <button className="text-sidebar-foreground/60 hover:text-sidebar-foreground"><LogOut className="size-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div
        style={{ paddingLeft: isMobile ? 0 : sidebarWidth }}
        className="transition-[padding] duration-300 ease-out"
      >
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((c) => !c))}
              className="grid size-10 place-items-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search buyers, plots, transactions…"
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
              </div>
            </div>
            <div className="flex-1 md:hidden" />
            <button className="grid size-10 place-items-center rounded-lg border border-border bg-card hover:bg-muted relative" aria-label="Notifications">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-2">
              <div className="size-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-semibold text-sm">IT</div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold">Idowu Tobi.</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
