import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "./mongodb";

/**
 * Media storage in the SAME MongoDB Atlas database (GridFS bucket "media"),
 * so uploaded photos and video clips live with the property data — no extra
 * service or credentials beyond MONGODB_URI. Files are served publicly via
 * /api/media/<id>, and that URL is what gets stored on the listing so the
 * website and the AI consultant both see the media immediately.
 */
export const MEDIA_BUCKET = "media";

async function bucket(): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: MEDIA_BUCKET });
}

/** Store a file, returning the public URL to reference it by. */
export async function putMedia(
  filename: string,
  contentType: string,
  data: Buffer,
): Promise<{ id: string; url: string }> {
  const b = await bucket();
  const id: string = await new Promise((resolve, reject) => {
    const up = b.openUploadStream(filename, { metadata: { contentType } });
    up.on("error", reject);
    up.on("finish", () => resolve(String(up.id)));
    up.end(data);
  });
  return { id, url: `/api/media/${id}` };
}

export interface MediaFile {
  data: Buffer;
  contentType: string;
}

/** Read a stored file back (buffered — media here is short clips / photos). */
export async function getMedia(id: string): Promise<MediaFile | null> {
  let _id: ObjectId;
  try {
    _id = new ObjectId(id);
  } catch {
    return null;
  }
  const b = await bucket();
  const files = await b.find({ _id }).limit(1).toArray();
  if (files.length === 0) return null;
  const chunks: Buffer[] = [];
  for await (const chunk of b.openDownloadStream(_id)) {
    chunks.push(chunk as Buffer);
  }
  const contentType =
    (files[0].metadata as { contentType?: string } | undefined)?.contentType ??
    "application/octet-stream";
  return {
    data: Buffer.concat(chunks),
    contentType,
  };
}
