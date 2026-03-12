import { renderHook, waitFor } from "@testing-library/react";
import { useProjectsList } from "@/hooks/use-projects-list";
import * as workspaceApi from "@/lib/workspace-api";

jest.mock("@/lib/workspace-api", () => ({
  useWorkspaceApi: jest.fn(),
  getCustomerToken: jest.fn(),
  workspaceFetch: jest.fn(),
}));

describe("useProjectsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (workspaceApi.useWorkspaceApi as jest.Mock).mockReturnValue(true);
    (workspaceApi.getCustomerToken as jest.Mock).mockReturnValue("fake-token");
  });

  it("returns projects and loading", () => {
    (workspaceApi.workspaceFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const { result } = renderHook(() => useProjectsList());
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it("sets projects and loading false after fetch", async () => {
    (workspaceApi.workspaceFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: "P1", status: "building", created_at: "2025-01-01" }],
    });
    const { result } = renderHook(() => useProjectsList());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe("P1");
    expect(result.current.projects[0].progress).toBe(50);
  });
});
