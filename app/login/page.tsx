import Link from "next/link";

import LoginForm from "./LoginForm";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <main className="full-width-section min-h-screen bg-transparent py-16 text-[#1A1A1A]">
      <div className="main-content">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-medium">Log in</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/70">
            We’ll email you a magic link to sign in.
          </p>

          {error === "auth" ? (
            <p className="mt-4 text-sm text-red-700">Sign-in failed. Try again.</p>
          ) : null}

          <div className="mt-8">
            <LoginForm />
          </div>

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
