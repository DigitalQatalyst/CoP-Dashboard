"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDrillDown } from "@/components/shared/DrillDownContext";
import { useContractors } from "@/hooks/useContractors";
import type { Position } from "@/types/cop";

interface GlobalSearchProps {
  positions: Position[];
}

export function GlobalSearch({ positions }: GlobalSearchProps) {
  const { openDrillDown } = useDrillDown();
  const { data: contractorData } = useContractors();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contractors = contractorData?.contractors ?? [];

  const trimmed = query.trim().toLowerCase();

  const matchedPositions = trimmed.length >= 2
    ? positions.filter((p) => p.name.toLowerCase().includes(trimmed)).slice(0, 6)
    : [];

  const matchedContractors = trimmed.length >= 2
    ? contractors.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 6)
    : [];

  const hasResults = matchedPositions.length > 0 || matchedContractors.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleSelect(type: "position" | "contractor", id: string) {
    openDrillDown(type, id);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search positions & contractors…"
          className="h-9 w-full rounded-2xl border border-border bg-muted/40 py-2 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </span>
        )}
      </div>

      {open && trimmed.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              {matchedPositions.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Positions
                  </p>
                  {matchedPositions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect("position", p.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        P
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{p.studio} · {p.buTower}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchedContractors.length > 0 && (
                <div className={matchedPositions.length > 0 ? "border-t border-border" : ""}>
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Contractors
                  </p>
                  {matchedContractors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect("contractor", c.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        C
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.priority} · {c.initiative}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
                Click a result to open its detail panel
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
