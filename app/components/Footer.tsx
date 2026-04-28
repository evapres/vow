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
        <p
          className="mt-4 font-serif text-[18px] font-normal uppercase tracking-[2px] text-[#AE9B91]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          PRIVATE MODERN LOVE
        </p>
      </div>
    </footer>
  );
}

