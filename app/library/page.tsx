import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePrompt, setVisibility, toggleFavorite } from "@/app/actions";
import { Sidebar, ModelBadge } from "@/app/components/Sidebar";
import { PromptContent } from "@/app/components/PromptContent";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; category?: string; tag?: string; favorites?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  const { q, category, tag, favorites } = await searchParams;
  const query = q?.trim() ?? "";
  const favoritesOnly = favorites === "1";

  const [prompts, categories, tags] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        userId: user.id,
        ...(category ? { category: { slug: category } } : {}),
        ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
        ...(favoritesOnly ? { isFavorite: true } : {}),
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
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      include: { category: true, tags: { include: { tag: true }, take: 4 } },
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({
      where: { prompts: { some: { prompt: { userId: user.id } } } },
      orderBy: { name: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} activeItem="library" theme={theme} />

      <main style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            backdropFilter: "blur(18px)",
            background: "color-mix(in srgb, var(--bg) 84%, transparent)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              padding: "20px 28px",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={eyebrow}>Workspace</p>
              <h1 style={heading}>Library</h1>
              <p style={subtitle}>
                {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"} saved
                {query ? ` for "${query}"` : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/explore" style={ghostButton}>
                Explore public
              </Link>
              <Link href="/new" style={primaryButton}>
                + New prompt
              </Link>
            </div>
          </div>

          <div
            style={{
              padding: "0 28px 22px",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <form action="/library" style={{ flex: 1, minWidth: 260, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input name="q" defaultValue={query} placeholder="Search prompts..." style={searchInput} />
              {category && <input type="hidden" name="category" value={category} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              {favoritesOnly && <input type="hidden" name="favorites" value="1" />}
              <button type="submit" style={primaryButton}>
                Search
              </button>
            </form>

            <FilterSelect
              label="All categories"
              value={category ?? ""}
              param="category"
              query={query}
              favoritesOnly={favoritesOnly}
              options={categories.map((c) => ({ label: c.name, value: c.slug }))}
            />

            <FilterSelect
              label="All tags"
              value={tag ?? ""}
              param="tag"
              query={query}
              favoritesOnly={favoritesOnly}
              options={tags.map((t) => ({ label: `#${t.name}`, value: t.slug }))}
            />

            <Link
              href="/library?favorites=1"
              style={{
                ...chipLink,
                background: favoritesOnly ? "var(--accent-soft)" : "var(--bg-elevated)",
                color: favoritesOnly ? "var(--text)" : "var(--text-muted)",
              }}
            >
              Favorites
            </Link>
            <Link href="/library" style={chipLink}>
              Clear
            </Link>
          </div>
        </header>

        <div style={{ padding: "24px 28px 36px" }}>
          {prompts.length > 0 ? (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </section>
          ) : (
            <EmptyState
              title={query || category || tag || favoritesOnly ? "No results found" : "No prompts yet"}
              description={
                query || category || tag || favoritesOnly
                  ? "Try different filters or clear the current view."
                  : "Create a prompt from scratch or paste one you already trust."
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PromptCard({
  prompt,
}: {
  prompt: {
    id: string;
    title: string;
    slug: string;
    content: string;
    description: string | null;
    updatedAt: Date;
    isFavorite: boolean;
    visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
    model: string | null;
    category: { name: string; slug: string } | null;
    tags: { tag: { id: string; name: string } }[];
  };
}) {
  const updated = new Date(prompt.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 18,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <VisibilityBadge visibility={prompt.visibility} />
          {prompt.isFavorite && <Badge label="Favorite" tone="var(--accent-amber-soft)" color="var(--accent-amber)" />}
          {prompt.category && <Badge label={prompt.category.name} tone="var(--accent-soft)" color="var(--accent)" />}
        </div>

        <form action={toggleFavorite}>
          <input type="hidden" name="id" value={prompt.id} />
          <input type="hidden" name="isFavorite" value={String(prompt.isFavorite)} />
          <button style={iconButton} aria-label="Toggle favorite">
            {prompt.isFavorite ? "★" : "☆"}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", lineHeight: 1.35 }}>{prompt.title}</h3>
        {prompt.description && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>{prompt.description}</p>
        )}
      </div>

      <PromptContent content={prompt.content} maxHeight={116} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        <ModelBadge model={prompt.model} />
        {prompt.tags.map(({ tag }) => (
          <span key={tag.id} style={tagBadge}>
            #{tag.name}
          </span>
        ))}
      </div>

      <div style={footerRow}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {prompt.visibility !== "PRIVATE" && (
            <Link href={`/p/${prompt.slug}`} style={ghostButton}>
              Open
            </Link>
          )}
          <form action={setVisibility}>
            <input type="hidden" name="id" value={prompt.id} />
            <input type="hidden" name="visibility" value={prompt.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE"} />
            <button style={ghostButton as React.CSSProperties}>{prompt.visibility === "PRIVATE" ? "Share" : "Hide"}</button>
          </form>
          <form action={deletePrompt}>
            <input type="hidden" name="id" value={prompt.id} />
            <button style={{ ...ghostButton, color: "#d06262", borderColor: "rgba(208, 98, 98, 0.32)" }}>Delete</button>
          </form>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{updated}</span>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  param,
  query,
  favoritesOnly,
  options,
}: {
  label: string;
  value: string;
  param: string;
  query: string;
  favoritesOnly: boolean;
  options: { label: string; value: string }[];
}) {
  return (
    <form action="/library" style={{ display: "inline-flex" }}>
      {query && <input type="hidden" name="q" value={query} />}
      {favoritesOnly && <input type="hidden" name="favorites" value="1" />}
      <select
        name={param}
        defaultValue={value}
        onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
        style={selectStyle}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}

function VisibilityBadge({ visibility }: { visibility: "PRIVATE" | "PUBLIC" | "UNLISTED" }) {
  const map = {
    PRIVATE: { label: "Private", bg: "var(--bg-surface)", color: "var(--text-muted)" },
    PUBLIC: { label: "Public", bg: "var(--accent-soft)", color: "var(--accent)" },
    UNLISTED: { label: "Unlisted", bg: "var(--accent-amber-soft)", color: "var(--accent-amber)" },
  } as const;
  const badge = map[visibility];

  return <span style={{ ...badgeStyle, background: badge.bg, color: badge.color }}>{badge.label}</span>;
}

function Badge({ label, tone, color }: { label: string; tone: string; color: string }) {
  return <span style={{ ...badgeStyle, background: tone, color }}>{label}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section
      style={{
        background: "var(--bg-elevated)",
        border: "1px dashed var(--border-strong)",
        borderRadius: 8,
        padding: 30,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.6 }}>{description}</p>
      <Link href="/new" style={{ ...primaryButton, display: "inline-flex", marginTop: 18 }}>
        Create prompt
      </Link>
    </section>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-blue)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  marginBottom: 6,
};

const heading: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  color: "var(--text)",
  letterSpacing: "-0.03em",
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 4,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 40,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid transparent",
  background: "var(--accent)",
  color: "white",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
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

const chipLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
};

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: 40,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  outline: "none",
  fontSize: 13,
};

const selectStyle: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  outline: "none",
  fontSize: 13,
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

const footerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 14,
  paddingTop: 14,
  borderTop: "1px solid var(--border)",
};

const iconButton: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg-surface)",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: 16,
};
