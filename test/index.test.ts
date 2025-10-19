import { sluggit } from "../src/index";

describe("Sluggit Utility Tests", () => {
  describe("Basic Functionality", () => {
    test("converts basic text to lowercase slug", () => {
      expect(sluggit("Hello World!")).toBe("hello-world");
    });

    test("removes emojis from text", () => {
      expect(sluggit("Sluggy 😎 Test")).toBe("sluggy-test");
    });

    test("normalizes accented characters", () => {
      expect(sluggit("Café du Monde")).toBe("cafe-du-monde");
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
        "-hello-world-"
      );
    });

    test("removes trailing dash when removeTrailingDash is true", () => {
      expect(sluggit("Hello World - ", { removeTrailingDash: true })).toBe(
        "hello-world"
      );
    });
  });

  describe("Length Limiting", () => {
    test("respects maxLength while keeping word boundaries", () => {
      expect(sluggit("The Quick Brown Fox", { maxLength: 10 })).toBe(
        "the-quick"
      );
    });

    test("handles maxLength with custom separator", () => {
      expect(
        sluggit("The Quick Brown Fox", { maxLength: 10, separator: "_" })
      ).toBe("the_quick");
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
        })
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
        })
      ).toBe("product-tm-and-copyright-c");
    });
  });

  describe("Number Handling", () => {
    test("preserves numbers by default", () => {
      expect(sluggit("Hello 123 World")).toBe("hello-123-world");
    });

    test("removes numbers when preserveNumbers is false", () => {
      expect(sluggit("Hello 123 World", { preserveNumbers: false })).toBe(
        "hello-world"
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
        })
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
        })
      ).toBe("cafe-and-resume-c-2023");
    });
  });
});
