"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import SolidSilkButton from "@/app/components/SolidSilkButton";
import { buildAuthCallbackUrl, resolveSignInSiteOrigin } from "@/lib/auth/authCallbackUrl";
import { mapSignInEmailError } from "@/lib/auth/signInEmail";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const redirectTo = buildAuthCallbackUrl(resolveSignInSiteOrigin(), nextPath);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(mapSignInEmailError(error.message, redirectTo, error.code));
      return;
    }

    setStatus("sent");
    setMessage(
      `Check your email for the login link. After signing in you will return to the page you requested.`,
    );
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
