# Sluggit

[![npm version](https://img.shields.io/npm/v/sluggit.svg)](https://www.npmjs.com/package/sluggit)
[![downloads](https://img.shields.io/npm/dt/sluggit.svg)](https://www.npmjs.com/package/sluggit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Sluggit** is a high-performance, lightweight TypeScript utility for converting text strings into clean, URL-friendly slugs. It handles Unicode, accents, emojis, currencies, math symbols, locale transliterations, and unique collision resolution with zero runtime dependencies.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage & Examples](#usage--examples)
  - [Basic Usage](#basic-usage)
  - [Unique Slug Generator](#unique-slug-generator-cms--database)
  - [Allowed Characters Whitelist](#allowed-characters-whitelist-paths--files)
  - [Locale Support (Umlauts & Accents)](#locale-support-umlauts--accents)
  - [Currency & Math Symbols](#currency--math-symbols)
  - [Length Limiting (Word-Boundary Aware)](#length-limiting-word-boundary-aware)
  - [Custom Replacements](#custom-replacements)
- [API Reference](#api-reference)
- [Options Reference](#options-reference)
- [License](#license)

---

## Features

- 🚀 **Blazing Fast**: Pre-compiled and cached static transliteration tables for maximum performance.
- 🌐 **Full Unicode & Emoji Handling**: Strips emojis, normalizes diacritics, and transliterates Cyrillic/Greek symbols.
- 🔢 **Unique Slug Generator**: Built-in `uniqueSlug` helper to automatically handle slug collisions for CMSs and databases.
- 🌍 **Locale-Aware Transliterations**: Special expansions for German (`de`), Scandinavian (`da`, `sv`, `nb`, `nn`), Turkish (`tr`), and more.
- 💱 **Currency & Symbol Transliteration**: Automatic conversions for `$`, `€`, `£`, `¥`, `₹`, `%`, `+`, `@`, `&`, etc.
- 🛡️ **Whitelist Characters (`allowedChars`)**: Preserve specific characters like `/` for paths or `.` for file names.
- 📦 **Dual ESM & CommonJS**: Supports `import sluggit from "sluggit"`, `import { sluggit, uniqueSlug } from "sluggit"`, and `require("sluggit")`.
- 🏷️ **TypeScript Ready**: Full type definitions and JSDoc annotations out of the box.
- 🪶 **Zero Dependencies**: Pure, lightweight code.

---

## Installation

```bash
# npm
npm install sluggit

# pnpm
pnpm add sluggit

# yarn
yarn add sluggit

# bun
bun add sluggit
```

---

## Quick Start

```typescript
import sluggit, { uniqueSlug } from "sluggit";

// Basic slug
sluggit("Hello World!"); 
// Output: "hello-world"

// Unique slug against existing entries
uniqueSlug("My Post", ["my-post", "my-post-1"]); 
// Output: "my-post-2"
```

---

## Usage & Examples

### Basic Usage

```typescript
import { sluggit } from "sluggit";

// Default behavior
sluggit("Hello World!"); // "hello-world"

// Custom separator
sluggit("Hello World!", { separator: "_" }); // "hello_world"

// Preserve casing
sluggit("Hello World!", { lowercase: false }); // "Hello-World"

// Remove emojis
sluggit("Super Cool 🚀 Blog Post 😎"); // "super-cool-blog-post"

// Accented characters
sluggit("Café & Résumé"); // "cafe-and-resume"
```

### Unique Slug Generator (CMS / Database)

Prevent duplicate slugs by passing a list or `Set` of existing slugs:

```typescript
import { uniqueSlug } from "sluggit";

const existingSlugs = ["product", "product-1"];

// Generates next available sequential slug
const slug1 = uniqueSlug("Product", existingSlugs);
// Output: "product-2"

// Also accessible via sluggit.unique
const slug2 = sluggit.unique("New Article", ["new-article"]);
// Output: "new-article-1"
```

### Allowed Characters Whitelist (Paths & Files)

Preserve specific characters such as `/` for URL/file paths or `.` for extensions:

```typescript
// Preserve slashes for URL paths
sluggit("blog/2026/my first post", { allowedChars: "/" });
// Output: "blog/2026/my-first-post"

// Preserve file extensions
sluggit("Annual Financial Report 2026.pdf", { allowedChars: "." });
// Output: "annual-financial-report-2026.pdf"
```

### Locale Support (Umlauts & Accents)

Apply language-specific transliteration rules using the `locale` option:

```typescript
// German (ä -> ae, ö -> oe, ü -> ue, ß -> ss)
sluggit("Schöne Grüße über München", { locale: "de" });
// Output: "schoene-gruesse-ueber-muenchen"

// Danish / Norwegian (å -> aa, æ -> ae, ø -> oe)
sluggit("København Blåbær", { locale: "da" });
// Output: "koebenhavn-blaabaer"

// Swedish (å -> aa, ä -> ae, ö -> oe)
sluggit("Mörkö Räksmörgås", { locale: "sv" });
// Output: "moerkoe-raeksmoergaas"
```

### Currency & Math Symbols

Currencies and math symbols attached to numbers or words are intelligently transliterated:

```typescript
sluggit("Price: 100$");              // "price-100-dollar"
sluggit("Save £25 on your order");   // "save-pound-25-on-your-order"
sluggit("Special 50% discount");     // "special-50-percent-discount"
sluggit("C++ Programming");          // "c-plus-plus-programming"
sluggit("Contact me@domain.com");    // "contact-me-at-domain-com"
```

### Length Limiting (Word-Boundary Aware)

Limit slug length without chopping words awkwardly:

```typescript
sluggit("The Quick Brown Fox Jumps Over", { maxLength: 15 });
// Output: "the-quick-brown"

// Preserves numeric tails (like years/IDs) when context is kept:
sluggit("Quarterly Fiscal Report 2026", { maxLength: 20 });
// Output: "quarterly-2026"
```

### Custom Replacements

Override or define custom character substitutions:

```typescript
sluggit("Node.js & TypeScript", {
  customReplacements: {
    ".js": "-javascript",
    "&": "and",
  },
});
// Output: "node-javascript-and-typescript"
```

---

## API Reference

### `sluggit(text, options?)`

Converts input text to a URL-friendly slug.

- **Parameters**:
  - `text` (`string`): Input text string.
  - `options` (`SluggitOptions`, optional): Configuration options.
- **Returns**: `string`

### `uniqueSlug(text, existing, options?)`

Generates a collision-free slug by appending an incremental number suffix if a duplicate exists.

- **Parameters**:
  - `text` (`string`): Input text string.
  - `existing` (`string[] | Set<string>`): Existing slug entries.
  - `options` (`SluggitOptions`, optional): Configuration options.
- **Returns**: `string`

---

## Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `separator` | `string` | `"-"` | Character used to separate words. |
| `lowercase` | `boolean` | `true` | Converts output to lowercase. |
| `trim` | `boolean` | `true` | Removes leading and trailing separators. |
| `maxLength` | `number` | `undefined` | Truncates slug to maximum length at word boundaries. |
| `customReplacements`| `Record<string, string>` | `undefined` | Custom mapping of characters to replace. |
| `preserveNumbers` | `boolean` | `true` | Set to `false` to remove all numeric digits. |
| `removeTrailingDash`| `boolean` | `false` | Strips trailing separators from output. |
| `allowedChars` | `string` | `""` | Additional characters to whitelist/preserve (e.g. `"/."`). |
| `locale` | `string` | `undefined` | Language code for locale-specific transliterations (e.g. `'de'`, `'da'`, `'sv'`, `'tr'`). |

---

## License

[MIT](LICENSE) © Misbahul Alam

