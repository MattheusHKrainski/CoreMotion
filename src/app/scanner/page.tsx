import ScannerClient from "./ScannerClient";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  await ensureSeed();
  const codes = await db
    .select({
      scanCode: products.scanCode,
      ean: products.ean,
      name: products.name,
      image: products.image,
    })
    .from(products);
  return <ScannerClient availableCodes={codes} />;
}
