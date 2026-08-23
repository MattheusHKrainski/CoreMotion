"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleLikeAction,
  addCommentAction,
  type ActionState,
} from "@/app/actions";
import Avatar from "@/components/Avatar";
import {
  IconHeart,
  IconHeartFilled,
  IconComment,
  IconShare,
} from "@/components/Icons";

type C = {
  id: number;
  content: string;
  authorName: string;
  authorAvatar: string;
  when: string;
};

const initial: ActionState = {};

export default function PostActions({
  postId,
  likes,
  commentCount,
  liked,
  isLogged,
  comments,
}: {
  postId: number;
  likes: number;
  commentCount: number;
  liked: boolean;
  isLogged: boolean;
  comments: C[];
}) {
  const router = useRouter();
  const [optLiked, setOptLiked] = useState(liked);
  const [optLikes, setOptLikes] = useState(likes);
  const [open, setOpen] = useState(false);
  const [, startLike] = useTransition();
  const [state, formAction, pending] = useActionState(addCommentAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  function handleLike() {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    setOptLiked((v) => !v);
    setOptLikes((n) => (optLiked ? n - 1 : n + 1));
    startLike(async () => {
      await toggleLikeAction(postId);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-5 text-sm text-slate-500">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition ${
            optLiked ? "text-red-600" : "hover:text-red-600"
          }`}
        >
          {optLiked ? (
            <IconHeartFilled width={18} height={18} />
          ) : (
            <IconHeart width={18} height={18} />
          )}
          <span className="font-semibold">{optLikes}</span>
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 hover:text-slate-900"
        >
          <IconComment width={18} height={18} />
          <span className="font-semibold">{commentCount}</span>
        </button>
        <button className="ml-auto flex items-center gap-1.5 text-xs font-bold hover:text-red-600">
          <IconShare width={15} height={15} /> Compartilhar
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar src={c.authorAvatar} name={c.authorName} size={30} />
              <div className="flex-1 min-w-0 bg-slate-50 rounded-2xl px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">{c.authorName}</span>
                  <span className="text-[10px] text-slate-400">{c.when}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-2">
              Nenhum comentário ainda. Seja o primeiro.
            </div>
          )}

          {isLogged ? (
            <form ref={formRef} action={formAction} className="flex gap-2">
              <input type="hidden" name="postId" value={postId} />
              <input
                name="content"
                required
                placeholder="Escreva um comentário..."
                className="flex-1 min-w-0 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
              />
              <button
                disabled={pending}
                className="bg-slate-900 hover:bg-red-600 disabled:bg-slate-300 text-white font-bold text-xs px-4 rounded-full shrink-0"
              >
                Enviar
              </button>
            </form>
          ) : (
            <div className="text-xs text-slate-500 text-center">
              Entre na sua conta para comentar.
            </div>
          )}
        </div>
      )}
    </>
  );
}
