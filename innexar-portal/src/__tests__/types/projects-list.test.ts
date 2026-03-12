import type { ProjectListItem } from "@/types/projects-list";

describe("projects-list types", () => {
  it("ProjectListItem has required fields", () => {
    const project: ProjectListItem = {
      id: 1,
      name: "My Site",
      status: "building",
      progress: 50,
      created_at: "2025-01-01",
      expected_delivery: null,
      site_url: "https://example.com",
      files_count: 3,
      has_files: true,
    };
    expect(project.id).toBe(1);
    expect(project.name).toBe("My Site");
    expect(project.progress).toBe(50);
    expect(project.site_url).toBe("https://example.com");
  });
});
