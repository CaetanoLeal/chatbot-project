// app/(dashboard)/dashboard/components/keepAliveTabs.tsx
"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type Tab = { key: string; label: string; content: ReactNode; closable?: boolean };

type Props = {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  onClose?: (key: string) => void;
};

export default function KeepAliveTabs({ tabs, activeKey, onChange, onClose }: Props) {
  function closeTab(e: React.MouseEvent, key: string) {
    e.stopPropagation();
    onClose?.(key);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-zinc-200 bg-white px-2 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          const canClose = tab.closable !== false && tabs.length > 1;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`group flex items-center gap-2 pl-4 pr-2 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              {canClose && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => closeTab(e, tab.key)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") closeTab(e as any, tab.key) }}
                  className={`p-0.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <X size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tabs.map((tab) => (
          <div key={tab.key} style={{ display: tab.key === activeKey ? "block" : "none" }} className="h-full">
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}