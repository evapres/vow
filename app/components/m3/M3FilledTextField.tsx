"use client";

import type { InputHTMLAttributes } from "react";

type M3FilledTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label: string;
  supportingText?: string;
  clearable?: boolean;
  onClear?: () => void;
};

export default function M3FilledTextField({
  label,
  supportingText,
  clearable = false,
  onClear,
  value,
  id,
  ...inputProps
}: M3FilledTextFieldProps) {
  const inputId = id ?? inputProps.name;
  const showClear =
    clearable &&
    onClear &&
    value != null &&
    String(value).length > 0 &&
    !inputProps.readOnly &&
    !inputProps.disabled;

  return (
    <div className="space-y-1">
      <div className="m3-filled-field">
        <label htmlFor={inputId} className="m3-filled-field__label">
          {label}
        </label>
        <input
          {...inputProps}
          id={inputId}
          value={value}
          className="m3-filled-field__input"
        />
        {showClear ? (
          <button
            type="button"
            className="m3-filled-field__clear"
            aria-label={`Clear ${label}`}
            onClick={onClear}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
            </svg>
          </button>
        ) : null}
      </div>
      {supportingText ? <p className="m3-field-support">{supportingText}</p> : null}
    </div>
  );
}
