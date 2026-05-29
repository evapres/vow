"use client";

import type { SelectHTMLAttributes } from "react";

type M3FilledSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  supportingText?: string;
};

export default function M3FilledSelect({
  label,
  supportingText,
  id,
  children,
  ...selectProps
}: M3FilledSelectProps) {
  const selectId = id ?? selectProps.name;

  return (
    <div className="space-y-1">
      <div className="m3-filled-field m3-filled-field--select">
        <label htmlFor={selectId} className="m3-filled-field__label">
          {label}
        </label>
        <select {...selectProps} id={selectId} className="m3-filled-field__input">
          {children}
        </select>
        <span className="m3-filled-field__chevron" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </span>
      </div>
      {supportingText ? <p className="m3-field-support">{supportingText}</p> : null}
    </div>
  );
}
