import Link from "next/link";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/loja/${slug}`);
}
