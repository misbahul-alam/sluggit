import { sluggit } from "../src/index";

describe("Sluggit Utility Tests", () => {
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
