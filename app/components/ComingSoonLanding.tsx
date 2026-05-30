import InvitationFrame from "@/app/components/InvitationFrame";
import { invitationPageCanvasMonochromeStyle } from "@/app/components/invitationDarkBandStyle";

export default function ComingSoonLanding() {
  return (
    <InvitationFrame includeInviteGutter={false} canvasStyle={invitationPageCanvasMonochromeStyle}>
      <div className="m3-admin-form flex min-h-[min(100vh,720px)] flex-col items-center justify-center bg-transparent py-16 text-center font-sans text-[var(--m3-on-background)]">
        <div className="mx-auto w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG wordmark */}
          <img
            src="/vow-footer-logo.svg"
            alt="Vow"
            className="h-[52px] w-auto drop-shadow-sm contrast-110 saturate-110 sm:h-[64px] md:h-[72px]"
            width={160}
            height={72}
            decoding="async"
          />
        </div>

        <p
          className="mt-4 font-serif text-[11px] font-normal uppercase tracking-[0.2em] text-[#AE9B91] sm:mt-5 sm:text-[13px] sm:tracking-[0.24em]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          PRIVATE MODERN LOVE
        </p>

        <h1 className="m3-page-title mt-12 text-[var(--m3-on-surface)] sm:mt-14">Coming soon</h1>
      </div>
    </InvitationFrame>
  );
}
