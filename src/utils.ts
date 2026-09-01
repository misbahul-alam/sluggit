export const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function collapseSeparators(str: string, sep: string): string {
  if (!sep) return str;
  return str.replace(new RegExp(`${escapeRegex(sep)}{2,}`, "g"), sep);
}

export function hasLetterOrNumber(str: string): boolean {
  return /[\p{L}\p{N}]/u.test(str);
}
