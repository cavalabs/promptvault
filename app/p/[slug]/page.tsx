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
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-sidebar)",
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
          <span style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: "var(--tag-green)", color: "var(--tag-green-text)",
          }}>
            {prompt.visibility === "PUBLIC" ? "Public" : "Unlisted"}
          </span>
          <Link href="/signin" style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "var(--accent)", color: "white", textDecoration: "none",
          }}>
            Get started free
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {/* Meta */}
        <div style={{ marginBottom: 32 }}>
          {prompt.category && (
            <p style={{
              fontSize: 12, fontWeight: 700, color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
            }}>
              {prompt.category.name}
            </p>
          )}
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {prompt.title}
          </h1>
          {prompt.description && (
            <p style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.7 }}>
              {prompt.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              By <strong style={{ color: "var(--text)" }}>{author}</strong>
            </span>
            {prompt.tags.map(({ tag }) => (
              <span key={tag.id} style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 6,
                background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 600,
              }}>
                #{tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Prompt box */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {/* Box header */}
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--bg-sidebar)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>prompt</span>
            <CopyButton text={prompt.content} />
          </div>

          {/* Content */}
          <pre style={{
            padding: "28px 24px",
            fontFamily: "var(--font-mono)",
            fontSize: 14, lineHeight: 1.8,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}>
            {prompt.content}
          </pre>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 40, padding: 28, borderRadius: 12,
          background: "var(--accent-muted)", border: "1px solid rgba(124,110,245,0.3)",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            Save this prompt to your vault
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
            Create a free account to organize, customize, and share your best prompts.
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", padding: "12px 28px", borderRadius: 9,
            background: "var(--accent)", color: "white", fontWeight: 700,
            fontSize: 15, textDecoration: "none",
          }}>
            Create free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
