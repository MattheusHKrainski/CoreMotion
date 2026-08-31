import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Shell from "@/components/Shell";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/app/actions";

export const metadata: Metadata = {
  title: "CoreMotion — Seu esporte, seu movimento",
  description: "Marketplace esportivo premium. Compre de lojas oficiais e atletas. Venda seus equipamentos. Conecte-se com a comunidade.",
  keywords: ["esporte", "marketplace", "tênis", "corrida", "futebol", "basquete", "loja esportiva"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a3d2e",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const cartCount = await getCartCount();

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Shell user={user ? {
          id: user.id,
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          role: user.role,
        } : null} cartCount={cartCount}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
