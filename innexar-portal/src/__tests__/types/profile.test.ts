import type { CustomerProfile } from "@/types/profile";
import { emptyProfile } from "@/types/profile";

describe("profile types", () => {
  it("emptyProfile has expected shape", () => {
    expect(emptyProfile).toEqual({
      name: "",
      email: "",
      phone: null,
      address: null,
    });
  });

  it("CustomerProfile allows partial address", () => {
    const profile: CustomerProfile = {
      name: "Jane",
      email: "jane@example.com",
      phone: "+5511999999999",
      address: { street: "Rua A", city: "São Paulo" },
    };
    expect(profile.name).toBe("Jane");
    expect(profile.address?.street).toBe("Rua A");
  });
});
