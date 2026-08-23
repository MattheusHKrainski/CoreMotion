import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingForm from "./ListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.banned) redirect("/");

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight">Anunciar no desapego</h1>
      <p className="text-slate-500 text-sm mt-1">
        Modelo C2C do CoreMotion — venda o que você não usa mais para outros atletas.
      </p>
      <ListingForm city={me.city} />
    </div>
  );
}
