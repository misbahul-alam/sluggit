# Sluggit

[![npm version](https://img.shields.io/npm/v/sluggit.svg)](https://www.npmjs.com/package/sluggit)
[![downloads](https://img.shields.io/npm/dt/sluggit.svg)](https://www.npmjs.com/package/sluggit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sluggit is a lightweight TypeScript utility to convert strings into URL-friendly slugs. Removes emojis, accents, and special characters, supports custom separators, and preserves casing if needed.

This release refactors the codebase into small modules and introduces new options:

- maxLength: limit the length of the generated slug while preserving word boundaries when possible
- customReplacements: provide a mapping of characters/strings to replace before slugification
- preserveNumbers: whether numbers should be kept in the slug (default: true)
- removeTrailingDash: when true, removes any trailing separators from the final slug

## Table of Contents

| Section                         | Description                             |
| ------------------------------- | --------------------------------------- |
| [Features](#features)           | Key functionality of the package        |
| [Installation](#installation)   | How to install using NPM, Yarn, or PNPM |
| [Quick Start](#quick-start)     | Minimal example to start using Sluggit  |
| [Usage](#usage)                 | Full usage examples                     |
| [API Reference](#api-reference) | Function signature and parameters       |
| [Options](#options)             | Available options and default values    |
| [Examples](#examples)           | Example inputs and expected outputs     |

## Features

- Convert any string to a **URL-friendly slug**
- Remove **special characters, emojis, and accents**
- Customizable **separator** (`-`, `_`, or any character)
- Optional **lowercase / uppercase**
- Supports **ESM and CommonJS**
- TypeScript-ready with **type definitions**

---

## Installation

```bash
# npm
npm install sluggit

# yarn
yarn add sluggit

# pnpm
pnpm add sluggit
```

---

## Quick Start

```typescript
import { sluggit } from "sluggit";

const slug = sluggit("Hello World!"); // Output: hello-world
```

---

## Usage

```typescript
import { sluggit } from "sluggit";

// Basic usage
sluggit("Hello World!"); // hello-world

// Custom separator
sluggit("Hello World!", { separator: "_" }); // hello_world

// Preserve case
sluggit("Hello World!", { lowercase: false }); // Hello-World

// Remove emojis
sluggit("Hello 👋 World! 🌍"); // hello-world

// Handle accents
sluggit("Hôtel Crémieux"); // hotel-cremieux
```

---

## API Reference

### Function Signature

```typescript
function sluggit(input: string, options?: SluggitOptions): string;
```

### Parameters

- `input` (string): The string to convert to a slug
- `options` (optional: SlugOptions): Configuration options

### Return Value

- Returns a string containing the URL-friendly slug

---

## Options

The `SlugOptions` interface provides the following configuration options:

```typescript
interface SluggitOptions {
  separator?: string; // Default: '-'
  lowercase?: boolean; // Default: true
  trim?: boolean; // Default: true
  maxLength?: number; // Optional: max length of the slug
  customReplacements?: Record<string, string>; // Optional mappings applied before slug generation
  preserveNumbers?: boolean; // Default: true
  removeTrailingDash?: boolean; // Default: false
}
```

### Options Description

- `separator`: Character to use between words (default: '-')
- `lowercase`: Convert the output to lowercase (default: true)
- `trim`: Remove leading and trailing separators (default: true)

- `maxLength`: When provided, the function attempts to keep whole tokens, truncating only at token boundaries when possible. If a numeric tail (e.g., a year) is present and the token before it is included in the truncated result, the numeric tail will be appended.
- `customReplacements`: A map of strings to replace prior to slug generation. Useful for mapping © → c, ™ → tm, & → and, etc.
- `preserveNumbers`: Whether numbers should be preserved (default: true). Set to false to remove all digits.
- `removeTrailingDash`: When true, strip trailing separators from the final slug.

---

## Examples

Here are some example inputs and their corresponding outputs:

| Input                   | Options                                        | Output                       |
| ----------------------- | ---------------------------------------------- | ---------------------------- |
| "Hello World!"          | default                                        | "hello-world"                |
| "Hello_World!"          | { separator: '\_' }                            | "hello_world"                |
| "Hello World!"          | { lowercase: false }                           | "Hello-World"                |
| " Hello World! "        | { trim: true }                                 | "hello-world"                |
| "Café & Résumé"         | { customReplacements: { "&": "and" }}          | "cafe-and-resume"            |
| "Hello 👋 World! 🌍"    | default                                        | "hello-world"                |
| "Product™ & Copyright©" | { customReplacements: { "™": "tm", "©": "c" }} | "product-tm-and-copyright-c" |
