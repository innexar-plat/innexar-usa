"use client";

import { useWorkspaceApi } from "@/lib/workspace-api";
import PortalDashboardWorkspace from "@/components/PortalDashboardWorkspace";

export default function PortalDashboard() {
  const isWorkspaceApi = useWorkspaceApi();

  if (!isWorkspaceApi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-400 text-center max-w-md">
          Portal requer configuração. Configure NEXT_PUBLIC_USE_WORKSPACE_API e
          NEXT_PUBLIC_WORKSPACE_API_URL no ambiente.
        </p>
      </div>
    );
  }

  return <PortalDashboardWorkspace />;
}
