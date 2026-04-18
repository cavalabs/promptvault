"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/app/actions";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/signin?registered=1");
    }
  }

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
            </div>
            <div className="grid gap-3 text-sm text-[#d7f4eb] sm:grid-cols-3">
              <span className="rounded-[8px] bg-white/10 p-3">Private by default</span>
              <span className="rounded-[8px] bg-white/10 p-3">Fast search</span>
              <span className="rounded-[8px] bg-white/10 p-3">Public links</span>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006d5b]">
              Criar conta
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Crie seu vault
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
              <input
                name="name"
                type="text"
                placeholder="Nome (opcional)"
                className="h-12 rounded-[8px] border border-[#cfd4ca] px-4 text-sm outline-none focus:border-[#006d5b]"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="h-12 rounded-[8px] border border-[#cfd4ca] px-4 text-sm outline-none focus:border-[#006d5b]"
              />
              <input
                name="password"
                type="password"
                placeholder="Senha (mínimo 6 caracteres)"
                required
                className="h-12 rounded-[8px] border border-[#cfd4ca] px-4 text-sm outline-none focus:border-[#006d5b]"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center rounded-[8px] bg-[#006d5b] px-4 text-sm font-semibold text-white transition hover:bg-[#005a4a] disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[#686d64]">
              Já tem conta?{" "}
              <Link href="/signin" className="font-semibold text-[#006d5b] hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
