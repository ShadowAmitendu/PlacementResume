import { showAlert, placeCaretAtEnd } from './utils.js';
import { snapshot } from './history.js';

export function formatText(cmd) {
    document.execCommand(cmd, false, null);
}

export function formatCustom(style, className = "") {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
        showAlert("Please highlight the text you want to format first.", "No Text Selected");
        return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    if (style) span.setAttribute("style", style);
    if (className) span.className = className;
    try {
        range.surroundContents(span);
    } catch (e) {
        showAlert("Cannot apply formatting across multiple elements.", "Formatting Error");
    }
}

// --- Phone Formatting ---

export function formatPhoneValue(raw) {
    const trimmed = (raw || "").trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return hasPlus ? "+" : "";

    const parts = [];
    const firstLen = Math.min(2, digits.length);
    parts.push(digits.slice(0, firstLen));
    let index = firstLen;
    while (index < digits.length) {
        parts.push(digits.slice(index, index + 5));
        index += 5;
    }
    return (hasPlus ? "+" : "") + parts.join(" ");
}

export function applyPhoneFormat(el) {
    const formatted = formatPhoneValue(el.textContent);
    if (formatted !== el.textContent) {
        el.textContent = formatted;
        placeCaretAtEnd(el);
    }
}

export function initPhoneFormatting() {
    document.querySelectorAll(".phone-number").forEach((el) => {
        if (el.dataset.phoneBound === "true") return;
        el.dataset.phoneBound = "true";
        el.addEventListener("input", () => applyPhoneFormat(el));
        applyPhoneFormat(el);
    });
}

// --- Paste Handler ---

export function handlePaste(e) {
    const el = e.target.closest('[contenteditable="true"]');
    if (!el) return;

    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const lines = text.split(/\r?\n/);
    const frag = document.createDocumentFragment();
    lines.forEach((line, i) => {
        if (i > 0) frag.appendChild(document.createElement("br"));
        frag.appendChild(document.createTextNode(line));
    });

    const lastNode = frag.lastChild;
    range.insertNode(frag);
    if (lastNode) {
        const afterRange = document.createRange();
        afterRange.setStartAfter(lastNode);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
    }
}
