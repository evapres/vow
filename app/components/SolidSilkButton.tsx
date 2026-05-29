"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

const solidPrimaryBaseClass =
  "flex h-full w-full cursor-pointer items-center justify-center border-0 border-b px-2 font-sans text-[10px] font-semibold uppercase tracking-[1.5px] text-[#FAF6F2] transition-[filter,background-color] hover:brightness-[1.06] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 sm:px-3 sm:text-[12px] sm:tracking-[2px]";

export type SolidSilkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> & {
  wrapperClassName?: string;
  buttonClassName?: string;
  /** Defaults to classic invitation fill (#6F5248). */
  fill?: string;
  /** Defaults to #E6D1D0 bottom stroke. */
  borderColor?: string;
  children: ReactNode;
};

export default function SolidSilkButton({
  children,
  wrapperClassName = "",
  buttonClassName = "",
  fill = "#6F5248",
  borderColor = "#E6D1D0",
  disabled,
  ...buttonProps
}: SolidSilkButtonProps) {
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <button
        {...buttonProps}
        disabled={disabled}
        className={`${solidPrimaryBaseClass} ${buttonClassName}`.trim()}
        style={{ backgroundColor: fill, borderBottomColor: borderColor }}
      >
        {children}
      </button>
    </div>
  );
}
