import { redirect } from "next/navigation";

export default async function VerifyLookup({ searchParams }: { searchParams: Promise<{serial?:string}> }) {
  const { serial } = await searchParams;
  if (!serial || !/^[A-Za-z0-9-]{3,80}$/.test(serial)) redirect("/");
  redirect(`/verify/${encodeURIComponent(serial)}`);
}
