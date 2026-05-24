import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { safeAuthNextPath } from "@/lib/auth/authCallbackUrl";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const safeNext = safeAuthNextPath(searchParams.get("next"));

  const authError = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  if (authError || errorCode) {
    const code = errorCode ?? authError ?? "auth";
    const next = searchParams.get("next");
    const loginUrl = new URL(`${origin}/login`);
    loginUrl.searchParams.set("error", code);
    if (next) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl.toString());
  }

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(loginRedirectWithNext(origin, searchParams.get("next"), "auth"));
  }

  const successUrl = `${origin}${safeNext}`;
  let response = NextResponse.redirect(successUrl);
  const supabase = createRouteHandlerClient(request, response);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginError = isExpiredAuthError(error.message) ? "otp_expired" : "auth";
      const loginUrl = loginRedirectWithNext(origin, searchParams.get("next"), loginError);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash!,
    type: type as EmailOtpType,
  });
  if (error) {
    const loginError = isExpiredAuthError(error.message) ? "otp_expired" : "auth";
    return NextResponse.redirect(loginRedirectWithNext(origin, searchParams.get("next"), loginError));
  }
  return response;
}

function loginRedirectWithNext(origin: string, next: string | null, errorCode: string): string {
  const loginUrl = new URL(`${origin}/login`);
  loginUrl.searchParams.set("error", errorCode);
  if (next) loginUrl.searchParams.set("next", next);
  return loginUrl.toString();
}

function isExpiredAuthError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("expired") ||
    lower.includes("invalid") ||
    lower.includes("already been used")
  );
}
