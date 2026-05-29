"use client";

import type { CSSProperties } from "react";

import {
  INVITATION_THEME_LIST,
  type InvitationThemeId,
} from "@/lib/invitationThemes";

type M3ThemePickerProps = {
  value: InvitationThemeId;
  onChange: (id: InvitationThemeId) => void;
};

export default function M3ThemePicker({ value, onChange }: M3ThemePickerProps) {
  return (
    <fieldset className="m3-theme-fieldset space-y-3 border-0 p-0">
      <legend className="m3-filled-field__label">Theme</legend>
      <div className="m3-theme-grid">
        {INVITATION_THEME_LIST.map((theme) => {
          const selected = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              className={`m3-theme-card ${selected ? "m3-theme-card--selected" : ""}`}
              onClick={() => onChange(theme.id)}
              aria-pressed={selected}
            >
              <div className="m3-theme-card__swatch" style={theme.swatchStyle as CSSProperties} />
              <div className="m3-theme-card__body">
                <p className="m3-theme-card__title">{theme.label}</p>
                <p className="m3-theme-card__desc">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
