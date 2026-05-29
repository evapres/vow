"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type M3FileFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  supportingText?: string;
  children?: ReactNode;
};

const M3FileField = forwardRef<HTMLInputElement, M3FileFieldProps>(function M3FileField(
  { label, supportingText, id, children, ...inputProps },
  ref,
) {
  const inputId = id ?? inputProps.name;

  return (
    <div className="space-y-1">
      <div className="m3-file-field">
        <label htmlFor={inputId} className="m3-filled-field__label">
          {label}
        </label>
        <input {...inputProps} ref={ref} id={inputId} className="m3-file-field__input" />
      </div>
      {supportingText ? <p className="m3-field-support">{supportingText}</p> : null}
      {children}
    </div>
  );
});

export default M3FileField;
