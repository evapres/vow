"use server";

import { revalidatePath } from "next/cache";

/** Called after a guest saves an RSVP so the host dashboard shows fresh data. */
export async function revalidateWeddingDashboard(weddingId: string) {
  const id = weddingId.trim();
  if (!id) return;
  revalidatePath(`/dashboard/${id}`);
}
