import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type NavItem = { href: string; icon: string; label: string; active?: boolean };

const MODEL_COLORS: Record<string, string> = {
  "GPT-4o": "#0f8b74",
  "Claude 3.7": "#1667c5",
  "Gemini 1.5 Pro": "#0ea5e9",
};

export function Sidebar({
  user,
  activeItem,
  theme,
}: {
  user: { name?: string | null; email?: string | null };
  activeItem: string;
  theme: "dark" | "light";
}) {
  const displayName = user.name ?? user.email ?? "User";
  const initials = displayName
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");

  return (
    <aside
      style={{
        width: 272,
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "18px 14px",
        flexShrink: 0,
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
          padding: "10px 12px",
          textDecoration: "none",
          borderRadius: 8,
          background: "var(--accent-soft)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--accent-blue))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
            color: "white",
            fontFamily: "var(--font-mono)",
          }}
        >
          P
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>
            PromptVault
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
            Private prompt workspace
          </p>
        </div>
      </Link>

      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          paddingLeft: 10,
          marginBottom: 8,
        }}
      >
        Navigation
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <SidebarLink href="/" icon="◈" label="Dashboard" active={activeItem === "dashboard"} />
        <SidebarLink href="/library" icon="☰" label="Library" active={activeItem === "library"} />
        <SidebarLink href="/new" icon="＋" label="New prompt" active={activeItem === "new"} />
        <SidebarLink href="/explore" icon="◎" label="Explore" active={activeItem === "explore"} />
        <SidebarLink href="/settings" icon="⚙" label="Settings" active={activeItem === "settings"} />
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <ThemeToggle current={theme} />
        <Link
          href="/api/auth/signout"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <span style={{ width: 18, textAlign: "center" }}>↩</span>
          Sign out
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), var(--accent-blue))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 2,
              }}
            >
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label, active }: NavItem) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
      }}
    >
      <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}

export function ModelBadge({ model }: { model?: string | null }) {
  if (!model) return null;

  const color = MODEL_COLORS[model] ?? "var(--accent)";

  return (
    <span
      style={{
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 8,
        background: `${color}20`,
        color,
        fontWeight: 700,
        border: `1px solid ${color}30`,
      }}
    >
      {model}
    </span>
  );
}
