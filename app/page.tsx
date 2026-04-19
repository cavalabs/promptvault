import Link from "next/link";
import {
  createPrompt,
  deletePrompt,
  setVisibility,
  toggleFavorite,
} from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const { q, category: categoryFilter } = await searchParams;
  const query = q?.trim() ?? "";

  const promptWhere = {
    userId: user.id,
    ...(categoryFilter ? { category: { slug: categoryFilter } } : {}),
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

  const [prompts, categories, stats] = await Promise.all([
    prisma.prompt.findMany({
      where: promptWhere,
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        tags: { include: { tag: true }, take: 5 },
      },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.prompt.groupBy({
      by: ["visibility"],
      where: { userId: user.id },
      _count: true,
    }),
  ]);

  const totalPrompts = stats.reduce((sum, s) => sum + s._count, 0);
  const publicPrompts = stats.find((s) => s.visibility === "PUBLIC")?._count ?? 0;
  const favoritePrompts = prompts.filter((p) => p.isFavorite).length;

  const displayName = user.name ?? user.email ?? "User";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: "white", fontFamily: "monospace",
          }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            Prompt<span style={{ color: "var(--accent)" }}>Vault</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <NavItem href="/" icon="◈" label="Prompts" active={!categoryFilter} />
          <NavItem href="/?favorites=1" icon="★" label="Favorites" />
          <NavItem href="/explore" icon="◎" label="Explore" />
          <div style={{ marginTop: 16, marginBottom: 8, paddingLeft: 8, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Categories
          </div>
          {categories.map((cat) => (
            <NavItem
              key={cat.id}
              href={`/?category=${cat.slug}`}
              icon="▸"
              label={cat.name}
              active={categoryFilter === cat.slug}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavItem href="/settings" icon="⚙" label="Settings" />
          <Link href="/api/auth/signout" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            borderRadius: 8, fontSize: 13, color: "var(--text-muted)",
            textDecoration: "none",
          }}>
            <span style={{ width: 18, textAlign: "center" }}>↩</span>
            Sign out
          </Link>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 8,
            background: "var(--accent-muted)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white",
              flexShrink: 0,
            }}>
              {initials(displayName)}
            </div>
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "var(--bg)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {displayName}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              PromptVault
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, maxWidth: 540, marginLeft: 32 }}>
            <form action="/" style={{ flex: 1, display: "flex", gap: 8 }}>
              {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
              <input
                name="q"
                defaultValue={query}
                placeholder="Search title, content, or notes"
                style={{
                  flex: 1, height: 38, padding: "0 14px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--input-bg)",
                  color: "var(--text)", fontSize: 13, outline: "none",
                }}
              />
              <button type="submit" style={{
                height: 38, padding: "0 16px", borderRadius: 8,
                background: "var(--accent)", color: "white",
                border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Search
              </button>
            </form>
            {query && (
              <Link href="/" style={{
                height: 38, padding: "0 14px", borderRadius: 8,
                border: "1px solid var(--border)", color: "var(--text-muted)",
                fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none",
              }}>
                Clear
              </Link>
            )}
          </div>
        </header>

        <div style={{ padding: "24px 28px", flex: 1 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            <StatCard label="Total prompts" value={totalPrompts} color="var(--accent)" />
            <StatCard label="Shared prompts" value={publicPrompts} color="#10a37f" />
            <StatCard label="Favorites" value={favoritePrompts} color="#c8956c" />
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Library</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                {categoryFilter ? `Filtered by category` : "Your best instructions, ready to reuse."}
              </p>
            </div>
            <NewPromptButton categories={categories} />
          </div>

          {/* Grid */}
          {prompts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {prompts.map((prompt) => (
                <article key={prompt.id} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <VisibilityBadge v={prompt.visibility} />
                      {prompt.isFavorite && <Badge text="★ Favorite" color="var(--tag-amber)" textColor="var(--tag-amber-text)" />}
                      {prompt.category && <Badge text={prompt.category.name} color="var(--accent-muted)" textColor="var(--accent)" />}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                      {prompt.title}
                    </h3>
                    {prompt.description && (
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                        {prompt.description}
                      </p>
                    )}
                  </div>

                  {/* Content preview */}
                  <pre style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    maxHeight: 96,
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                  } as React.CSSProperties}>
                    {prompt.content}
                  </pre>

                  {/* Tags */}
                  {prompt.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {prompt.tags.map(({ tag }) => (
                        <span key={tag.id} style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 6,
                          background: "var(--accent-muted)", color: "var(--accent)",
                          fontWeight: 600,
                        }}>
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginTop: "auto", flexWrap: "wrap" }}>
                    {prompt.visibility !== "PRIVATE" && (
                      <Link href={`/p/${prompt.slug}`} style={actionBtnStyle}>
                        Open
                      </Link>
                    )}
                    <form action={toggleFavorite}>
                      <input type="hidden" name="id" value={prompt.id} />
                      <input type="hidden" name="isFavorite" value={String(prompt.isFavorite)} />
                      <button style={actionBtnStyle}>{prompt.isFavorite ? "Unpin" : "Pin"}</button>
                    </form>
                    <form action={setVisibility}>
                      <input type="hidden" name="id" value={prompt.id} />
                      <input type="hidden" name="visibility" value={prompt.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE"} />
                      <button style={actionBtnStyle}>{prompt.visibility === "PRIVATE" ? "Share" : "Hide"}</button>
                    </form>
                    <form action={deletePrompt}>
                      <input type="hidden" name="id" value={prompt.id} />
                      <button style={{ ...actionBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{
              border: "1px dashed var(--border)", borderRadius: 10,
              padding: 48, textAlign: "center",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No prompts yet</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14 }}>
                {query ? `No results for "${query}".` : "Save your first reusable prompt above."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* New Prompt Panel */}
      <aside style={{
        width: 300,
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        borderLeft: "1px solid var(--border)",
        padding: "24px 16px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>New prompt</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Store the version that works.</p>
        </div>
        <form action={createPrompt} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Title" name="title" placeholder="Cold email critique" required />
          <FormField label="Short note" name="description" placeholder="What this prompt does" />
          <div>
            <label style={labelStyle}>Prompt</label>
            <textarea
              name="content"
              required
              rows={7}
              placeholder="Paste the prompt you want to reuse..."
              style={{ ...inputStyle, resize: "vertical", padding: "10px 12px", lineHeight: 1.6 }}
            />
          </div>
          <FormField label="Category" name="category" placeholder={categories[0]?.name ?? "Marketing"} />
          <FormField label="Tags" name="tags" placeholder="email, gpt, sales" />
          <div>
            <label style={labelStyle}>Visibility</label>
            <select name="visibility" defaultValue="PRIVATE" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </div>
          <button type="submit" style={{
            height: 42, width: "100%", borderRadius: 8,
            background: "var(--accent)", color: "white",
            border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            Save prompt
          </button>
        </form>

        {categories.length > 0 && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Categories
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/?category=${cat.slug}`} style={{
                  fontSize: 12, padding: "4px 10px", borderRadius: 6,
                  background: "var(--accent-muted)", color: "var(--accent)",
                  fontWeight: 600, textDecoration: "none",
                }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  fontSize: 12, padding: "5px 10px", borderRadius: 6,
  border: "1px solid var(--border)", background: "transparent",
  color: "var(--text-muted)", cursor: "pointer", fontWeight: 600,
  textDecoration: "none", display: "inline-flex", alignItems: "center",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 38, padding: "0 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--input-bg)",
  color: "var(--text)", fontSize: 13, outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
};

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px", borderRadius: 8,
      background: active ? "var(--accent-muted)" : "transparent",
      color: active ? "var(--accent)" : "var(--text-muted)",
      textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 400,
      transition: "all 0.15s",
    }}>
      <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "16px 20px",
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10 }}>
        <strong style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          {value}
        </strong>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
          background: color + "20", color,
        }}>
          Live
        </span>
      </div>
    </div>
  );
}

function VisibilityBadge({ v }: { v: "PRIVATE" | "PUBLIC" | "UNLISTED" }) {
  const map = {
    PRIVATE: { label: "Private", color: "var(--text-faint)", text: "var(--text-muted)" },
    PUBLIC: { label: "Public", color: "var(--tag-green)", text: "var(--tag-green-text)" },
    UNLISTED: { label: "Unlisted", color: "var(--tag-amber)", text: "var(--tag-amber-text)" },
  };
  const { label, color, text } = map[v];
  return <Badge text={label} color={color} textColor={text} />;
}

function Badge({ text, color, textColor }: { text: string; color: string; textColor: string }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 8px", borderRadius: 6,
      background: color, color: textColor, fontWeight: 600,
    }}>
      {text}
    </span>
  );
}

function FormField({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
      />
    </div>
  );
}

function NewPromptButton({ categories }: { categories: { name: string }[] }) {
  return null;
}

function initials(value: string) {
  return value
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");
}
