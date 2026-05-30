type InvitationEmailHtmlPreviewProps = {
  embedSrc: string;
};

export default function InvitationEmailHtmlPreview({ embedSrc }: InvitationEmailHtmlPreviewProps) {
  return (
    <div className="m3-form-card m3-form-preview-panel overflow-hidden p-0">
      <iframe
        key={embedSrc}
        title="Invitation email preview"
        className="block h-[min(900px,85vh)] w-full border-0 bg-[var(--m3-surface)]"
        src={embedSrc}
      />
    </div>
  );
}
