import { useState, useCallback, useRef } from 'react';

export function useHistory<T>(initialPresent: T, maxHistory = 60) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  const presentRef = useRef<T>(present);
  presentRef.current = present;

  const snapshotBaseRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canUndo = past.length > 0 || snapshotBaseRef.current !== null;
  const canRedo = future.length > 0;

  const flushPendingSnapshot = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (snapshotBaseRef.current !== null) {
      const base = snapshotBaseRef.current;
      snapshotBaseRef.current = null;
      if (JSON.stringify(base) !== JSON.stringify(presentRef.current)) {
        setPast((prevPast) => {
          const updated = [...prevPast, base];
          if (updated.length > maxHistory) {
            return updated.slice(updated.length - maxHistory);
          }
          return updated;
        });
      }
    }
  }, [maxHistory]);

  const undo = useCallback(() => {
    flushPendingSnapshot();

    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
      setPresent(previous);
      return newPast;
    });
  }, [flushPendingSnapshot]);

  const redo = useCallback(() => {
    flushPendingSnapshot();

    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast((prevPast) => [...prevPast, presentRef.current]);
      setPresent(next);
      return newFuture;
    });
  }, [flushPendingSnapshot]);

  // Immediate state update with debounced snapshot (for text editing)
  const setDebounced = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      const resolved =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(presentRef.current)
          : newPresent;

      if (snapshotBaseRef.current === null) {
        snapshotBaseRef.current = presentRef.current;
      }

      setPresent(resolved);
      setFuture([]);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        flushPendingSnapshot();
      }, 500);
    },
    [flushPendingSnapshot]
  );

  // Immediate state update with immediate snapshot (for buttons/switches/actions)
  const set = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      flushPendingSnapshot();

      const resolved =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(presentRef.current)
          : newPresent;

      if (JSON.stringify(presentRef.current) === JSON.stringify(resolved)) {
        return;
      }

      setPast((prevPast) => {
        const updated = [...prevPast, presentRef.current];
        if (updated.length > maxHistory) {
          return updated.slice(updated.length - maxHistory);
        }
        return updated;
      });
      setPresent(resolved);
      setFuture([]);
    },
    [maxHistory, flushPendingSnapshot]
  );

  const resetHistory = useCallback((newInitial: T) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    snapshotBaseRef.current = null;
    setPast([]);
    setPresent(newInitial);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    setDebounced,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
