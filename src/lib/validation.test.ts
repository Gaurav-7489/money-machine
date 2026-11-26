import { describe, expect, it } from "vitest";
import { profileInput } from "./validation";

const base = { displayName: "Asha", bio: "", category: "", country: "", city: "", priceFrom: "", priceTo: "", perSaleMin: "", perSaleMax: "", perThousandMin: "", perThousandMax: "", earningModels: [], instagram: "", youtube: "", x: "", email: "" };

describe("profileInput", () => {
  it("turns empty optional fields into undefined", () => {
    const r = profileInput.parse(base);
    expect(r.priceFrom).toBeUndefined();
    expect(r.email).toBeUndefined();
    expect(r.instagram).toBeUndefined();
  });
  it("cleans social handles and parses prices", () => {
    const r = profileInput.parse({ ...base, instagram: "https://instagram.com/asha.cooks/", x: "@asha", priceFrom: "500", priceTo: "900" });
    expect(r.instagram).toBe("asha.cooks");
    expect(r.x).toBe("asha");
    expect(r.priceFrom).toBe(500);
  });
  it("rejects a bad email and a reversed price range", () => {
    expect(profileInput.safeParse({ ...base, email: "nope" }).success).toBe(false);
    expect(profileInput.safeParse({ ...base, priceFrom: "900", priceTo: "100" }).success).toBe(false);
    expect(profileInput.safeParse({ ...base, perSaleMin: "300", perSaleMax: "100" }).success).toBe(false);
  });
});
