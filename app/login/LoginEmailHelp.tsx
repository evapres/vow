export default function LoginEmailHelp() {
  return (
    <details className="mt-8 border border-[#1A1A1A]/15 bg-[#1A1A1A]/[0.02] px-4 py-3 text-sm text-[#1A1A1A]/75">
      <summary className="cursor-pointer font-medium text-[#1A1A1A]/85">
        Email link still shows otp_expired?
      </summary>
      <div className="mt-3 space-y-4 leading-relaxed">
        <p>
          Your email button points at Supabase with{" "}
          <code className="text-xs">redirect_to=%20https://thevow.vip</code> — a{" "}
          <span className="font-medium">leading space</span> and{" "}
          <span className="font-medium">no /auth/callback</span>. The app cannot fix that from code;
          fix Supabase, then change the email template below.
        </p>

        <div>
          <p className="font-medium text-[#1A1A1A]/90">Step 1 — URL configuration</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              <span className="font-medium">Site URL</span> — delete the field, retype exactly{" "}
              <code className="text-xs">https://thevow.vip</code> (no spaces; do not paste from Notes).
            </li>
            <li>
              Remove any redirect URL that is only <code className="text-xs">https://thevow.vip</code> or
              has a space.
            </li>
            <li>
              Add:{" "}
              <code className="block break-all rounded bg-[#1A1A1A]/10 px-1 py-0.5 text-xs">
                https://thevow.vip/auth/callback**
              </code>
            </li>
            <li>Save, then request a new magic link.</li>
          </ol>
        </div>

        <div>
          <p className="font-medium text-[#1A1A1A]/90">
            Step 2 — Magic link template (bypasses broken verify URL)
          </p>
          <p className="mt-1 text-[#1A1A1A]/65">
            Supabase → Authentication → Emails → Templates → <span className="font-medium">Magic link</span>
            . Replace the body with:
          </p>
          <pre className="mt-2 overflow-x-auto rounded border border-[#1A1A1A]/15 bg-[#1A1A1A]/[0.04] p-3 text-xs leading-relaxed">
{`<h2>Sign in to Vow</h2>
<p><a href="https://thevow.vip/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=%2Fadmin%2Finvitations">Sign in</a></p>
<p>This link expires in about an hour. Open it once.</p>`}
          </pre>
          <p className="mt-2 text-[#1A1A1A]/65">
            The button should go to <code className="text-xs">thevow.vip/auth/callback</code>, not{" "}
            <code className="text-xs">supabase.co/auth/v1/verify</code>. For localhost, use{" "}
            <code className="text-xs">http://localhost:3000/auth/callback?token_hash=...</code> in the
            template while testing locally.
          </p>
        </div>
      </div>
    </details>
  );
}
