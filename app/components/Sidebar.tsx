import Link from "next/link";

type NavItem = { href: string; icon: string; label: string; active?: boolean };

const MODEL_COLORS: Record<string, string> = {
  "GPT-4o": "#10a37f",
  "Claude 3.7": "#c8956c",
  "Gemini 1.5 Pro": "#4285f4",
};

export function Sidebar({
  user,
  activeItem,
}: {
  user: { name?: string | null; email?: string | null };
  activeItem: string;
}) {
  const displayName = user.name ?? user.email ?? "User";
  const initials = displayName
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p.at(0)?.toUpperCase())
    .join("");

  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: "16px 12px", flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingLeft: 8, textDecoration: "none" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 14, color: "white", fontFamily: "monospace",
        }}>P</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
          Prompt<span style={{ color: "var(--accent)" }}>Vault</span>
        </span>
      </Link>

      {/* Nav label */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 10, marginBottom: 6 }}>
        Navigation
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <SidebarLink href="/" icon="▣" label="Dashboard" active={activeItem === "dashboard"} />
        <SidebarLink href="/library" icon="☰" label="Library" active={activeItem === "library"} />
        <SidebarLink href="/explore" icon="◎" label="Explore" active={activeItem === "explore"} />
        <SidebarLink href="/tags" icon="#" label="Tags" active={activeItem === "tags"} />
        <SidebarLink href="/settings" icon="○" label="Settings" active={activeItem === "settings"} />
      </nav>

      {/* Bottom */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <Link href="/api/auth/signout" style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 8,
          fontSize: 13, color: "var(--text-muted)", textDecoration: "none",
        }}>
          <span style={{ fontSize: 13 }}>↩</span> Collapse
        </Link>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 8,
          background: "var(--accent-muted)",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name ?? "User"}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 8,
      background: active ? "var(--accent-muted)" : "transparent",
      color: active ? "var(--accent)" : "var(--text-muted)",
      textDecoration: "none", fontSize: 13,
      fontWeight: active ? 600 : 400,
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
    }}>
      <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}

export function ModelBadge({ model }: { model?: string | null }) {
  if (!model) return null;
  const color = MODEL_COLORS[model] ?? "var(--accent)";
  return (
    <span style={{
      fontSize: 11, padding: "3px 8px", borderRadius: 6,
      background: color + "25", color, fontWeight: 700,
      border: "1px solid " + color + "40",
    }}>
      {model}
    </span>
  );
}
