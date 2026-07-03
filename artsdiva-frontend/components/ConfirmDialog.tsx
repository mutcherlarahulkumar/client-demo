interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded border border-border bg-background p-4 shadow-sm">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="border px-2 py-1 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="border px-2 py-1 text-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
