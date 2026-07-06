import { useEffect, useState } from "react";
import { X, Loader2, Copy, CheckCircle2, Banknote } from "lucide-react";

const ENDPOINT = "https://idowutobi1.pythonanywhere.com/api/v1/virtual-accounts";

interface Props {
  open: boolean;
  onClose: () => void;
  plot: string;
}

interface VA {
  account_number?: string;
  bank_name?: string;
  account_name?: string;
  reference?: string;
}

export function VirtualAccountModal({ open, onClose, plot }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VA | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setData(null);
      setError(null);
      setCopied(false);
    }
  }, [open]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plot, source: "admin-dashboard" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json?.virtual_account ?? json?.data ?? json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate account");
    } finally {
      setLoading(false);
    }
  }

  function copy(v: string) {
    navigator.clipboard?.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(94vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card text-card-foreground shadow-2xl ring-1 ring-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Banknote className="size-5 text-accent" />
            <h2 className="font-semibold">Virtual Account — {plot}</h2>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!data && !loading && (
            <>
              <p className="text-sm text-muted-foreground">
                Generate a unique Nomba virtual account for plot <span className="font-mono">{plot}</span>. Buyers transfer to this number to reserve the plot.
              </p>
              <button
                onClick={generate}
                className="w-full rounded-lg bg-accent text-accent-foreground py-3 font-semibold hover:opacity-90"
              >
                Generate Virtual Account
              </button>
            </>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Provisioning account with Nomba…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-3">
              <Row label="Bank" value={data.bank_name ?? "—"} onCopy={copy} />
              <Row label="Account Number" value={data.account_number ?? "—"} onCopy={copy} mono />
              <Row label="Account Name" value={data.account_name ?? "—"} onCopy={copy} />
              {data.reference && <Row label="Reference" value={data.reference} onCopy={copy} mono />}
              {copied && (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="size-4" /> Copied to clipboard
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, onCopy, mono }: { label: string; value: string; onCopy: (v: string) => void; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={"truncate font-semibold " + (mono ? "font-mono" : "")}>{value}</div>
      </div>
      <button onClick={() => onCopy(value)} className="grid size-8 place-items-center rounded-md hover:bg-muted text-muted-foreground" aria-label={`Copy ${label}`}>
        <Copy className="size-4" />
      </button>
    </div>
  );
}
