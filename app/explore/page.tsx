import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

export default async function ExplorePage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const query = q?.trim() ?? "";

  const [prompts, categories] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        visibility: "PUBLIC",
        ...(category ? { category: { slug: category } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { description: { contains: query, mode: "insensitive" as const } },
                { content: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true, tags: { include: { tag: true }, take: 4 }, user: true },
    }),
    prisma.category.findMany({
      where: { prompts: { some: { visibility: "PUBLIC" } } },
      orderBy: { name: "asc" },
    }),
  ]);

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
          <Link href="/signin" style={ghostButton}>
            Sign in
          </Link>
          <Link href="/signup" style={primaryButton}>
            Get started
          </Link>
        </div>
      </header>

      <section style={hero}>
        <p style={eyebrow}>CavaLabs · Prompt Library</p>
        <h1 style={title}>Ready-to-use prompts for real work.</h1>
        <p style={description}>
          Browse the public side of the vault and open prompts that are already organized for marketing, sales,
          operations, and more.
        </p>

        <form action="/explore" style={searchRow}>
          {category && <input type="hidden" name="category" value={category} />}
          <input name="q" defaultValue={query} placeholder="Search prompts..." style={searchInput} />
          <button type="submit" style={primaryButton}>
            Search
          </button>
          {(query || category) && (
            <Link href="/explore" style={ghostButton}>
              Clear
            </Link>
          )}
        </form>
      </section>

      {categories.length > 0 && (
        <div style={chipRow}>
          <Link href="/explore" style={categoryChip(!category)}>
            All
          </Link>
          {categories.map((item) => (
            <Link key={item.id} href={`/explore?category=${item.slug}`} style={categoryChip(category === item.slug)}>
              {item.name}
            </Link>
          ))}
        </div>
      )}

      <main style={contentWrap}>
        {prompts.length > 0 ? (
          <section style={grid}>
            {prompts.map((prompt) => (
              <Link key={prompt.id} href={`/p/${prompt.slug}`} style={cardLink}>
                <article style={card}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {prompt.category && <Badge label={prompt.category.name} tone="var(--accent-soft)" color="var(--accent)" />}
                    <Badge label={prompt.visibility === "PUBLIC" ? "Public" : "Unlisted"} tone="var(--accent-blue-soft)" color="var(--accent-blue)" />
                  </div>

                  <h2 style={cardTitle}>{prompt.title}</h2>
                  {prompt.description && <p style={cardText}>{prompt.description}</p>}

                  <pre style={preview}>{prompt.content.slice(0, 180)}{prompt.content.length > 180 ? "..." : ""}</pre>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {prompt.tags.map(({ tag }) => (
                      <span key={tag.id} style={tagBadge}>
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  <div style={cardFooter}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      by <strong style={{ color: "var(--text)" }}>{prompt.user.name ?? "CavaLabs"}</strong>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800 }}>Open →</span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        ) : (
          <section style={emptyCard}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>
              {query ? `No results for "${query}"` : "No prompts yet"}
            </h2>
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Try another search or check back soon.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Badge({ label, tone, color }: { label: string; tone: string; color: string }) {
  return <span style={{ ...badgeStyle, background: tone, color }}>{label}</span>;
}

function categoryChip(active: boolean): React.CSSProperties {
  return {
    ...chipStyle,
    background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
    color: active ? "var(--text)" : "var(--text-muted)",
    borderColor: active ? "var(--border-strong)" : "var(--border)",
  };
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

const hero: React.CSSProperties = {
  padding: "56px 24px 42px",
  textAlign: "center",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-blue)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  marginBottom: 10,
};

const title: React.CSSProperties = {
  fontSize: 54,
  fontWeight: 900,
  lineHeight: 1.02,
  letterSpacing: "-0.05em",
  maxWidth: 760,
  margin: "0 auto",
};

const description: React.CSSProperties = {
  fontSize: 16,
  color: "var(--text-muted)",
  maxWidth: 580,
  margin: "16px auto 0",
  lineHeight: 1.7,
};

const searchRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  maxWidth: 720,
  margin: "28px auto 0",
  flexWrap: "wrap",
  justifyContent: "center",
};

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 240,
  height: 42,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  outline: "none",
  fontSize: 14,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
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

const ghostButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 42,
  padding: "0 16px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "center",
  padding: "0 24px 32px",
};

const chipStyle: React.CSSProperties = {
  minHeight: 36,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
};

const contentWrap: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 24px 56px",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
  gap: 16,
};

const cardLink: React.CSSProperties = {
  textDecoration: "none",
};

const card: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minHeight: 320,
  boxShadow: "var(--shadow-soft)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 900,
  color: "var(--text)",
  lineHeight: 1.35,
};

const cardText: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  lineHeight: 1.6,
};

const preview: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 12px",
  margin: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  lineHeight: 1.7,
  color: "var(--text)",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  maxHeight: 96,
};

const cardFooter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: "auto",
  paddingTop: 4,
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
  background: "var(--bg-surface)",
  color: "var(--text-muted)",
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

const emptyCard: React.CSSProperties = {
  borderRadius: 8,
  border: "1px dashed var(--border-strong)",
  background: "var(--bg-elevated)",
  padding: 28,
  textAlign: "center",
};
