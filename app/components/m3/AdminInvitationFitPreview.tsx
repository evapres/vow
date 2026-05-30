"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { ADMIN_PREVIEW_REFERENCE_WIDTH_PX } from "@/lib/adminInvitationPreview";

type FitLayout = {
  scale: number;
  width: number;
  height: number;
  viewportHeight: number;
};

type AdminInvitationFitPreviewProps = {
  panelStyle?: CSSProperties;
  children: ReactNode;
};

/** Matches `.m3-form-preview__viewport { padding: 8% }` — % padding uses the viewport width. */
const VIEWPORT_PADDING_RATIO = 0.08;

function measureFit(viewport: HTMLElement, content: HTMLElement): FitLayout | null {
  const pad = viewport.clientWidth * VIEWPORT_PADDING_RATIO;
  const vw = viewport.clientWidth - pad * 2;
  const cw = content.scrollWidth;
  const ch = content.scrollHeight;
  if (vw <= 0 || cw <= 0 || ch <= 0) return null;

  const scale = Math.min(vw / cw, 1);
  const viewportHeight = ch * scale + pad * 2;

  return { scale, width: cw, height: ch, viewportHeight };
}

export default function AdminInvitationFitPreview({
  panelStyle,
  children,
}: AdminInvitationFitPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<FitLayout | null>(null);

  const remeasure = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const next = measureFit(viewport, content);
    if (!next) return;
    setLayout((prev) => {
      if (
        prev &&
        Math.abs(prev.scale - next.scale) < 0.001 &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.viewportHeight === next.viewportHeight
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    remeasure();

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(remeasure);
    });
    ro.observe(viewport);
    ro.observe(content);

    const mo = new MutationObserver(() => {
      requestAnimationFrame(remeasure);
    });
    // Layout-only: characterData fired on every keystroke in the live preview and caused input lag.
    mo.observe(content, { subtree: true, attributes: true, childList: true });

    const onLoad = () => requestAnimationFrame(remeasure);
    content.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", onLoad);
    });

    window.addEventListener("resize", remeasure);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, [remeasure]);

  const scaledW = layout ? layout.width * layout.scale : undefined;
  const scaledH = layout ? layout.height * layout.scale : undefined;

  return (
    <div
      className="m3-form-preview-panel w-full"
      style={{
        ...panelStyle,
        minHeight: layout ? layout.viewportHeight : 320,
      }}
      aria-label="Invitation preview"
    >
      <div
        ref={viewportRef}
        className="m3-form-preview__viewport"
        style={layout ? { height: layout.viewportHeight } : undefined}
      >
        <div
          className="m3-form-preview__fit"
          style={{
            width: scaledW,
            height: scaledH,
            visibility: layout ? "visible" : "hidden",
          }}
        >
          <div
            ref={contentRef}
            className="m3-form-preview__content"
            style={{
              width: ADMIN_PREVIEW_REFERENCE_WIDTH_PX,
              transform: layout ? `scale(${layout.scale})` : undefined,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
