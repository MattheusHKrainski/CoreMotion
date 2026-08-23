import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Shell from "@/components/Shell";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/app/actions";
import { ensureSeed } from "@/lib/seed";

export const metadata: Metadata = {
  title: "CoreMotion — Marketplace esportivo B2C + C2C",
  description:
    "CoreMotion: marketplace esportivo com lojas oficiais (B2C), desapego entre usuários (C2C), comunidades, treinadores e notícias. Fotos e valores reais.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#dc2626",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  await ensureSeed();
  const user = await getCurrentUser();
  const cartCount = await getCartCount();

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Shell
          user={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  handle: user.handle,
                  avatar: user.avatar,
                  role: user.role,
                }
              : null
          }
          cartCount={cartCount}
        >
          {children}
        </Shell>
      </body>
    </html>
  );
}
