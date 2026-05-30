import Link from "next/link";
import { Suspense } from "react";

import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";

import LoginEmailHelp from "./LoginEmailHelp";
import LoginForm from "./LoginForm";

type PageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

function loginErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  if (error === "otp_expired") {
    return "That link is invalid. Your Supabase email is probably still using a bad redirect (see “Email link still shows otp_expired?” below). Fix Site URL + redirect URLs, update the Magic link template, then request a new email.";
  }
  if (error === "auth" || error === "access_denied") {
    return "Sign-in failed. Request a new magic link and try again.";
  }
  return "Sign-in failed. Request a new magic link and try again.";
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error, next } = await searchParams;
  const errorMessage = loginErrorMessage(error);
  const returnPath = next?.startsWith("/") && !next.startsWith("//") ? next : null;

  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-full flex-col bg-transparent font-sans text-[var(--m3-on-background)]">
        <main className="admin-shell-main mx-auto w-full max-w-md">
          <div className="mb-8 border-b border-[var(--m3-outline-variant)] pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--m3-on-surface-variant)]">
              Admin
            </p>
            <h1 className="m3-page-title mt-2">Log in</h1>
            <p className="mt-2 text-sm text-[var(--m3-on-surface-variant)]">
              Enter your email and we&apos;ll send a magic link. No password required.
            </p>
          </div>

          {errorMessage ? (
            <div className="m3-banner m3-banner--error" role="alert">
              <p className="m3-banner__detail">{errorMessage}</p>
            </div>
          ) : null}

          {returnPath ? (
            <div className="m3-banner m3-banner--info">
              <p className="m3-banner__detail">After sign-in you will return to your dashboard.</p>
            </div>
          ) : null}

          <div className="m3-form-card">
            <Suspense
              fallback={
                <p className="text-sm text-[var(--m3-on-surface-variant)]" aria-busy="true">
                  Loading…
                </p>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <LoginEmailHelp />

          <p className="mt-8">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--m3-primary)] underline underline-offset-4 hover:opacity-80"
            >
              Back to site
            </Link>
          </p>
        </main>
      </div>
    </InvitationFrame>
  );
}
