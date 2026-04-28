import { toAllCapsNoAccents } from "@/lib/invitationDisplay";

type EditorialDetailsProps = {
  coupleNames: string;
  dateTime: string;
  location: string;
};

function splitCoupleNames(coupleNames: string) {
  const parts = coupleNames.split("&").map((p) => p.trim());
  const left = parts[0] ?? "";
  const right = parts[1] ?? "";
  return { left, right };
}

export default function EditorialDetails({
  coupleNames,
  dateTime,
  location,
}: EditorialDetailsProps) {
  const { left, right } = splitCoupleNames(coupleNames);

  return (
    <section id="details" aria-label="Invitation details" className="bg-[#FCFCF6] text-[#181818]">
      <div className="w-full pt-8 pb-14">
        <div className="w-full">
          <div className="h-px w-full bg-[#181818]/20" />

          <div className="mt-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#181818]/60">
              CELEBRATE WITH
            </p>

            <div
              className="mt-3 text-left text-[56px] font-normal leading-[0.95] tracking-[0.02em]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              <div>{toAllCapsNoAccents(left)}</div>
              <div className="-mt-1">&</div>
              <div>{toAllCapsNoAccents(right)}</div>
            </div>

            <div className="mt-6 text-[14px] font-normal leading-6 text-[#181818]/75">{dateTime}</div>
            <div className="mt-1 text-[14px] font-normal leading-6 text-[#181818]/75">{location}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

