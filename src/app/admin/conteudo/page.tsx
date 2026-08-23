import { db } from "@/db";
import { posts, users, reviews, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  adminDeletePostAction,
  adminDeleteReviewAction,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [postList, reviewList] = await Promise.all([
    db
      .select({
        id: posts.id,
        content: posts.content,
        sport: posts.sport,
        likes: posts.likes,
        createdAt: posts.createdAt,
        authorName: users.name,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(30),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        authorName: reviews.authorName,
        createdAt: reviews.createdAt,
        productName: products.name,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Conteúdo</h1>
        <p className="text-sm text-slate-500">
          Modere posts da comunidade e avaliações de produtos.
        </p>
      </div>

      <section>
        <h2 className="font-black mb-3">Posts recentes</h2>
        <div className="space-y-2">
          {postList.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">
                  <strong>{p.authorName}</strong> · {p.sport} · {p.likes} likes
                </div>
                <p className="text-sm mt-1 line-clamp-2">{p.content}</p>
              </div>
              <form action={adminDeletePostAction}>
                <input type="hidden" name="postId" value={p.id} />
                <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white shrink-0">
                  Excluir
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-black mb-3">Avaliações</h2>
        <div className="space-y-2">
          {reviewList.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">
                  <strong>{r.authorName}</strong> · {r.rating}★ ·{" "}
                  {r.productName}
                </div>
                <p className="text-sm mt-1 line-clamp-2">{r.comment}</p>
              </div>
              <form action={adminDeleteReviewAction}>
                <input type="hidden" name="reviewId" value={r.id} />
                <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white shrink-0">
                  Excluir
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
