import { toAllCapsNoAccents } from "@/lib/invitationDisplay";

type HeaderProps = {
  coupleNames: string;
  eventDate: string;
  location: string;
};

function monogramInitials(coupleNames: string): { left: string; right: string } | null {
  const parts = coupleNames.split("&").map((p) => p.trim());
  const left = parts[0]?.[0] ?? "";
  const right = parts[1]?.[0] ?? "";
  if (!left || !right) return null;
  return { left: toAllCapsNoAccents(left), right: toAllCapsNoAccents(right) };
}

export default function Header({ coupleNames, eventDate, location }: HeaderProps) {
  const initials = monogramInitials(coupleNames);

  return (
    <header className="bg-[#FCFCF6] text-[#181818]">
      <div className="w-full">
        <div className="w-full">
          <div className="flex flex-col items-center">
            <div className="flex w-full justify-center pt-8 sm:pt-10">
              <h1
                className="flex items-end justify-center gap-1 font-normal tracking-normal text-[#181818]/85 sm:gap-1.5"
                style={{
                  fontFamily: "var(--font-heading)",
                }}
              >
                {initials ? (
                  <>
                    <span className="text-[64px] leading-none">{initials.left}</span>
                    <span className="text-[32px] leading-none">&</span>
                    <span className="text-[64px] leading-none">{initials.right}</span>
                  </>
                ) : (
                  <span className="text-[64px] leading-none">{coupleNames}</span>
                )}
              </h1>
            </div>

            <div className="w-full py-4">
              <div className="h-px w-full bg-[#181818]/20" />
            </div>

            <div className="flex w-full items-center justify-between pb-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#181818]/80">
                {toAllCapsNoAccents(eventDate)}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#181818]/80">
                {toAllCapsNoAccents(location)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

