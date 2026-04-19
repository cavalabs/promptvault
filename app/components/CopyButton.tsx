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
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 8,
        background: copied ? "rgba(52,211,153,0.15)" : "var(--accent)",
        color: copied ? "#34d399" : "white",
        border: "none", fontSize: 14, fontWeight: 700,
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      {copied ? "✓ Copied!" : "Copy prompt"}
    </button>
  );
}
