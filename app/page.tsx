import Image from "next/image";
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

export const dynamic = "force-dynamic";

const visibilityLabels = {
  PRIVATE: "Private",
  PUBLIC: "Public",
  UNLISTED: "Unlisted",
};

const visibilityStyles = {
  PRIVATE: "border-stone-200 bg-stone-100 text-stone-700",
  PUBLIC: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UNLISTED: "border-amber-200 bg-amber-50 text-amber-700",
};

type HomeProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const promptWhere = {
    userId: user.id,
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              description: {
                contains: query,
              },
            },
            {
              content: {
                contains: query,
              },
            },
          ],
        }
      : {}),
  };

  const [prompts, categories, stats] = await Promise.all([
    prisma.prompt.findMany({
      where: promptWhere,
      orderBy: [
        {
          isFavorite: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
          take: 6,
        },
      },
    }),
    prisma.category.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.prompt.groupBy({
      by: ["visibility"],
      where: {
        userId: user.id,
      },
      _count: true,
    }),
  ]);

  const totalPrompts = stats.reduce((sum, stat) => sum + stat._count, 0);
  const publicPrompts = stats.find((stat) => stat.visibility === "PUBLIC")?._count ?? 0;
  const favoritePrompts = prompts.filter((prompt) => prompt.isFavorite).length;

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#1c1b1f]">
      <div className="grid min-h-screen lg:grid-cols-[88px_1fr]">
        <aside className="hidden border-r border-[#dfe2da] bg-white/90 px-4 py-6 lg:flex lg:flex-col lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-8">
            <div className="grid size-12 place-items-center rounded-[8px] bg-[#006d5b] shadow-sm">
              <Image src="/globe.svg" alt="PromptVault" width={24} height={24} />
            </div>
            <nav className="flex flex-col gap-3" aria-label="Primary">
              <a className="grid size-12 place-items-center rounded-[8px] bg-[#d7f4eb] text-lg font-semibold text-[#004b3f]">
                P
              </a>
              <a className="grid size-12 place-items-center rounded-[8px] text-lg text-[#5f625c] transition hover:bg-[#eef1ea]">
                C
              </a>
              <a className="grid size-12 place-items-center rounded-[8px] text-lg text-[#5f625c] transition hover:bg-[#eef1ea]">
                S
              </a>
            </nav>
          </div>
          <div className="grid size-12 place-items-center rounded-[8px] bg-[#f1f4ed] text-sm font-bold text-[#3d423a]">
            {initials(user.name ?? user.email ?? "PV")}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#dfe2da] bg-[#f7f8f5]/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006d5b]">
                  {user.name ?? user.email}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#171a16]">
                  PromptVault
                </h1>
              </div>
              <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                <form action="/" className="flex min-w-0 flex-1 gap-2">
                  <label className="sr-only" htmlFor="search">
                    Search prompts
                  </label>
                  <input
                    id="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search title, content, or notes"
                    className="h-12 min-w-0 flex-1 rounded-[8px] border border-[#cfd4ca] bg-white px-4 text-sm outline-none transition focus:border-[#006d5b] focus:ring-4 focus:ring-[#006d5b]/10"
                  />
                  <button className="h-12 rounded-[8px] bg-[#006d5b] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005143]">
                    Search
                  </button>
                </form>
                <Link
                  href="/api/auth/signout"
                  className="flex h-12 items-center justify-center rounded-[8px] border border-[#cfd4ca] bg-white px-4 text-sm font-semibold text-[#3d423a] transition hover:border-[#006d5b]"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-w-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Metric label="Total prompts" value={totalPrompts} tone="green" />
                <Metric label="Shared prompts" value={publicPrompts} tone="rose" />
                <Metric label="Favorites here" value={favoritePrompts} tone="amber" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Library
                  </h2>
                  <p className="text-sm text-[#686d64]">
                    Your best instructions, ready to reuse.
                  </p>
                </div>
                {query ? (
                  <Link
                    href="/"
                    className="w-fit rounded-[8px] border border-[#cfd4ca] bg-white px-4 py-2 text-sm font-semibold text-[#3d423a] transition hover:border-[#006d5b]"
                  >
                    Clear search
                  </Link>
                ) : null}
              </div>

              <div className="grid gap-4">
                {prompts.length > 0 ? (
                  prompts.map((prompt) => (
                    <article
                      key={prompt.id}
                      className="rounded-[8px] border border-[#dfe2da] bg-white p-5 shadow-[0_1px_2px_rgba(28,27,31,0.08)]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-[8px] border px-2.5 py-1 text-xs font-semibold ${visibilityStyles[prompt.visibility]}`}
                            >
                              {visibilityLabels[prompt.visibility]}
                            </span>
                            {prompt.category ? (
                              <span className="rounded-[8px] bg-[#eef1ea] px-2.5 py-1 text-xs font-semibold text-[#4f554c]">
                                {prompt.category.name}
                              </span>
                            ) : null}
                            {prompt.isFavorite ? (
                              <span className="rounded-[8px] bg-[#fff1bf] px-2.5 py-1 text-xs font-semibold text-[#6b5200]">
                                Favorite
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold tracking-tight">
                              {prompt.title}
                            </h3>
                            {prompt.description ? (
                              <p className="mt-1 text-sm leading-6 text-[#686d64]">
                                {prompt.description}
                              </p>
                            ) : null}
                          </div>
                          <pre className="max-h-36 overflow-hidden whitespace-pre-wrap rounded-[8px] border border-[#ecefe8] bg-[#fbfcf8] p-4 font-mono text-sm leading-6 text-[#30342d]">
                            {prompt.content}
                          </pre>
                          <div className="flex flex-wrap gap-2">
                            {prompt.tags.map(({ tag }) => (
                              <span
                                key={tag.id}
                                className="rounded-[8px] bg-[#eaf4f1] px-2.5 py-1 text-xs font-semibold text-[#006d5b]"
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                          {prompt.visibility !== "PRIVATE" ? (
                            <Link
                              href={`/p/${prompt.slug}`}
                              className="rounded-[8px] border border-[#cfd4ca] px-3 py-2 text-sm font-semibold text-[#3d423a] transition hover:border-[#006d5b]"
                            >
                              Open
                            </Link>
                          ) : null}
                          <form action={toggleFavorite}>
                            <input type="hidden" name="id" value={prompt.id} />
                            <input
                              type="hidden"
                              name="isFavorite"
                              value={String(prompt.isFavorite)}
                            />
                            <button className="rounded-[8px] border border-[#cfd4ca] px-3 py-2 text-sm font-semibold text-[#3d423a] transition hover:border-[#006d5b]">
                              {prompt.isFavorite ? "Unpin" : "Pin"}
                            </button>
                          </form>
                          <form action={setVisibility}>
                            <input type="hidden" name="id" value={prompt.id} />
                            <input
                              type="hidden"
                              name="visibility"
                              value={prompt.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE"}
                            />
                            <button className="rounded-[8px] border border-[#cfd4ca] px-3 py-2 text-sm font-semibold text-[#3d423a] transition hover:border-[#006d5b]">
                              {prompt.visibility === "PRIVATE" ? "Share" : "Hide"}
                            </button>
                          </form>
                          <form action={deletePrompt}>
                            <input type="hidden" name="id" value={prompt.id} />
                            <button className="rounded-[8px] border border-[#f0c8c8] px-3 py-2 text-sm font-semibold text-[#9a3412] transition hover:bg-[#fff3ef]">
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[8px] border border-dashed border-[#c7cdc2] bg-white p-8 text-center">
                    <h3 className="text-xl font-semibold">No prompts yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#686d64]">
                      Save your first reusable prompt and this library starts doing the heavy lifting.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-[8px] border border-[#dfe2da] bg-white p-5 shadow-[0_1px_2px_rgba(28,27,31,0.08)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-[8px] bg-[#d7f4eb] text-lg font-bold text-[#005143]">
                    +
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">New prompt</h2>
                    <p className="text-sm text-[#686d64]">Store the version that works.</p>
                  </div>
                </div>
                <form action={createPrompt} className="space-y-4">
                  <Field label="Title" name="title" placeholder="Cold email critique" />
                  <Field
                    label="Short note"
                    name="description"
                    placeholder="Reviews outbound copy with sharper angles"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#30342d]" htmlFor="content">
                      Prompt
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      required
                      rows={7}
                      placeholder="Paste the prompt you want to reuse..."
                      className="w-full resize-y rounded-[8px] border border-[#cfd4ca] bg-[#fbfcf8] px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#006d5b] focus:ring-4 focus:ring-[#006d5b]/10"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <Field
                      label="Category"
                      name="category"
                      placeholder={categories[0]?.name ?? "Marketing"}
                    />
                    <Field label="Tags" name="tags" placeholder="email, gpt, sales" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#30342d]" htmlFor="visibility">
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      className="h-11 w-full rounded-[8px] border border-[#cfd4ca] bg-white px-3 text-sm outline-none transition focus:border-[#006d5b] focus:ring-4 focus:ring-[#006d5b]/10"
                      defaultValue="PRIVATE"
                    >
                      <option value="PRIVATE">Private</option>
                      <option value="PUBLIC">Public</option>
                      <option value="UNLISTED">Unlisted</option>
                    </select>
                  </div>
                  <button className="h-12 w-full rounded-[8px] bg-[#006d5b] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005143]">
                    Save prompt
                  </button>
                </form>
              </section>

              <section className="rounded-[8px] border border-[#dfe2da] bg-white p-5">
                <h2 className="text-lg font-semibold">Categories</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-[8px] bg-[#eef1ea] px-3 py-2 text-sm font-semibold text-[#4f554c]"
                      >
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[#686d64]">
                      Categories appear here as you save prompts.
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function initials(value: string) {
  return value
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "rose" | "amber";
}) {
  const tones = {
    green: "bg-[#d7f4eb] text-[#005143]",
    rose: "bg-[#ffe1df] text-[#8b1a10]",
    amber: "bg-[#fff1bf] text-[#6b5200]",
  };

  return (
    <div className="rounded-[8px] border border-[#dfe2da] bg-white p-5">
      <p className="text-sm font-semibold text-[#686d64]">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <strong className="text-4xl font-semibold tracking-tight">{value}</strong>
        <span className={`rounded-[8px] px-3 py-1 text-xs font-bold ${tones[tone]}`}>
          Live
        </span>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#30342d]" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required={name === "title"}
        className="h-11 w-full rounded-[8px] border border-[#cfd4ca] bg-white px-3 text-sm outline-none transition focus:border-[#006d5b] focus:ring-4 focus:ring-[#006d5b]/10"
      />
    </div>
  );
}
