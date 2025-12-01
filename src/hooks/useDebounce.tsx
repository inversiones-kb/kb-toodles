import { useState } from "react";

function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const [debouncedFunction] = useState(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  });

  return debouncedFunction as T;
}

export default useDebounce;
