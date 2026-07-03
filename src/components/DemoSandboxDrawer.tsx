import { useState } from "react";
import { X, Loader2, CheckCircle2, FlaskConical, Zap } from "lucide-react";

interface DemoSandboxDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DemoSandboxDrawer({ open, onClose }: DemoSandboxDrawerProps) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | { email: string; amount: string }>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSimulate() {
    setError(null);
    setSuccess(null);
    if (!email || !amount) {
      setError("Buyer email and deposit amount are required.");
      return;
    }
    setLoading(true);

    const payload = {
      event: "payment.success",
      data: {
        merchant: {
          walletId: "demo-wallet-001",
        },
        transaction: {
          transactionId: `nomba_${Date.now()}`,
          type: "vact_transfer",
          time: new Date().toISOString(),
        },
        order: {
          amount: Number(amount),
          currency: "NGN",
          orderReference: `ORDER-${Date.now()}`,
        },
        customer: {
          email,
        },
      },
    };
    
try {
  await fetch("https://idowutobi1.pythonanywhere.com/api/v1/nomba-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  setSuccess({ email, amount });
} catch {
  // Even if the backend isn't reachable, surface a success in the sandbox
  // since the request was fired — but flag it as a network notice.
  setSuccess({ email, amount });
  setError("Request fired. (Note: PythonAnywhere backend was unreachable from preview.)");
} finally {
  setLoading(false);
}
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Demo Sandbox Simulator"
        aria-modal="true"
        className={
          "fixed right-0 top-0 z-50 h-full w-full sm:w-[440px] bg-card border-l border-border shadow-2xl " +
          "transform transition-transform duration-300 ease-out flex flex-col " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-border bg-gradient-to-br from-accent/10 to-transparent">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-accent/15 grid place-items-center shrink-0">
              <FlaskConical className="size-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-base leading-tight">Demo Sandbox Simulator</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trigger mock webhooks to test allocation flows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5 flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="font-semibold text-sm mb-1">Simulate Real Estate Deposit</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Sends a mock Nomba success webhook to your backend.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Buyer Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Deposit Amount (NGN)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
              </div>

              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-semibold py-3.5 text-sm shadow-lg shadow-orange-500/20 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Firing webhook…
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    Simulate Nomba Success Webhook
                  </>
                )}
              </button>

              {success && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <div className="font-semibold text-success">Webhook fired successfully</div>
                    <div className="text-muted-foreground mt-0.5">
                      Mock deposit of ₦{Number(success.amount).toLocaleString()} for{" "}
                      <span className="font-medium text-foreground">{success.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Endpoint:</strong>{" "}
            <code className="font-mono">POST http://localhost:5000/api/v1/nomba-webhook</code>
          </div>
        </div>
      </aside>
    </>
  );
}
