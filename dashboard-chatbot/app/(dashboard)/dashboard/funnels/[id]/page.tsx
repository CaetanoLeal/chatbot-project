//app/(dashboard)/dashboard/funnels/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import FunnelFlowBuilder from "../components/FunnelForm";

export default function EditFunnelPage() {
  const params = useParams();

  const idFunil = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);

  if (!idFunil) {
    return <div className="p-6">Funil não encontrado.</div>;
  }

  return <FunnelFlowBuilder idFunil={idFunil} />;
}