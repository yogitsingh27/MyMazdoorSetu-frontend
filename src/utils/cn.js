// Tiny classNames helper — joins truthy class strings.
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
