import Link from "next/link";
import LoginForm from "./LoginForm";
import { IconLogo } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Red */}
      <div className="hidden lg:flex lg:w-1/2 gradient-red items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full mb-8">
            <IconLogo width={20} height={20} className="text-white" />
            <span className="text-sm font-semibold">CoreMotion</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Sua performance
            <br />
            em movimento.
          </h1>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            Entre para acessar sua conta e continuar sua experiência no marketplace esportivo.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-600 grid place-items-center text-white">
                <IconLogo width={20} height={20} />
              </div>
              <span className="font-black text-lg text-gray-900">CoreMotion</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Entre na sua conta
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Continue sua experiência esportiva.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <LoginForm />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Ao entrar, você concorda com nossos{" "}
              <Link href="/termos" className="font-bold text-red-600 hover:underline">
                Termos
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="font-bold text-red-600 hover:underline">
                Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
