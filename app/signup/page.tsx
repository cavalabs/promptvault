"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/app/actions";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await registerUser(new FormData(e.currentTarget));

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/signin?registered=1");
  }

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

        <p style={eyebrow}>Create account</p>
        <h1 style={heroTitle}>Build your prompt vault</h1>
        <p style={heroText}>
          Keep reusable prompts in one place, then share only the ones you want the world to see.
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
          <h2 style={formTitle}>Create account</h2>
          <p style={formText}>Start with email and password. You can add OAuth later.</p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <Field label="Name">
              <input name="name" type="text" placeholder="Your name" style={inputStyle} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" required placeholder="you@example.com" style={inputStyle} />
            </Field>
            <Field label="Password">
              <input name="password" type="password" required placeholder="Min. 6 characters" style={inputStyle} />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}

            <button type="submit" disabled={loading} style={primaryButton}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={footerText}>
            Already have an account?{" "}
            <Link href="/signin" style={linkStyle}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
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
