import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawSceneData } from '../../types/excalidraw';
import '@excalidraw/excalidraw/index.css';

interface ExcalidrawEditorProps {
  onSceneChange?: (scene: ExcalidrawSceneData) => void;
  onElementsSelected?: (elementIds: string[]) => void;
  initialData?: ExcalidrawSceneData;
}

export function ExcalidrawEditor({
  onSceneChange,
  onElementsSelected,
  initialData,
}: ExcalidrawEditorProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const onSceneChangeRef = useRef(onSceneChange);
  const onElementsSelectedRef = useRef(onElementsSelected);

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange;
  }, [onSceneChange]);
  useEffect(() => {
    onElementsSelectedRef.current = onElementsSelected;
  }, [onElementsSelected]);

  const handleApiReady = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly ExcalidrawElement[], appState: any, _files: any) => {
      if (!apiRef.current) return;

      if (onSceneChangeRef.current) {
        const files = apiRef.current.getFiles();
        onSceneChangeRef.current({
          elements,
          appState: {
            viewBackgroundColor: appState?.viewBackgroundColor,
          },
          files: files ?? {},
        });
      }

      if (onElementsSelectedRef.current && appState?.selectedElementIds) {
        const selectedIds = Object.keys(appState.selectedElementIds).filter(
          (id: string) => appState.selectedElementIds[id],
        );
        onElementsSelectedRef.current(selectedIds);
      }
    },
    [],
  );

  const stableInitialData = useMemo(
    () =>
      initialData
        ? {
            elements: initialData.elements as ExcalidrawElement[],
            appState: initialData.appState,
            files: initialData.files,
          }
        : undefined,
    [initialData],
  );

  return (
    <div
      className="excalidraw-wrapper"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Excalidraw
        excalidrawAPI={handleApiReady}
        initialData={stableInitialData}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
