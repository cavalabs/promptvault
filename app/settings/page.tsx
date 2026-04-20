import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/app/components/Sidebar";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} activeItem="settings" theme={theme} />

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={header}>
          <div>
            <p style={eyebrowStyle}>Account</p>
            <h1 style={heading}>Settings</h1>
            <p style={subtitle}>Tweak your profile and appearance.</p>
          </div>
          <Link href="/library" style={ghostButton}>
            Back to library
          </Link>
        </header>

        <div style={contentGrid}>
          <Panel title="Profile" eyebrow="Identity">
            <Row label="Name" value={user.name ?? "—"} />
            <Row label="Email" value={user.email ?? "—"} />
          </Panel>

          <Panel title="Appearance" eyebrow="Display">
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Currently using <strong style={{ color: "var(--accent)" }}>{theme} mode</strong>.
            </p>
            <ThemeToggle current={theme} />
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={panel}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <strong style={{ fontSize: 13, color: "var(--text)" }}>{value}</strong>
    </div>
  );
}

const header: React.CSSProperties = {
  padding: "20px 28px",
  borderBottom: "1px solid var(--border)",
  background: "color-mix(in srgb, var(--bg) 84%, transparent)",
  backdropFilter: "blur(18px)",
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const contentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  padding: "24px 28px 36px",
  alignItems: "start",
};

const panel: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 18,
  boxShadow: "var(--shadow-soft)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  color: "var(--text)",
  marginTop: 6,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-blue)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const heading: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  color: "var(--text)",
  letterSpacing: "-0.03em",
  marginTop: 6,
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 4,
};

const ghostButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 40,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};
