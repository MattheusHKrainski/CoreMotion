"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import {
  IconHome,
  IconChat,
  IconBag,
  IconScan,
  IconWhistle,
  IconTrophy,
  IconLogo,
  IconNews,
  IconUser,
  IconUsers,
  IconLogout,
  IconPackage,
  IconHeart,
  IconCalendar,
  IconSearch,
  IconMenu,
  IconClose,
  IconShield,
} from "@/components/Icons";
async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export type ShellUser = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  role: string;
} | null;

const mainNav = [
  { href: "/", label: "Início", Icon: IconHome },
  { href: "/marketplace", label: "Marketplace", Icon: IconBag },
  { href: "/lojas", label: "Lojas", Icon: IconPackage },
  { href: "/desapego", label: "Desapego", Icon: IconUsers },
  { href: "/noticias", label: "Notícias", Icon: IconNews },
  { href: "/feed", label: "Comunidade", Icon: IconChat },
  { href: "/scanner", label: "SmartScan", Icon: IconScan },
  { href: "/treinadores", label: "Treinadores", Icon: IconWhistle },
  { href: "/atletas", label: "Atletas", Icon: IconTrophy },
];

const accountNav = [
  { href: "/minha-loja", label: "Minha Loja", Icon: IconPackage },
  { href: "/pedidos", label: "Meus pedidos", Icon: IconPackage },
  { href: "/favoritos", label: "Favoritos", Icon: IconHeart },
  { href: "/agendamentos", label: "Agendamentos", Icon: IconCalendar },
  { href: "/perfil", label: "Meu perfil", Icon: IconUser },
];

const adminNav = { href: "/admin", label: "Painel Admin", Icon: IconShield };

const bottomNav = [
  { href: "/", label: "Início", Icon: IconHome },
  { href: "/marketplace", label: "Loja", Icon: IconBag },
  { href: "/desapego", label: "Desapego", Icon: IconUsers },
  { href: "/scanner", label: "Scan", Icon: IconScan, highlight: true },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
];

export default function Shell({
  user,
  cartCount,
  children,
}: {
  user: ShellUser;
  cartCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      {/* ---------------------------- Desktop sidebar --------------------------- */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen overflow-y-auto">
        <div className="px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 grid place-items-center text-white shadow-lg shadow-red-500/30">
              <IconLogo width={22} height={22} />
            </div>
            <div>
              <div className="font-black text-xl tracking-tight leading-none">
                CoreMotion
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                Marketplace esportivo
              </div>
            </div>
          </Link>
        </div>

        <nav className="px-3 space-y-0.5">
          {mainNav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive(href)
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon width={19} height={19} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 mt-5">
          <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Minha conta
          </div>
          <nav className="space-y-0.5">
            {accountNav.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(href)
                    ? "bg-red-50 text-red-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon width={18} height={18} />
                {label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href={adminNav.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/admin")
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-purple-700 hover:bg-purple-50"
                }`}
              >
                <adminNav.Icon width={18} height={18} />
                {adminNav.label}
              </Link>
            )}
          </nav>
        </div>

        <div className="mt-auto p-3">
          {user ? (
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    @{user.handle}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 py-2 rounded-lg border border-slate-200"
              >
                <IconLogout width={14} height={14} /> Sair
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
              <div className="font-bold text-sm">Entre na sua conta</div>
              <div className="text-xs text-slate-300 mt-1">
                Compre, comente e agende treinos.
              </div>
              <Link
                href="/login"
                className="mt-3 block text-center text-xs bg-red-500 hover:bg-red-600 font-bold py-2 rounded-lg"
              >
                Entrar ou cadastrar
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ------------------------------ Main column ----------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-slate-700"
              aria-label="Abrir menu"
            >
              <IconMenu width={24} height={24} />
            </button>

            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 grid place-items-center text-white">
                <IconLogo width={18} height={18} />
              </div>
              <span className="font-black">CoreMotion</span>
            </Link>

            <form
              action="/marketplace"
              className="hidden sm:flex flex-1 max-w-xl relative"
            >
              <IconSearch
                width={17}
                height={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="q"
                placeholder="Buscar tênis, chuteiras, marcas..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white"
              />
            </form>

            <div className="ml-auto flex items-center gap-1.5">
              <Link
                href="/scanner"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-full"
              >
                <IconScan width={16} height={16} /> SmartScan
              </Link>
              <Link
                href="/favoritos"
                aria-label="Favoritos"
                className="hidden sm:grid place-items-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <IconHeart width={19} height={19} />
              </Link>
              <Link
                href="/carrinho"
                aria-label="Carrinho"
                className="relative grid place-items-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-700"
              >
                <IconBag width={20} height={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <Link href="/perfil" className="ml-1">
                  <Avatar src={user.avatar} name={user.name} size={32} />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="ml-1 text-xs font-bold bg-slate-900 text-white px-3.5 py-2 rounded-full hover:bg-red-600"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <form action="/marketplace" className="sm:hidden px-4 pb-3 relative">
            <IconSearch
              width={16}
              height={16}
              className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              placeholder="Buscar produtos..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-white"
            />
          </form>
        </header>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* ------------------------------ Mobile drawer --------------------------- */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-red-600 grid place-items-center text-white">
                  <IconLogo width={19} height={19} />
                </div>
                <span className="font-black text-lg">SportHub</span>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Fechar">
                <IconClose width={22} height={22} />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Avatar src={user.avatar} name={user.name} size={44} />
                <div className="min-w-0">
                  <div className="font-bold truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    @{user.handle}
                  </div>
                </div>
              </div>
            )}

            <nav className="p-3 space-y-0.5">
              {mainNav.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(href)
                      ? "bg-red-50 text-red-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon width={19} height={19} />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="px-3 pb-3">
              <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Minha conta
              </div>
              <nav className="space-y-0.5">
                {accountNav.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icon width={18} height={18} />
                    {label}
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-purple-700 hover:bg-purple-50 font-medium"
                  >
                    <IconShield width={18} height={18} />
                    Painel Admin
                  </Link>
                )}
              </nav>
            </div>

            <div className="p-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-700 border border-slate-200 py-2.5 rounded-xl"
                >
                  <IconLogout width={16} height={16} /> Sair da conta
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm"
                >
                  Entrar ou cadastrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------- Mobile bottom nav -------------------------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {bottomNav.map(({ href, label, Icon, highlight }) => {
            const active = isActive(href);
            if (highlight)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center py-1.5"
                >
                  <div className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 grid place-items-center text-white shadow-lg shadow-purple-500/40">
                    <Icon width={21} height={21} />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 text-purple-700">
                    {label}
                  </span>
                </Link>
              );
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 ${
                  active ? "text-red-600" : "text-slate-500"
                }`}
              >
                <Icon width={20} height={20} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
