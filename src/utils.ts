import type { CustomReplacements } from "./replacements";

export const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function collapseSeparators(str: string, sep: string) {
  return str.replace(new RegExp(`${escapeRegex(sep)}{2,}`, "g"), sep);
}

export function hasLetterOrNumber(str: string) {
  return /[\p{L}\p{N}]/u.test(str);
}

export function applyReplacements(
  input: string,
  replacements: CustomReplacements,
  separator: string
): string {
  let out = input;
  const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const rawValue = (replacements as any)[key];
    const value =
      rawValue !== undefined && rawValue !== null ? String(rawValue) : "";
    const pattern = escapeRegex(key);
    const keyIsSymbol = !/\p{L}/u.test(key) && !/\p{N}/u.test(key);
    const valueHasLetters = /\p{L}/u.test(value);
    if (keyIsSymbol && valueHasLetters) {
      const source = out;
      const symbolRegex = new RegExp(pattern, "giu");
      out = source.replace(symbolRegex, (match, ...args) => {
        const offset = args[args.length - 2] as number;
        const before = source.charAt(Math.max(0, offset - 1));
        const after = source.charAt(offset + match.length);
        const beforeIsAlnum = /[\p{L}\p{N}]/u.test(before);
        const afterIsAlnum = /[\p{L}\p{N}]/u.test(after);
        const beforeIsSpace = /\s/.test(before);
        const afterIsSpace = /\s/.test(after);
        // If symbol sits between non-alnum non-space characters, drop it.
        if (!beforeIsAlnum && !afterIsAlnum && !beforeIsSpace && !afterIsSpace)
          return "";
        const left = beforeIsAlnum || beforeIsSpace ? separator : "";
        const right = afterIsAlnum || afterIsSpace ? separator : "";
        return `${left}${value}${right}`;
      });
    } else {
      const regex = new RegExp(pattern, "giu");
      out = out.replace(regex, value);
    }
  }
  return out;
}
