import { Button } from '@mantine/core';
import { IconPencil, IconMovie } from '@tabler/icons-react';
import { useUIStore } from '../../stores/uiStore';

export function ModeSwitcher() {
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);

  return (
    <div className="flex items-center bg-surface rounded-md p-0.5">
      <Button
        variant={mode === 'edit' ? 'light' : 'subtle'}
        color={mode === 'edit' ? 'indigo' : 'gray'}
        size="compact-xs"
        leftSection={<IconPencil size={14} />}
        onClick={() => setMode('edit')}
      >
        Edit
      </Button>
      <Button
        variant={mode === 'animate' ? 'light' : 'subtle'}
        color={mode === 'animate' ? 'indigo' : 'gray'}
        size="compact-xs"
        leftSection={<IconMovie size={14} />}
        onClick={() => setMode('animate')}
      >
        Animate
      </Button>
    </div>
  );
}
