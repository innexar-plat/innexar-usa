import { API_PATHS } from "@/lib/api-paths";

describe("api-paths", () => {
  it("PROJECTS.DETAIL returns path with id", () => {
    expect(API_PATHS.PROJECTS.DETAIL("123")).toBe("/api/portal/projects/123");
    expect(API_PATHS.PROJECTS.DETAIL(456)).toBe("/api/portal/projects/456");
  });

  it("PROJECTS.FILES returns path with id", () => {
    expect(API_PATHS.PROJECTS.FILES("1")).toBe("/api/portal/projects/1/files");
  });

  it("PROJECTS.FILE_DOWNLOAD returns path with projectId and fileId", () => {
    expect(API_PATHS.PROJECTS.FILE_DOWNLOAD("1", "2")).toBe(
      "/api/portal/projects/1/files/2/download"
    );
  });

  it("ME.FEATURES and ME.DASHBOARD match API_PORTAL", () => {
    expect(API_PATHS.ME.FEATURES).toBe("/api/portal/me/features");
    expect(API_PATHS.ME.DASHBOARD).toBe("/api/portal/me/dashboard");
  });

  it("AUTH and ME paths exist", () => {
    expect(API_PATHS.AUTH.LOGIN).toBe("/api/public/auth/customer/login");
    expect(API_PATHS.AUTH.CHECKOUT_LOGIN).toBe("/api/public/auth/customer/checkout-login");
    expect(API_PATHS.ME.PROFILE).toBe("/api/portal/me/profile");
    expect(API_PATHS.ME.PASSWORD).toBe("/api/portal/me/password");
    expect(API_PATHS.ME.SET_PASSWORD).toBe("/api/portal/me/set-password");
    expect(API_PATHS.PROJECTS.MESSAGES_UPLOAD(1)).toBe("/api/portal/projects/1/messages/upload");
  });
});
