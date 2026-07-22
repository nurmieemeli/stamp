import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { AVATAR_DIR, isValidAvatarFilename } from "@/lib/avatar-storage";

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!isValidAvatarFilename(filename)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const data = await readFile(path.join(AVATAR_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
