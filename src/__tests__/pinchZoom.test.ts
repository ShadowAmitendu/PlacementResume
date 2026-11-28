import { describe, it, expect } from 'vitest';
import { computePinchScale, computePinchScrollTarget } from '../utils/pinchZoom';

describe('pinchZoom utilities', () => {
  it('scales proportionally within min/max bounds', () => {
    expect(computePinchScale(1.0, 100, 150, 0.3, 2.0)).toBe(1.5);
    expect(computePinchScale(0.5, 200, 100, 0.3, 2.0)).toBe(0.3);
    expect(computePinchScale(1.5, 100, 200, 0.3, 2.0)).toBe(2.0);
  });

  it('guards against invalid or zero pinch distances', () => {
    expect(computePinchScale(0.85, 0, 120, 0.3, 2.0)).toBe(0.85);
    expect(computePinchScale(5.0, -10, 100, 0.3, 2.0)).toBe(2.0);
  });

  it('computes scroll target anchoring the pinched point under fingers', () => {
    // Stage starts at scroll offset 20, pinch docPoint 300 is under viewport x=200 at zoom 1.0 -> 300*1 - 200 + 20 = 120
    expect(computePinchScrollTarget(20, 300, 200, 1.0)).toBe(120);
    // Double zoom (2.0) shifts scroll to keep docPoint 300 under viewport x=200: 20 + 600 - 200 = 420
    expect(computePinchScrollTarget(20, 300, 200, 2.0)).toBe(420);
    // Clamps cleanly at 0 when point stays left of viewport
    expect(computePinchScrollTarget(20, 50, 200, 1.0)).toBe(0);
  });
});
