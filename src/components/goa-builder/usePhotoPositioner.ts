/**
 * usePhotoPositioner.ts
 * ---------------------------------------------------------------------------
 * A small headless hook that gives any crop viewport (circle or rounded-rect)
 * drag-to-pan + scroll/pinch-to-zoom + slider-to-zoom behavior, with pointer
 * events so it works on both mouse and touch (mobile) out of the box.
 *
 * Usage:
 *   const positioner = usePhotoPositioner();
 *   <div {...positioner.bind} ref={positioner.viewportRef}>...</div>
 *   <input type="range" value={positioner.transform.scale}
 *          onChange={(e) => positioner.setScale(Number(e.target.value))} />
 * ---------------------------------------------------------------------------
 */
import { useCallback, useRef, useState } from "react";
import { clamp, type ImageTransform } from "./goaBuilderShared";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const PAN_BOUND_FACTOR = 0.9; // how far user can drag relative to zoomed overflow

export function usePhotoPositioner(initial?: Partial<ImageTransform>) {
  const [transform, setTransform] = useState<ImageTransform>({
    scale: initial?.scale ?? 1,
    offsetX: initial?.offsetX ?? 0,
    offsetY: initial?.offsetY ?? 0,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    pointers: Map<number, { x: number; y: number }>;
    pinchStartDist: number;
    pinchStartScale: number;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pointers: new Map(),
    pinchStartDist: 0,
    pinchStartScale: 1,
  });

  const maxPanFor = useCallback((scale: number) => {
    // more zoom => more room to pan before revealing empty space
    const viewport = viewportRef.current;
    const size = viewport?.clientWidth ?? 400;
    return ((scale - 1) * size * PAN_BOUND_FACTOR) / 2;
  }, []);

  const reset = useCallback(() => {
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const setScale = useCallback(
    (scale: number) => {
      setTransform((prev) => {
        const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);
        const bound = maxPanFor(nextScale);
        return {
          scale: nextScale,
          offsetX: clamp(prev.offsetX, -bound, bound),
          offsetY: clamp(prev.offsetY, -bound, bound),
        };
      });
    },
    [maxPanFor]
  );

  const pointerDistance = (pointers: Map<number, { x: number; y: number }>) => {
    const pts = Array.from(pointers.values());
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (dragState.current.pointers.size === 1) {
      dragState.current.dragging = true;
      dragState.current.startX = e.clientX;
      dragState.current.startY = e.clientY;
      setTransform((prev) => {
        dragState.current.startOffsetX = prev.offsetX;
        dragState.current.startOffsetY = prev.offsetY;
        return prev;
      });
    } else if (dragState.current.pointers.size === 2) {
      dragState.current.pinchStartDist = pointerDistance(dragState.current.pointers);
      setTransform((prev) => {
        dragState.current.pinchStartScale = prev.scale;
        return prev;
      });
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current.pointers.has(e.pointerId)) return;
      dragState.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (dragState.current.pointers.size === 2) {
        // pinch zoom
        const dist = pointerDistance(dragState.current.pointers);
        if (dragState.current.pinchStartDist > 0) {
          const ratio = dist / dragState.current.pinchStartDist;
          setScale(dragState.current.pinchStartScale * ratio);
        }
        return;
      }

      if (!dragState.current.dragging) return;
      const dxRaw = e.clientX - dragState.current.startX;
      const dyRaw = e.clientY - dragState.current.startY;

      setTransform((prev) => {
        const bound = maxPanFor(prev.scale);
        return {
          ...prev,
          offsetX: clamp(dragState.current.startOffsetX + dxRaw, -bound, bound),
          offsetY: clamp(dragState.current.startOffsetY + dyRaw, -bound, bound),
        };
      });
    },
    [maxPanFor, setScale]
  );

  const endPointer = useCallback((e: React.PointerEvent) => {
    dragState.current.pointers.delete(e.pointerId);
    if (dragState.current.pointers.size < 2) {
      dragState.current.pinchStartDist = 0;
    }
    if (dragState.current.pointers.size === 0) {
      dragState.current.dragging = false;
    }
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setTransform((prev) => {
        const delta = -e.deltaY * 0.0015;
        const nextScale = clamp(prev.scale + delta, MIN_SCALE, MAX_SCALE);
        const bound = maxPanFor(nextScale);
        return {
          scale: nextScale,
          offsetX: clamp(prev.offsetX, -bound, bound),
          offsetY: clamp(prev.offsetY, -bound, bound),
        };
      });
    },
    [maxPanFor]
  );

  return {
    transform,
    setScale,
    reset,
    viewportRef,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onPointerLeave: endPointer,
      onWheel,
    },
  };
}
