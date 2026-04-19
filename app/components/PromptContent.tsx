"use client";

// Highlights {{variable}} syntax in prompt content
export function PromptContent({ content, maxHeight = 120 }: { content: string; maxHeight?: number }) {
  const parts = content.split(/(\{\{[^}]+\}\})/g);

  return (
    <pre style={{
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 12px",
      fontSize: 12, fontFamily: "var(--font-mono)",
      lineHeight: 1.7, whiteSpace: "pre-wrap",
      overflow: "hidden", maxHeight,
      wordBreak: "break-word", margin: 0,
      color: "var(--text-muted)",
    }}>
      {parts.map((part, i) =>
        /^\{\{[^}]+\}\}$/.test(part) ? (
          <span key={i} style={{ color: "var(--accent)", fontWeight: 600 }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </pre>
  );
}
