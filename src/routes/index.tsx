import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import {
  TrendingUp,
  Wallet,
  Home,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";

const METRICS_ENDPOINT = "http://localhost:5000/api/v1/dashboard-metrics";

interface DashboardMetrics {
  total_revenue_ngn: number;
  allocated_plots_count: number;
  pending_validation_count: number;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Metrics — Estate Admin" },
      { name: "description", content: "Revenue and allocation metrics from Nomba virtual accounts." },
    ],
  }),
  component: MetricsPage,
});

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const recentTxns = [
  { ref: "NMB-8821", buyer: "Chinedu Okafor", plot: "B-204", amount: 4_500_000, time: "2 min ago" },
  { ref: "NMB-8820", buyer: "Aisha Bello", plot: "C-118", amount: 7_200_000, time: "18 min ago" },
  { ref: "NMB-8819", buyer: "Tunde Adekola", plot: "A-031", amount: 12_000_000, time: "1 hr ago" },
  { ref: "NMB-8818", buyer: "Grace Eze", plot: "B-207", amount: 3_800_000, time: "3 hr ago" },
  { ref: "NMB-8817", buyer: "Ibrahim Musa", plot: "D-052", amount: 9_650_000, time: "Yesterday" },
];

function buildStats(metrics: DashboardMetrics | null) {
  return [
    {
      label: "Total Revenue",
      value: metrics ? ngn.format(metrics.total_revenue_ngn) : "—",
      change: "+12.4%",
      trend: "up" as const,
      icon: Wallet,
      hint: "via Nomba virtual accounts",
    },
    {
      label: "Allocated Plots",
      value: metrics ? String(metrics.allocated_plots_count) : "—",
      change: "+8.1%",
      trend: "up" as const,
      icon: Home,
      hint: "fully allocated to buyers",
    },
    {
      label: "Pending Validation",
      value: metrics ? String(metrics.pending_validation_count) : "—",
      change: "-2.0%",
      trend: "down" as const,
      icon: CheckCircle2,
      hint: "awaiting confirmation",
    },
    {
      label: "Active Listings",
      value: metrics
        ? String(Math.max(0, 210 - metrics.allocated_plots_count - metrics.pending_validation_count))
        : "—",
      change: "+1.4%",
      trend: "up" as const,
      icon: TrendingUp,
      hint: "available inventory",
    },
  ];
}

function MetricsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(METRICS_ENDPOINT);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DashboardMetrics;
        if (!cancelled) setMetrics(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load metrics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = buildStats(metrics);

  return (
    <AdminShell title="Overview" subtitle="Track revenue collected via Nomba virtual accounts and automated allocations.">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          Couldn't reach metrics endpoint ({error}). Showing placeholder values.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          const positive = s.trend === "up";
          return (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold " +
                    (positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")
                  }
                >
                  {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {s.change}
                </span>
              </div>
              <div className="mt-5">
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {loading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart card */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h3 className="font-display font-bold text-lg">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Last 7 months — Nomba inflows</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">This month</div>
              <div className="font-display font-bold text-foreground">{ngn.format(96_400_000)}</div>
            </div>
          </div>
          <BarChart />
        </div>

        {/* Allocation status */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-display font-bold text-lg">Allocation Status</h3>
          <p className="text-sm text-muted-foreground mb-5">Inventory breakdown</p>
          <div className="space-y-4">
            <ProgressRow label="Fully Allocated" value={132} total={210} tone="success" />
            <ProgressRow label="Pending" value={15} total={210} tone="warning" />
            <ProgressRow label="Available" value={63} total={210} tone="muted" />
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mt-6 sm:mt-8 rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-lg">Recent Nomba Transactions</h3>
            <p className="text-sm text-muted-foreground">Latest virtual account inflows</p>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {recentTxns.map((t) => (
            <li key={t.ref} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-5 sm:px-6 py-4">
              <div className="hidden sm:grid size-10 place-items-center rounded-lg bg-success/15 text-success shrink-0">
                <ArrowUpRight className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{t.buyer}</div>
                <div className="text-xs text-muted-foreground truncate">{t.ref} · Plot {t.plot}</div>
              </div>
              <div className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">{t.time}</div>
              <div className="text-right font-semibold text-sm whitespace-nowrap">{ngn.format(t.amount)}</div>
            </li>
          ))}
        </ul>
      </div>
    </AdminShell>
  );
}

function ProgressRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: "success" | "warning" | "muted" }) {
  const pct = Math.round((value / total) * 100);
  const bar = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-muted-foreground/40";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} / {total}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BarChart() {
  const data = [42, 58, 51, 69, 74, 82, 96];
  const labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 sm:gap-4 h-48">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-md bg-[image:var(--gradient-hero)] hover:opacity-90 transition-all relative group"
              style={{ height: `${(v / max) * 100}%` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-0.5 rounded whitespace-nowrap">
                ₦{v}M
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
