import Link from "next/link";
import type { ReactNode } from "react";

export type M3TabItem = {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
};

type M3TabBarProps = {
  items: M3TabItem[];
  "aria-label": string;
};

export default function M3TabBar({ items, "aria-label": ariaLabel }: M3TabBarProps) {
  return (
    <div className="m3-tab-bar" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <M3Tab key={item.id} item={item} />
      ))}
    </div>
  );
}

function M3Tab({ item }: { item: M3TabItem }) {
  const className = `m3-tab${item.active ? " m3-tab--active" : ""}`;
  const content: ReactNode = item.label;

  if (item.disabled || !item.href) {
    return (
      <span
        role="tab"
        aria-selected={item.active ?? false}
        aria-disabled="true"
        title={item.title}
        className={`${className} m3-tab--disabled`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      role="tab"
      aria-selected={item.active ?? false}
      title={item.title}
      className={className}
    >
      {content}
    </Link>
  );
}
