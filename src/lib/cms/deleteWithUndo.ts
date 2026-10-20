import { toast } from 'sonner';

export function deleteWithUndo(
  url: string,
  displayName: string,
  restore: () => void
) {
  let settled = false;

  const cleanup = () => {
    window.clearTimeout(timer);
    window.removeEventListener('pagehide', commitDelete);
  };

  const commitDelete = async () => {
    if (settled) return;
    settled = true;
    cleanup();
    toast.dismiss(toastId);

    try {
      // Let the request finish even when a refresh closes the Undo window.
      const res = await fetch(url, { method: 'DELETE', keepalive: true });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      toast.error('Failed to delete — restoring');
      restore();
    }
  };

  const timer = window.setTimeout(commitDelete, 5000);
  window.addEventListener('pagehide', commitDelete);

  const toastId = toast(`Deleted "${displayName}"`, {
    action: {
      label: 'Undo',
      onClick: () => {
        if (settled) return;
        settled = true;
        cleanup();
        restore();
      },
    },
    duration: 5000,
    onAutoClose: commitDelete,
    onDismiss: commitDelete,
  });
}
