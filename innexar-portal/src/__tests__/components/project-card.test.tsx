import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ProjectListItem } from "@/types/projects-list";

const mockProject: ProjectListItem = {
  id: 1,
  name: "Meu Site",
  status: "building",
  progress: 50,
  created_at: "2025-01-15",
  expected_delivery: null,
  site_url: null,
  files_count: 2,
  has_files: true,
};

describe("ProjectCard", () => {
  it("renders project name, status label and progress", () => {
    render(<ProjectCard project={mockProject} index={0} locale="pt" />);
    expect(screen.getByText("Meu Site")).toBeInTheDocument();
    expect(screen.getByText("building")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("details")).toBeInTheDocument();
  });

  it("renders files count", () => {
    render(<ProjectCard project={mockProject} index={0} locale="pt" />);
    expect(screen.getByText(/filesLabel/)).toBeInTheDocument();
  });

  it("renders link to project details", () => {
    render(<ProjectCard project={mockProject} index={0} locale="pt" />);
    const link = screen.getByRole("link", { name: /details/i });
    expect(link).toHaveAttribute("href", "/pt/projects/1");
  });
});
