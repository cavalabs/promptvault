import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const providers = [
  {
    id: "github",
    name: "GitHub",
    enabled: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  },
  {
    id: "google",
    name: "Google",
    enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
];

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const enabledProviders = providers.filter((provider) => provider.enabled);

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 text-[#1c1b1f]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[8px] border border-[#dfe2da] bg-white shadow-[0_16px_50px_rgba(28,27,31,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[560px] flex-col justify-between bg-[#006d5b] p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-[8px] bg-white/15">
                <Image src="/globe.svg" alt="PromptVault" width={24} height={24} />
              </span>
              <span className="text-lg font-semibold">PromptVault</span>
            </div>
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bcefe0]">
                Private prompt library
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
                Your prompts, organized around your workflow.
              </h1>
              <p className="mt-5 text-base leading-7 text-[#d7f4eb]">
                Save reusable prompts, group them by category, tag the useful ones, and share only what you choose.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-[#d7f4eb] sm:grid-cols-3">
              <span className="rounded-[8px] bg-white/10 p-3">Private by default</span>
              <span className="rounded-[8px] bg-white/10 p-3">Fast search</span>
              <span className="rounded-[8px] bg-white/10 p-3">Public links</span>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006d5b]">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Continue to your vault
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#686d64]">
              Use GitHub or Google. New accounts are created automatically on first sign in.
            </p>

            <div className="mt-8 grid gap-3">
              {enabledProviders.length > 0 ? (
                enabledProviders.map((provider) => (
                  <Link
                    key={provider.id}
                    href={`/api/auth/signin/${provider.id}`}
                    className="flex h-12 items-center justify-center rounded-[8px] border border-[#cfd4ca] bg-white px-4 text-sm font-semibold text-[#30342d] transition hover:border-[#006d5b] hover:bg-[#f7fbf8]"
                  >
                    Continue with {provider.name}
                  </Link>
                ))
              ) : (
                <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  OAuth credentials are not configured yet. Add GitHub or Google client credentials to enable sign in.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
