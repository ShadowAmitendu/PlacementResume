/**
 * Displays a temporary toast notification.
 * @param {string} msg 
 * @param {number} duration 
 */
export function showToast(msg, duration = 2200) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), duration);
}

/**
 * Shows an alert modal.
 * @param {string} message 
 * @param {string} title 
 */
export function showAlert(message, title = "Notice") {
    const modal = document.getElementById("alertModal");
    const titleEl = document.getElementById("alertTitle");
    const msgEl = document.getElementById("alertMessage");
    if (!modal || !titleEl || !msgEl) return;
    
    titleEl.textContent = title;
    msgEl.textContent = message;
    modal.style.display = "flex";
}

/**
 * Closes the alert modal.
 */
export function closeAlert() {
    const modal = document.getElementById("alertModal");
    if (modal) modal.style.display = "none";
}

let _confirmResolve = null;

/**
 * Shows a confirmation modal.
 * @returns {Promise<boolean>}
 */
export function showConfirm(message, title = "Are you sure?", okLabel = "Delete") {
    const modal = document.getElementById("confirmModal");
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const okBtn = document.getElementById("confirmOkBtn");
    
    if (!modal || !titleEl || !msgEl || !okBtn) return Promise.resolve(false);

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = okLabel;
    modal.style.display = "flex";

    return new Promise((resolve) => {
        _confirmResolve = resolve;
    });
}

/**
 * Closes the confirm modal.
 * @param {boolean} result 
 */
export function closeConfirm(result) {
    const modal = document.getElementById("confirmModal");
    if (modal) modal.style.display = "none";
    if (_confirmResolve) {
        _confirmResolve(result);
        _confirmResolve = null;
    }
}

/**
 * Sets caret at the end of a contenteditable element.
 */
export function placeCaretAtEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
}
