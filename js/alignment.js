import { showAlert } from './utils.js';
import { snapshot } from './history.js';

let _lastFocused = null;

export function setLastFocused(el) { _lastFocused = el; }
export function getLastFocused() { return _lastFocused; }

export function alignText(align) {
    if (!_lastFocused) {
        showAlert("Click inside a text area in the resume first.", "No Field Selected");
        return;
    }
    _lastFocused.style.textAlign = align;
    updateAlignButtons(_lastFocused);
    snapshot();
}

export function updateAlignButtons(el) {
    const current = el ? el.style.textAlign || getComputedStyle(el).textAlign || "left" : "left";
    ["left", "center", "right", "justify"].forEach((a) => {
        const btn = document.getElementById("align-" + a);
        if (btn) btn.classList.toggle("active", current === a);
    });
}
