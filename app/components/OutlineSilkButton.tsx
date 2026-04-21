"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Secondary: plain text button (no border, no fill). */
const outlineSecondaryClass =
  "flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-sans text-[12px] font-bold uppercase tracking-[0.09em] transition-colors disabled:pointer-events-none disabled:opacity-60";

export type OutlineSilkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> & {
  wrapperClassName?: string;
  buttonClassName?: string;
  children: ReactNode;
};

export default function OutlineSilkButton({
  children,
  wrapperClassName = "",
  buttonClassName = "",
  disabled,
  ...buttonProps
}: OutlineSilkButtonProps) {
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <button
        {...buttonProps}
        disabled={disabled}
        className={`${outlineSecondaryClass} ${buttonClassName}`.trim()}
      >
        {children}
      </button>
    </div>
  );
}
