"use client";

import Link from "next/link";
import { useState } from "react";
import { createPrompt } from "@/app/actions";
import { PromptContent } from "@/app/components/PromptContent";

const MODELS = ["GPT-4o", "Claude 3.7", "Gemini 1.5 Pro", "GPT-4 Turbo", "Claude 3 Opus", "Gemini Pro"];

export default function NewPromptPage() {
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function addTag(raw: string) {
    const normalized = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput("");
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header style={pageHeader}>
        <div>
          <p style={eyebrow}>Workspace</p>
          <h1 style={heading}>New prompt</h1>
          <p style={subtitle}>Shape a prompt once and reuse it everywhere.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/library" style={ghostButton}>
            Back to library
          </Link>
          <button form="prompt-form" type="submit" style={primaryButton}>
            Save prompt
          </button>
        </div>
      </header>

      <div style={pageGrid}>
        <form id="prompt-form" action={createPrompt} style={editorColumn}>
          <input type="hidden" name="tags" value={tags.join(",")} />

          <section style={panel}>
            <label style={fieldLabelStyle}>Title</label>
            <input name="title" required placeholder="e.g. Code review assistant" style={titleInput} />
          </section>

          <section style={panel}>
            <div style={tabHeader}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["editor", "preview"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    style={tabButton(tab === item)}
                  >
                    {item === "editor" ? "Editor" : "Preview"}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Use <code style={inlineCode}>{"{{variable}}"}</code> for dynamic values
              </span>
            </div>

            {tab === "editor" ? (
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={16}
                placeholder={"You are a helpful assistant.\n\nTask: {{task}}\n\nContext: {{context}}"}
                style={textareaStyle}
              />
            ) : (
              <div style={previewSurface}>
                {content ? (
                  <PromptContent content={content} maxHeight={420} />
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Write something in the editor first.</p>
                )}
              </div>
            )}
          </section>

          <section style={panel}>
            <label style={fieldLabelStyle}>Notes</label>
            <textarea
              name="description"
              rows={3}
              placeholder="What this prompt is for, or when to use it."
              style={textareaStyle}
            />
          </section>
        </form>

        <aside style={sidebar}>
          <section style={panel}>
            <p style={eyebrow}>Metadata</p>
            <h2 style={sectionTitle}>Organize</h2>
            <p style={sectionText}>Add the details that make the prompt easier to find and reuse.</p>
          </section>

          <Field label="Model">
            <select name="model" form="prompt-form" style={selectStyle}>
              <option value="">Select model</option>
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <input name="category" form="prompt-form" placeholder="e.g. Marketing" style={inputStyle} />
          </Field>

          <Field label="Visibility">
            <select name="visibility" form="prompt-form" defaultValue="PRIVATE" style={selectStyle}>
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </Field>

          <Field label="Tags">
            <div style={tagBox}>
              {tags.map((tag) => (
                <span key={tag} style={tagPill}>
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((item) => item !== tag))}
                    style={tagRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={() => tagInput && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Add tag..." : ""}
                style={tagInputStyle}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Press Enter or comma to add</p>
          </Field>
        </aside>
      </div>
    </div>
  );
}

function Field({ label: fieldLabel, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={fieldLabelStyle}>{fieldLabel}</label>
      {children}
    </div>
  );
}

const pageHeader: React.CSSProperties = {
  padding: "20px 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  borderBottom: "1px solid var(--border)",
  background: "color-mix(in srgb, var(--bg) 84%, transparent)",
  position: "sticky",
  top: 0,
  zIndex: 20,
  backdropFilter: "blur(18px)",
};

const pageGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
  gap: 20,
  padding: "24px 28px 36px",
};

const editorColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const sidebar: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const panel: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 18,
  boxShadow: "var(--shadow-soft)",
};

const titleInput: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  fontSize: 15,
  fontWeight: 700,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 240,
  padding: "14px 16px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  resize: "vertical",
  lineHeight: 1.7,
  fontFamily: "var(--font-mono)",
};

const previewSurface: React.CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 14,
  minHeight: 240,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  color: "var(--text)",
  marginTop: 8,
};

const sectionText: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  marginTop: 6,
  lineHeight: 1.6,
};

const tabHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

const tabButton = (active: boolean): React.CSSProperties => ({
  height: 34,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: active ? "var(--accent-soft)" : "var(--bg-elevated)",
  color: active ? "var(--text)" : "var(--text-muted)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
});

const inlineCode: React.CSSProperties = {
  padding: "1px 6px",
  borderRadius: 6,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontSize: 12,
};

const tagBox: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--input-bg)",
  padding: "8px 10px",
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  minHeight: 42,
};

const tagPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 26,
  padding: "0 8px",
  borderRadius: 8,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontSize: 12,
  fontWeight: 800,
};

const tagRemove: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  padding: 0,
  fontSize: 14,
  lineHeight: 1,
};

const tagInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  background: "none",
  color: "var(--text)",
  fontSize: 13,
  flex: 1,
  minWidth: 80,
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

const eyebrow: React.CSSProperties = {
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
