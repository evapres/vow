"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Filled primary: brown fill, 1px bottom stroke #E6D1D0. */
const solidPrimaryClass =
  "flex h-full w-full cursor-pointer items-center justify-center rounded-none border-0 border-b border-b-[#E6D1D0] bg-[#6F5248] px-3 font-sans text-[11px] font-bold uppercase tracking-[0.09em] text-[#FAF6F2] transition-[filter,background-color] hover:brightness-[1.06] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 sm:text-[12px]";

export type SolidSilkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> & {
  wrapperClassName?: string;
  buttonClassName?: string;
  children: ReactNode;
};

export default function SolidSilkButton({
  children,
  wrapperClassName = "",
  buttonClassName = "",
  disabled,
  ...buttonProps
}: SolidSilkButtonProps) {
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <button
        {...buttonProps}
        disabled={disabled}
        className={`${solidPrimaryClass} ${buttonClassName}`.trim()}
      >
        {children}
      </button>
    </div>
  );
}
