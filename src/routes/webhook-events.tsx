import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { Loader2, RefreshCw, Webhook, CheckCircle2, XCircle, Clock } from "lucide-react";

const ENDPOINT = "https://idowutobi1.pythonanywhere.com/api/v1/webhook-events";

export const Route = createFileRoute("/webhook-events")({
  head: () => ({
    meta: [
      { title: "Webhook Events — Estate Admin" },
      { name: "description", content: "Recent payment.success webhook events received from Nomba." },
    ],
  }),
  component: WebhookEventsPage,
});

interface Evt {
  id?: string | number;
  event?: string;
  email?: string;
  buyer_name?: string;
  plot?: string;
  amount?: number;
  status?: string;
  received_at?: string;
  reference?: string;
}

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

function WebhookEventsPage() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: Evt[] = Array.isArray(json) ? json : json?.events ?? json?.data ?? [];
      setEvents(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <AdminShell title="Webhook Events" subtitle="Live tail of payment.success events received by Flask from Nomba.">
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <Webhook className="size-5" />
          </div>
          <div>
            <div className="font-semibold">/api/v1/nomba-webhook</div>
            <div className="text-xs text-muted-foreground">Auto-refresh every 15s</div>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-3 py-2 text-sm font-semibold hover:bg-muted"
        >
          <RefreshCw className={"size-4 " + (loading ? "animate-spin" : "")} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load events ({error}).
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading webhook events…
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No webhook events yet. Fire one from the Sandbox drawer on the Inventory page.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e, i) => {
              const ok = (e.status ?? "").toLowerCase().includes("success") || (e.status ?? "").toLowerCase() === "ok";
              const failed = (e.status ?? "").toLowerCase().includes("fail");
              return (
                <li key={e.id ?? e.reference ?? i} className="px-5 py-4 flex items-start gap-4 hover:bg-secondary/30">
                  <div className={"mt-0.5 grid size-8 place-items-center rounded-full shrink-0 " + (failed ? "bg-destructive/15 text-destructive" : ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                    {failed ? <XCircle className="size-4" /> : ok ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-1">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{e.event ?? "payment.success"} · {e.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Plot <span className="font-mono">{e.plot ?? "—"}</span>
                        {e.reference && <> · ref <span className="font-mono">{e.reference}</span></>}
                      </div>
                    </div>
                    <div className="md:text-right">
                      <div className="font-bold tabular-nums">{e.amount ? ngn.format(e.amount) : "—"}</div>
                      <div className="text-xs text-muted-foreground">{e.received_at ? new Date(e.received_at).toLocaleString() : ""}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
