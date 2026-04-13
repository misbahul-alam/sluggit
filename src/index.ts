import type { CustomReplacements } from "./replacements.js";
import { defaultReplacements, transliterations } from "./replacements.js";

export interface SluggitOptions {
  separator?: string;
  lowercase?: boolean;
  trim?: boolean;
  maxLength?: number;
  customReplacements?: CustomReplacements;
  preserveNumbers?: boolean;
  removeTrailingDash?: boolean;
}

/**
 * Convert a string to a URL-friendly slug
 * @param text The string to convert to a slug
 * @param options Configuration options for slug generation
 * @returns A URL-friendly slug
 */
export function sluggit(text: string, options: SluggitOptions = {}): string {
  const {
    separator = "-",
    lowercase = true,
    trim = true,
    maxLength,
    customReplacements = {},
    preserveNumbers = true,
    removeTrailingDash = false,
  } = options;
  const hasSeparator = separator.length > 0;

  const replacements = {
    ...defaultReplacements,
    ...transliterations,
    ...customReplacements,
  };

  let slug = text.toString();

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const replacementEntries = Object.entries(replacements) as Array<
    [string, string]
  >;

  replacementEntries
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([key, value]) => {
      const pattern = escapeRegex(key);

      const keyIsSymbol = !/\p{L}/u.test(key) && !/\p{N}/u.test(key);
      const valueHasLetters = /\p{L}/u.test(value);
      let regex: RegExp;
      let replacement: string = value;
      if (keyIsSymbol && valueHasLetters) {
        const symbolRegex = new RegExp(pattern, "giu");
        slug = slug.replace(symbolRegex, (match, ...args) => {
          const offset = args[args.length - 2] as number;
          const before = slug.charAt(Math.max(0, offset - 1));
          const after = slug.charAt(offset + match.length);
          const beforeIsAlnum = /[\p{L}\p{N}]/u.test(before);
          const afterIsAlnum = /[\p{L}\p{N}]/u.test(after);
          const left = beforeIsAlnum ? separator : "";
          const right = afterIsAlnum ? separator : "";
          return `${left}${value}${right}`;
        });
      } else {
        regex = new RegExp(pattern, "giu");
        slug = slug.replace(regex, replacement);
      }
    });

  slug = slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "");

  const alphanumericPattern = preserveNumbers ? "[^a-zA-Z0-9]" : "[^a-zA-Z]";
  slug = slug.replace(new RegExp(alphanumericPattern + "+", "g"), separator);

  if (trim && hasSeparator) {
    slug = slug.replace(
      new RegExp(
        `^${escapeRegex(separator)}+|${escapeRegex(separator)}+$`,
        "g",
      ),
      "",
    );
  }

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (removeTrailingDash && hasSeparator) {
    slug = slug.replace(new RegExp(`${escapeRegex(separator)}+$`), "");
  }

  if (maxLength && slug.length > maxLength) {
    const original = slug;
    const parts = hasSeparator
      ? original.split(separator).filter(Boolean)
      : [original];
    let built: string = "";
    for (const part of parts) {
      const candidate = built ? `${built}${separator}${part}` : part;
      if (candidate.length <= maxLength) {
        built = candidate;
      } else {
        break;
      }
    }

    if (!built) {
      built = original.substring(0, maxLength);
      if (hasSeparator) {
        built = built.replace(new RegExp(`${escapeRegex(separator)}+$`), "");
      }
    }

    const numericTailMatch = hasSeparator
      ? original.match(new RegExp(`${escapeRegex(separator)}(\\d+)$`))
      : null;
    if (numericTailMatch) {
      const tail = numericTailMatch[1];
      const partsList = original.split(separator).filter(Boolean);
      const prevToken =
        partsList.length >= 2 ? partsList[partsList.length - 2] : null;

      if (prevToken) {
        const builtParts = built ? built.split(separator).filter(Boolean) : [];
        const lastBuiltToken = builtParts.length
          ? builtParts[builtParts.length - 1]
          : null;
        if (lastBuiltToken === prevToken) {
          const newBuilt = built ? `${built}${separator}${tail}` : tail;
          built = String(newBuilt);
        }
      }
    }

    slug = built;
  }

  if (hasSeparator) {
    slug = slug.replace(
      new RegExp(`${escapeRegex(separator)}{2,}`, "g"),
      separator,
    );
  }

  if (!/[\p{L}\p{N}]/u.test(slug)) return "";

  return slug;
}
