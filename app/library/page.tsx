import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePrompt, setVisibility, toggleFavorite } from "@/app/actions";
import { Sidebar, ModelBadge } from "@/app/components/Sidebar";
import { PromptContent } from "@/app/components/PromptContent";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; category?: string; tag?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const { q, category, tag } = await searchParams;
  const query = q?.trim() ?? "";

  const [prompts, categories, tags, total] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        userId: user.id,
        ...(category ? { category: { slug: category } } : {}),
        ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        } : {}),
      },
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      include: { category: true, tags: { include: { tag: true }, take: 4 } },
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({
      where: { prompts: { some: { prompt: { userId: user.id } } } },
      orderBy: { name: "asc" },
      take: 20,
    }),
    prisma.prompt.count({ where: { userId: user.id } }),
  ]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar user={user} activeItem="library" />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{
          padding: "20px 28px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Library</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
              {query ? ` for "${query}"` : ""}
            </p>
          </div>
          <Link href="/new" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 9,
            background: "var(--accent)", color: "white",
            fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
            + New Prompt
          </Link>
        </header>

        {/* Filters */}
        <div style={{
          padding: "12px 28px", borderBottom: "1px solid var(--border)",
          display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        }}>
          <form action="/library" style={{ flex: 1, minWidth: 240, maxWidth: 480, display: "flex", gap: 8 }}>
            <input
              name="q" defaultValue={query}
              placeholder="Search prompts..."
              style={{
                flex: 1, height: 36, padding: "0 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--input-bg)",
                color: "var(--text)", fontSize: 13, outline: "none",
              }}
            />
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
          </form>

          {/* Category filter */}
          <FilterSelect
            label="All Categories"
            value={category ?? ""}
            param="category"
            query={query}
            options={categories.map((c) => ({ label: c.name, value: c.slug }))}
          />

          {/* Tag filter */}
          <FilterSelect
            label="All Tags"
            value={tag ?? ""}
            param="tag"
            query={query}
            options={tags.map((t) => ({ label: "#" + t.name, value: t.slug }))}
          />

          {(query || category || tag) && (
            <Link href="/library" style={{
              height: 36, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--border)", color: "var(--text-muted)",
              fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
            }}>
              Clear
            </Link>
          )}
        </div>

        {/* Grid */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          {prompts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div style={{
              border: "1px dashed var(--border)", borderRadius: 12,
              padding: 64, textAlign: "center",
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                {query || category || tag ? "No results found" : "No prompts yet"}
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 14 }}>
                {query || category || tag ? "Try different filters." : "Save your first reusable prompt."}
              </p>
              <Link href="/new" style={{
                padding: "10px 20px", borderRadius: 9,
                background: "var(--accent)", color: "white",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
                + New Prompt
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PromptCard({ prompt }: { prompt: any }) {
  const now = new Date();
  const date = new Date(prompt.updatedAt);
  const dateStr = date.toISOString().split("T")[0];

  return (
    <article style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Card top */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>
          {prompt.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, flexShrink: 0 }}>
          <form action={toggleFavorite} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={prompt.id} />
            <input type="hidden" name="isFavorite" value={String(prompt.isFavorite)} />
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, color: prompt.isFavorite ? "#fbbf24" : "var(--text-muted)",
              padding: 2,
            }}>★</button>
          </form>
          <span style={{ fontSize: 16, color: "var(--text-muted)", cursor: "pointer" }}>···</span>
        </div>
      </div>

      {/* Content preview */}
      <PromptContent content={prompt.content} maxHeight={110} />

      {/* Model + tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <ModelBadge model={prompt.model} />
        {prompt.tags.map(({ tag }: any) => (
          <span key={tag.id} style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 6,
            background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 600,
          }}>
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid var(--border)", paddingTop: 12,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {prompt.visibility !== "PRIVATE" && (
            <Link href={`/p/${prompt.slug}`} style={actionBtn}>Open</Link>
          )}
          <form action={setVisibility} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={prompt.id} />
            <input type="hidden" name="visibility" value={prompt.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE"} />
            <button style={actionBtn}>{prompt.visibility === "PRIVATE" ? "Share" : "Hide"}</button>
          </form>
          <form action={deletePrompt} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={prompt.id} />
            <button style={{ ...actionBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }}>
              Delete
            </button>
          </form>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{dateStr}</span>
      </div>
    </article>
  );
}

const actionBtn: React.CSSProperties = {
  fontSize: 11, padding: "4px 10px", borderRadius: 6,
  border: "1px solid var(--border)", background: "transparent",
  color: "var(--text-muted)", cursor: "pointer", fontWeight: 600,
  textDecoration: "none", display: "inline-flex", alignItems: "center",
};

function FilterSelect({
  label, value, param, query, options,
}: {
  label: string;
  value: string;
  param: string;
  query: string;
  options: { label: string; value: string }[];
}) {
  return (
    <form action="/library" style={{ display: "inline" }}>
      {query && <input type="hidden" name="q" value={query} />}
      <select
        name={param}
        defaultValue={value}
        onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
        style={{
          height: 36, padding: "0 10px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--input-bg)",
          color: value ? "var(--text)" : "var(--text-muted)",
          fontSize: 13, outline: "none", cursor: "pointer",
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
  );
}
