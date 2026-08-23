import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import {
  IconShield,
  IconUsers,
  IconBag,
  IconNews,
  IconPackage,
  IconHome,
  IconChat,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard", Icon: IconHome },
  { href: "/admin/usuarios", label: "Usuários", Icon: IconUsers },
  { href: "/admin/lojas", label: "Lojas", Icon: IconBag },
  { href: "/admin/produtos", label: "Produtos", Icon: IconBag },
  { href: "/admin/desapego", label: "Desapego", Icon: IconUsers },
  { href: "/admin/pedidos", label: "Pedidos", Icon: IconPackage },
  { href: "/admin/denuncias", label: "Denúncias", Icon: IconShield },
  { href: "/admin/conteudo", label: "Conteúdo", Icon: IconChat },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await ensureSeed();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 grid place-items-center">
              <IconShield width={16} height={16} />
            </div>
            <div>
              <div className="font-black text-sm leading-none">
                SportHub Admin
              </div>
              <div className="text-[10px] text-slate-400">
                logado como {user.name}
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-slate-300 hover:text-white"
          >
            ← Voltar à loja
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Icon width={14} height={14} />
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
