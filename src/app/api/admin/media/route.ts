import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isMongoConfigured } from "@/lib/mongodb";
import { putMedia } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Practical cap. NOTE: hosting platforms limit serverless request bodies
// (~4.5 MB on Vercel's default tier). For larger videos, paste a hosted URL
// (YouTube/Vimeo/CDN) in the form instead of uploading.
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  if (!verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    const type = file.type || "application/octet-stream";
    if (!type.startsWith("image/") && !type.startsWith("video/")) {
      return NextResponse.json({ error: "Only image or video files are allowed." }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Upload up to 20 MB, or paste a hosted URL for large videos." },
        { status: 413 },
      );
    }
    const { url } = await putMedia(file.name || "upload", type, buf);
    return NextResponse.json({ ok: true, url, kind: type.startsWith("video/") ? "video" : "image" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
