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
    } else {
      router.push("/signin?registered=1");
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
          Create your vault
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
          Start organizing your prompts in seconds.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Name (optional)</label>
            <input name="name" type="text" placeholder="Your name" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" required placeholder="you@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" required placeholder="Min. 6 characters" style={inputStyle} />
          </div>
          {error && <p style={{ fontSize: 13, color: "#f87171" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            height: 44, borderRadius: 9, background: "var(--accent)",
            color: "white", border: "none", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            marginTop: 4,
          }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
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
