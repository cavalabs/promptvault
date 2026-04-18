import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PublicPromptProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicPrompt({ params }: PublicPromptProps) {
  const { slug } = await params;
  const prompt = await prisma.prompt.findFirst({
    where: {
      slug,
      visibility: {
        not: "PRIVATE",
      },
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      user: true,
    },
  });

  if (!prompt) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-6 text-[#1c1b1f] md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-[#005143]">
            <span className="grid size-10 place-items-center rounded-[8px] bg-[#d7f4eb]">
              <Image src="/globe.svg" alt="PromptVault" width={20} height={20} />
            </span>
            PromptVault
          </Link>
          <span className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Shared
          </span>
        </header>

        <article className="rounded-[8px] border border-[#dfe2da] bg-white p-6 shadow-[0_1px_2px_rgba(28,27,31,0.08)] md:p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006d5b]">
              {prompt.category?.name ?? "Prompt"}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {prompt.title}
            </h1>
            {prompt.description ? (
              <p className="max-w-2xl text-base leading-7 text-[#686d64]">
                {prompt.description}
              </p>
            ) : null}
          </div>

          <pre className="mt-8 whitespace-pre-wrap rounded-[8px] border border-[#ecefe8] bg-[#fbfcf8] p-5 font-mono text-sm leading-7 text-[#30342d]">
            {prompt.content}
          </pre>

          <footer className="mt-6 flex flex-col gap-4 border-t border-[#ecefe8] pt-5 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="text-sm text-[#686d64]">
              Shared by {prompt.user.name ?? "CavaLabs"}
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
