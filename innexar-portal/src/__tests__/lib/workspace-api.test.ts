import {
  getWorkspaceApiBase,
  useWorkspaceApi,
  getCustomerToken,
  CUSTOMER_TOKEN_KEY,
  STAFF_TOKEN_KEY,
} from "@/lib/workspace-api";

describe("workspace-api", () => {
  describe("getWorkspaceApiBase", () => {
    it("returns a string (normalized URL or empty)", () => {
      const base = getWorkspaceApiBase();
      expect(typeof base).toBe("string");
      expect(base === "" || !base.endsWith("/")).toBe(true);
    });
  });

  describe("useWorkspaceApi", () => {
    it("returns a boolean", () => {
      expect(typeof useWorkspaceApi()).toBe("boolean");
    });
  });

  describe("getCustomerToken", () => {
    it("returns string or null", () => {
      const token = getCustomerToken();
      expect(token === null || typeof token === "string").toBe(true);
    });
  });

  describe("constants", () => {
    it("exports CUSTOMER_TOKEN_KEY and STAFF_TOKEN_KEY", () => {
      expect(CUSTOMER_TOKEN_KEY).toBe("customer_token");
      expect(STAFF_TOKEN_KEY).toBe("staff_token");
    });
  });
});
