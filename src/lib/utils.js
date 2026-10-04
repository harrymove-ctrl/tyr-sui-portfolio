/** Join truthy class names (used by the restored React Bits components). */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
