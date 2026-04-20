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
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        width: "100%",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span style={{ fontSize: 18 }}>{optimistic === "dark" ? "☀️" : "🌙"}</span>
      Switch to {optimistic === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
