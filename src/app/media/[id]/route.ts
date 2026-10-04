import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { canViewPost, readDb, uploadDir } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^media_[a-f0-9]+\.(jpg|png|webp)$/.test(id)) {
    return new Response("No encontrado", { status: 404 });
  }
  const db = readDb();
  const post = db.posts.find((item) => item.image === id || item.cover === id);
  const viewer = await getSessionUser();
  const cover = post?.cover === id;
  if (!post || (!cover && !canViewPost(db, viewer, post))) {
    return new Response("No disponible", { status: 403 });
  }
  const target = path.join(uploadDir(), path.basename(id));
  if (!fs.existsSync(target)) return new Response("No encontrado", { status: 404 });
  const type = id.endsWith(".png") ? "image/png" : id.endsWith(".webp") ? "image/webp" : "image/jpeg";
  const body = fs.readFileSync(target);
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
