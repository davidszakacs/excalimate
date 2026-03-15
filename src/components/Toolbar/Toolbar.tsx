import { Button } from '@mantine/core';
import { IconGhost, IconListDetails, IconBroadcast, IconBroadcastOff } from '@tabler/icons-react';
import { FileControls } from './FileControls';
import { ModeSwitcher } from './ModeSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { ExportControls } from './ExportControls';
import { FrameControls } from './FrameControls';
import { useUIStore } from '../../stores/uiStore';
import { useMcpLive } from '../../hooks/useMcpLive';

export function Toolbar() {
  const ghostMode = useUIStore((s) => s.ghostMode);
  const sequenceRevealOpen = useUIStore((s) => s.sequenceRevealOpen);
  const theme = useUIStore((s) => s.theme);
  const { connected, connect, disconnect } = useMcpLive();

  return (
    <header role="toolbar" aria-label="Main toolbar" className="bg-surface border-border shadow-float mx-2 my-2 flex items-center h-10 px-2 gap-1 border rounded-lg select-none">
      {/* Left section: Logo and file controls */}
      <div className="flex items-center gap-1 mr-4">
        <img src={theme === 'dark' ? '/excalimate_logo_dark.svg' : '/excalimate_logo.svg'} alt="Excalimate logo" className="w-auto h-5" />
        <FileControls />
      </div>

      {/* Center section: Mode switcher */}
      <div className="flex-1 flex justify-center">
        <ModeSwitcher />
      </div>

      {/* Right section: Ghost mode + Frame + Playback + Export */}
      <div className="flex items-center gap-1">
        <Button
          variant={ghostMode ? 'light' : 'subtle'}
          color={ghostMode ? 'indigo' : 'gray'}
          size="compact-xs"
          leftSection={<IconGhost size={14} />}
          onClick={() => useUIStore.getState().toggleGhostMode()}
          title="Ghost Mode: Show faded hidden elements for easier selection"
        >
          Ghost
        </Button>
        <Button
          variant={sequenceRevealOpen ? 'light' : 'subtle'}
          color={sequenceRevealOpen ? 'indigo' : 'gray'}
          size="compact-xs"
          leftSection={<IconListDetails size={14} />}
          onClick={() => useUIStore.getState().toggleSequenceReveal()}
          title="Sequence Reveal: Create staggered reveal animations"
        >
          Sequence
        </Button>
        <Button
          variant={connected ? 'light' : 'subtle'}
          color={connected ? 'green' : 'gray'}
          size="compact-xs"
          leftSection={connected ? <IconBroadcast size={14} /> : <IconBroadcastOff size={14} />}
          onClick={() => connected ? disconnect() : connect()}
          title={connected ? 'Disconnect from MCP server' : 'Connect to MCP server for live AI-driven updates'}
        >
          Live
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <FrameControls />
        <div className="w-px h-5 bg-border mx-1" />
        <ExportControls />
        <div className="w-px h-5 bg-border mx-1" />
        <ThemeToggle />
      </div>
    </header>
  );
}
