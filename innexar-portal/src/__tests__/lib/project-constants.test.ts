import {
  getStatusColorClasses,
  formatFileSize,
  PROJECT_STATUS_CONFIG,
  MOD_STATUS_LABELS,
} from "@/lib/project-constants";

describe("project-constants", () => {
  describe("getStatusColorClasses", () => {
    it("returns color classes for known color", () => {
      const c = getStatusColorClasses("blue");
      expect(c.bg).toBe("bg-blue-500/20");
      expect(c.border).toBe("border-blue-500/30");
      expect(c.text).toBe("text-blue-400");
    });

    it("returns blue as fallback for unknown color", () => {
      const c = getStatusColorClasses("unknown");
      expect(c.bg).toBe("bg-blue-500/20");
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });
    it("formats KB", () => {
      expect(formatFileSize(2048)).toBe("2.0 KB");
    });
    it("formats MB", () => {
      expect(formatFileSize(1024 * 1024 * 2)).toBe("2.0 MB");
    });
  });

  describe("PROJECT_STATUS_CONFIG", () => {
    it("has expected status keys", () => {
      expect(PROJECT_STATUS_CONFIG.aguardando_briefing).toBeDefined();
      expect(PROJECT_STATUS_CONFIG.concluido).toBeDefined();
      expect(PROJECT_STATUS_CONFIG.cancelado).toBeDefined();
    });
  });

  describe("MOD_STATUS_LABELS", () => {
    it("has expected mod status keys", () => {
      expect(MOD_STATUS_LABELS.pending).toEqual({
        label: "Pendente",
        color: "amber",
      });
      expect(MOD_STATUS_LABELS.completed).toEqual({
        label: "Concluída",
        color: "green",
      });
    });
  });
});
