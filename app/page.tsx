import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, ModelBadge } from "@/app/components/Sidebar";
import { PromptContent } from "@/app/components/PromptContent";
import { setVisibility, deletePrompt, toggleFavorite } from "@/app/actions";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ q?: string; category?: string; favorites?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  const { q, category: categoryFilter, favorites } = await searchParams;
  const query = q?.trim() ?? "";
  const favoritesOnly = favorites === "1";

  const promptWhere = {
    userId: user.id,
    ...(categoryFilter ? { category: { slug: categoryFilter } } : {}),
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
  };

  const [filteredPrompts, categories, totalPrompts, publicPrompts, favoriteCount] = await Promise.all([
    prisma.prompt.findMany({
      where: promptWhere,
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        tags: { include: { tag: true }, take: 3 },
      },
      take: 12,
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.prompt.count({ where: { userId: user.id } }),
    prisma.prompt.count({ where: { userId: user.id, visibility: "PUBLIC" } }),
    prisma.prompt.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  const displayName = user.name ?? user.email ?? "User";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} activeItem="dashboard" theme={theme} />

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
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 240 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--accent-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 6,
                }}
              >
                PromptVault
              </p>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>
                Dashboard
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Welcome back, {displayName}. Your prompt library is ready.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Link href="/explore" style={ghostButton}>
                Explore public
              </Link>
              <Link href="/library" style={ghostButton}>
                Open library
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
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <form action="/" style={{ flex: 1, minWidth: 260, display: "flex", gap: 10 }}>
              {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
              {favoritesOnly && <input type="hidden" name="favorites" value="1" />}
              <input
                name="q"
                defaultValue={query}
                placeholder="Search prompts, notes, or content"
                style={searchInput}
              />
              <button type="submit" style={primaryButton}>
                Search
              </button>
            </form>

            <Link
              href="/"
              style={{
                ...chipLink,
                borderColor: favoritesOnly ? "var(--border-strong)" : "var(--border)",
                background: favoritesOnly ? "var(--accent-soft)" : "var(--bg-elevated)",
                color: favoritesOnly ? "var(--text)" : "var(--text-muted)",
              }}
            >
              All prompts
            </Link>
            <Link
              href="/?favorites=1"
              style={{
                ...chipLink,
                borderColor: favoritesOnly ? "var(--border-strong)" : "var(--border)",
                background: favoritesOnly ? "var(--accent-soft)" : "var(--bg-elevated)",
                color: favoritesOnly ? "var(--text)" : "var(--text-muted)",
              }}
            >
              Favorites only
            </Link>
          </div>
        </header>

        <div style={{ padding: "24px 28px 36px" }}>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <StatCard label="Total prompts" value={totalPrompts} tone="var(--accent)" />
            <StatCard label="Public" value={publicPrompts} tone="var(--accent-blue)" />
            <StatCard label="Favorites" value={favoriteCount} tone="var(--accent-amber)" />
            <StatCard label="Categories" value={categories.length} tone="var(--text-muted)" />
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionHeader
                title="Recent prompts"
                description={favoritesOnly ? "Pinned ideas that matter most right now." : "What you touched most recently."}
              />

              {filteredPrompts.length > 0 ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {filteredPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No prompts yet"
                  description="Create your first prompt or try a different filter."
                  href="/new"
                  cta="Create prompt"
                />
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Panel title="Categories" eyebrow="Organize">
                {categories.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/?category=${category.slug}`}
                        style={{
                          ...chipLink,
                          background: "var(--bg-surface)",
                          color: "var(--text)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Categories appear once you tag prompts.</p>
                )}
              </Panel>

              <Panel title="Quick actions" eyebrow="Workflow">
                <div style={{ display: "grid", gap: 10 }}>
                  <QuickAction href="/new" title="Create prompt" text="Write a reusable prompt with tags and visibility." />
                  <QuickAction href="/library" title="Browse library" text="Search, filter, and manage saved prompts." />
                  <QuickAction href="/explore" title="Open explore" text="Review public prompts shared from the vault." />
                </div>
              </Panel>

              <Panel title="Workspace summary" eyebrow="Status">
                <div style={{ display: "grid", gap: 12 }}>
                  <SummaryRow label="Visible prompts" value={`${publicPrompts}/${totalPrompts || 1}`} />
                  <SummaryRow label="Favorites" value={String(favoriteCount)} />
                  <SummaryRow label="Categories" value={String(categories.length)} />
                </div>
              </Panel>
            </div>
          </section>
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
  const date = new Date(prompt.updatedAt).toLocaleDateString("pt-BR", {
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
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
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

      <PromptContent content={prompt.content} maxHeight={124} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        <ModelBadge model={prompt.model} />
        {prompt.tags.map(({ tag }) => (
          <span
            key={tag.id}
            style={{
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 8,
              background: "var(--bg-surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              fontWeight: 700,
            }}
          >
            #{tag.name}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
        }}
      >
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
            <button
              style={{
                ...ghostButton,
                color: "#d06262",
                borderColor: "rgba(208, 98, 98, 0.32)",
              }}
            >
              Delete
            </button>
          </form>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{date}</span>
      </div>
    </article>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 18,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 8, marginBottom: 14 }}>{title}</h2>
      {children}
    </section>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
        Library
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginTop: 6 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{description}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <strong style={{ fontSize: 13, color: "var(--text)" }}>{value}</strong>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
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
      <p style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
        <strong style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {value}
        </strong>
        <span
          style={{
            height: 24,
            padding: "0 8px",
            borderRadius: 8,
            background: `${tone}20`,
            color: tone,
            display: "inline-flex",
            alignItems: "center",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          Live
        </span>
      </div>
    </article>
  );
}

function QuickAction({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 14,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
        textDecoration: "none",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{title}</p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{text}</p>
    </Link>
  );
}

function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px dashed var(--border-strong)",
        background: "var(--bg-elevated)",
        padding: 28,
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.6 }}>{description}</p>
      <Link href={href} style={{ ...primaryButton, display: "inline-flex", marginTop: 18 }}>
        {cta}
      </Link>
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: "PRIVATE" | "PUBLIC" | "UNLISTED" }) {
  const map = {
    PRIVATE: { label: "Private", bg: "var(--bg-surface)", color: "var(--text-muted)" },
    PUBLIC: { label: "Public", bg: "var(--accent-soft)", color: "var(--accent)" },
    UNLISTED: { label: "Unlisted", bg: "var(--accent-amber-soft)", color: "var(--accent-amber)" },
  } as const;
  const badge = map[visibility];

  return (
    <span style={{ ...badgeStyle, background: badge.bg, color: badge.color }}>
      {badge.label}
    </span>
  );
}

function Badge({ label, tone, color }: { label: string; tone: string; color: string }) {
  return (
    <span style={{ ...badgeStyle, background: tone, color }}>
      {label}
    </span>
  );
}

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
