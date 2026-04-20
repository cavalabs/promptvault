"use client";

import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ProviderMap = Awaited<ReturnType<typeof getProviders>>;

function SignInForm() {
  const params = useSearchParams();
  const registered = params.get("registered");
  const [providers, setProviders] = useState<ProviderMap>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  const oauthProviders = Object.values(providers ?? {}).filter((provider) => provider.id !== "credentials");

  return (
    <div style={pageWrap}>
      <section style={heroPanel}>
        <div style={brandRow}>
          <div style={brandMark}>P</div>
          <div>
            <p style={brandName}>PromptVault</p>
            <p style={brandSub}>Private prompt workspace</p>
          </div>
        </div>

        <p style={eyebrow}>Sign in</p>
        <h1 style={heroTitle}>Continue to your vault</h1>
        <p style={heroText}>
          Keep your prompts organized, searchable, and ready to reuse across projects and teams.
        </p>

        <div style={featureGrid}>
          <Feature label="Private by default" />
          <Feature label="Fast search" />
          <Feature label="Public links" />
        </div>
      </section>

      <section style={formPanel}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <p style={eyebrow}>Access</p>
          <h2 style={formTitle}>Sign in</h2>
          <p style={formText}>Use email and password, or continue with an external account.</p>

          {registered && <Notice tone="success">Account created. Sign in below.</Notice>}

          {oauthProviders.length > 0 && (
            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              {oauthProviders.map((provider) => (
                <button key={provider.id} type="button" onClick={() => signIn(provider.id, { callbackUrl: "/" })} style={oauthButton}>
                  Continue with {provider.name}
                </button>
              ))}
            </div>
          )}

          {oauthProviders.length > 0 && <Divider />}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}

            <button type="submit" disabled={loading} style={primaryButton}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={linkStyle}>
              Create one
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return <div style={featureChip}>{label}</div>;
}

function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 8,
        border: "1px solid",
        borderColor: tone === "success" ? "rgba(46,189,155,0.35)" : "rgba(208,98,98,0.35)",
        background: tone === "success" ? "var(--accent-soft)" : "rgba(208,98,98,0.12)",
        color: tone === "success" ? "var(--accent)" : "#d06262",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "18px 0" }} />;
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "minmax(320px, 1fr) minmax(360px, 540px)",
  background: "var(--bg)",
};

const heroPanel: React.CSSProperties = {
  padding: "44px 42px",
  background: "linear-gradient(180deg, var(--bg-sidebar), var(--bg))",
  borderRight: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 24,
};

const formPanel: React.CSSProperties = {
  padding: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandMark: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, var(--accent), var(--accent-blue))",
  color: "white",
  fontWeight: 900,
  fontFamily: "var(--font-mono)",
};

const brandName: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 900,
  color: "var(--text)",
};

const brandSub: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  marginTop: 3,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-blue)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const heroTitle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 900,
  color: "var(--text)",
  lineHeight: 1.02,
  letterSpacing: "-0.05em",
  maxWidth: 460,
};

const heroText: React.CSSProperties = {
  fontSize: 16,
  color: "var(--text-muted)",
  lineHeight: 1.7,
  maxWidth: 480,
};

const featureGrid: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const featureChip: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text)",
  fontSize: 13,
  fontWeight: 700,
};

const formTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "var(--text)",
  marginTop: 6,
};

const formText: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 6,
  marginBottom: 22,
  lineHeight: 1.6,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 42,
  borderRadius: 8,
  border: "1px solid transparent",
  background: "var(--accent)",
  color: "white",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const oauthButton: React.CSSProperties = {
  ...primaryButton,
  background: "var(--bg-elevated)",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

const footerText: React.CSSProperties = {
  marginTop: 22,
  textAlign: "center",
  fontSize: 13,
  color: "var(--text-muted)",
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 800,
  textDecoration: "none",
};
