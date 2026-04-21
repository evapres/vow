type InvitationEmailHtmlPreviewProps = {
  html: string;
};

export default function InvitationEmailHtmlPreview({ html }: InvitationEmailHtmlPreviewProps) {
  return (
    <section className="mt-8 border border-[#181818]/20 bg-white shadow-sm">
      <div className="border-b border-[#181818]/15 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#181818]/55">Rendered HTML</p>
      </div>
      <iframe
        title="Invitation email preview"
        className="h-[min(560px,75vh)] w-full border-0 bg-[#f6f4f1]"
        sandbox="allow-same-origin"
        srcDoc={html}
      />
    </section>
  );
}
