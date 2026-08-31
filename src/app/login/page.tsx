import Link from "next/link";
import LoginForm from "./LoginForm";
import { IconLogo } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-racing-green grid place-items-center text-white">
            <IconLogo width={20} height={20} />
          </div>
          <span className="font-black text-lg text-gray-900">CoreMotion</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Decorative element */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-racing-green text-white mb-4">
              <IconLogo width={32} height={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Entre na sua conta
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Continue sua experiência esportiva.
            </p>
          </div>

          {/* Login form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-premium-lg">
            <LoginForm />
          </div>

          {/* Footer links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Ao entrar, você concorda com nossos{" "}
              <Link href="/termos" className="font-bold text-racing-green hover:underline">
                Termos
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="font-bold text-racing-green hover:underline">
                Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Subtle background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-racing-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-racing-green/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
