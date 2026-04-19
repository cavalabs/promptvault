import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, minHeight: "100vh",
        background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "20px 12px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: "white", fontFamily: "monospace",
          }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            Prompt<span style={{ color: "var(--accent)" }}>Vault</span>
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <NavItem href="/" icon="◈" label="Prompts" />
          <NavItem href="/?favorites=1" icon="★" label="Favorites" />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavItem href="/settings" icon="⚙" label="Settings" active />
          <Link href="/api/auth/signout" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            borderRadius: 8, fontSize: 13, color: "var(--text-muted)", textDecoration: "none",
          }}>
            <span style={{ width: 18, textAlign: "center" }}>↩</span>
            Sign out
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 40 }}>
          Manage your account and preferences.
        </p>

        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Account */}
          <section style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 24,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Account</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row label="Name" value={user.name ?? "—"} />
              <Row label="Email" value={user.email ?? "—"} />
            </div>
          </section>

          {/* Theme */}
          <section style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 24,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Appearance</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Currently using <strong style={{ color: "var(--accent)" }}>{theme} mode</strong>.
            </p>
            <ThemeToggle current={theme} />
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 8,
      background: active ? "var(--accent-muted)" : "transparent",
      color: active ? "var(--accent)" : "var(--text-muted)",
      textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 400,
    }}>
      <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
