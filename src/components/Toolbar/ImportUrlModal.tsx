import { Button } from '@mantine/core';
import { Modal } from '../common';

interface ImportUrlModalProps {
  isOpen: boolean;
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onImport: () => void;
  onClose: () => void;
}

export function ImportUrlModal({
  isOpen,
  url,
  loading,
  onUrlChange,
  onImport,
  onClose,
}: ImportUrlModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import from Excalidraw URL"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="default" size="xs" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" onClick={onImport} disabled={loading || !url.trim()}>
            {loading ? 'Loading...' : 'Import'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-text-muted">
          Paste an Excalidraw sharing link to import the drawing.
        </p>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onImport();
          }}
          placeholder="https://excalidraw.com/#json=..."
          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          autoFocus
          disabled={loading}
        />
        <p className="text-xs text-text-muted">
          Supported format: <code className="text-accent">https://excalidraw.com/#json=ID,KEY</code>
        </p>
      </div>
    </Modal>
  );
}
