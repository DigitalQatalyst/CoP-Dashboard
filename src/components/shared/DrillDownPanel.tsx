"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
  // E5: prev/next navigation
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  // E7: back navigation
  onBack?: () => void;
  backLabel?: string;
}

export function DrillDownPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  badges,
  children,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  onBack,
  backLabel,
}: DrillDownPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 border-l border-border bg-card data-[state=open]:duration-400 data-[state=closed]:duration-400"
      >
        <div className="flex h-full flex-col">
          {/* E6: header is outside ScrollArea so it stays fixed at the top while content scrolls */}
          <SheetHeader className="shrink-0 border-b border-border bg-card px-6 py-5 pr-16 text-left shadow-sm">
            {/* E7: back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {backLabel ?? "Back"}
              </button>
            )}
            <SheetTitle className="text-xl pr-2">{title}</SheetTitle>
            {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
            {badges && <div className="flex flex-wrap gap-2 pt-2">{badges}</div>}

            {/* E5: prev/next navigation */}
            {(onPrev ?? onNext) && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {prevLabel ?? "Prev"}
                </button>
                <button
                  onClick={onNext}
                  disabled={!onNext}
                  className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-30"
                >
                  {nextLabel ?? "Next"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </SheetHeader>
          <ScrollArea className="flex-1 px-6 py-5">{children}</ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
