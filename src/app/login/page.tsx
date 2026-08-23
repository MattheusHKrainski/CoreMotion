import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeed();
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-to-br from-red-600 to-red-800 text-white p-12 items-center">
        <svg
          className="absolute right-0 bottom-0 w-full h-2/3 opacity-15"
          viewBox="0 0 400 200"
          fill="none"
        >
          <path
            d="M0 180 L60 140 L120 155 L180 90 L240 110 L300 40 L400 60"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative">
          <h2 className="text-5xl font-black leading-tight tracking-tight">
            Sua performance
            <br /> em movimento.
          </h2>
          <p className="mt-4 text-white/85 text-lg max-w-sm">
            Loja com as maiores marcas, comunidade de atletas, treinadores
            certificados e o SmartScan AI.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Catálogo oficial Nike, Adidas, Asics, Puma e mais",
              "Escaneie qualquer produto com a câmera do celular",
              "Contrate treinadores e agende sessões",
              "Notícias do esporte atualizadas todo dia",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black tracking-tight">Entrar</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo de volta. Continue de onde parou.
          </p>

          <LoginForm />

          <p className="mt-6 text-sm text-slate-600 text-center">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="text-red-600 font-bold">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
