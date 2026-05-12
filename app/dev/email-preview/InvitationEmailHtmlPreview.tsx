type InvitationEmailHtmlPreviewProps = {
  /** Full-document URL (same HTML as Resend) so layout matches real email clients. */
  embedSrc: string;
};

export default function InvitationEmailHtmlPreview({ embedSrc }: InvitationEmailHtmlPreviewProps) {
  return (
    <section className="mt-8 border border-[#181818]/20 bg-white shadow-sm">
      <div className="border-b border-[#181818]/15 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/55">Rendered HTML</p>
      </div>
      <iframe
        key={embedSrc}
        title="Invitation email preview"
        className="h-[min(900px,85vh)] w-full border-0 bg-[#f6f4f1]"
        src={embedSrc}
      />
    </section>
  );
}
