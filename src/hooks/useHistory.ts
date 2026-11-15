import { useState, useCallback, useRef } from 'react';

export function useHistory<T>(initialPresent: T, maxHistory = 60) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  // Ref to always have the latest present value without triggering stale closures
  const presentRef = useRef<T>(present);
  presentRef.current = present;

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
    setPresent(previous);
  }, [past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, presentRef.current]);
    setPresent(next);
    setFuture(newFuture);
  }, [future]);

  const set = useCallback(
    (newPresent: T | ((prev: T) => T), shouldSnapshot = true) => {
      const resolved =
        typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(presentRef.current)
          : newPresent;

      if (!shouldSnapshot) {
        setPresent(resolved);
        return;
      }

      // Memory check: don't snapshot if deep equal via JSON string
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
    [maxHistory]
  );

  const resetHistory = useCallback((newInitial: T) => {
    setPast([]);
    setPresent(newInitial);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
