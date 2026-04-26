type FooterProps = {
  coupleNames: string;
  year: string;
};

const footerBleed =
  "w-[calc(100%+2*var(--invite-gutter,12px))] max-w-none -mx-[var(--invite-gutter,12px)]";

export default function Footer({ coupleNames: _coupleNames, year: _year }: FooterProps) {
  return (
    <footer className={`${footerBleed} bg-transparent`}>
      <div className="w-full bg-transparent px-[var(--invite-gutter,12px)] pt-14 pb-12 text-center">
        <div className="mx-auto h-px w-full max-w-sm bg-[#181818]/18" />

        <div className="pt-8">
          <div className="mx-auto w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG wordmark */}
            <img
              src="/vow-footer-logo.svg"
              alt="Vow"
              className="h-[72px] w-auto drop-shadow-sm contrast-110 saturate-110"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="mt-4 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#181818]/45">
            PRIVATE MODERN LOVE
          </p>
        </div>
      </div>
    </footer>
  );
}

