export function formLoadErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Could not load invitation.";

  try {
    const parsed = JSON.parse(trimmed) as { error?: string };
    if (parsed.error === "Not found") {
      return "Invitation not found. Make sure you are signed in with the account that owns it.";
    }
    if (parsed.error) return parsed.error;
  } catch {
    /* plain text response */
  }

  if (trimmed === "Not found") {
    return "Invitation not found. Make sure you are signed in with the account that owns it.";
  }

  return trimmed;
}
