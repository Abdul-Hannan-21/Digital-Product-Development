import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const condition1 = false;
    const condition2 = true;
    expect(cn("foo", condition1 && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", condition2 && "bar")).toBe("foo bar");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    // twMerge resolves conflicting Tailwind utilities
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("py-2", "py-4")).toBe("py-4");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, "bar", null)).toBe("foo bar");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with conditional classes", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should combine multiple class types", () => {
    expect(cn("foo", ["bar", "baz"], { qux: true })).toBe("foo bar baz qux");
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
