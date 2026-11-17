import { NextResponse } from "next/server";
import { getEmployee } from "@/lib/github";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{serial:string}> }) {
  const { serial } = await params;
  if (!/^[A-Za-z0-9-]{3,80}$/.test(serial)) {
    return NextResponse.json({ error:"Invalid verification number" }, { status:400 });
  }
  try {
    const record = await getEmployee(serial);
    if (!record) return NextResponse.json({ error:"No employee record matches this verification number" }, { status:404 });
    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify this record";
    return NextResponse.json({ error:message }, { status:502 });
  }
}
