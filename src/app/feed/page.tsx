import Link from "next/link";
import { db } from "@/db";
import { posts, users, postLikes, postComments } from "@/db/schema";
import { desc, eq, and, inArray, SQL } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import Composer from "./Composer";
import PostActions from "./PostActions";
import { IconVerified } from "@/components/Icons";

export const dynamic = "force-dynamic";

const SPORTS = [
  "Todos",
  "Corrida",
  "Futebol",
  "Basquete",
  "Vôlei",
  "Jiu-Jitsu",
  "Surf",
  "Multi-esportes",
];

function timeAgo(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  await ensureSeed();
  const { sport } = await searchParams;
  const me = await getCurrentUser();

  const wheres: SQL[] = [];
  if (sport && sport !== "Todos") wheres.push(eq(posts.sport, sport));

  const rows = await db
    .select({
      id: posts.id,
      content: posts.content,
      sport: posts.sport,
      likes: posts.likes,
      comments: posts.comments,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorHandle: users.handle,
      authorAvatar: users.avatar,
      authorRole: users.role,
      authorVerified: users.verified,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(wheres.length ? and(...wheres) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(40);

  const ids = rows.map((r) => r.id);

  const [myLikes, allComments] = await Promise.all([
    me && ids.length
      ? db
          .select({ postId: postLikes.postId })
          .from(postLikes)
          .where(and(eq(postLikes.userId, me.id), inArray(postLikes.postId, ids)))
      : Promise.resolve([]),
    ids.length
      ? db
          .select({
            id: postComments.id,
            postId: postComments.postId,
            content: postComments.content,
            createdAt: postComments.createdAt,
            authorName: users.name,
            authorAvatar: users.avatar,
          })
          .from(postComments)
          .innerJoin(users, eq(postComments.userId, users.id))
          .where(inArray(postComments.postId, ids))
          .orderBy(desc(postComments.createdAt))
      : Promise.resolve([]),
  ]);

  const likedSet = new Set(myLikes.map((l) => l.postId));

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Comunidade
      </h1>
      <p className="text-slate-500 text-sm">
        Compartilhe treinos, ache parceiros e organize amistosos.
      </p>

      <div className="mt-5">
        <Composer isLogged={!!me} avatar={me?.avatar} name={me?.name} />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {SPORTS.map((s) => {
          const active = (sport ?? "Todos") === s;
          return (
            <Link
              key={s}
              href={s === "Todos" ? "/feed" : `/feed?sport=${encodeURIComponent(s)}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                active
                  ? "bg-red-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-red-300"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((p) => {
          const pComments = allComments.filter((c) => c.postId === p.id);
          return (
            <article
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 p-5"
            >
              <header className="flex items-center gap-3">
                <Avatar src={p.authorAvatar} name={p.authorName} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold truncate">{p.authorName}</span>
                    {p.authorVerified && (
                      <IconVerified
                        width={14}
                        height={14}
                        className="text-blue-500 shrink-0"
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.authorRole === "coach" ? "Treinador" : "Atleta"} ·{" "}
                    {timeAgo(p.createdAt)}
                  </div>
                </div>
                <Link
                  href={`/feed?sport=${encodeURIComponent(p.sport)}`}
                  className="text-[10px] bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0"
                >
                  {p.sport}
                </Link>
              </header>

              <p className="mt-3 leading-relaxed text-slate-800 whitespace-pre-line">
                {p.content}
              </p>

              <PostActions
                postId={p.id}
                likes={p.likes}
                commentCount={p.comments}
                liked={likedSet.has(p.id)}
                isLogged={!!me}
                comments={pComments.map((c) => ({
                  id: c.id,
                  content: c.content,
                  authorName: c.authorName,
                  authorAvatar: c.authorAvatar,
                  when: timeAgo(c.createdAt),
                }))}
              />
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-100">
            Nenhum post neste esporte ainda. Seja o primeiro!
          </div>
        )}
      </div>
    </div>
  );
}
