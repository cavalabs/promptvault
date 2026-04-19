"use client";

import { setTheme } from "@/app/actions";
import { useOptimistic, useTransition } from "react";

export function ThemeToggle({ current }: { current: "dark" | "light" }) {
  const [optimistic, setOptimistic] = useOptimistic(current);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = optimistic === "dark" ? "light" : "dark";
    startTransition(async () => {
      setOptimistic(next);
      const fd = new FormData();
      fd.set("theme", next);
      await setTheme(fd);
    });
  }

  return (
    <button
      onClick={toggle}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", borderRadius: 10, width: "100%",
        background: "var(--accent-muted)", border: "1px solid var(--border)",
        color: "var(--text)", cursor: "pointer", fontSize: 14, fontWeight: 600,
      }}
    >
      <span style={{ fontSize: 18 }}>{optimistic === "dark" ? "☀️" : "🌙"}</span>
      Switch to {optimistic === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
