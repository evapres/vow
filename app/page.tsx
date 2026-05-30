import type { Metadata } from "next";

import ComingSoonLanding from "./components/ComingSoonLanding";

export const metadata: Metadata = {
  title: "Vow — Coming soon",
  description: "Private modern love. Wedding invitations, coming soon.",
};

export default function Page() {
  return <ComingSoonLanding />;
}
