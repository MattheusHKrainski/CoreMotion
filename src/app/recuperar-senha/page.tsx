import RecoverForm from "./RecoverForm";

export const dynamic = "force-dynamic";

export default function RecuperarSenhaPage() {
  return (
    <div className="max-w-md mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-black tracking-tight">Recuperar senha</h1>
      <p className="text-slate-500 text-sm mt-1">Informe seu e-mail para receber o link de redefinição.</p>
      <RecoverForm />
    </div>
  );
}
