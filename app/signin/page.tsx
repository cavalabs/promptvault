"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignInForm() {
  const params = useSearchParams();
  const registered = params.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "40px 36px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16, color: "white", fontFamily: "monospace",
          }}>P</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
            Prompt<span style={{ color: "var(--accent)" }}>Vault</span>
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Continue to your vault
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
          Sign in to access your prompt library.
        </p>

        {registered && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: "rgba(16,163,127,0.12)", color: "#10a37f", fontSize: 13,
          }}>
            Account created! Sign in below.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="you@example.com" style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••" style={inputStyle}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            height: 44, borderRadius: 9, background: "var(--accent)",
            color: "white", border: "none", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            marginTop: 4,
          }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--input-bg)",
  color: "var(--text)", fontSize: 14, outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
