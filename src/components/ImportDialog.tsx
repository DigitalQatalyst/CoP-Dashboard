import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseCSV, parseExcel } from "@/lib/import-positions";
import type { Position } from "@/data/positions";

interface ImportDialogProps {
  onImport: (positions: Position[]) => void;
}

export function ImportDialog({ onImport }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Position[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setFileName("");
    setError("");
  };

  const processFile = async (file: File) => {
    reset();
    setFileName(file.name);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let positions: Position[];

      if (ext === "csv") {
        const text = await file.text();
        positions = parseCSV(text);
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        positions = parseExcel(buffer);
      } else {
        setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
        return;
      }

      if (positions.length === 0) {
        setError("No valid position rows found. Ensure the file has a 'Position' or 'Role' column.");
        return;
      }

      setPreview(positions);
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border border-border rounded-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Upload className="h-3 w-3" />
          Import
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Import Positions
          </DialogTitle>
        </DialogHeader>

        {!preview && !error && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xs font-mono text-muted-foreground">
              Drop a <span className="text-foreground font-semibold">.csv</span> or{" "}
              <span className="text-foreground font-semibold">.xlsx</span> file here
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">or click to browse</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono text-destructive">{error}</p>
                <p className="text-[10px] text-muted-foreground mt-1">File: {fileName}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="w-full text-xs font-mono">
              Try another file
            </Button>
          </div>
        )}

        {preview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-secondary rounded-sm">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-medium truncate">{fileName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {preview.length} positions parsed
                </p>
              </div>
              <button onClick={reset} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="border border-border rounded-sm">
              <div className="grid grid-cols-[1fr_60px_60px_50px] px-3 py-1.5 bg-secondary text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>Position</span>
                <span className="text-right">HC</span>
                <span className="text-right">Studio</span>
                <span className="text-right">Vacancy</span>
              </div>
              <ScrollArea className="max-h-[200px]">
                {preview.map((p, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_60px_60px_80px] px-3 py-1.5 text-xs border-b border-border last:border-0"
                  >
                    <span className="truncate font-medium">{p.position}</span>
                    <span className="text-right text-muted-foreground">
                      {p.actualYTD}/{p.planFYE}
                    </span>
                    <span className="text-right text-muted-foreground text-[10px]">
                      {p.studio}
                    </span>
                    <span className="text-right text-[10px] text-muted-foreground">
                      {p.vacancyStatus}
                    </span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset} className="flex-1 text-xs font-mono">
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirm} className="flex-1 text-xs font-mono">
                Import {preview.length} positions
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              This will replace existing position data for the current session.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
