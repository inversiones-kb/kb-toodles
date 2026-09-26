import { RefObject, useEffect } from "react";

const SKIPPED_INPUT_TYPES = new Set([
  "submit",
  "button",
  "file",
  "checkbox",
  "radio",
]);

function isFocusableField(el: HTMLElement) {
  return el.tagName === "INPUT" || el.tagName === "SELECT";
}

/**
 * POS-terminal muscle memory: Enter moves to the next field instead of
 * submitting the form. Multi-line textareas keep their native newline
 * behavior, and the actual submit button still submits on Enter/click.
 *
 * Implemented as a native, capture-phase listener on the form's container
 * (via ref), not a React `onKeyDown` prop. Some composed inputs in this app
 * (react-number-format's `NumericFormat` wrapping a HeroUI `Input`) don't
 * reliably bubble their native keydown through React's synthetic event
 * system up to an ancestor's `onKeyDown` — capture-phase native listeners
 * run before that internal handling and aren't affected by it.
 */
export function useFocusNextFieldOnEnter(
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter") return;

      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;
      if (
        target instanceof HTMLInputElement &&
        SKIPPED_INPUT_TYPES.has(target.type)
      ) {
        return;
      }
      if (!isFocusableField(target)) return;

      e.preventDefault();
      e.stopPropagation();

      const focusable = Array.from(
        container!.querySelectorAll<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
        ),
      ).filter((el) => el.offsetParent !== null);

      const next = focusable[focusable.indexOf(target) + 1];
      if (!next) {
        target.blur();
        return;
      }

      next.focus();
      if (next instanceof HTMLInputElement) next.select();
    }

    container.addEventListener("keydown", handleKeyDown, true);
    return () => container.removeEventListener("keydown", handleKeyDown, true);
  }, [containerRef]);
}
