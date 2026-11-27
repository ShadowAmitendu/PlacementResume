import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useHistory } from '../hooks/useHistory';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

interface HarnessApi<T> {
  state: T;
  canUndo: boolean;
  canRedo: boolean;
  set: (v: T | ((prev: T) => T)) => void;
  setDebounced: (v: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: (v: T) => void;
}

describe('useHistory', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  function mountHistory<T>(initial: T) {
    let api!: HarnessApi<T>;
    const Harness: React.FC = () => {
      api = useHistory(initial);
      return null;
    };
    act(() => {
      root.render(React.createElement(Harness));
    });
    return () => api;
  }

  it('supports discrete set, undo, and redo cleanly in StrictMode', () => {
    let api!: HarnessApi<number>;
    const Harness: React.FC = () => {
      api = useHistory(0);
      return null;
    };
    act(() => {
      root.render(React.createElement(React.StrictMode, null, React.createElement(Harness)));
    });

    expect(api.state).toBe(0);
    expect(api.canUndo).toBe(false);

    act(() => api.set(1));
    act(() => api.set(2));
    expect(api.state).toBe(2);
    expect(api.canUndo).toBe(true);

    act(() => api.undo());
    expect(api.state).toBe(1);
    expect(api.canRedo).toBe(true);

    act(() => api.redo());
    expect(api.state).toBe(2);
    expect(api.canRedo).toBe(false);
  });

  it('batches debounced edits into one snapshot and clears on resetHistory', () => {
    const getApi = mountHistory('a');

    act(() => getApi().setDebounced('ab'));
    act(() => getApi().setDebounced('abc'));
    expect(getApi().state).toBe('abc');
    expect(getApi().canUndo).toBe(true);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    act(() => getApi().undo());
    expect(getApi().state).toBe('a');

    act(() => getApi().resetHistory('fresh'));
    expect(getApi().state).toBe('fresh');
    expect(getApi().canUndo).toBe(false);
    expect(getApi().canRedo).toBe(false);
  });
});
