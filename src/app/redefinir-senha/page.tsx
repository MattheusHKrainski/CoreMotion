import ResetForm from "./ResetForm";

export const dynamic = "force-dynamic";

export default function RedefinirSenhaPage() {
  return (
    <div className="max-w-md mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-black tracking-tight">Nova senha</h1>
      <p className="text-slate-500 text-sm mt-1">Defina sua nova senha.</p>
      <ResetForm />
    </div>
  );
}
