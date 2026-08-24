import { checkSupabaseConnection, supabase } from "@/lib/supabase";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage() {
  const supaStatus = await checkSupabaseConnection();
  let dbOk = false;
  let dbType = "Desconhecido";
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
    dbType = process.env.DATABASE_URL?.includes("supabase.co") ? "Supabase Postgres" : "Postgres Local (dev)";
  } catch {}

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://erpwfjdycdlygxwkdakv.supabase.co";
  const hasKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight">Integrações</h1>
      <p className="text-sm text-slate-500">Status do Supabase e GitHub</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dbOk ? "bg-emerald-500" : "bg-red-500"}`} />
            Banco de Dados
          </h2>
          <div className="mt-3 text-sm space-y-1">
            <div><strong>Status:</strong> {dbOk ? "Conectado" : "Desconectado"}</div>
            <div><strong>Tipo:</strong> {dbType}</div>
            <div className="text-xs text-slate-500 break-all">URL: {process.env.DATABASE_URL?.slice(0, 50)}...</div>
          </div>
          {!dbType.includes("Supabase") && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Para usar Supabase Postgres, vá em Supabase → Settings → Database → Connection String (URI) e coloque no .env como DATABASE_URL. Depois rode <code>npx drizzle-kit push --force</code>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${supaStatus.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
            Supabase REST
          </h2>
          <div className="mt-3 text-sm space-y-1">
            <div><strong>URL:</strong> {supabaseUrl}</div>
            <div><strong>Anon Key:</strong> {hasKey ? "Configurada (sb_publishable_...)" : "Não configurada"}</div>
            <div><strong>Conexão:</strong> {supaStatus.ok ? "OK" : supaStatus.error || "Erro"}</div>
            {supaStatus.needsMigration && <div className="text-amber-700 text-xs">Tabelas ainda não existem no Supabase — execute o supabase-setup.sql no SQL Editor</div>}
          </div>
          <Link href="/api/integrations/status" className="mt-3 inline-block text-xs font-bold text-purple-600 hover:underline">
            Ver JSON completo →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:col-span-2">
          <h2 className="font-black">Como criar as tabelas no Supabase</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-700">
            <li>Acesse <a href="https://supabase.com/dashboard/project/erpwfjdycdlygxwkdakv" target="_blank" className="text-purple-600 font-bold">seu projeto Supabase</a></li>
            <li>Vá em <strong>SQL Editor → New Query</strong></li>
            <li>Abra o arquivo <code>supabase-setup.sql</code> na raiz do projeto e copie todo o conteúdo</li>
            <li>Cole no SQL Editor e clique <strong>Run</strong></li>
            <li>Depois, para usar o Postgres do Supabase no app, adicione no .env:<br />
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">DATABASE_URL=postgresql://postgres:[SENHA]@db.erpwfjdycdlygxwkdakv.supabase.co:5432/postgres</code>
            </li>
            <li>Reinicie o app: as lojas e produtos passarão a ser salvos no Supabase</li>
          </ol>
          <div className="mt-4 text-xs text-slate-500">
            Atualmente o app está usando Postgres local (funciona 100%). Quando conectar no Supabase Postgres, todos os dados migrarão para nuvem.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:col-span-2">
          <h2 className="font-black">GitHub</h2>
          <div className="mt-2 text-sm">
            Repositório local já commitado. Para conectar:
            <pre className="mt-2 bg-slate-900 text-white p-3 rounded-xl text-xs overflow-x-auto">
git remote add origin https://github.com/SEU_USUARIO/coremotion.git
git branch -M main
git push -u origin main
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
