import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, ne, and, desc, sql } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { IconArrowLeft, IconClock, IconEye, IconShare } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureSeed();
  const { slug } = await params;

  const [article] = await db
    .select()
    .from(news)
    .where(eq(news.slug, slug))
    .limit(1);
  if (!article) notFound();

  await db
    .update(news)
    .set({ views: sql`${news.views} + 1` })
    .where(eq(news.id, article.id));

  const related = await db
    .select()
    .from(news)
    .where(and(eq(news.sport, article.sport), ne(news.id, article.id)))
    .orderBy(desc(news.publishedAt))
    .limit(3);

  const paragraphs = article.body.split("\n\n").filter(Boolean);

  return (
    <article className="max-w-3xl mx-auto p-4 md:p-8">
      <Link
        href="/noticias"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600"
      >
        <IconArrowLeft width={16} height={16} /> Todas as notícias
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
          {article.sport}
        </span>
        <span className="text-xs text-slate-500">{article.source}</span>
      </div>

      <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
        {article.title}
      </h1>

      <p className="mt-4 text-lg text-slate-600 leading-relaxed">
        {article.excerpt}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 pb-5 border-b border-slate-200">
        <span className="flex items-center gap-1">
          <IconClock width={13} height={13} />
          {new Date(article.publishedAt).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
        <span className="flex items-center gap-1">
          <IconEye width={13} height={13} />
          {(article.views + 1).toLocaleString("pt-BR")} leituras
        </span>
        <button className="ml-auto flex items-center gap-1.5 font-bold hover:text-red-600">
          <IconShare width={14} height={14} /> Compartilhar
        </button>
      </div>

      <div className="mt-6 rounded-2xl overflow-hidden bg-slate-100 aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-7 space-y-5">
        {paragraphs.map((p, i) => {
          if (p.startsWith("**") && p.endsWith("**"))
            return (
              <h2 key={i} className="text-xl md:text-2xl font-black pt-2">
                {p.replace(/\*\*/g, "")}
              </h2>
            );
          return (
            <p key={i} className="text-slate-800 leading-[1.8] text-[17px]">
              {p}
            </p>
          );
        })}
      </div>

      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-black mb-4">
            Mais sobre {article.sport}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/noticias/${r.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition"
              >
                <div className="aspect-[16/10] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:text-red-600 transition">
                    {r.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
