/**
 * Computes clamped pinch-to-zoom scale rounded to 0.01 precision.
 */
export function computePinchScale(
  startZoom: number,
  startDistance: number,
  currentDistance: number,
  minZoom: number,
  maxZoom: number
): number {
  if (!Number.isFinite(startDistance) || startDistance <= 0 || !Number.isFinite(currentDistance)) {
    return Math.min(maxZoom, Math.max(minZoom, startZoom));
  }
  const raw = startZoom * (currentDistance / startDistance);
  const clamped = Math.min(maxZoom, Math.max(minZoom, raw));
  return Math.round(clamped * 100) / 100;
}

/**
 * Computes scroll position keeping a document point aligned under the pinch midpoint.
 */
export function computePinchScrollTarget(
  stageContentOffset: number,
  docPoint: number,
  pointerOffsetInViewport: number,
  nextZoom: number
): number {
  return Math.max(0, Math.round(stageContentOffset + docPoint * nextZoom - pointerOffsetInViewport));
}
