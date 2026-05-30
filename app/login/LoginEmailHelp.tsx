export default function LoginEmailHelp() {
  return (
    <details className="m3-panel mt-6">
      <summary className="m3-panel__summary">Email link still shows otp_expired?</summary>
      <div className="m3-panel__body space-y-4 text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">
        <p>
          Your email button points at Supabase with{" "}
          <code className="rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
            redirect_to=%20https://thevow.vip
          </code>{" "}
          — a <span className="font-medium">leading space</span> and{" "}
          <span className="font-medium">no /auth/callback</span>. The app cannot fix that from code; fix
          Supabase, then change the email template below.
        </p>

        <div>
          <p className="font-medium text-[var(--m3-on-surface)]">Step 1 — URL configuration</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              <span className="font-medium">Site URL</span> — delete the field, retype exactly{" "}
              <code className="rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
                https://thevow.vip
              </code>{" "}
              (no spaces; do not paste from Notes).
            </li>
            <li>
              Remove any redirect URL that is only{" "}
              <code className="rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
                https://thevow.vip
              </code>{" "}
              or has a space.
            </li>
            <li>
              Add:{" "}
              <code className="mt-1 block break-all rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
                https://thevow.vip/auth/callback**
              </code>{" "}
              and for local dev{" "}
              <code className="mt-1 block break-all rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
                http://localhost:3000/**
              </code>
            </li>
            <li>
              <span className="font-medium">Local login still opens production?</span> Use{" "}
              <span className="font-medium">Get local login link (no email)</span> on the login page (needs{" "}
              <code className="rounded bg-[var(--m3-surface-container-highest)] px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              in .env.local).
            </li>
            <li>Save, then request a new magic link.</li>
          </ol>
        </div>

        <div>
          <p className="font-medium text-[var(--m3-on-surface)]">
            Step 2 — Magic link template (bypasses broken verify URL)
          </p>
          <p className="mt-1">
            Supabase → Authentication → Emails → Templates → <span className="font-medium">Magic link</span>.
            Replace the body with:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-[var(--m3-shape-corner-sm)] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-highest)] p-3 text-xs leading-relaxed text-[var(--m3-on-surface)]">
            {`<h2>Sign in to Vow</h2>
<p><a href="https://thevow.vip/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=%2Fadmin%2Finvitations">Sign in</a></p>
<p>This link expires in about an hour. Open it once.</p>`}
          </pre>
          <p className="mt-2">
            The button should go to <code className="text-xs">thevow.vip/auth/callback</code>, not{" "}
            <code className="text-xs">supabase.co/auth/v1/verify</code>. For localhost, use{" "}
            <code className="text-xs">http://localhost:3000/auth/callback?token_hash=...</code> in the template
            while testing locally.
          </p>
        </div>
      </div>
    </details>
  );
}
