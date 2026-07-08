import { getMedia } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Publicly serve an uploaded photo/video from GridFS (referenced on listings). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const media = await getMedia(params.id);
    if (!media) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
