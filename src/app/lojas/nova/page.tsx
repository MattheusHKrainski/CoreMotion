import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function NewStorePage() {
  redirect("/minha-loja/criar");
}
