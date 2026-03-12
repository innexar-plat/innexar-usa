import {
  PROJECT_STATUS_CONFIG,
  getProgressFromStatus,
  getProjectColorClasses,
} from "@/lib/project-status";

describe("project-status", () => {
  describe("PROJECT_STATUS_CONFIG", () => {
    it("has expected status keys with icon, color, label", () => {
      const entry = PROJECT_STATUS_CONFIG.aguardando_briefing;
      expect(entry).toBeDefined();
      expect(entry.color).toBe("amber");
      expect(entry.label).toBe("Aguardando Briefing");
      expect(entry.icon).toBeDefined();
      expect(PROJECT_STATUS_CONFIG.building).toBeDefined();
      expect(PROJECT_STATUS_CONFIG.ativo).toBeDefined();
      expect(PROJECT_STATUS_CONFIG.cancelado).toBeDefined();
    });

    it("building has purple color and Em Desenvolvimento label", () => {
      expect(PROJECT_STATUS_CONFIG.building.color).toBe("purple");
      expect(PROJECT_STATUS_CONFIG.building.label).toBe("Em Desenvolvimento");
    });
  });

  describe("getProgressFromStatus", () => {
    it("returns 0 for aguardando_briefing and pending_payment", () => {
      expect(getProgressFromStatus("aguardando_briefing")).toBe(0);
      expect(getProgressFromStatus("pending_payment")).toBe(0);
    });

    it("returns 20 for briefing_recebido", () => {
      expect(getProgressFromStatus("briefing_recebido")).toBe(20);
    });

    it("returns 100 for ativo, entregue, delivered, concluido", () => {
      expect(getProgressFromStatus("ativo")).toBe(100);
      expect(getProgressFromStatus("entregue")).toBe(100);
      expect(getProgressFromStatus("delivered")).toBe(100);
      expect(getProgressFromStatus("concluido")).toBe(100);
    });

    it("returns 0 for unknown status", () => {
      expect(getProgressFromStatus("unknown_status")).toBe(0);
    });
  });

  describe("getProjectColorClasses", () => {
    it("returns bg, border, text, gradient for known color", () => {
      const blue = getProjectColorClasses("blue");
      expect(blue).toHaveProperty("bg", "bg-blue-500/20");
      expect(blue).toHaveProperty("border", "border-blue-500/30");
      expect(blue).toHaveProperty("text", "text-blue-400");
      expect(blue.gradient).toContain("from-blue-500");
    });

    it("returns blue classes for unknown color", () => {
      const fallback = getProjectColorClasses("unknown");
      expect(fallback.bg).toBe("bg-blue-500/20");
    });
  });
});
