import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CopyButton } from "@/app/components/CopyButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicPrompt({ params }: Props) {
  const { slug } = await params;
  const prompt = await prisma.prompt.findFirst({
    where: { slug, visibility: { not: "PRIVATE" } },
    include: { category: true, tags: { include: { tag: true } }, user: true },
  });

  if (!prompt) notFound();

  const author = prompt.user.name ?? "CavaLabs";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header style={header}>
        <Link href="/explore" style={brandLink}>
          <div style={brandMark}>P</div>
          <div>
            <p style={brandName}>PromptVault</p>
            <p style={brandSub}>Public prompt library</p>
          </div>
        </Link>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...badgeStyle, background: "var(--accent-soft)", color: "var(--accent)" }}>
            {prompt.visibility === "PUBLIC" ? "Public" : "Unlisted"}
          </span>
          <Link href="/signup" style={primaryButton}>
            Get started
          </Link>
        </div>
      </header>

      <main style={mainWrap}>
        <section style={hero}>
          {prompt.category && <p style={eyebrow}>{prompt.category.name}</p>}
          <h1 style={title}>{prompt.title}</h1>
          {prompt.description && <p style={description}>{prompt.description}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <span style={metaText}>
              By <strong style={{ color: "var(--text)" }}>{author}</strong>
            </span>
            {prompt.tags.map(({ tag }) => (
              <span key={tag.id} style={tagBadge}>
                #{tag.name}
              </span>
            ))}
          </div>
        </section>

        <section style={promptPanel}>
          <div style={promptHeader}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ ...dot, background: "#f25f5c" }} />
              <div style={{ ...dot, background: "#f2c14e" }} />
              <div style={{ ...dot, background: "#2ebd9b" }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>prompt</span>
            <CopyButton text={prompt.content} />
          </div>

          <pre style={promptBody}>{prompt.content}</pre>
        </section>

        <section style={ctaCard}>
          <p style={eyebrow}>Your turn</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginTop: 6 }}>Save this prompt to your vault.</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.7 }}>
            Create a free account to organize, customize, and share your own prompt library.
          </p>
          <Link href="/signup" style={{ ...primaryButton, marginTop: 18 }}>
            Create free account
          </Link>
        </section>
      </main>
    </div>
  );
}

const header: React.CSSProperties = {
  padding: "18px 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  borderBottom: "1px solid var(--border)",
  background: "color-mix(in srgb, var(--bg) 84%, transparent)",
  backdropFilter: "blur(18px)",
  position: "sticky",
  top: 0,
  zIndex: 20,
};

const brandLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  textDecoration: "none",
};

const brandMark: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 8,
  background: "linear-gradient(135deg, var(--accent), var(--accent-blue))",
  display: "grid",
  placeItems: "center",
  color: "white",
  fontWeight: 900,
  fontFamily: "var(--font-mono)",
};

const brandName: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 900,
  color: "var(--text)",
};

const brandSub: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  marginTop: 2,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 42,
  padding: "0 16px",
  borderRadius: 8,
  border: "1px solid transparent",
  background: "var(--accent)",
  color: "white",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 24,
  padding: "0 8px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 800,
  border: "1px solid var(--border)",
};

const mainWrap: React.CSSProperties = {
  maxWidth: 940,
  margin: "0 auto",
  padding: "48px 24px 56px",
  display: "grid",
  gap: 20,
};

const hero: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-blue)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const title: React.CSSProperties = {
  fontSize: 44,
  fontWeight: 900,
  color: "var(--text)",
  lineHeight: 1.05,
  letterSpacing: "-0.05em",
  maxWidth: 740,
};

const description: React.CSSProperties = {
  fontSize: 16,
  color: "var(--text-muted)",
  lineHeight: 1.7,
  maxWidth: 720,
};

const metaText: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
};

const tagBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 24,
  padding: "0 8px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 800,
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text-muted)",
};

const promptPanel: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "var(--shadow-soft)",
};

const promptHeader: React.CSSProperties = {
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-surface)",
};

const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
};

const promptBody: React.CSSProperties = {
  margin: 0,
  padding: "24px 22px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "var(--font-mono)",
  fontSize: 14,
  lineHeight: 1.8,
  color: "var(--text)",
};

const ctaCard: React.CSSProperties = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  padding: 22,
};
