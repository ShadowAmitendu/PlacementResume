import { getResumeData } from './state.js';
import { showToast } from './utils.js';

const MAX_HISTORY = 60;
let _undoHistory = [];
let historyIndex = -1;
let _ignoreNextSnapshot = false;

/**
 * Updates undo/redo button opacity.
 */
export function updateUndoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    if (undoBtn) undoBtn.style.opacity = historyIndex > 0 ? "1" : "0.4";
    if (redoBtn) redoBtn.style.opacity = historyIndex < _undoHistory.length - 1 ? "1" : "0.4";
}

/**
 * Captures a snapshot of the current state.
 * Optimized: Only snapshots if the JSON string has changed.
 */
export function snapshot() {
    if (_ignoreNextSnapshot) {
        _ignoreNextSnapshot = false;
        return;
    }

    const currentState = getResumeData();
    const currentStateStr = JSON.stringify(currentState);
    
    // Memory optimization: Don't save if it's the same as the last snapshot
    if (historyIndex >= 0 && JSON.stringify(_undoHistory[historyIndex]) === currentStateStr) {
        return;
    }

    if (historyIndex < _undoHistory.length - 1) {
        _undoHistory = _undoHistory.slice(0, historyIndex + 1);
    }

    _undoHistory.push(currentState);

    if (_undoHistory.length > MAX_HISTORY) {
        _undoHistory.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoButtons();
}

/**
 * Sets the ignore flag for the next snapshot.
 */
export function setIgnoreNextSnapshot(val) {
    _ignoreNextSnapshot = val;
}

/**
 * Undo logic.
 * @param {Function} applyCallback Callback to apply the restored state.
 */
export function undo(applyCallback) {
    if (historyIndex > 0) {
        historyIndex--;
        _ignoreNextSnapshot = true;
        
        // Ensure buttons update first to give immediate feedback
        updateUndoButtons();
        
        applyCallback(_undoHistory[historyIndex]);
        showToast("Undone");
        
        // The flag will be reset by the debounced snapshot 
        // triggered by the DOM changes in applyCallback.
    }
}

/**
 * Redo logic.
 * @param {Function} applyCallback Callback to apply the restored state.
 */
export function redo(applyCallback) {
    if (historyIndex < _undoHistory.length - 1) {
        historyIndex++;
        _ignoreNextSnapshot = true;
        
        updateUndoButtons();
        
        applyCallback(_undoHistory[historyIndex]);
        showToast("Redone");
    }
}
