"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import M3FilledTextField from "@/app/components/m3/M3FilledTextField";
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

  function resetStatusForNewAttempt() {
    setStatus("idle");
    setMessage(null);
    setDevLink(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage(null);
    setDevLink(null);

    const redirectTo = buildAuthCallbackUrl(nextPath);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
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
        ? `Email sent to ${trimmed}. The link should return to ${redirectTo}. If the email still opens thevow.vip, Supabase ignored localhost — use “Get local login link” below instead.`
        : `Email sent to ${trimmed}. Check your inbox (and spam). Open the newest link once in this browser. You can request another link below if needed.`,
    );
  }

  async function handleDevLink() {
    setDevLinkLoading(true);
    setDevLink(null);
    const redirectTo = buildAuthCallbackUrl(nextPath);
    const result = await generateDevLoginLink(email, redirectTo);
    setDevLinkLoading(false);
    if (!result.ok) {
      setStatus("error");
      setMessage(result.error);
      return;
    }
    setDevLink(result.link);
    setStatus("sent");
    setMessage(`Local login link (opens ${redirectTo}):`);
  }

  const messageBannerClass =
    status === "error"
      ? "m3-banner m3-banner--error"
      : status === "sent"
        ? "m3-banner m3-banner--success"
        : "m3-banner m3-banner--info";

  const submitLabel =
    status === "loading" ? "Sending…" : status === "sent" ? "Send another link" : "Send magic link";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <M3FilledTextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "sent" || status === "error") resetStatusForNewAttempt();
        }}
        disabled={status === "loading"}
      />

      <div className="m3-form-actions pt-0">
        <div className="m3-form-actions__secondary w-full">
          <button
            type="submit"
            className="m3-btn m3-btn--filled m3-btn--block"
            disabled={status === "loading" || !email.trim()}
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {showDevLogin ? (
        <button
          type="button"
          disabled={!email.trim() || devLinkLoading || status === "loading"}
          onClick={() => void handleDevLink()}
          className="m3-btn m3-btn--text"
        >
          {devLinkLoading ? "Generating…" : "Get local login link (no email)"}
        </button>
      ) : null}

      {devLink ? (
        <p className="m3-field-support break-all">
          <a
            href={devLink}
            className="font-medium text-[var(--m3-primary)] underline underline-offset-4 hover:opacity-80"
          >
            Open sign-in link
          </a>
        </p>
      ) : null}

      {message ? (
        <div className={messageBannerClass} role={status === "error" ? "alert" : "status"}>
          <p className="m3-banner__detail">{message}</p>
        </div>
      ) : null}
    </form>
  );
}
