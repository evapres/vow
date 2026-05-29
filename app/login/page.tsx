import Link from "next/link";
import { Suspense } from "react";

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
    <main className="full-width-section app-shell-canvas min-h-screen py-16 text-[#1A1A1A]">
      <div className="main-content">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-medium">Log in</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/70">
            Enter your email and we&apos;ll send a magic link. No password required.
          </p>

          {errorMessage ? (
            <p className="mt-4 text-sm leading-relaxed text-red-700">{errorMessage}</p>
          ) : null}

          {returnPath ? (
            <p className="mt-4 text-sm text-[#1A1A1A]/70">
              After sign-in you will return to your dashboard.
            </p>
          ) : null}

          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-[#1A1A1A]/70">Loading…</p>}>
              <LoginForm />
            </Suspense>
          </div>

          <LoginEmailHelp />

          <p className="mt-8 text-sm">
            <Link href="/" className="text-[#1A1A1A]/80 underline underline-offset-4 hover:text-[#1A1A1A]">
              Back to site
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
