import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await ensureSeed();
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="max-w-md mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-black tracking-tight">Criar conta</h1>
      <p className="text-slate-500 mt-1">
        Leva menos de um minuto. É grátis para sempre.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-slate-600 text-center">
        Já tem conta?{" "}
        <Link href="/login" className="text-red-600 font-bold">
          Entrar
        </Link>
      </p>
    </div>
  );
}
