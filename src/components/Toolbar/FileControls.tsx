import { Menu, UnstyledButton } from '@mantine/core';
import {
  IconFilePlus, IconFolderOpen, IconDeviceFloppy,
  IconFileImport, IconPlug, IconLink, IconShare, IconChevronDown,
} from '@tabler/icons-react';
import { ImportUrlModal } from './ImportUrlModal';
import { useFileOperations } from './useFileOperations';
import { useShareOperations } from './useShareOperations';

export function FileControls() {
  const { handleNew, handleOpen, handleSave, handleImportFile, handleLoadCheckpoint } =
    useFileOperations();
  const {
    loading,
    handleShare,
    showUrlModal,
    setShowUrlModal,
    url,
    setUrl,
    handleImportUrl,
  } = useShareOperations();

  return (
    <>
      <Menu shadow="md" width={220} position="bottom-start">
        <Menu.Target>
          <UnstyledButton className="px-2 py-1 text-xs rounded-md transition-colors font-medium hover:bg-surface-alt text-text-muted flex items-center gap-1">
            File <IconChevronDown size={12} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFilePlus size={16} />} onClick={handleNew}>
            New
          </Menu.Item>
          <Menu.Item leftSection={<IconFolderOpen size={16} />} onClick={handleOpen}>
            Open
          </Menu.Item>
          <Menu.Item leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave}>
            Save
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Import</Menu.Label>
          <Menu.Item leftSection={<IconFileImport size={16} />} onClick={handleImportFile}>
            Import file
          </Menu.Item>
          <Menu.Item leftSection={<IconPlug size={16} />} onClick={handleLoadCheckpoint}>
            MCP checkpoint
          </Menu.Item>
          <Menu.Item leftSection={<IconLink size={16} />} onClick={() => setShowUrlModal(true)}>
            From URL
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item leftSection={<IconShare size={16} />} onClick={handleShare}>
            Share
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {showUrlModal && (
        <ImportUrlModal
          isOpen={showUrlModal}
          url={url}
          loading={loading}
          onUrlChange={setUrl}
          onImport={handleImportUrl}
          onClose={() => {
            setShowUrlModal(false);
            setUrl('');
          }}
        />
      )}
    </>
  );
}
