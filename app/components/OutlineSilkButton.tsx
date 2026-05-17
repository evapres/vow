"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Secondary: plain text button (no border, no fill). */
const outlineSecondaryClass =
  "flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 px-1 font-sans text-[10px] font-semibold uppercase tracking-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-60 sm:text-[12px] sm:tracking-[2px]";

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
