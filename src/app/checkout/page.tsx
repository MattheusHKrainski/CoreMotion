import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { cartItems, products, listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import CheckoutForm from "./CheckoutForm";
import { IconShield, IconTruck, IconCreditCard } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/checkout");

  // Get cart items
  const cart = await db
    .select({
      id: cartItems.id,
      qty: cartItems.qty,
      size: cartItems.size,
      productId: products.id,
      productName: products.name,
      productImage: products.image,
      productPrice: products.price,
      listingId: listings.id,
      listingTitle: listings.title,
      listingImages: listings.images,
      listingPrice: listings.price,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(listings, eq(cartItems.listingId, listings.id))
    .where(eq(cartItems.userId, me.id));

  const items = cart.filter((c) => c.productId || c.listingId);

  if (items.length === 0) {
    redirect("/carrinho");
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = item.productPrice || item.listingPrice || "0";
    return sum + Number(price) * item.qty;
  }, 0);

  const shipping = subtotal >= 249 ? 0 : 24.9;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="font-black text-2xl text-racing-green">CoreMotion</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IconShield width={16} height={16} className="text-racing-green" />
              <span>Checkout seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Checkout form */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-8">Finalizar compra</h1>
            
            <CheckoutForm items={items} subtotal={subtotal} shipping={shipping} discount={discount} total={total} />
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-premium">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Resumo do pedido</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const name = item.productName || item.listingTitle || "Produto";
                  const image = item.productImage || (item.listingImages as any)?.[0];
                  const price = item.productPrice || item.listingPrice || "0";
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.size !== "Único" && <span>Tam. {item.size} • </span>}
                          Qtd {item.qty}
                        </div>
                        <div className="text-sm font-bold text-racing-green mt-1">
                          R$ {Number(price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="divider my-6" />

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <IconTruck width={14} height={14} /> Frete
                  </span>
                  <span className={shipping === 0 ? "text-success-green font-bold" : ""}>
                    {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success-green">
                    <span>Desconto</span>
                    <span>-R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="divider my-3" />
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-racing-green">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <IconShield width={14} height={14} className="text-racing-green" />
                  <span>Compra protegida</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCreditCard width={14} height={14} className="text-racing-green" />
                  <span>Até 12x sem juros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
