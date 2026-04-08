export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
