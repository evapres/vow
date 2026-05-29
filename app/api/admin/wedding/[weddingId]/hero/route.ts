import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ weddingId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { weddingId } = await context.params;
  const id = weddingId.trim();
  if (!id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("weddings")
    .select("hero_image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data?.hero_image_url) {
    return new NextResponse("Not found", { status: 404 });
  }

  const raw = data.hero_image_url.trim();

  if (raw.startsWith("data:")) {
    const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(raw);
    if (!match) {
      return new NextResponse("Invalid image data", { status: 400 });
    }
    const bytes = Buffer.from(match[2], "base64");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": match[1],
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return NextResponse.redirect(raw);
  }

  return new NextResponse("Not found", { status: 404 });
}
