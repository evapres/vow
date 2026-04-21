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
          <p
            className="text-[26px] font-normal tracking-[0.28em] text-[#2a2620]/90"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            VOW
          </p>
          <p className="mt-4 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#181818]/45">
            PRIVATE MODERN LOVE
          </p>
        </div>
      </div>
    </footer>
  );
}

