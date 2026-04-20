"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        background: copied ? "var(--accent-soft)" : "var(--accent)",
        color: copied ? "var(--accent)" : "white",
        border: "1px solid " + (copied ? "var(--border-strong)" : "transparent"),
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer",
        transition: "transform 120ms ease, background-color 120ms ease",
      }}
    >
      {copied ? "✓ Copied!" : "Copy prompt"}
    </button>
  );
}
