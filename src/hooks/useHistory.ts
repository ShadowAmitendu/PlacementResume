import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T, maxHistory = 60) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const historyRef = useRef<HistoryState<T>>(history);
  const snapshotBaseRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasPendingSnapshot, setHasPendingSnapshot] = useState(false);

  const commitHistory = useCallback((next: HistoryState<T>) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  const flushPendingSnapshot = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (snapshotBaseRef.current !== null) {
      const base = snapshotBaseRef.current;
      snapshotBaseRef.current = null;
      setHasPendingSnapshot(false);
      const current = historyRef.current;
      if (base !== current.present && JSON.stringify(base) !== JSON.stringify(current.present)) {
        const updatedPast = [...current.past, base];
        const trimmedPast =
          updatedPast.length > maxHistory
            ? updatedPast.slice(updatedPast.length - maxHistory)
            : updatedPast;
        commitHistory({
          past: trimmedPast,
          present: current.present,
          future: current.future,
        });
      }
    }
  }, [maxHistory, commitHistory]);

  const undo = useCallback(() => {
    flushPendingSnapshot();
    const current = historyRef.current;
    if (current.past.length === 0) return;
    const previous = current.past[current.past.length - 1];
    commitHistory({
      past: current.past.slice(0, -1),
      present: previous,
      future: [current.present, ...current.future],
    });
  }, [flushPendingSnapshot, commitHistory]);

  const redo = useCallback(() => {
    flushPendingSnapshot();
    const current = historyRef.current;
    if (current.future.length === 0) return;
    const next = current.future[0];
    commitHistory({
      past: [...current.past, current.present],
      present: next,
      future: current.future.slice(1),
    });
  }, [flushPendingSnapshot, commitHistory]);

  /**
   * Immediate state update with a debounced undo snapshot for continuous typing.
   */
  const setDebounced = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      const current = historyRef.current;
      const resolved =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(current.present)
          : newPresent;

      if (snapshotBaseRef.current === null) {
        snapshotBaseRef.current = current.present;
        setHasPendingSnapshot(true);
      }

      commitHistory({
        past: current.past,
        present: resolved,
        future: [],
      });

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        flushPendingSnapshot();
      }, 500);
    },
    [flushPendingSnapshot, commitHistory]
  );

  /**
   * Immediate state update with an immediate undo snapshot for discrete actions.
   */
  const set = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      flushPendingSnapshot();

      const current = historyRef.current;
      const resolved =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(current.present)
          : newPresent;

      if (current.present === resolved) {
        return;
      }

      if (JSON.stringify(current.present) === JSON.stringify(resolved)) {
        return;
      }

      const updatedPast = [...current.past, current.present];
      const trimmedPast =
        updatedPast.length > maxHistory
          ? updatedPast.slice(updatedPast.length - maxHistory)
          : updatedPast;

      commitHistory({
        past: trimmedPast,
        present: resolved,
        future: [],
      });
    },
    [maxHistory, flushPendingSnapshot, commitHistory]
  );

  const resetHistory = useCallback(
    (newInitial: T) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      snapshotBaseRef.current = null;
      setHasPendingSnapshot(false);
      commitHistory({
        past: [],
        present: newInitial,
        future: [],
      });
    },
    [commitHistory]
  );

  return {
    state: history.present,
    set,
    setDebounced,
    undo,
    redo,
    canUndo: history.past.length > 0 || hasPendingSnapshot,
    canRedo: history.future.length > 0,
    resetHistory,
  };
}
