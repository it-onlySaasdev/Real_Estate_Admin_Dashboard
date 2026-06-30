import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { DemoSandboxDrawer } from "@/components/DemoSandboxDrawer";
import { Search, Download, Filter, MoreHorizontal, FlaskConical, Loader2 } from "lucide-react";

const PROPERTIES_ENDPOINT = "http://localhost:5000/api/v1/properties";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Property Inventory — Estate Admin" },
      { name: "description", content: "Buyer allocations, plot status, and payments across the estate." },
    ],
  }),
  component: InventoryPage,
});

type Status = "Available" | "Pending" | "Fully Allocated";

interface Row {
  buyer: string;
  email: string;
  amount: number;
  plot: string;
  status: Status;
}

interface ApiProperty {
  buyer_name?: string | null;
  email?: string | null;
  plot?: string | null;
  status?: string | null;
  amount?: number | null;
  amount_paid?: number | null;
}

const fallbackRows: Row[] = [
  { buyer: "—", email: "—", amount: 0, plot: "A-032", status: "Available" },
];

function normalizeStatus(s: string | null | undefined): Status {
  const v = (s ?? "").toLowerCase();
  if (v.includes("alloc")) return "Fully Allocated";
  if (v.includes("pend")) return "Pending";
  return "Available";
}

function mapProperty(p: ApiProperty): Row {
  return {
    buyer: p.buyer_name?.trim() || "—",
    email: p.email?.trim() || "—",
    amount: p.amount_paid ?? p.amount ?? 0,
    plot: p.plot ?? "—",
    status: normalizeStatus(p.status),
  };
}

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const statusStyles: Record<Status, string> = {
  Available: "bg-muted text-muted-foreground ring-1 ring-border",
  Pending: "bg-warning/15 text-warning-foreground ring-1 ring-warning/40",
  "Fully Allocated": "bg-success/15 text-success ring-1 ring-success/30",
};

function InventoryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(PROPERTIES_ENDPOINT);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: ApiProperty[] = Array.isArray(json) ? json : json?.properties ?? json?.data ?? [];
        if (!cancelled) setRows(list.map(mapProperty));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load properties");
          setRows(fallbackRows);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQuery =
        !query ||
        r.buyer.toLowerCase().includes(query.toLowerCase()) ||
        r.email.toLowerCase().includes(query.toLowerCase()) ||
        r.plot.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || r.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [rows, query, filter]);

  return (
    <AdminShell title="Property Inventory" subtitle="All plots, buyer assignments, and allocation status.">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buyer, email or plot…"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {(["All", "Available", "Pending", "Fully Allocated"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted")
                }
              >
                {f}
              </button>
            ))}
            <button className="shrink-0 grid place-items-center size-9 rounded-lg border border-border bg-background hover:bg-muted" aria-label="More filters">
              <Filter className="size-4" />
            </button>
            <button
              onClick={() => setSandboxOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-2 text-sm font-semibold hover:bg-orange-500/20"
            >
              <FlaskConical className="size-4" />
              <span className="hidden sm:inline">Sandbox</span>
            </button>
            <button className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground px-3 py-2 text-sm font-semibold hover:opacity-90">
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Buyer Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold text-right">Amount Paid</th>
                <th className="px-5 py-3 font-semibold">Plot Number</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.plot} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-xs font-bold shrink-0">
                        {r.buyer === "—" ? "—" : initials(r.buyer)}
                      </div>
                      <span className="font-medium text-foreground">{r.buyer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.email}</td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {r.amount ? ngn.format(r.amount) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{r.plot}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[r.status]}`}>
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="grid size-8 place-items-center rounded-md hover:bg-muted text-muted-foreground" aria-label="Actions">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground border-t border-border">
          <span>Showing {filtered.length} of {rows.length} plots</span>
          <div className="flex items-center gap-1">
            <button className="rounded-md px-2.5 py-1 hover:bg-muted">Previous</button>
            <button className="rounded-md px-2.5 py-1 bg-secondary text-secondary-foreground">1</button>
            <button className="rounded-md px-2.5 py-1 hover:bg-muted">2</button>
            <button className="rounded-md px-2.5 py-1 hover:bg-muted">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filtered.map((r) => (
          <div key={r.plot} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary">{r.plot}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <div className="mt-2 font-semibold truncate">{r.buyer}</div>
                <div className="text-xs text-muted-foreground truncate">{r.email}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">Paid</div>
                <div className="font-bold tabular-nums">{r.amount ? ngn.format(r.amount) : "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DemoSandboxDrawer open={sandboxOpen} onClose={() => setSandboxOpen(false)} />
    </AdminShell>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
