import { useInsertionEffect } from "react";

/* ── Page-scoped stylesheet lifecycle ───────────────────────────────────────
   Each route imports its own stylesheet as a string (`?inline`) and calls
   usePageStyles(). The <style> tag is injected on route enter and removed
   on route leave, so page styles never leak into other routes. Rules in
   the file join the native `components` cascade layer declared by the
   master sheet, so Tailwind utilities still win.                          */

export function usePageStyles(pageId: string, css: string) {
  useInsertionEffect(() => {
    const id = `ny-page-style-${pageId}`;
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      el.setAttribute("data-ny-page", pageId);
      el.textContent = css;
      document.head.appendChild(el);
    }
    return () => {
      el?.remove();
    };
  }, [pageId, css]);
}
