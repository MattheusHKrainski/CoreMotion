import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import Avatar from "@/components/Avatar";
import {
  adminBanUserAction,
  adminUnbanUserAction,
  adminDeleteUserAction,
  adminVerifyUserAction,
} from "@/app/actions";
import { IconVerified } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const list = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Usuários</h1>
        <p className="text-sm text-slate-500">
          {list.length} contas · banir, verificar ou excluir contas abusivas
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Usuário</th>
                <th className="px-4 py-3 font-bold">Papel</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Denúncias</th>
                <th className="px-4 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((u) => (
                <tr key={u.id} className={u.banned ? "bg-red-50/40" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.avatar} name={u.name} size={36} />
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1">
                          {u.name}
                          {u.verified && (
                            <IconVerified
                              width={13}
                              height={13}
                              className="text-blue-500"
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {u.email} · @{u.handle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "coach"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <div>
                        <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Banido
                        </span>
                        {u.banReason && (
                          <div className="text-[10px] text-red-600 mt-1 max-w-[160px]">
                            {u.banReason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {u.reportCount > 0 ? (
                      <span className="text-red-600">{u.reportCount}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="text-[11px] text-slate-400">
                        Protegido
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <form action={adminVerifyUserAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button className="text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                            {u.verified ? "Remover ✓" : "Verificar"}
                          </button>
                        </form>
                        {u.banned ? (
                          <form action={adminUnbanUserAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white">
                              Desbanir
                            </button>
                          </form>
                        ) : (
                          <form action={adminBanUserAction} className="flex gap-1">
                            <input type="hidden" name="userId" value={u.id} />
                            <input
                              name="reason"
                              placeholder="Motivo"
                              required
                              className="w-28 text-[10px] border border-slate-200 rounded-md px-2 py-1"
                            />
                            <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500 text-white">
                              Banir
                            </button>
                          </form>
                        )}
                        {u.email !== "demo@sporthub.com" && (
                          <form action={adminDeleteUserAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white">
                              Excluir
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
