import { sluggy } from "../src/index";

describe("Sluggy Utility Tests", () => {
  test("converts basic text to lowercase slug", () => {
    expect(sluggy("Hello World!")).toBe("hello-world");
  });

  test("removes emojis from text", () => {
    expect(sluggy("Sluggy 😎 Test")).toBe("sluggy-test");
  });

  test("normalizes accented characters", () => {
    expect(sluggy("Café du Monde")).toBe("cafe-du-monde");
  });

  test("allows custom separator", () => {
    expect(sluggy("Hello World!", { separator: "_" })).toBe("hello_world");
  });

  test("respects uppercase option when lowercase is false", () => {
    expect(sluggy("Hello World!", { lowercase: false })).toBe("Hello-World");
  });
});
