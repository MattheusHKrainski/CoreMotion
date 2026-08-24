"use server";

import { db } from "@/db";
import {
  users,
  posts,
  postLikes,
  postComments,
  follows,
  products,
  cartItems,
  wishlist,
  orders,
  orderItems,
  reviews,
  bookings,
  coachServices,
  reports,
  adminLogs,
  sessions,
  stores,
  listings,
} from "@/db/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
  requireAdmin,
  slugify,
  isAllowedEmail,
} from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { PEOPLE } from "@/lib/media";

export type ActionState = { error?: string; ok?: boolean; message?: string };

/* ---------------------------------- AUTH --------------------------------- */

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureSeed();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? "athlete");
  const role = roleRaw === "coach" ? "coach" : "athlete";
  const sport = String(formData.get("sport") ?? "Multi-esportes");
  const city = String(formData.get("city") ?? "").trim();

  if (name.length < 2) return { error: "Informe seu nome completo." };

  const emailCheck = isAllowedEmail(email);
  if (!emailCheck.ok) return { error: emailCheck.reason };

  // Não permite registrar com o e-mail demo ou admin
  if (email === "demo@sporthub.com" || email === "operacaoamd@gmail.com") {
    return { error: "Este e-mail é reservado. Faça login na conta existente." };
  }

  if (password.length < 6)
    return { error: "A senha precisa ter ao menos 6 caracteres." };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) return { error: "Este e-mail já está cadastrado. Faça login." };

  let handle = slugify(name) || "atleta";
  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.handle, handle))
    .limit(1);
  if (taken.length) handle = `${handle}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      handle,
      passwordHash: hashPassword(password),
      role,
      sport,
      city,
      avatar: PEOPLE.training,
      bio:
        role === "coach"
          ? "Treinador no SportHub. Atualize sua bio no perfil."
          : "Atleta no SportHub. Atualize sua bio no perfil.",
      pricePerHour: role === "coach" ? 120 : null,
      lastLoginAt: new Date(),
    })
    .returning({ id: users.id });

  await createSession(created.id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await ensureSeed();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return { error: "Preencha e-mail e senha." };
    }

    const emailCheck = isAllowedEmail(email);
    // Demo e admin passam; e-mails inventados são bloqueados no login também
    if (!emailCheck.ok && email !== "demo@sporthub.com") {
      return { error: emailCheck.reason };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { error: "E-mail ou senha incorretos." };
    }

    if (user.banned) {
      return {
        error: `Conta suspensa${user.banReason ? `: ${user.banReason}` : "."} Contate o suporte.`,
      };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { error: "E-mail ou senha incorretos." };
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    await createSession(user.id);
    revalidatePath("/", "layout");

    if (user.role === "admin") {
      redirect("/admin");
    }
    redirect("/");
  } catch (e) {
    // redirect() lança NEXT_REDIRECT — repropagar
    if (e && typeof e === "object" && "digest" in e) throw e;
    console.error("loginAction error", e);
    return { error: "Erro ao entrar. Tente novamente." };
  }
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para editar o perfil." };

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const sport = String(formData.get("sport") ?? me.sport);
  const level = String(formData.get("level") ?? me.level);
  const priceRaw = formData.get("pricePerHour");
  const pricePerHour =
    me.role === "coach" && priceRaw ? Number(priceRaw) : me.pricePerHour;

  if (name.length < 2) return { error: "Nome muito curto." };

  await db
    .update(users)
    .set({ name, bio, city, sport, level, pricePerHour })
    .where(eq(users.id, me.id));

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------------------------- CART --------------------------------- */

export async function addToCartAction(
  productId: number,
  size: string,
  qty = 1,
) {
  const me = await getCurrentUser();
  if (!me) redirect(`/login?next=/produto`);

  await db
    .insert(cartItems)
    .values({ userId: me.id, productId, size, qty })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId, cartItems.size],
      set: { qty: sql`${cartItems.qty} + ${qty}` },
    });

  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartQtyAction(itemId: number, qty: number) {
  const me = await getCurrentUser();
  if (!me) return { error: "Não autenticado" };
  if (qty <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, me.id)));
  } else {
    await db
      .update(cartItems)
      .set({ qty })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, me.id)));
  }
  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeCartItemAction(itemId: number) {
  const me = await getCurrentUser();
  if (!me) return { error: "Não autenticado" };
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, me.id)));
  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleWishlistAction(productId: number) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const existing = await db
    .select({ id: wishlist.id })
    .from(wishlist)
    .where(and(eq(wishlist.userId, me.id), eq(wishlist.productId, productId)))
    .limit(1);
  if (existing.length) {
    await db.delete(wishlist).where(eq(wishlist.id, existing[0].id));
  } else {
    await db.insert(wishlist).values({ userId: me.id, productId });
  }
  revalidatePath("/favoritos");
  revalidatePath("/marketplace");
  return { ok: true };
}

/* -------------------------------- CHECKOUT -------------------------------- */

export async function checkoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para finalizar a compra." };

  const address = String(formData.get("address") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "pix");
  if (address.length < 10)
    return { error: "Informe um endereço de entrega completo." };

  const rows = await db
    .select({
      itemId: cartItems.id,
      qty: cartItems.qty,
      size: cartItems.size,
      productId: products.id,
      name: products.name,
      image: products.image,
      price: products.price,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, me.id));

  if (rows.length === 0) return { error: "Seu carrinho está vazio." };

  const subtotal = rows.reduce((s, r) => s + Number(r.price) * r.qty, 0);
  const shipping = subtotal >= 249 ? 0 : 24.9;
  const discount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shipping - discount;

  const code = `SH${Date.now().toString(36).toUpperCase()}`;

  const [order] = await db
    .insert(orders)
    .values({
      userId: me.id,
      code,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      address,
      status: "Confirmado",
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(
    rows.map((r) => ({
      orderId: order.id,
      productId: r.productId,
      name: r.name,
      image: r.image,
      size: r.size,
      unitPrice: r.price,
      qty: r.qty,
    })),
  );

  // decrement stock
  for (const r of rows) {
    await db
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${r.qty}, 0)` })
      .where(eq(products.id, r.productId));
  }

  await db.delete(cartItems).where(eq(cartItems.userId, me.id));

  revalidatePath("/pedidos");
  revalidatePath("/", "layout");
  redirect(`/pedidos?novo=${code}`);
}

/* --------------------------------- SOCIAL --------------------------------- */

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para publicar." };
  const content = String(formData.get("content") ?? "").trim();
  const sport = String(formData.get("sport") ?? "Multi-esportes");
  if (content.length < 3) return { error: "Escreva algo antes de publicar." };

  await db.insert(posts).values({ userId: me.id, content, sport });
  revalidatePath("/feed");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleLikeAction(postId: number) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const existing = await db
    .select({ id: postLikes.id })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, me.id)))
    .limit(1);

  if (existing.length) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    await db
      .update(posts)
      .set({ likes: sql`GREATEST(${posts.likes} - 1, 0)` })
      .where(eq(posts.id, postId));
  } else {
    await db.insert(postLikes).values({ postId, userId: me.id });
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));
  }
  revalidatePath("/feed");
  return { ok: true };
}

export async function addCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para comentar." };
  const postId = Number(formData.get("postId"));
  const content = String(formData.get("content") ?? "").trim();
  if (!postId || content.length < 1) return { error: "Comentário vazio." };

  await db.insert(postComments).values({ postId, userId: me.id, content });
  await db
    .update(posts)
    .set({ comments: sql`${posts.comments} + 1` })
    .where(eq(posts.id, postId));
  revalidatePath("/feed");
  return { ok: true };
}

export async function toggleFollowAction(targetId: number) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.id === targetId) return { error: "Você não pode se seguir." };

  const existing = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetId)))
    .limit(1);

  if (existing.length) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    await db
      .update(users)
      .set({ followers: sql`GREATEST(${users.followers} - 1, 0)` })
      .where(eq(users.id, targetId));
  } else {
    await db.insert(follows).values({ followerId: me.id, followingId: targetId });
    await db
      .update(users)
      .set({ followers: sql`${users.followers} + 1` })
      .where(eq(users.id, targetId));
  }
  revalidatePath("/atletas");
  revalidatePath("/treinadores");
  return { ok: true };
}

/* -------------------------------- REVIEWS --------------------------------- */

export async function addReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para avaliar." };
  const productId = Number(formData.get("productId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!productId || rating < 1 || rating > 5)
    return { error: "Selecione uma nota de 1 a 5." };
  if (comment.length < 5) return { error: "Escreva um comentário maior." };

  await db.insert(reviews).values({
    productId,
    userId: me.id,
    authorName: me.name,
    rating,
    comment,
  });

  const [agg] = await db
    .select({
      avg: sql<string>`ROUND(AVG(${reviews.rating})::numeric, 2)`,
      total: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  await db
    .update(products)
    .set({ rating: agg.avg ?? "0", reviewCount: agg.total ?? 0 })
    .where(eq(products.id, productId));

  const [p] = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, productId));
  if (p) revalidatePath(`/produto/${p.slug}`);
  return { ok: true };
}

/* -------------------------------- BOOKINGS -------------------------------- */

export async function bookServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para reservar." };
  const serviceId = Number(formData.get("serviceId"));
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim();
  if (!serviceId) return { error: "Serviço inválido." };
  if (!scheduledFor) return { error: "Escolha uma data e horário." };

  const [svc] = await db
    .select()
    .from(coachServices)
    .where(eq(coachServices.id, serviceId))
    .limit(1);
  if (!svc) return { error: "Serviço não encontrado." };

  await db.insert(bookings).values({
    userId: me.id,
    serviceId,
    coachId: svc.coachId,
    scheduledFor,
    price: svc.pricePerSession,
  });

  revalidatePath("/agendamentos");
  return { ok: true };
}

export async function cancelBookingAction(bookingId: number) {
  const me = await getCurrentUser();
  if (!me) return { error: "Não autenticado" };
  await db
    .update(bookings)
    .set({ status: "Cancelado" })
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, me.id)));
  revalidatePath("/agendamentos");
  return { ok: true };
}

/* --------------------------------- HELPERS -------------------------------- */

export async function getCartCount() {
  const me = await getCurrentUser();
  if (!me) return 0;
  const [row] = await db
    .select({ n: sql<number>`COALESCE(SUM(${cartItems.qty}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.userId, me.id));
  return row?.n ?? 0;
}

export async function getRecentOrders(limit = 5) {
  const me = await getCurrentUser();
  if (!me) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, me.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

/* ---------------------------------- ADMIN --------------------------------- */

async function logAdmin(
  adminId: number,
  action: string,
  targetType = "",
  targetId?: number,
  details = "",
) {
  await db.insert(adminLogs).values({
    adminId,
    action,
    targetType,
    targetId: targetId ?? null,
    details,
  });
}

export async function adminBanUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const reason = String(formData.get("reason") ?? "Violação das regras").trim();
  if (!userId) return;

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target || target.role === "admin") return;

  await db
    .update(users)
    .set({ banned: true, banReason: reason })
    .where(eq(users.id, userId));
  // Derruba sessões do banido
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await logAdmin(admin.id, "ban_user", "user", userId, reason);
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function adminUnbanUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (!userId) return;
  await db
    .update(users)
    .set({ banned: false, banReason: "" })
    .where(eq(users.id, userId));
  await logAdmin(admin.id, "unban_user", "user", userId);
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function adminDeleteUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (!userId) return;

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target || target.role === "admin") return;
  // Não apaga a conta demo oficial
  if (target.email === "demo@sporthub.com") return;

  await db.delete(users).where(eq(users.id, userId));
  await logAdmin(
    admin.id,
    "delete_user",
    "user",
    userId,
    `Removido: ${target.name} <${target.email}>`,
  );
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function adminToggleProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const productId = Number(formData.get("productId"));
  if (!productId) return;
  const [p] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!p) return;
  const next = !p.active;
  await db.update(products).set({ active: next }).where(eq(products.id, productId));
  await logAdmin(
    admin.id,
    next ? "activate_product" : "deactivate_product",
    "product",
    productId,
    p.name,
  );
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/marketplace");
}

export async function adminDeleteProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const productId = Number(formData.get("productId"));
  if (!productId) return;
  const [p] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!p) return;
  await db.delete(products).where(eq(products.id, productId));
  await logAdmin(admin.id, "delete_product", "product", productId, p.name);
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/marketplace");
}

export async function adminUpdateStockAction(formData: FormData) {
  const admin = await requireAdmin();
  const productId = Number(formData.get("productId"));
  const stock = Number(formData.get("stock"));
  if (!productId || Number.isNaN(stock) || stock < 0) return;
  await db.update(products).set({ stock }).where(eq(products.id, productId));
  await logAdmin(admin.id, "update_stock", "product", productId, `stock=${stock}`);
  revalidatePath("/admin/produtos");
}

export async function adminDeletePostAction(formData: FormData) {
  const admin = await requireAdmin();
  const postId = Number(formData.get("postId"));
  if (!postId) return;
  await db.delete(posts).where(eq(posts.id, postId));
  await logAdmin(admin.id, "delete_post", "post", postId);
  revalidatePath("/admin");
  revalidatePath("/admin/conteudo");
  revalidatePath("/feed");
}

export async function adminDeleteReviewAction(formData: FormData) {
  const admin = await requireAdmin();
  const reviewId = Number(formData.get("reviewId"));
  if (!reviewId) return;
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  await logAdmin(admin.id, "delete_review", "review", reviewId);
  revalidatePath("/admin/conteudo");
}

export async function adminResolveReportAction(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = Number(formData.get("reportId"));
  const status = String(formData.get("status") ?? "Resolvido");
  const resolution = String(formData.get("resolution") ?? "").trim();
  if (!reportId) return;
  await db
    .update(reports)
    .set({
      status,
      resolution,
      resolvedBy: admin.id,
      resolvedAt: new Date(),
    })
    .where(eq(reports.id, reportId));
  await logAdmin(admin.id, "resolve_report", "report", reportId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/denuncias");
}

export async function adminCancelOrderAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  if (!orderId) return;
  await db
    .update(orders)
    .set({ status: "Cancelado" })
    .where(eq(orders.id, orderId));
  await logAdmin(admin.id, "cancel_order", "order", orderId);
  revalidatePath("/admin/pedidos");
}

export async function adminVerifyUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (!userId) return;
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return;
  await db
    .update(users)
    .set({ verified: !u.verified })
    .where(eq(users.id, userId));
  await logAdmin(
    admin.id,
    u.verified ? "unverify_user" : "verify_user",
    "user",
    userId,
  );
  revalidatePath("/admin/usuarios");
}

export async function reportContentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para denunciar." };
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = Number(formData.get("targetId"));
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  if (!targetType || !targetId || !reason)
    return { error: "Preencha o motivo da denúncia." };

  await db.insert(reports).values({
    reporterId: me.id,
    targetType,
    targetId,
    reason,
    details,
  });

  if (targetType === "user") {
    await db
      .update(users)
      .set({ reportCount: sql`${users.reportCount} + 1` })
      .where(eq(users.id, targetId));
  }

  return { ok: true, message: "Denúncia enviada. Nossa equipe vai analisar." };
}

/* ============================== C2C DESAPEGO ============================== */

export async function createListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para anunciar." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const condition = String(formData.get("condition") ?? "Seminovo");
  const category = String(formData.get("category") ?? "Calçados");
  const sport = String(formData.get("sport") ?? "Multi-esportes");
  const brand = String(formData.get("brand") ?? "").trim();
  const size = String(formData.get("size") ?? "Único").trim();
  const city = String(formData.get("city") ?? me.city ?? "").trim();

  if (title.length < 5) return { error: "Título muito curto (mínimo 5 caracteres)." };
  if (description.length < 15) return { error: "Descreva melhor o produto (mínimo 15 caracteres)." };
  const priceNum = Number(price.replace(",", "."));
  if (!price || isNaN(priceNum) || priceNum <= 0) return { error: "Informe um preço válido." };

  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || `https://images.pexels.com/photos/28222529/pexels-photo-28222529.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop`;

  const [created] = await db.insert(listings).values({
    sellerId: me.id,
    title,
    description,
    price: priceNum.toFixed(2),
    condition,
    category,
    sport,
    brand,
    size,
    images: [imageUrl],
    city,
    status: "Ativo",
  }).returning({ id: listings.id });

  revalidatePath("/desapego");
  redirect(`/desapego/${created.id}`);
}

export async function addListingToCartAction(listingId: number, size = "Único") {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  // Remove product items conflict? Cart has two unique indexes
  await db.insert(cartItems).values({
    userId: me.id,
    listingId,
    size,
    qty: 1,
  }).onConflictDoNothing();

  revalidatePath("/carrinho");
  return { ok: true };
}

export async function deleteListingAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;
  const listingId = Number(formData.get("listingId"));
  if (!listingId) return;

  const [l] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!l) return;
  // Owner or admin can delete
  if (l.sellerId !== me.id && me.role !== "admin") return;

  await db.delete(listings).where(eq(listings.id, listingId));
  revalidatePath("/desapego");
  revalidatePath("/admin");
}

export async function adminToggleListingAction(formData: FormData) {
  const admin = await requireAdmin();
  const listingId = Number(formData.get("listingId"));
  if (!listingId) return;
  const [l] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!l) return;
  const next = l.status === "Ativo" ? "Pausado" : "Ativo";
  await db.update(listings).set({ status: next }).where(eq(listings.id, listingId));
  await logAdmin(admin.id, "toggle_listing", "listing", listingId, next);
  revalidatePath("/desapego");
  revalidatePath("/admin");
}

export async function adminDeleteListingAction(formData: FormData) {
  const admin = await requireAdmin();
  const listingId = Number(formData.get("listingId"));
  if (!listingId) return;
  await db.delete(listings).where(eq(listings.id, listingId));
  await logAdmin(admin.id, "delete_listing", "listing", listingId);
  revalidatePath("/desapego");
  revalidatePath("/admin");
}

/* ============================== LOJAS ============================== */

function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Você precisa entrar na sua conta para criar uma loja." };
  if (me.banned) return { error: "Conta suspensa. Contate o suporte." };

  // Uma loja por usuário (admin pode ter várias)
  if (me.role !== "admin") {
    const [existing] = await db.select({ id: stores.id }).from(stores).where(eq(stores.ownerId, me.id)).limit(1);
    if (existing) return { error: "Você já possui uma loja. Acesse em Minha Loja para gerenciar." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const category = String(formData.get("category") ?? "Multi-esportes").trim();
  const logo = String(formData.get("logo") ?? "").trim();
  const banner = String(formData.get("banner") ?? "").trim();
  const email = String(formData.get("email") ?? me.email ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? me.city ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const social = String(formData.get("social") ?? "").trim();

  if (!name) return { error: "Nome da loja é obrigatório." };
  if (name.length < 3) return { error: "Nome da loja deve ter ao menos 3 caracteres." };
  if (!shortDescription) return { error: "Descrição curta é obrigatória." };
  if (shortDescription.length < 10) return { error: "Descrição curta deve ter ao menos 10 caracteres." };
  if (!description) return { error: "Descrição da loja é obrigatória." };
  if (!category) return { error: "Categoria é obrigatória." };
  if (!email) return { error: "E-mail de contato é obrigatório." };
  if (!isValidEmailFormat(email)) return { error: "E-mail de contato inválido." };
  if (!phone) return { error: "Telefone/WhatsApp é obrigatório." };
  if (!city) return { error: "Cidade é obrigatória." };
  if (!state || state.length !== 2) return { error: "Estado deve ter 2 letras (ex: SP)." };

  let slug = slugRaw ? slugify(slugRaw) : slugify(name);
  if (!slug || slug.length < 3) slug = `loja-${me.id}-${Date.now().toString(36)}`;
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Identificador da loja deve conter apenas letras, números e hífen." };

  const slugExists = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
  if (slugExists.length) return { error: `Identificador "${slug}" já está em uso. Escolha outro.` };

  const logoUrl = logo || PEOPLE.training;
  const bannerUrl = banner || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop";

  const [created] = await db.insert(stores).values({
    ownerId: me.id,
    name,
    slug,
    description,
    shortDescription,
    category,
    logo: logoUrl,
    banner: bannerUrl,
    email,
    phone,
    city,
    state,
    social,
  }).returning({ id: stores.id, slug: stores.slug });

  revalidatePath("/lojas");
  revalidatePath("/loja");
  revalidatePath("/minha-loja");
  revalidatePath("/marketplace");
  redirect("/minha-loja");
}

export async function updateStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Você precisa entrar na sua conta." };

  const storeId = Number(formData.get("storeId"));
  if (!storeId) return { error: "Loja inválida." };

  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store) return { error: "Loja não encontrada." };
  if (store.ownerId !== me.id && me.role !== "admin") return { error: "Você não tem permissão para editar esta loja." };

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const logo = String(formData.get("logo") ?? "").trim();
  const banner = String(formData.get("banner") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const social = String(formData.get("social") ?? "").trim();

  if (!name) return { error: "Nome da loja é obrigatório." };
  if (!shortDescription) return { error: "Descrição curta é obrigatória." };
  if (!email || !isValidEmailFormat(email)) return { error: "E-mail de contato inválido." };
  if (!city) return { error: "Cidade é obrigatória." };
  if (!state || state.length !== 2) return { error: "Estado deve ter 2 letras." };

  let slug = slugRaw ? slugify(slugRaw) : store.slug;
  if (slug !== store.slug) {
    const exists = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
    if (exists.length) return { error: `Identificador "${slug}" já está em uso.` };
  }

  await db.update(stores).set({
    name,
    slug,
    description,
    shortDescription,
    category,
    logo: logo || store.logo,
    banner: banner || store.banner,
    email,
    phone,
    city,
    state,
    social,
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  revalidatePath(`/lojas/${slug}`);
  revalidatePath(`/loja/${slug}`);
  revalidatePath("/minha-loja");
  revalidatePath("/lojas");
  revalidatePath("/marketplace");

  return { ok: true, message: "Loja atualizada com sucesso." };
}

export async function createStoreProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para cadastrar produtos." };

  const storeId = Number(formData.get("storeId"));
  if (!storeId) return { error: "Loja inválida." };

  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store) return { error: "Loja não encontrada." };
  if (store.ownerId !== me.id && me.role !== "admin") return { error: "Sem permissão para adicionar produtos nesta loja." };

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "Calçados").trim();
  const sport = String(formData.get("sport") ?? "Multi-esportes").trim();
  const priceRaw = String(formData.get("price") ?? "").trim().replace(",", ".");
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim().replace(",", ".");
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const sizeRaw = String(formData.get("sizes") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "10").trim();
  const condition = String(formData.get("condition") ?? "Novo").trim();

  if (!name || name.length < 3) return { error: "Nome do produto é obrigatório." };
  if (!brand) return { error: "Marca é obrigatória." };
  if (!priceRaw) return { error: "Preço é obrigatório." };
  const priceNum = Number(priceRaw);
  if (isNaN(priceNum) || priceNum <= 0) return { error: "Preço inválido." };

  if (!image) return { error: "Imagem do produto é obrigatória (cole uma URL)." };
  if (!/^https?:\/\//.test(image)) return { error: "URL da imagem deve começar com http." };

  const slugBase = slugify(name) || `produto-${Date.now()}`;
  let slug = slugBase;
  let counter = 1;
  while (true) {
    const exists = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!exists.length) break;
    slug = `${slugBase}-${counter++}`;
  }

  const sizes = sizeRaw ? sizeRaw.split(",").map((s) => s.trim()).filter(Boolean) : ["Único"];
  const stock = Math.max(0, parseInt(stockRaw) || 10);
  const scanCode = `CM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000)}`;
  const ean = `${Date.now().toString().slice(-12)}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`.slice(0, 13);

  await db.insert(products).values({
    storeId,
    sellerId: me.id,
    slug,
    name,
    brand,
    category,
    sport,
    description: description || `${name} — ${condition}`,
    price: priceNum.toFixed(2),
    oldPrice: oldPriceRaw && Number(oldPriceRaw) > priceNum ? Number(oldPriceRaw).toFixed(2) : null,
    image,
    gallery: [image],
    sizes,
    stock,
    badge: condition !== "Novo" ? condition : null,
    scanCode,
    ean,
    tags: [brand.toLowerCase(), sport.toLowerCase(), category.toLowerCase()],
  });

  await db.update(stores).set({
    productCount: sql`${stores.productCount} + 1`,
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  revalidatePath(`/lojas/${store.slug}`);
  revalidatePath(`/loja/${store.slug}`);
  revalidatePath("/minha-loja");
  revalidatePath("/marketplace");

  return { ok: true, message: "Produto cadastrado com sucesso." };
}

export async function updateStoreProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login." };

  const productId = Number(formData.get("productId"));
  if (!productId) return { error: "Produto inválido." };

  const [p] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!p) return { error: "Produto não encontrado." };

  if (p.storeId) {
    const [s] = await db.select().from(stores).where(eq(stores.id, p.storeId)).limit(1);
    if (!s) return { error: "Loja não encontrada." };
    if (s.ownerId !== me.id && me.role !== "admin") return { error: "Sem permissão." };
  } else {
    if (p.sellerId !== me.id && me.role !== "admin") return { error: "Sem permissão." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim().replace(",", ".");
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim().replace(",", ".");
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "").trim();

  if (!name) return { error: "Nome obrigatório." };
  const priceNum = Number(priceRaw);
  if (isNaN(priceNum) || priceNum <= 0) return { error: "Preço inválido." };

  await db.update(products).set({
    name,
    brand: brand || p.brand,
    category: category || p.category,
    sport: sport || p.sport,
    price: priceNum.toFixed(2),
    oldPrice: oldPriceRaw ? Number(oldPriceRaw).toFixed(2) : p.oldPrice,
    description: description || p.description,
    image: image || p.image,
    stock: stockRaw ? Math.max(0, parseInt(stockRaw) || 0) : p.stock,
  }).where(eq(products.id, productId));

  revalidatePath("/minha-loja");
  revalidatePath("/marketplace");
  if (p.storeId) {
    const [s] = await db.select().from(stores).where(eq(stores.id, p.storeId)).limit(1);
    if (s) {
      revalidatePath(`/lojas/${s.slug}`);
      revalidatePath(`/loja/${s.slug}`);
    }
  }

  return { ok: true, message: "Produto atualizado com sucesso." };
}

export async function deleteStoreProductAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) return;
  const productId = Number(formData.get("productId"));
  if (!productId) return;

  const [p] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!p) return;

  if (p.storeId) {
    const [s] = await db.select().from(stores).where(eq(stores.id, p.storeId)).limit(1);
    if (!s) return;
    if (s.ownerId !== me.id && me.role !== "admin") return;
    await db.delete(products).where(eq(products.id, productId));
    await db.update(stores).set({
      productCount: sql`GREATEST(${stores.productCount} - 1, 0)`,
      updatedAt: new Date(),
    }).where(eq(stores.id, s.id));
    revalidatePath(`/lojas/${s.slug}`);
    revalidatePath(`/loja/${s.slug}`);
  } else {
    if (p.sellerId !== me.id && me.role !== "admin") return;
    await db.delete(products).where(eq(products.id, productId));
  }

  revalidatePath("/minha-loja");
  revalidatePath("/marketplace");
  revalidatePath("/admin/produtos");
}

export async function adminToggleStoreAction(formData: FormData) {
  const admin = await requireAdmin();
  const storeId = Number(formData.get("storeId"));
  if (!storeId) return;
  const [s] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!s) return;
  await db.update(stores).set({ active: !s.active }).where(eq(stores.id, storeId));
  await logAdmin(admin.id, s.active ? "deactivate_store" : "activate_store", "store", storeId, s.name);
  revalidatePath("/lojas");
  revalidatePath("/admin");
}

export async function adminDeleteStoreAction(formData: FormData) {
  const admin = await requireAdmin();
  const storeId = Number(formData.get("storeId"));
  if (!storeId) return;
  const [s] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!s) return;
  await db.delete(stores).where(eq(stores.id, storeId));
  await logAdmin(admin.id, "delete_store", "store", storeId, s.name);
  revalidatePath("/lojas");
  revalidatePath("/admin");
}

/* ============================== VERIFICAÇÃO OFICIAL ============================== */

export async function requestStoreVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await getCurrentUser();
  if (!me) return { error: "Faça login para solicitar verificação." };

  const storeId = Number(formData.get("storeId"));
  if (!storeId) return { error: "Loja inválida." };

  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store) return { error: "Loja não encontrada." };
  if (store.ownerId !== me.id && me.role !== "admin") return { error: "Sem permissão." };

  if (["pending", "under_review"].includes(store.verificationStatus)) {
    return { error: `Sua solicitação já está com status ${store.verificationStatus}. Aguarde análise.` };
  }

  const legalName = String(formData.get("legalName") ?? "").trim();
  const tradeName = String(formData.get("tradeName") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const responsibleName = String(formData.get("responsibleName") ?? "").trim();
  const responsibleRole = String(formData.get("responsibleRole") ?? "").trim();
  const responsibleEmail = String(formData.get("responsibleEmail") ?? "").trim();
  const responsiblePhone = String(formData.get("responsiblePhone") ?? "").trim();
  const brandName = String(formData.get("brandName") ?? "").trim();
  const brandRelation = String(formData.get("brandRelation") ?? "").trim();
  const brandWebsite = String(formData.get("brandWebsite") ?? "").trim();
  const brandSocial = String(formData.get("brandSocial") ?? "").trim();
  const documentsRaw = String(formData.get("documents") ?? "").trim();

  if (!legalName) return { error: "Razão social é obrigatória." };
  if (!tradeName) return { error: "Nome comercial é obrigatório." };
  if (!cnpj) return { error: "CNPJ é obrigatório." };
  if (!address) return { error: "Endereço é obrigatório." };
  if (!responsibleName) return { error: "Nome do responsável é obrigatório." };
  if (!responsibleEmail || !isValidEmailFormat(responsibleEmail)) return { error: "E-mail profissional inválido." };

  const docs = documentsRaw ? documentsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // Import storeVerifications table
  const { storeVerifications } = await import("@/db/schema");

  await db.insert(storeVerifications).values({
    storeId,
    status: "pending",
    legalName,
    tradeName,
    cnpj,
    address,
    phone,
    website,
    responsibleName,
    responsibleRole,
    responsibleEmail,
    responsiblePhone,
    brandName,
    brandRelation,
    brandWebsite,
    brandSocial,
    documents: docs,
  });

  await db.update(stores).set({ verificationStatus: "pending", updatedAt: new Date() }).where(eq(stores.id, storeId));

  // Notificação para admin
  const { notifications } = await import("@/db/schema");
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  for (const admin of admins) {
    await db.insert(notifications).values({
      userId: admin.id,
      type: "verification_request",
      title: `Nova solicitação de verificação: ${store.name}`,
      message: `${responsibleName} solicitou verificação para a loja ${store.name} (CNPJ ${cnpj})`,
      link: "/admin/verificacoes",
    });
  }

  revalidatePath("/minha-loja/verificacao");
  revalidatePath("/admin/verificacoes");
  return { ok: true, message: "Solicitação de verificação enviada. Nossa equipe vai analisar em até 3 dias úteis." };
}

export async function adminReviewVerificationAction(formData: FormData) {
  const admin = await requireAdmin();
  const verificationId = Number(formData.get("verificationId"));
  const newStatus = String(formData.get("status") ?? ""); // approved | rejected | under_review | revoked
  const reason = String(formData.get("reason") ?? "").trim();

  if (!verificationId || !["approved", "rejected", "under_review", "revoked"].includes(newStatus)) return;

  const { storeVerifications, stores, notifications } = await import("@/db/schema");
  const [verification] = await db.select().from(storeVerifications).where(eq(storeVerifications.id, verificationId)).limit(1);
  if (!verification) return;

  const [store] = await db.select().from(stores).where(eq(stores.id, verification.storeId)).limit(1);
  if (!store) return;

  await db
    .update(storeVerifications)
    .set({
      status: newStatus,
      reason,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(storeVerifications.id, verificationId));

  // Atualiza loja
  if (newStatus === "approved") {
    await db.update(stores).set({ verified: true, verificationStatus: "approved", updatedAt: new Date() }).where(eq(stores.id, store.id));
  } else if (newStatus === "rejected") {
    await db.update(stores).set({ verificationStatus: "rejected", updatedAt: new Date() }).where(eq(stores.id, store.id));
  } else if (newStatus === "revoked") {
    await db.update(stores).set({ verified: false, verificationStatus: "revoked", updatedAt: new Date() }).where(eq(stores.id, store.id));
  } else if (newStatus === "under_review") {
    await db.update(stores).set({ verificationStatus: "under_review", updatedAt: new Date() }).where(eq(stores.id, store.id));
  }

  // Notificação para lojista
  const title =
    newStatus === "approved"
      ? `Loja ${store.name} verificada!`
      : newStatus === "rejected"
        ? `Verificação de ${store.name} rejeitada`
        : newStatus === "revoked"
          ? `Verificação de ${store.name} revogada`
          : `Verificação de ${store.name} em análise`;

  const message =
    newStatus === "approved"
      ? `Parabéns! Sua loja ${store.name} recebeu o selo Verificado do CoreMotion. O selo já aparece na sua vitrine e em todos os produtos.`
      : newStatus === "rejected"
        ? `Sua solicitação de verificação para ${store.name} foi rejeitada. Motivo: ${reason || "Não informado"}. Você pode enviar nova solicitação com documentação corrigida.`
        : newStatus === "revoked"
          ? `A verificação da loja ${store.name} foi revogada. Motivo: ${reason}. O selo foi removido automaticamente.`
          : `Sua solicitação para ${store.name} está em análise pela equipe CoreMotion.`;

  await db.insert(notifications).values({
    userId: store.ownerId,
    type: `verification_${newStatus}`,
    title,
    message,
    link: newStatus === "approved" ? `/loja/${store.slug}` : "/minha-loja/verificacao",
  });

  await logAdmin(admin.id, `verification_${newStatus}`, "store_verification", verificationId, `${store.name}: ${reason}`);

  revalidatePath("/admin/verificacoes");
  revalidatePath(`/loja/${store.slug}`);
  revalidatePath("/minha-loja");
}

