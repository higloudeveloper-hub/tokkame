import { activeSub, canViewPost, findUserById, isDropLocked, isFollowing, toPublic } from "./store";
import type { DB, Post, User } from "./types";

export function presentPost(db: DB, post: Post, viewer: User | null) {
  const creator = findUserById(db, post.creatorId);
  if (!creator) return null;
  const remix = post.remixOf ? db.posts.find((item) => item.id === post.remixOf) : null;
  const remixCreator = remix ? findUserById(db, remix.creatorId) : null;
  const visible = canViewPost(db, viewer, post);
  let lock: "login" | "circle" | "tier" | "ppv" | "drop" | null = null;
  if (!visible) {
    if (isDropLocked(post)) lock = "drop";
    else if (!viewer) lock = "login";
    else if (post.visibility === "ppv") lock = "ppv";
    else {
      const sub = activeSub(db, viewer.id, post.creatorId);
      lock = sub ? "tier" : "circle";
    }
  }
  return {
    post,
    creator: toPublic(creator),
    visible,
    lock,
    liked: viewer ? post.likes.includes(viewer.id) : false,
    remixUsername: remixCreator?.username ?? null,
    following: isFollowing(db, viewer?.id, creator.id),
    subscribed: viewer ? Boolean(activeSub(db, viewer.id, creator.id)) : false,
    comments: post.comments.slice(-3).map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      username: findUserById(db, comment.userId)?.username ?? "usuario",
    })),
  };
}

export type PresentedPost = NonNullable<ReturnType<typeof presentPost>>;
