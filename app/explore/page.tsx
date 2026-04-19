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
        ...(query ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        } : {}),
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
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-sidebar)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <Link href="/explore" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: "white", fontFamily: "monospace",
          }}>P</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
            Prompt<span style={{ color: "var(--accent)" }}>Vault</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/signin" style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none",
          }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "var(--accent)", color: "white", textDecoration: "none",
          }}>
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
          CavaLabs · Prompt Library
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
          Ready-to-use prompts<br />for your business
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 36px" }}>
          A curated library of professional prompts for marketing, sales, HR, product, and more.
        </p>

        {/* Search */}
        <form action="/explore" style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
          {category && <input type="hidden" name="category" value={category} />}
          <input
            name="q" defaultValue={query}
            placeholder="Search prompts..."
            style={{
              flex: 1, height: 46, padding: "0 16px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--input-bg)",
              color: "var(--text)", fontSize: 15, outline: "none",
            }}
          />
          <button type="submit" style={{
            height: 46, padding: "0 20px", borderRadius: 10,
            background: "var(--accent)", color: "white",
            border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            Search
          </button>
          {(query || category) && (
            <Link href="/explore" style={{
              height: 46, padding: "0 16px", borderRadius: 10,
              border: "1px solid var(--border)", color: "var(--text-muted)",
              fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
            }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "0 24px 36px" }}>
          <Link href="/explore" style={catBtnStyle(!category)}>All</Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/explore?category=${cat.slug}`} style={catBtnStyle(category === cat.slug)}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        {prompts.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18 }}>
            {prompts.map((prompt) => (
              <Link key={prompt.id} href={`/p/${prompt.slug}`} style={{ textDecoration: "none" }}>
                <article style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: 22,
                  display: "flex", flexDirection: "column", gap: 12,
                  height: "100%", cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                }}>
                  {prompt.category && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "var(--accent)",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      {prompt.category.name}
                    </span>
                  )}
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                    {prompt.title}
                  </h2>
                  {prompt.description && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {prompt.description}
                    </p>
                  )}
                  <pre style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 12px",
                    fontSize: 12, fontFamily: "var(--font-mono)",
                    color: "var(--accent)", lineHeight: 1.6,
                    whiteSpace: "pre-wrap", overflow: "hidden", maxHeight: 80,
                    margin: 0,
                  }}>
                    {prompt.content.slice(0, 160)}{prompt.content.length > 160 ? "..." : ""}
                  </pre>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                    {prompt.tags.map(({ tag }) => (
                      <span key={tag.id} style={{
                        fontSize: 11, padding: "3px 8px", borderRadius: 6,
                        background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 600,
                      }}>
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      by <strong style={{ color: "var(--text)" }}>{prompt.user.name ?? "CavaLabs"}</strong>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                      View →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 64 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {query ? `No results for "${query}"` : "No prompts yet"}
            </h2>
            <p style={{ color: "var(--text-muted)" }}>Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function catBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "7px 16px", borderRadius: 8,
    background: active ? "var(--accent)" : "var(--bg-card)",
    color: active ? "white" : "var(--text-muted)",
    border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
    fontSize: 13, fontWeight: 600, textDecoration: "none",
    cursor: "pointer",
  };
}
