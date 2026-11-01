import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schema";

describe("registerSchema", () => {
  const ok = {
    name: "Pat Test",
    email: "pat@example.com",
    password: "long-enough",
  };

  it("accepts a valid sign-up and trims the name and email", () => {
    const parsed = registerSchema.parse({
      ...ok,
      name: "  Pat  ",
      email: " pat@example.com ",
    });
    expect(parsed).toMatchObject({ name: "Pat", email: "pat@example.com" });
  });
  it.each([
    [{ ...ok, name: "P" }, "name"],
    [{ ...ok, email: "nope" }, "email"],
    [{ ...ok, password: "short" }, "password"],
    [{ ...ok, password: "x".repeat(73) }, "password"],
  ])("rejects %j", (input, field) => {
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe(field);
  });
});

describe("loginSchema", () => {
  it("only needs an email shape and a non-empty password (the API decides the rest)", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "x" }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "" }).success,
    ).toBe(false);
  });
});
