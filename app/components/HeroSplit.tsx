import Image from "next/image";

import { toAllCapsNoAccents } from "@/lib/invitationDisplay";

type HeroSplitProps = {
  kicker: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
};

/** Soft radius on TL, TR, BL; sharp BR — matches hero reference. */
const imageMaskClass =
  "rounded-tl-[clamp(72px,12vw,200px)] rounded-tr-[clamp(72px,12vw,200px)] rounded-br-none rounded-bl-[clamp(72px,12vw,200px)]";

export default function HeroSplit({
  kicker,
  title,
  subtitle,
  imageSrc,
  imageAlt,
}: HeroSplitProps) {
  return (
    <section
      aria-label="Invitation hero"
      className="w-[calc(100%+2*var(--invite-gutter,12px))] max-w-none -mx-[var(--invite-gutter,12px)]"
    >
      <div className="flex w-full flex-col bg-[#181818] lg:h-[clamp(360px,38vw,560px)] lg:flex-row lg:items-center lg:gap-x-8">
        <div className="relative flex items-center justify-start pb-8 pl-0 pr-0 pt-14 lg:w-[48%] lg:pb-0 lg:pt-0">
          <div
            className={`relative h-[clamp(280px,34.72vw,500px)] w-[clamp(280px,34.72vw,500px)] shrink-0 overflow-hidden bg-[#181818] ring-1 ring-[#FCFCF6]/10 ${imageMaskClass}`}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 33vw, 80vw"
              className="object-cover object-center grayscale saturate-75"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-[var(--invite-gutter,12px)] py-14 text-[#FCFCF6] lg:py-16 lg:pl-0 lg:pr-[var(--invite-gutter,12px)]">
          <p
            className="max-w-xl text-[54px] leading-[1.12] text-[#FCFCF6]/90"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {`${kicker} ${title} ${subtitle}`}
          </p>

          <a
            href="#rsvp"
            className="mt-10 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FCFCF6]/75 transition-colors hover:text-[#FCFCF6]"
          >
            <span aria-hidden="true" className="text-base leading-none text-[#FCFCF6]/70">
              ↓
            </span>
            {toAllCapsNoAccents("Kindly Respond Below")}
          </a>
        </div>
      </div>
    </section>
  );
}
