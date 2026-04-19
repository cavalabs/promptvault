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
    const t = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
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
      {/* Header */}
      <header style={{
        padding: "14px 28px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-sidebar)", position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/library" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
            ← Back
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>New Prompt</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/library" style={{
            padding: "8px 18px", borderRadius: 8,
            border: "1px solid var(--border)", color: "var(--text)",
            fontWeight: 600, fontSize: 13, textDecoration: "none",
            display: "flex", alignItems: "center",
          }}>
            Cancel
          </Link>
          <button
            form="prompt-form"
            type="submit"
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: "var(--accent)", color: "white",
              fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
            }}
          >
            Create Prompt
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
        {/* Main editor */}
        <form
          id="prompt-form"
          action={createPrompt}
          style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}
        >
          {/* Hidden tags */}
          <input type="hidden" name="tags" value={tags.join(",")} />

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Code Review Assistant"
              style={{
                ...inputStyle,
                height: 48, fontSize: 16, fontWeight: 500,
                borderColor: "var(--accent)",
              }}
            />
          </div>

          {/* Editor / Preview tabs */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 0 }}>
                {(["editor", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    style={{
                      padding: "6px 16px", fontSize: 13, fontWeight: 600,
                      background: "none", border: "none", cursor: "pointer",
                      color: tab === t ? "var(--accent)" : "var(--text-muted)",
                      borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                      textTransform: "capitalize",
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Use <code style={{ color: "var(--accent)", background: "var(--accent-muted)", padding: "1px 5px", borderRadius: 4 }}>{"{{variable}}"}</code> for dynamic values
              </span>
            </div>

            {tab === "editor" ? (
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={14}
                placeholder={"You are a helpful assistant.\n\nTask: {{task}}\n\nContext: {{context}}"}
                style={{
                  ...inputStyle, height: "auto", resize: "vertical",
                  padding: "14px 16px", lineHeight: 1.7,
                  fontFamily: "var(--font-mono)", fontSize: 13,
                }}
              />
            ) : (
              <div style={{
                background: "var(--input-bg)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "14px 16px", minHeight: 260,
              }}>
                {content ? (
                  <PromptContent content={content} maxHeight={400} />
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
                    Nothing to preview yet. Write your prompt in the Editor tab.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Tips for using this prompt effectively..."
              style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </form>

        {/* Metadata sidebar */}
        <aside style={{
          width: 260, borderLeft: "1px solid var(--border)",
          background: "var(--bg-sidebar)", padding: "28px 20px",
          display: "flex", flexDirection: "column", gap: 24, overflowY: "auto",
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Metadata</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Organize your prompt</p>
          </div>

          <MetaField label="Model">
            <select name="model" form="prompt-form" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Select model</option>
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </MetaField>

          <MetaField label="Category">
            <input
              name="category"
              form="prompt-form"
              placeholder="e.g. Marketing"
              style={inputStyle}
            />
          </MetaField>

          <MetaField label="Visibility">
            <select name="visibility" form="prompt-form" defaultValue="PRIVATE" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </MetaField>

          <MetaField label="Tags">
            <div style={{
              border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--input-bg)", padding: "8px 10px",
              display: "flex", flexWrap: "wrap", gap: 6,
              minHeight: 42,
            }}>
              {tags.map((t) => (
                <span key={t} style={{
                  fontSize: 12, padding: "3px 8px", borderRadius: 6,
                  background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 14, lineHeight: 1, padding: 0 }}
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
                style={{
                  border: "none", outline: "none", background: "none",
                  color: "var(--text)", fontSize: 13, flex: 1, minWidth: 80,
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Press Enter or comma to add
            </p>
          </MetaField>
        </aside>
      </div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.1em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 38, padding: "0 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--input-bg)",
  color: "var(--text)", fontSize: 13, outline: "none",
};
