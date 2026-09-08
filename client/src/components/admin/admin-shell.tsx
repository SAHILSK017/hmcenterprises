"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  Tag,
  Users,
  Wrench,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Ticket,
  ScrollText,
  Warehouse,
  Cpu,
  CreditCard,
  LineChart,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Service",
    items: [
      { href: "/admin/repairs", label: "Repairs", icon: Wrench },
      { href: "/admin/sells", label: "Sell Requests", icon: ClipboardList },
      { href: "/admin/managed-sells", label: "Manage Selling Phone", icon: Smartphone },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Boxes },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/brands", label: "Brands", icon: Smartphone },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/imei-devices", label: "IMEI Devices", icon: Cpu },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Reports",
    items: [{ href: "/admin/reports", label: "Reports", icon: LineChart }],
  },
  {
    title: "System",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/users", label: "Admin Users", icon: Users },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

function pageTitle(pathname: string) {
  for (const g of NAV) {
    for (const item of g.items) {
      if (item.href === "/admin" && pathname === "/admin") return item.label;
      if (item.href !== "/admin" && pathname.startsWith(item.href)) return item.label;
    }
  }
  return "Admin";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ unread: number }>("/api/admin/notifications/unread-count")
      .then((d) => setUnread(d.unread || 0))
      .catch(() => setUnread(0));
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const title = useMemo(() => pageTitle(pathname), [pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
  };

  const SidebarNav = ({ compact }: { compact?: boolean }) => (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.title} className="border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
          {!compact && (
            <p className="mb-2 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#94A3B8]">
              {group.title}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={compact ? label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-150",
                      active
                        ? "bg-[#EFF6FF] text-[#1473EA] shadow-xs"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]",
                      compact && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#1473EA]" : "text-[#64748B]")} />
                    {!compact && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="fixed inset-0 z-[80] flex bg-[#F6F8FB] text-[#111827]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full flex-col border-r border-[#E2E8F0] bg-white transition-[width] duration-200 lg:flex shadow-xs",
          collapsed ? "w-[72px]" : "w-[250px]"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#E2E8F0] px-4">
          {!collapsed ? (
            <Link href="/admin" className="px-1 font-display text-base font-bold tracking-tight text-[#111827]">
              HMC <span className="text-[#1473EA]">Admin</span>
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto font-display text-base font-bold text-[#1473EA]">
              H
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <SidebarNav compact={collapsed} />
        <div className="border-t border-[#E2E8F0] p-3 bg-[#F8FAFC]">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1473EA] transition-colors",
              collapsed && "justify-center"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {!collapsed && "Back to website"}
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-display text-[15px] font-bold">
                HMC <span className="text-[#0071e3]">Admin</span>
              </span>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-slate-400">
              Admin / <span className="text-slate-600">{title}</span>
            </p>
            <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">{title}</h1>
          </div>

          <form onSubmit={onSearch} className="relative hidden max-w-xs flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, customer, product…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#0071e3]/50 focus:bg-white"
            />
          </form>

          <Link
            href="/admin/notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0071e3] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          <Link
            href="/admin/settings"
            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:inline-flex"
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>

          <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-semibold leading-tight">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-400">{user?.role || "admin"}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
