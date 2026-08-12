// app/(dashboard)/dashboard/components/keepAliveTabs.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
};

export default function KeepAliveTabs({ tabs, activeKey, onChange }: Props) {
  // Guarda quais abas já foram abertas (clicadas) — nessa ORDEM.
  const [visitedKeys, setVisitedKeys] = useState<string[]>([activeKey]);

  useEffect(() => {
    if (!visitedKeys.includes(activeKey)) {
      setVisitedKeys((prev) => [...prev, activeKey]);
    }
  }, [activeKey, visitedKeys]);

  // Só as abas já visitadas aparecem na barra — na ordem em que foram clicadas.
  const visibleTabs = tabs.filter((tab) => visitedKeys.includes(tab.key));

  function closeTab(e: React.MouseEvent, key: string) {
    e.stopPropagation(); // não deixa o clique no X também ativar a aba

    // Sempre mantém pelo menos 1 aba aberta
    if (visitedKeys.length <= 1) return;

    const closingIndex = visitedKeys.indexOf(key);
    const nextVisitedKeys = visitedKeys.filter((k) => k !== key);
    setVisitedKeys(nextVisitedKeys);

    // Se a aba fechada era a ativa, foca na aba anterior (à esquerda);
    // se era a primeira da lista, foca na que ficou no lugar (a nova primeira).
    if (key === activeKey) {
      const newIndex = Math.max(0, closingIndex - 1);
      onChange(nextVisitedKeys[newIndex]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho das abas — só mostra as abas já clicadas */}
      <div className="flex items-center gap-1 border-b border-zinc-200 bg-white px-2 shrink-0 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const active = tab.key === activeKey;
          const canClose = visibleTabs.length > 1;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`group flex items-center gap-2 pl-4 pr-2 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              {canClose && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => closeTab(e, tab.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") closeTab(e as unknown as React.MouseEvent, tab.key);
                  }}
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

      {/* Conteúdo: lazy-mount + preserva estado com display none/block */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {visibleTabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <div
              key={tab.key}
              style={{ display: active ? "block" : "none" }}
              className="h-full"
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}