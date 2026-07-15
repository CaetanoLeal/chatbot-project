// app/(dashboard)/dashboard/funnels/new/page.tsx

"use client";

import FunnelFlowBuilder from "../components/FunnelForm";

export default function NewFunnelPage() {
  return (
    <FunnelFlowBuilder
      mode="create"
    />
  );
}