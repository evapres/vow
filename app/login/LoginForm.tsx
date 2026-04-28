"use client";

import { useState } from "react";

import SolidSilkButton from "@/app/components/SolidSilkButton";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    // Prefer an explicit site URL (Vercel/prod) so magic links never point at localhost.
    const siteOrigin =
      (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin).trim();
    // Wedding id isn't available here; callback will resolve the latest wedding for this user.
    const redirectTo = `${siteOrigin}/auth/callback?next=/admin/edit`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the login link.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block text-sm">
        <span className="text-[#1A1A1A]/80">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "sent"}
          className="mt-1 w-full border border-[#1A1A1A]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]/45"
        />
      </label>
      <SolidSilkButton
        type="submit"
        disabled={status === "loading" || status === "sent"}
        wrapperClassName="h-11 w-full"
      >
        {status === "loading" ? "Sending…" : "Send magic link"}
      </SolidSilkButton>
      {message ? <p className="text-sm text-[#1A1A1A]/80">{message}</p> : null}
    </form>
  );
}
