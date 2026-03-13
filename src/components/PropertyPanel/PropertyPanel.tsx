import { useMemo } from 'react';
import type {
  AnimationTrack,
  Keyframe,
  AnimatableProperty,
  EasingType,
} from '../../types/animation';
import { EASING_TYPES, PROPERTY_DEFAULTS } from '../../types/animation';
import type { AnimatableTarget } from '../../types/excalidraw';
import { NumberInput } from '../common/NumberInput';
import { Dropdown } from '../common/Dropdown';
import { interpolate } from '../../core/engine/InterpolationEngine';

const PROPERTY_CONFIG: Record<
  AnimatableProperty,
  {
    label: string; icon: string; suffix: string;
    min?: number; max?: number; step: number;
    displayScale?: number;
  }
> = {
  opacity: { label: 'Opacity', icon: '👁', suffix: '%', min: 0, max: 100, step: 1, displayScale: 100 },
  translateX: { label: 'Position X', icon: '↔', suffix: 'px', step: 1 },
  translateY: { label: 'Position Y', icon: '↕', suffix: 'px', step: 1 },
  scaleX: { label: 'Scale X', icon: '⇔', suffix: '%', min: 10, max: 500, step: 1, displayScale: 100 },
  scaleY: { label: 'Scale Y', icon: '⇕', suffix: '%', min: 10, max: 500, step: 1, displayScale: 100 },
  rotation: { label: 'Rotation', icon: '↻', suffix: '°', step: 1 },
  drawProgress: { label: 'Draw Progress', icon: '✏', suffix: '%', min: 0, max: 100, step: 1, displayScale: 100 },
};

import { CAMERA_FRAME_TARGET_ID } from '../../stores/projectStore';

/** Convert internal value to display value */
function toDisplay(property: AnimatableProperty, internal: number): number {
  const config = PROPERTY_CONFIG[property];
  if (!config) return internal;
  return internal * (config.displayScale ?? 1);
}

/** Convert display value to internal value */
function toInternal(property: AnimatableProperty, display: number): number {
  const config = PROPERTY_CONFIG[property];
  if (!config) return display;
  return display / (config.displayScale ?? 1);
}

const EASING_OPTIONS = EASING_TYPES.map((t) => ({ value: t, label: t }));

export interface PropertyPanelProps {
  selectedTargets: AnimatableTarget[];
  allTargets: AnimatableTarget[];
  tracks: AnimationTrack[];
  currentTime: number;
  selectedKeyframes: { track: AnimationTrack; keyframe: Keyframe }[];
  onAddTrack: (targetId: string, targetType: 'element' | 'group', property: AnimatableProperty) => void;
  onAddOrUpdateKeyframe: (trackId: string, time: number, value: number) => void;
  onUpdateKeyframe: (trackId: string, keyframeId: string, updates: Partial<Pick<Keyframe, 'time' | 'value' | 'easing'>>) => void;
  onDeleteKeyframe: (trackId: string, keyframeId: string) => void;
  onSelectTarget: (targetId: string) => void;
}

function TargetInfo({ target }: { target: AnimatableTarget }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="text-indigo-400 text-xs">{target.type === 'group' ? '⊞' : '◇'}</span>
      <span className="text-xs font-medium truncate flex-1">{target.label}</span>
      <span className="text-[10px] text-[var(--color-text-secondary)]">
        {target.type === 'group'
          ? `${target.elementIds.length} els`
          : `${Math.round(target.originalBounds.width)}×${Math.round(target.originalBounds.height)}`}
      </span>
    </div>
  );
}

function SelectedKeyframeEditor({
  track,
  keyframe,
  onUpdate,
  onDelete,
}: {
  track: AnimationTrack;
  keyframe: Keyframe;
  onUpdate: (updates: Partial<Pick<Keyframe, 'time' | 'value' | 'easing'>>) => void;
  onDelete: () => void;
}) {
  const config = PROPERTY_CONFIG[track.property] ?? { label: track.property, icon: '?', suffix: '', step: 1 };
  const displayVal = toDisplay(track.property, keyframe.value);
  return (
    <div className="px-3 py-2 border-b border-[var(--color-border)] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium flex items-center gap-1">
          <span className="text-indigo-400">◆</span> {config.icon} {config.label}
        </span>
        <button className="text-[10px] text-red-400 hover:text-red-300" onClick={onDelete} title="Delete keyframe">
          ✕ Delete
        </button>
      </div>
      <NumberInput label="Time" value={keyframe.time} onChange={(v) => onUpdate({ time: Math.max(0, v) })} min={0} step={10} suffix="ms" />
      <NumberInput
        label="Value"
        value={displayVal}
        onChange={(v) => onUpdate({ value: toInternal(track.property, v) })}
        min={config.min}
        max={config.max}
        step={config.step}
        suffix={config.suffix}
      />
      <Dropdown label="Easing" value={keyframe.easing} onChange={(v) => onUpdate({ easing: v as EasingType })} options={EASING_OPTIONS} />
    </div>
  );
}

export function PropertyPanel({
  selectedTargets,
  allTargets,
  tracks,
  currentTime,
  selectedKeyframes,
  onAddTrack,
  onAddOrUpdateKeyframe,
  onUpdateKeyframe,
  onDeleteKeyframe,
  onSelectTarget,
}: PropertyPanelProps) {
  const isMulti = selectedTargets.length > 1;
  const isCamera = selectedTargets.some(t => t.id === CAMERA_FRAME_TARGET_ID);

  // Auto-find keyframes at current time for selected targets (in addition to explicitly selected ones)
  const keyframesAtCurrentTime = useMemo(() => {
    const result: { track: AnimationTrack; keyframe: Keyframe }[] = [];
    const explicitIds = new Set(selectedKeyframes.map(sk => sk.keyframe.id));
    const selectedIds = new Set(selectedTargets.map(t => t.id));

    for (const track of tracks) {
      if (!selectedIds.has(track.targetId)) continue;
      for (const kf of track.keyframes) {
        if (Math.abs(kf.time - currentTime) < 1 && !explicitIds.has(kf.id)) {
          result.push({ track, keyframe: kf });
        }
      }
    }
    return result;
  }, [tracks, currentTime, selectedTargets, selectedKeyframes]);

  const allVisibleKeyframes = [...selectedKeyframes, ...keyframesAtCurrentTime];

  if (selectedTargets.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
            Animation Properties
          </div>
        </div>
        {allTargets.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-sm text-[var(--color-text-secondary)] px-4 text-center">
            <div className="text-2xl mb-2 opacity-40">◇</div>
            <p>Draw something in the editor to get started.</p>
          </div>
        ) : (
          <div className="px-2 py-1">
            <div className="text-xs text-[var(--color-text-secondary)] px-1 py-1 mb-1">
              Select an element to animate:
            </div>
            {allTargets.map((target) => (
              <button
                key={target.id}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-indigo-500/10 text-left transition-colors"
                onClick={() => onSelectTarget(target.id)}
              >
                <span className="text-indigo-400">{target.type === 'group' ? '⊞' : '◇'}</span>
                <span className="truncate flex-1">{target.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Helper: ensure track exists and set value (auto-create if needed)
  const ensureAndSet = (property: AnimatableProperty, value: number) => {
    for (const target of selectedTargets) {
      const track = tracks.find(t => t.targetId === target.id && t.property === property);
      if (track) {
        onAddOrUpdateKeyframe(track.id, currentTime, value);
      } else {
        // Auto-create track then set value
        onAddTrack(target.id, target.type, property);
      }
    }
  };

  // Helper: get current interpolated value for first selected target
  const getValue = (property: AnimatableProperty): number => {
    const track = tracks.find(t => t.property === property);
    if (track) return interpolate(track.keyframes, currentTime, track.property);
    return PROPERTY_DEFAULTS[property];
  };

  // Helper: check if keyframe exists at current time for a property
  const hasKeyframeAt = (prop: AnimatableProperty): boolean => {
    return tracks.some(t => t.property === prop && t.keyframes.some(kf => Math.abs(kf.time - currentTime) < 1));
  };

  // Helper: toggle keyframe at current time — add if missing, remove if exists
  const toggleKeyframeFor = (prop: AnimatableProperty) => {
    const has = hasKeyframeAt(prop);
    if (has) {
      // Remove the keyframe at current time
      for (const target of selectedTargets) {
        const track = tracks.find(t => t.targetId === target.id && t.property === prop);
        if (track) {
          const kf = track.keyframes.find(k => Math.abs(k.time - currentTime) < 1);
          if (kf) onDeleteKeyframe(track.id, kf.id);
        }
      }
    } else {
      // Add keyframe at current time with current value
      ensureAndSet(prop, getValue(prop));
    }
  };

  // Toggle keyframe for a compound group (Position = X+Y, Scale = X+Y)
  const toggleCompoundKeyframe = (properties: AnimatableProperty[]) => {
    const allHave = properties.every(p => hasKeyframeAt(p));
    for (const prop of properties) {
      if (allHave) {
        // Remove all keyframes in the group
        for (const target of selectedTargets) {
          const track = tracks.find(t => t.targetId === target.id && t.property === prop);
          if (track) {
            const kf = track.keyframes.find(k => Math.abs(k.time - currentTime) < 1);
            if (kf) onDeleteKeyframe(track.id, kf.id);
          }
        }
      } else {
        // Add keyframes for any missing
        if (!hasKeyframeAt(prop)) {
          ensureAndSet(prop, getValue(prop));
        }
      }
    }
  };

  // Keyframe button component
  const KfButton = ({ prop }: { prop: AnimatableProperty }) => {
    const has = hasKeyframeAt(prop);
    return (
      <button
        className={`w-4 h-4 flex items-center justify-center text-[10px] rounded transition-colors shrink-0 ${
          has ? 'text-indigo-400 hover:text-red-400' : 'text-[var(--color-text-secondary)] hover:text-indigo-400'
        }`}
        onClick={() => toggleKeyframeFor(prop)}
        title={has ? `Remove keyframe at ${Math.round(currentTime)}ms` : `Add keyframe at ${Math.round(currentTime)}ms`}
      >
        {has ? '◆' : '◇'}
      </button>
    );
  };

  // Define the property groups to show
  type PropGroup = { label: string; icon: string; properties: { prop: AnimatableProperty; label: string; suffix: string }[] };
  const groups: PropGroup[] = [
    {
      label: isCamera ? 'Pan' : 'Position',
      icon: '⊹',
      properties: [
        { prop: 'translateX', label: 'X', suffix: 'px' },
        { prop: 'translateY', label: 'Y', suffix: 'px' },
      ],
    },
    {
      label: isCamera ? 'Zoom' : 'Scale',
      icon: '⇔',
      properties: [
        { prop: 'scaleX', label: 'X', suffix: '%' },
        { prop: 'scaleY', label: 'Y', suffix: '%' },
      ],
    },
  ];

  const standaloneProps: { prop: AnimatableProperty; label: string }[] = [
    { prop: 'opacity', label: 'Opacity' },
    { prop: 'rotation', label: 'Rotation' },
    { prop: 'drawProgress', label: 'Draw Progress' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" aria-label="Properties">
      {/* Target info header */}
      <div className="border-b border-[var(--color-border)]">
        <div className="px-3 py-1 text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
          {isMulti ? `${selectedTargets.length} Selected` : 'Selected'}
        </div>
        {selectedTargets.map((target) => (
          <TargetInfo key={target.id} target={target} />
        ))}
      </div>

      <div className="px-3 py-1 text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider bg-[#1a1a2a]">
        Properties at {Math.round(currentTime)}ms
      </div>

      {/* Compound property groups (Position, Scale) — one keyframe button per group */}
      {groups.map((group) => {
        const groupProps = group.properties.map(p => p.prop);
        const allHaveKf = groupProps.every(p => hasKeyframeAt(p));
        const anyHasKf = groupProps.some(p => hasKeyframeAt(p));
        return (
          <div key={group.label} className="px-3 py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">{group.icon}</span>
              <span className="text-xs font-medium flex-1">{group.label}</span>
              <button
                className={`w-4 h-4 flex items-center justify-center text-[10px] rounded transition-colors shrink-0 ${
                  anyHasKf ? 'text-indigo-400 hover:text-red-400' : 'text-[var(--color-text-secondary)] hover:text-indigo-400'
                }`}
                onClick={() => toggleCompoundKeyframe(groupProps)}
                title={allHaveKf ? `Remove ${group.label} keyframe` : `Add ${group.label} keyframe`}
              >
                {anyHasKf ? '◆' : '◇'}
              </button>
            </div>
            <div className="space-y-1">
              {group.properties.map(({ prop, label, suffix }) => {
                const config = PROPERTY_CONFIG[prop];
                const internalVal = getValue(prop);
                const displayVal = toDisplay(prop, internalVal);
                const sliderMin = config.min ?? (prop === 'rotation' ? -360 : -500);
                const sliderMax = config.max ?? (prop === 'rotation' ? 360 : 500);
                return (
                  <div key={prop} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--color-text-secondary)] w-3">{label}</span>
                    <input
                      type="range" min={sliderMin} max={sliderMax} step={config.step}
                      value={displayVal}
                      onChange={(e) => ensureAndSet(prop, toInternal(prop, Number(e.target.value)))}
                      className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
                    />
                    <input
                      type="number"
                      value={Number(displayVal.toFixed(config.displayScale ? 0 : 1))}
                      onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) ensureAndSet(prop, toInternal(prop, v)); }}
                      step={config.step} min={config.min} max={config.max}
                      className="w-14 px-1 py-0.5 text-[10px] text-right rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                    <span className="text-[9px] text-[var(--color-text-secondary)] w-3">{suffix}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Standalone properties (Opacity, Rotation, Draw Progress) */}
      {standaloneProps.map(({ prop, label }) => {
        const config = PROPERTY_CONFIG[prop];
        const internalVal = getValue(prop);
        const displayVal = toDisplay(prop, internalVal);
        const sliderMin = config.min ?? (prop === 'rotation' ? -360 : -500);
        const sliderMax = config.max ?? (prop === 'rotation' ? 360 : 500);
        return (
          <div key={prop} className="px-3 py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">{config.icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="range" min={sliderMin} max={sliderMax} step={config.step}
                value={displayVal}
                onChange={(e) => ensureAndSet(prop, toInternal(prop, Number(e.target.value)))}
                className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
              />
              <input
                type="number"
                value={Number(displayVal.toFixed(config.displayScale ? 0 : 1))}
                onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) ensureAndSet(prop, toInternal(prop, v)); }}
                step={config.step} min={config.min} max={config.max}
                className="w-14 px-1 py-0.5 text-[10px] text-right rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <span className="text-[9px] text-[var(--color-text-secondary)] w-3">{config.suffix}</span>
              <KfButton prop={prop} />
            </div>
          </div>
        );
      })}

      {/* Keyframes at current time / selected keyframes */}
      {allVisibleKeyframes.length > 0 && (
        <>
          <div className="px-3 py-1 text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider bg-[#1a1a2a]">
            Keyframes at {Math.round(currentTime)}ms
          </div>
          {allVisibleKeyframes.map(({ track, keyframe }) => (
            <SelectedKeyframeEditor
              key={keyframe.id}
              track={track}
              keyframe={keyframe}
              onUpdate={(updates) => onUpdateKeyframe(track.id, keyframe.id, updates)}
              onDelete={() => onDeleteKeyframe(track.id, keyframe.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
