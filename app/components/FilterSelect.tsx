"use client";

import { useRouter } from "next/navigation";

export function FilterSelect({
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
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value;
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (favoritesOnly) params.set("favorites", "1");
    if (nextValue) params.set(param, nextValue);

    const search = params.toString();
    router.replace(search ? `/library?${search}` : "/library");
  }

  return (
    <select name={param} defaultValue={value} onChange={handleChange} style={selectStyle}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

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
