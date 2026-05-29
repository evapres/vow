"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import SolidSilkButton from "@/app/components/SolidSilkButton";
import { buildAuthCallbackUrl } from "@/lib/auth/authCallbackUrl";
import { mapSignInEmailError } from "@/lib/auth/signInEmail";
import { createClient } from "@/lib/supabase/client";

import { generateDevLoginLink } from "./dev-login-action";

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [devLinkLoading, setDevLinkLoading] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);

  useEffect(() => {
    setShowDevLogin(isLocalDevHost());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    setDevLink(null);

    const redirectTo = buildAuthCallbackUrl(nextPath);
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
      showDevLogin
        ? `Email sent. The link should return to ${redirectTo}. If the email still opens thevow.vip, Supabase ignored localhost — use “Get local login link” below instead.`
        : "Check your email for the login link. Open it once in this same browser.",
    );
  }

  async function handleDevLink() {
    setDevLinkLoading(true);
    setDevLink(null);
    const redirectTo = buildAuthCallbackUrl(nextPath);
    const result = await generateDevLoginLink(email, redirectTo);
    setDevLinkLoading(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setDevLink(result.link);
    setMessage(`Local login link (opens ${redirectTo}):`);
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

      {showDevLogin ? (
        <button
          type="button"
          disabled={!email.trim() || devLinkLoading}
          onClick={() => void handleDevLink()}
          className="text-sm text-[#1A1A1A]/75 underline underline-offset-4 hover:text-[#1A1A1A] disabled:opacity-50"
        >
          {devLinkLoading ? "Generating…" : "Get local login link (no email)"}
        </button>
      ) : null}

      {devLink ? (
        <p className="break-all text-sm">
          <a href={devLink} className="text-[#1A1A1A] underline underline-offset-4">
            Open sign-in link
          </a>
        </p>
      ) : null}

      {message ? <p className="text-sm leading-relaxed text-[#1A1A1A]/80">{message}</p> : null}
    </form>
  );
}
