/** Maps Supabase Auth errors from `signInWithOtp` to clearer login UI copy. */
export function mapSignInEmailError(
  message: string,
  redirectTo?: string,
  errorCode?: string,
): string {
  const lower = message.toLowerCase();
  const code = (errorCode ?? "").toLowerCase();

  if (
    code === "over_email_send_rate_limit" ||
    lower.includes("rate limit") ||
    lower.includes("too many")
  ) {
    return [
      "Supabase will not send another sign-in email right now (built-in mail: about 2 per hour for the whole project).",
      "No new email will arrive until that limit resets (often ~1 hour).",
      "To sign in locally without email: add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API → service_role), restart the dev server, then run: npm run dev:login-link -- your@email.com",
      "Or open a magic link from an email you already received (newest only).",
    ].join(" ");
  }

  if (lower.includes("redirect") || lower.includes("redirect_to")) {
    const hint = redirectTo
      ? ` Add this under Supabase → Authentication → URL configuration → Redirect URLs:\n${redirectTo.trim()}\n(or use a wildcard: ${redirectTo.trim().split("?")[0]}**)`
      : " Check Supabase → Authentication → URL configuration → Redirect URLs.";
    return `Sign-in redirect URL is not allowed.${hint}`;
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "New sign-ups are disabled in Supabase. Enable Email sign-in or create your user in the Supabase dashboard.";
  }

  if (lower.includes("email") && lower.includes("disabled")) {
    return "Email sign-in is turned off in Supabase. Enable it under Authentication → Providers → Email.";
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return "That email address looks invalid. Check for typos and try again.";
  }

  if (lower.includes("smtp") || lower.includes("mail")) {
    return "Supabase could not send mail (SMTP / email provider). Check Authentication → Emails in your Supabase project and Auth logs.";
  }

  return message;
}

export function assertSupabaseAuthEnv(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return "Server is missing NEXT_PUBLIC_SUPABASE_URL (.env.local). Sign-in email cannot be sent.";
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    return "Server is missing NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local). Sign-in email cannot be sent.";
  }
  return null;
}
