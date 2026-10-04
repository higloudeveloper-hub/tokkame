import { redirect } from "next/navigation";

export default async function CallPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  redirect(`/creator/${username}?tab=premium`);
}
