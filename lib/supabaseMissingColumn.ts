export function isMissingInvitationThemeColumn(error: {
  message?: string;
  code?: string;
  details?: string;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return text.includes("invitation_theme") || error.code === "PGRST204";
}

export function isMissingCoupleInitialsColumns(error: {
  message?: string;
  code?: string;
  details?: string;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    text.includes("couple_initial_left") ||
    text.includes("couple_initial_right") ||
    error.code === "PGRST204"
  );
}

export function isRetryableMissingColumnError(error: {
  message?: string;
  code?: string;
  details?: string;
}): boolean {
  return (
    isMissingInvitationThemeColumn(error) ||
    isMissingCoupleInitialsColumns(error) ||
    error.code === "PGRST204"
  );
}
