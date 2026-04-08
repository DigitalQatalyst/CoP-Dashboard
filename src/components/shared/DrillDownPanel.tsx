"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
}

export function DrillDownPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  badges,
  children,
}: DrillDownPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 border-l border-border bg-card data-[state=open]:duration-400 data-[state=closed]:duration-400"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
            {badges && <div className="flex flex-wrap gap-2 pt-2">{badges}</div>}
          </SheetHeader>
          <ScrollArea className="flex-1 px-6 py-5">{children}</ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
