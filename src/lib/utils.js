import { clsx } from "clsx";

/**
 * Utility function to combine class names
 * @param  {...any} inputs - Class names or objects to combine
 * @returns {string} - Combined class names
 */
export function cn(...inputs) {
  return clsx(inputs);
}
