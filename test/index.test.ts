import { describe, expect, test } from "vitest";
import sluggitDefault, { sluggit, uniqueSlug } from "../src/index.js";

describe("Sluggit Utility Tests", () => {
  describe("Basic Functionality", () => {
    test("converts basic text to lowercase slug", () => {
      expect(sluggit("Hello World!")).toBe("hello-world");
    });

    test("works via default import", () => {
      expect(sluggitDefault("Hello World!")).toBe("hello-world");
      expect(typeof sluggitDefault.unique).toBe("function");
    });

    test("removes emojis from text", () => {
      expect(sluggit("Sluggy 😎 Test")).toBe("sluggy-test");
    });

    test("handles multiple emojis", () => {
      expect(sluggit("Hello 👋 World! 🌍")).toBe("hello-world");
    });

    test("normalizes accented characters", () => {
      expect(sluggit("Café du Monde")).toBe("cafe-du-monde");
    });

    test("handles ampersand and accented characters", () => {
      expect(
        sluggit("Café & Résumé", { customReplacements: { "&": "and" } }),
      ).toBe("cafe-and-resume");
    });

    test("allows custom separator", () => {
      expect(sluggit("Hello World!", { separator: "_" })).toBe("hello_world");
    });

    test("respects uppercase option when lowercase is false", () => {
      expect(sluggit("Hello World!", { lowercase: false })).toBe("Hello-World");
    });
  });

  describe("Trim and Trailing Dash Options", () => {
    test("removes leading and trailing separators when trim is true", () => {
      expect(sluggit("  Hello  World  ")).toBe("hello-world");
    });

    test("keeps leading and trailing separators when trim is false", () => {
      expect(sluggit("  Hello  World  ", { trim: false })).toBe(
        "-hello-world-",
      );
    });

    test("removes trailing dash when removeTrailingDash is true", () => {
      expect(sluggit("Hello World - ", { removeTrailingDash: true })).toBe(
        "hello-world",
      );
    });

    test("supports dot separator without erasing output", () => {
      expect(sluggit("Hello World", { separator: "." })).toBe("hello.world");
    });

    test("supports dot separator with removeTrailingDash", () => {
      expect(sluggit("abc", { separator: ".", removeTrailingDash: true })).toBe(
        "abc",
      );
    });

    test("supports empty separator without throwing", () => {
      expect(sluggit("Hello World", { separator: "" })).toBe("helloworld");
    });

    test("supports empty separator with removeTrailingDash", () => {
      expect(sluggit("abc", { separator: "", removeTrailingDash: true })).toBe(
        "abc",
      );
    });
  });

  describe("Length Limiting", () => {
    test("respects maxLength while keeping word boundaries", () => {
      expect(sluggit("The Quick Brown Fox", { maxLength: 10 })).toBe(
        "the-quick",
      );
    });

    test("handles maxLength with custom separator", () => {
      expect(
        sluggit("The Quick Brown Fox", { maxLength: 10, separator: "_" }),
      ).toBe("the_quick");
    });

    test("handles maxLength with empty separator without throwing", () => {
      expect(sluggit("Hello World", { separator: "", maxLength: 5 })).toBe(
        "hello",
      );
    });
  });

  describe("Custom Replacements", () => {
    test("applies custom character replacements", () => {
      expect(
        sluggit("Hello & World @ 2023", {
          customReplacements: {
            "&": "and",
            "@": "at",
          },
        }),
      ).toBe("hello-and-world-at-2023");
    });

    test("handles special characters with custom replacements", () => {
      expect(
        sluggit("Product™ & Copyright©", {
          customReplacements: {
            "™": "tm",
            "©": "c",
            "&": "and",
          },
        }),
      ).toBe("product-tm-and-copyright-c");
    });
  });

  describe("Number Handling", () => {
    test("preserves numbers by default", () => {
      expect(sluggit("Hello 123 World")).toBe("hello-123-world");
    });

    test("removes numbers when preserveNumbers is false", () => {
      expect(sluggit("Hello 123 World", { preserveNumbers: false })).toBe(
        "hello-world",
      );
    });
  });

  describe("Unicode and Special Characters", () => {
    test("handles Cyrillic characters", () => {
      expect(sluggit("Привет мир")).toBe("privet-mir");
    });

    test("handles special symbols", () => {
      expect(sluggit("∞ ♥ ©")).toBe("infinity-love-c");
    });

    test("handles ligatures", () => {
      expect(sluggit("æther møøse straße")).toBe("aether-moose-strasse");
    });

    test("handles multiple spaces and special characters", () => {
      expect(sluggit("Hello    World!@#$%^&*()")).toBe("hello-world");
    });
  });

  describe("Currency and Math Symbols", () => {
    test("transliterates currency symbols attached to words/numbers", () => {
      expect(sluggit("Price: 100$")).toBe("price-100-dollar");
      expect(sluggit("Cost $50")).toBe("cost-dollar-50");
      expect(sluggit("100 € discount")).toBe("100-euro-discount");
      expect(sluggit("Save £25 now")).toBe("save-pound-25-now");
      expect(sluggit("5000 ¥ item")).toBe("5000-yen-item");
      expect(sluggit("100 ₹ coupon")).toBe("100-rupee-coupon");
    });

    test("transliterates percentages and math symbols", () => {
      expect(sluggit("100% Guaranteed")).toBe("100-percent-guaranteed");
      expect(sluggit("C++ Programming")).toBe("c-plus-plus-programming");
      expect(sluggit("Contact me@domain.com")).toBe("contact-me-at-domain-com");
    });
  });

  describe("Allowed Characters Whitelist", () => {
    test("preserves forward slashes for path slugs", () => {
      expect(sluggit("blog/2026/my first post", { allowedChars: "/" })).toBe(
        "blog/2026/my-first-post",
      );
    });

    test("preserves dots for file extensions", () => {
      expect(sluggit("my awesome report.pdf", { allowedChars: "." })).toBe(
        "my-awesome-report.pdf",
      );
    });

    test("preserves multiple whitelisted characters", () => {
      expect(sluggit("docs/v1.0/intro page.md", { allowedChars: "/." })).toBe(
        "docs/v1.0/intro-page.md",
      );
    });
  });

  describe("Locale Support", () => {
    test("handles German umlauts with locale 'de'", () => {
      expect(sluggit("Schöne Grüße über München", { locale: "de" })).toBe(
        "schoene-gruesse-ueber-muenchen",
      );
    });

    test("handles Scandinavian characters with locale 'da'", () => {
      expect(sluggit("København Blåbær", { locale: "da" })).toBe(
        "koebenhavn-blaabaer",
      );
    });

    test("handles Swedish characters with locale 'sv'", () => {
      expect(sluggit("Mörkö Räksmörgås", { locale: "sv" })).toBe(
        "moerkoe-raeksmoergaas",
      );
    });

    test("handles Turkish characters with locale 'tr'", () => {
      expect(sluggit("İstanbul Şehri Güneşi", { locale: "tr" })).toBe(
        "istanbul-sehri-gunesi",
      );
    });
  });

  describe("Unique Slug Generator", () => {
    test("returns base slug when no collisions exist", () => {
      const existing = ["apple", "banana"];
      expect(uniqueSlug("Orange", existing)).toBe("orange");
    });

    test("appends sequential numeric suffix on single collision", () => {
      const existing = ["my-post"];
      expect(uniqueSlug("My Post", existing)).toBe("my-post-1");
    });

    test("finds next available numeric index on multiple collisions", () => {
      const existing = ["my-post", "my-post-1", "my-post-2"];
      expect(uniqueSlug("My Post", existing)).toBe("my-post-3");
    });

    test("works with Set instances", () => {
      const existingSet = new Set(["blog-post", "blog-post-1"]);
      expect(uniqueSlug("Blog Post", existingSet)).toBe("blog-post-2");
    });

    test("works with custom separators and options", () => {
      const existing = ["my_post", "my_post_1"];
      expect(uniqueSlug("My Post", existing, { separator: "_" })).toBe(
        "my_post_2",
      );
    });

    test("is accessible via sluggit.unique", () => {
      const existing = ["article"];
      expect(sluggit.unique("Article", existing)).toBe("article-1");
    });

    test("returns empty string on empty input", () => {
      expect(uniqueSlug("", ["a", "b"])).toBe("");
    });
  });

  describe("Edge Cases", () => {
    test("handles empty string", () => {
      expect(sluggit("")).toBe("");
    });

    test("handles string with only special characters", () => {
      expect(sluggit("!@#$%^&*()")).toBe("");
    });

    test("handles string with only spaces", () => {
      expect(sluggit("   ")).toBe("");
    });

    test("handles string with only emojis", () => {
      expect(sluggit("🎉 🎊 🎈")).toBe("");
    });

    test("handles numeric inputs gracefully", () => {
      expect(sluggit(12345 as unknown as string)).toBe("12345");
    });

    test("handles uppercase locale identifiers", () => {
      expect(sluggit("Grüße", { locale: "DE" })).toBe("gruesse");
    });

    test("fills collision gaps in uniqueSlug", () => {
      const existing = ["post", "post-2"];
      expect(uniqueSlug("Post", existing)).toBe("post-1");
    });
  });

  describe("Combined Options", () => {
    test("combines multiple options correctly", () => {
      expect(
        sluggit("Hello & World © 2023!", {
          separator: "_",
          lowercase: false,
          maxLength: 15,
          customReplacements: {
            "&": "and",
            "©": "c",
          },
        }),
      ).toBe("Hello_and_World");
    });

    test("handles complex unicode and options", () => {
      expect(
        sluggit("Café & Résumé © 2023 🌟", {
          separator: "-",
          lowercase: true,
          maxLength: 20,
          customReplacements: {
            "&": "and",
            "©": "c",
          },
          preserveNumbers: true,
          removeTrailingDash: true,
        }),
      ).toBe("cafe-and-resume-c-2023");
    });
  });
});
