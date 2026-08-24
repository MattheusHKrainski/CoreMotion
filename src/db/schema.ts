import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ============================== USERS / AUTH ============================== */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    supabaseId: varchar("supabase_id", { length: 80 }), // UUID do Supabase Auth
    name: varchar("name", { length: 120 }).notNull(),
    handle: varchar("handle", { length: 60 }).notNull().unique(),
    email: varchar("email", { length: 160 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 30 }).notNull().default("user"), // user | seller | store_owner | community_owner | moderator | admin | super_admin | athlete | coach
    status: varchar("status", { length: 20 }).notNull().default("active"), // active | suspended | banned | pending
    sport: varchar("sport", { length: 60 }).notNull().default("Multi-esportes"),
    city: varchar("city", { length: 80 }).notNull().default(""),
    bio: text("bio").notNull().default(""),
    avatar: text("avatar").notNull().default(""),
    level: varchar("level", { length: 30 }).notNull().default("Iniciante"),
    followers: integer("followers").notNull().default(0),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    pricePerHour: integer("price_per_hour"),
    verified: boolean("verified").notNull().default(false),
    isDemo: boolean("is_demo").notNull().default(false),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason").notNull().default(""),
    reportCount: integer("report_count").notNull().default(0),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), index("users_supabase_idx").on(t.supabaseId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 80 }).notNull().unique(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_token_idx").on(t.token)],
);

/* ============================== LOJAS ============================== */

export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description").notNull().default(""),
    shortDescription: varchar("short_description", { length: 200 }).notNull().default(""),
    category: varchar("category", { length: 60 }).notNull().default("Multi-esportes"),
    logo: text("logo").notNull().default(""),
    banner: text("banner").notNull().default(""),
    email: varchar("email", { length: 160 }).notNull().default(""),
    phone: varchar("phone", { length: 30 }).notNull().default(""),
    city: varchar("city", { length: 80 }).notNull().default(""),
    state: varchar("state", { length: 2 }).notNull().default(""),
    country: varchar("country", { length: 60 }).notNull().default("Brasil"),
    address: text("address").notNull().default(""),
    social: varchar("social", { length: 160 }).notNull().default(""),
    website: text("website").notNull().default(""),
    businessType: varchar("business_type", { length: 60 }).notNull().default(""),
    cnpj: varchar("cnpj", { length: 20 }).notNull().default(""),
    // Verificação oficial CoreMotion
    verified: boolean("verified").notNull().default(false),
    verificationStatus: varchar("verification_status", { length: 20 }).notNull().default("not_requested"), // not_requested | pending | under_review | approved | rejected | revoked
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.8"),
    followers: integer("followers").notNull().default(0),
    productCount: integer("product_count").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("stores_owner_idx").on(t.ownerId), index("stores_slug_idx").on(t.slug)],
);

export const storeVerifications = pgTable(
  "store_verifications",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // not_requested | pending | under_review | approved | rejected | revoked
    // Empresa
    legalName: varchar("legal_name", { length: 160 }).notNull().default(""),
    tradeName: varchar("trade_name", { length: 160 }).notNull().default(""),
    cnpj: varchar("cnpj", { length: 20 }).notNull().default(""),
    address: text("address").notNull().default(""),
    phone: varchar("phone", { length: 30 }).notNull().default(""),
    website: text("website").notNull().default(""),
    // Responsável
    responsibleName: varchar("responsible_name", { length: 120 }).notNull().default(""),
    responsibleRole: varchar("responsible_role", { length: 80 }).notNull().default(""),
    responsibleEmail: varchar("responsible_email", { length: 160 }).notNull().default(""),
    responsiblePhone: varchar("responsible_phone", { length: 30 }).notNull().default(""),
    // Marca
    brandName: varchar("brand_name", { length: 120 }).notNull().default(""),
    brandRelation: varchar("brand_relation", { length: 80 }).notNull().default(""), // revenda autorizada, representante, etc
    brandWebsite: text("brand_website").notNull().default(""),
    brandSocial: text("brand_social").notNull().default(""),
    // Comprovação e análise
    documents: jsonb("documents").$type<string[]>().notNull().default([]),
    reason: text("reason").notNull().default(""),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    reviewedBy: integer("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("store_verifications_store_idx").on(t.storeId), index("store_verifications_status_idx").on(t.status)],
);

export const verificationDocuments = pgTable(
  "verification_documents",
  {
    id: serial("id").primaryKey(),
    verificationId: integer("verification_id").notNull().references(() => storeVerifications.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 40 }).notNull().default("document"),
    fileName: varchar("file_name", { length: 200 }).notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("verification_docs_verification_idx").on(t.verificationId)],
);

/* ============================== MARKETPLACE B2C ============================== */

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id").references(() => stores.id, { onDelete: "set null" }),
    sellerId: integer("seller_id").references(() => users.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    name: varchar("name", { length: 180 }).notNull(),
    brand: varchar("brand", { length: 80 }).notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    sport: varchar("sport", { length: 60 }).notNull(),
    gender: varchar("gender", { length: 20 }).notNull().default("Unissex"),
    colorway: varchar("colorway", { length: 80 }).notNull().default(""),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    oldPrice: numeric("old_price", { precision: 10, scale: 2 }),
    image: text("image").notNull(),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    description: text("description").notNull().default(""),
    specs: jsonb("specs").$type<{ label: string; value: string }[]>().notNull().default([]),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    condition: varchar("condition", { length: 20 }).notNull().default("novo"), // novo | como_novo | bom | usado | desgastado
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.5"),
    reviewCount: integer("review_count").notNull().default(0),
    stock: integer("stock").notNull().default(10),
    badge: varchar("badge", { length: 40 }),
    scanCode: varchar("scan_code", { length: 40 }).notNull().unique(),
    ean: varchar("ean", { length: 20 }).notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    active: boolean("active").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_sport_idx").on(t.sport),
    index("products_brand_idx").on(t.brand),
    index("products_store_idx").on(t.storeId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId), index("product_images_listing_idx").on(t.listingId)],
);

/* ============================== C2C DESAPEGO ============================== */

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    condition: varchar("condition", { length: 20 }).notNull().default("bom"), // novo | como_novo | bom | usado | desgastado
    category: varchar("category", { length: 60 }).notNull(),
    sport: varchar("sport", { length: 60 }).notNull(),
    brand: varchar("brand", { length: 80 }).notNull().default(""),
    size: varchar("size", { length: 30 }).notNull().default("Único"),
    color: varchar("color", { length: 40 }).notNull().default(""),
    quantity: integer("quantity").notNull().default(1),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    city: varchar("city", { length: 80 }).notNull().default(""),
    state: varchar("state", { length: 2 }).notNull().default(""),
    status: varchar("status", { length: 20 }).notNull().default("published"), // draft | pending | published | paused | sold | removed | rejected
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("listings_seller_idx").on(t.sellerId),
    index("listings_sport_idx").on(t.sport),
    index("listings_status_idx").on(t.status),
  ],
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================== COMPRA ============================== */

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "cascade" }),
    size: varchar("size", { length: 20 }).notNull().default("Único"),
    qty: integer("qty").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cart_unique_product").on(t.userId, t.productId, t.size),
    uniqueIndex("cart_unique_listing").on(t.userId, t.listingId, t.size),
  ],
);

export const wishlist = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("wishlist_unique_product").on(t.userId, t.productId),
    uniqueIndex("wishlist_unique_listing").on(t.userId, t.listingId),
  ],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 24 }).notNull().unique(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("Confirmado"),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull().default("pix"),
  address: text("address").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
  name: varchar("name", { length: 180 }).notNull(),
  image: text("image").notNull().default(""),
  size: varchar("size", { length: 20 }).notNull().default("Único"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  qty: integer("qty").notNull(),
});

/* ============================== SOCIAL / COMUNIDADES ============================== */

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sport: varchar("sport", { length: 60 }).notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikes = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("post_likes_unique").on(t.postId, t.userId)],
);

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: integer("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("follows_unique").on(t.followerId, t.followingId)],
);

export const communities = pgTable(
  "communities",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description").notNull().default(""),
    image: text("image").notNull().default(""),
    category: varchar("category", { length: 60 }).notNull().default("Multi-esportes"),
    memberCount: integer("member_count").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("communities_owner_idx").on(t.ownerId)],
);

/* ============================== COACHING ============================== */

export const coachServices = pgTable("coach_services", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  modality: varchar("modality", { length: 60 }).notNull(),
  description: text("description").notNull(),
  pricePerSession: integer("price_per_session").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").notNull().references(() => coachServices.id, { onDelete: "cascade" }),
  coachId: integer("coach_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledFor: varchar("scheduled_for", { length: 40 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("Confirmado"),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================== NOTÍCIAS ============================== */

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  sport: varchar("sport", { length: 60 }).notNull(),
  image: text("image").notNull(),
  source: varchar("source", { length: 80 }).notNull().default("CoreMotion News"),
  featured: boolean("featured").notNull().default(false),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

/* ============================== SCANNER ============================== */

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 40 }).notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  matched: boolean("matched").notNull().default(false),
  aiInsight: text("ai_insight").notNull().default(""),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
});

/* ============================== MODERAÇÃO / ADMIN ============================== */

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "set null" }),
  targetType: varchar("target_type", { length: 30 }).notNull(),
  targetId: integer("target_id").notNull(),
  reason: varchar("reason", { length: 80 }).notNull(),
  description: text("description").notNull().default(""),
  details: text("details").notNull().default(""),
  status: varchar("status", { length: 30 }).notNull().default("pending"), // pending | reviewing | resolved | dismissed
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolution: text("resolution").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 80 }).notNull(),
  targetType: varchar("target_type", { length: 40 }).notNull().default(""),
  targetId: integer("target_id"),
  reason: text("reason").notNull().default(""),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  details: text("details").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ============================== NOTIFICAÇÕES ============================== */

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 40 }).notNull(), // verification_approved | verification_rejected | report_resolved | order_received | etc
    title: varchar("title", { length: 160 }).notNull(),
    message: text("message").notNull(),
    link: text("link").notNull().default(""),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId), index("notifications_read_idx").on(t.read)],
);

/* ============================== CONFIG PLATAFORMA ============================== */

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  description: text("description").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
