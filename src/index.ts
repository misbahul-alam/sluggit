export interface SluggitOptions {
  separator?: string;
  lowercase?: boolean;
}

export function sluggit(text: string, options: SluggitOptions = {}): string {
  const separator = options.separator ?? "-";
  const lowercase = options.lowercase ?? true;

  let slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");

  return lowercase ? slug.toLowerCase() : slug;
}
