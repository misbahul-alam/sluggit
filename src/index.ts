import type { CustomReplacements } from "./replacements.js";
import {
  defaultReplacements,
  transliterations,
  localeReplacements,
} from "./replacements.js";
import { escapeRegex, collapseSeparators, hasLetterOrNumber } from "./utils.js";

export type { CustomReplacements };

export interface SluggitOptions {
  separator?: string;
  lowercase?: boolean;
  trim?: boolean;
  maxLength?: number;
  customReplacements?: CustomReplacements;
  preserveNumbers?: boolean;
  removeTrailingDash?: boolean;
  allowedChars?: string;
  locale?: string;
}

const staticReplacementsMap: CustomReplacements = {
  ...defaultReplacements,
  ...transliterations,
};

const staticReplacementEntries: Array<[string, string]> = Object.entries(
  staticReplacementsMap,
).sort((a, b) => b[0].length - a[0].length);

function applyEntries(
  input: string,
  entries: Array<[string, string]>,
  separator: string,
): string {
  let slug = input;
  for (const [key, value] of entries) {
    const pattern = escapeRegex(key);
    const keyIsSymbol = !/\p{L}/u.test(key) && !/\p{N}/u.test(key);
    const valueHasLetters = /\p{L}/u.test(value);

    if (keyIsSymbol && valueHasLetters) {
      const symbolRegex = new RegExp(pattern, "giu");
      slug = slug.replace(symbolRegex, (match, ...args) => {
        const offset = args[args.length - 2] as number;
        const before = slug.charAt(Math.max(0, offset - 1));
        const after = slug.charAt(offset + match.length);
        const beforeIsAlnum = /[\p{L}\p{N}]/u.test(before);
        const afterIsAlnum = /[\p{L}\p{N}]/u.test(after);
        const beforeIsSpace = /\s/.test(before);
        const afterIsSpace = /\s/.test(after);

        if (
          !beforeIsAlnum &&
          !afterIsAlnum &&
          !beforeIsSpace &&
          !afterIsSpace &&
          before !== "" &&
          after !== ""
        ) {
          return "";
        }

        const left =
          (beforeIsAlnum || beforeIsSpace) && before ? separator : "";
        const right = (afterIsAlnum || afterIsSpace) && after ? separator : "";
        return `${left}${value}${right}`;
      });
    } else {
      const regex = new RegExp(pattern, "giu");
      slug = slug.replace(regex, value);
    }
  }
  return slug;
}

export function sluggit(text: string, options: SluggitOptions = {}): string {
  const {
    separator = "-",
    lowercase = true,
    trim = true,
    maxLength,
    customReplacements,
    preserveNumbers = true,
    removeTrailingDash = false,
    allowedChars = "",
    locale,
  } = options;

  const hasSeparator = separator.length > 0;
  let slug = text ? text.toString() : "";
  if (!slug) return "";

  if (locale) {
    const locMap = localeReplacements[locale.toLowerCase()];
    if (locMap) {
      const locEntries = Object.entries(locMap).sort(
        (a, b) => b[0].length - a[0].length,
      );
      slug = applyEntries(slug, locEntries, separator);
    }
  }

  if (customReplacements && Object.keys(customReplacements).length > 0) {
    const customEntries = Object.entries(customReplacements).sort(
      (a, b) => b[0].length - a[0].length,
    );
    slug = applyEntries(slug, customEntries, separator);
  }

  slug = applyEntries(slug, staticReplacementEntries, separator);

  slug = slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "");

  const allowed = allowedChars ? escapeRegex(allowedChars) : "";
  const alphanumericPattern = preserveNumbers
    ? `[^a-zA-Z0-9${allowed}]`
    : `[^a-zA-Z${allowed}]`;
  slug = slug.replace(new RegExp(`${alphanumericPattern}+`, "g"), separator);

  if (trim && hasSeparator) {
    const escapedSep = escapeRegex(separator);
    slug = slug.replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, "g"), "");
  }

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (removeTrailingDash && hasSeparator) {
    const escapedSep = escapeRegex(separator);
    slug = slug.replace(new RegExp(`${escapedSep}+$`), "");
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
    slug = collapseSeparators(slug, separator);
  }

  if (!hasLetterOrNumber(slug) && (!allowedChars || !slug.trim())) {
    return "";
  }

  return slug;
}

export function uniqueSlug(
  text: string,
  existing: string[] | Set<string>,
  options: SluggitOptions = {},
): string {
  const baseSlug = sluggit(text, options);
  if (!baseSlug) return "";

  const existingSet = existing instanceof Set ? existing : new Set(existing);
  if (!existingSet.has(baseSlug)) {
    return baseSlug;
  }

  const separator = options.separator ?? "-";
  let count = 1;
  let candidate = `${baseSlug}${separator}${count}`;

  while (existingSet.has(candidate)) {
    count++;
    candidate = `${baseSlug}${separator}${count}`;
  }

  return candidate;
}

sluggit.unique = uniqueSlug;

export default sluggit;
