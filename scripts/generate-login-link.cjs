/**
 * Local dev only — bypasses Supabase “too many emails” when you must sign in as YOUR user.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (never commit or expose this script in production).
 *
 *   npm run dev:login-link -- you@example.com
 *
 * Prints a one-time magic link and (if available) the 6-digit code for /login.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const repoRoot = path.join(__dirname, "..");
const envPath = path.join(repoRoot, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local in project root.");
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function main() {
  const email = process.argv[2]?.trim();
  const next = process.argv[3]?.trim() || "/admin/invitations";

  if (!email) {
    console.error("Usage: npm run dev:login-link -- <your-email> [next-path]");
    console.error("Example: npm run dev:login-link -- you@gmail.com");
    process.exit(1);
  }

  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const siteUrl = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim().replace(/\/$/, "");

  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("generateLink failed:", error.message);
    process.exit(1);
  }

  const props = data?.properties ?? {};

  console.log("\n--- Sign in as", email, "---\n");

  if (props.email_otp) {
    console.log("6-digit code (paste on http://localhost:3000/login):");
    console.log(" ", props.email_otp);
    console.log("");
  }

  if (props.action_link) {
    console.log("Magic link (open in your browser while npm run dev is running on :3000):");
    console.log(props.action_link);
    console.log("");
  } else {
    console.log("No action_link returned. Check Supabase Auth settings for this user.");
  }

  console.log("Redirect after login:", next);
  console.log("");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
