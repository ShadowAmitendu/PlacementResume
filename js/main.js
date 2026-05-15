import * as ui from './ui.js';
import * as state from './state.js';
import * as history from './history.js';
import * as sections from './sections.js';
import * as storage from './storage.js';
import * as formatting from './formatting.js';
import * as alignment from './alignment.js';
import { closeAlert, closeConfirm } from './utils.js';

// --- Initialization ---

window.addEventListener("load", () => {
    // Restore Dark Mode
    try {
        if (localStorage.getItem("resumeAppDarkMode") === "true") {
            ui.toggleAppTheme();
        }
    } catch (e) { console.warn("Storage access restricted."); }

    // Restore Resume Data
    try {
        const saved = localStorage.getItem("mySavedResume");
        if (saved) {
            applyResumeDataWrapper(JSON.parse(saved));
        } else {
            sections.makeColumnsResizable();
        }
    } catch (e) {
        console.warn("Could not load saved resume.");
        sections.makeColumnsResizable();
    }

    // Check for URL import (for the new HTML export format)
    const hash = window.location.hash;
    if (hash && hash.startsWith("#import=")) {
        try {
            const b64 = hash.substring(8);
            const json = atob(b64);
            applyResumeDataWrapper(JSON.parse(json));
            history.snapshot();
            window.location.hash = ""; // Clear hash
        } catch (e) { console.error("URL import failed", e); }
    }

    formatting.initPhoneFormatting();
    if (typeof Sortable !== "undefined") {
        initSortable();
    }

    history.snapshot();
    history.updateUndoButtons();
    setTimeout(ui.autoFitZoom, 100);
});

function initSortable() {
    Sortable.create(document.getElementById("sortable-sections"), {
        handle: ".drag-handle",
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        onEnd: () => {
            history.snapshot();
            // showToast is in utils, but main.js doesn't import it directly for brevity here
        },
    });
}

function applyResumeDataWrapper(data) {
    if (!data.sections && !data.html) return;

    const sortableContainer = document.getElementById("sortable-sections");
    const wrapper = document.getElementById("resumeWrapper");
    if (!sortableContainer || !wrapper) return;

    if (data.sections) {
        // Modern Section-based Format
        sortableContainer.innerHTML = "";
        data.sections.forEach((sec) => {
            if (sec.type === "header") {
                const header = wrapper.querySelector(".header");
                if (header) header.innerHTML = sec.html;
            } else if (sec.type === "section") {
                const div = document.createElement("div");
                div.className = "section-block";
                div.innerHTML = sections.makeBlockControls() + sec.html;
                if (div.querySelector("table") && !div.querySelector(".table-controls")) {
                    div.querySelector("table").insertAdjacentHTML("afterend", sections.makeTableControls());
                }
                sortableContainer.appendChild(div);
            } else if (sec.type === "final") {
                const finalBlock = document.getElementById("declarationSection");
                if (finalBlock) finalBlock.innerHTML = sections.makeBlockControls() + sec.html;
            }
        });
    } else if (data.html) {
        // Legacy Monolithic HTML Format
        wrapper.innerHTML = data.html;
        
        // Restore controls and functionality
        document.querySelectorAll(".section-block").forEach((block) => {
            if (!block.querySelector(".block-controls")) {
                block.insertAdjacentHTML("afterbegin", sections.makeBlockControls());
            }
        });
        document.querySelectorAll(".section-block table").forEach((table) => {
            const block = table.closest(".section-block");
            if (block && !block.querySelector(".table-controls")) {
                table.insertAdjacentHTML("afterend", sections.makeTableControls());
            }
        });
    }

    // Apply Meta Settings (common to both versions)
    if (data.photo) {
        state.setPhotoBase64(data.photo);
        const img = document.getElementById("profile-photo");
        if (img) {
            img.src = data.photo;
            img.style.display = "block";
        }
        const lbl = document.getElementById("photo-label");
        if (lbl) lbl.style.display = "none";
    }

    if (data.theme) state.setTheme(data.theme);
    if (data.font) document.getElementById("fontSelector").value = data.font;
    if (data.marker !== undefined) document.getElementById("markerSelector").value = data.marker;
    if (data.tableStyle) document.getElementById("tableStyleSelector").value = data.tableStyle;
    
    const toggle = document.getElementById("toggleLinkIcons");
    if (toggle) {
        if (data.showLinkIcons !== undefined) {
            toggle.checked = data.showLinkIcons;
        } else if (data.hideLinkIcons !== undefined) {
            toggle.checked = !data.hideLinkIcons;
        }
    }
    
    if (data.zoom) {
        document.getElementById("zoomSlider").value = data.zoom;
        ui.applyZoom();
    }
    
    state.applySettings();
    sections.makeColumnsResizable();
    formatting.initPhoneFormatting();
    
    // Re-initialize sortable in case the container was replaced (legacy import)
    if (typeof Sortable !== "undefined") {
        initSortable();
    }
}

// --- Event Listeners (Delegation) ---

document.addEventListener("click", (e) => {
    const target = e.target;

    // Mobile Menu
    if (target.closest(".mobile-menu-btn")) ui.toggleMobileMenu();
    if (target.id === "sidebarOverlay") ui.closeMobileMenu();
    if (target.closest(".sidebar-close-btn")) ui.closeMobileMenu();

    // Modals
    if (target.id === "linkModal") ui.closeLinkModal();
    if (target.id === "exportModal") ui.closeExportModal();
    if (target.id === "alertModal") closeAlert();
    if (target.id === "confirmModal") closeConfirm(false);

    // Sidebar Actions
    if (target.closest("#undoBtn")) history.undo(applyResumeDataWrapper);
    if (target.closest("#redoBtn")) history.redo(applyResumeDataWrapper);
    if (target.id === "appThemeBtn" || target.closest("#appThemeBtn")) ui.toggleAppTheme();
    
    // Storage & PDF
    if (target.id === "clearSaveBtn" || target.closest("#clearSaveBtn")) storage.clearBrowserSave();
    if (target.id === "saveToBrowserBtn" || target.closest("#saveToBrowserBtn")) storage.saveToBrowser();
    if (target.id === "exportBtn" || target.closest("#exportBtn")) storage.exportData();
    if (target.id === "importBtn" || target.closest("#importBtn")) {
        document.getElementById("importFile").click();
    }
    if (target.id === "downloadPdfBtn" || target.closest("#downloadPdfBtn")) window.print();

    // Zoom
    if (target.onclick === null) { 
        // Logic for zoom buttons if needed
    }

    // Sections
    if (target.closest(".del-btn")) sections.deleteBlock(target);
    if (target.closest(".dup-btn")) sections.duplicateBlock(target);
    if (target.closest(".add-row-btn")) sections.addRow(target);
    if (target.closest(".del-row-btn")) sections.deleteRow(target, alignment.getLastFocused());
    if (target.closest(".add-col-btn")) sections.addColumn(target);
    if (target.closest(".del-col-btn")) sections.deleteColumn(target, alignment.getLastFocused());

    // Context toolbar (delete specific row/col)
    if (target.closest(".ctx-del-row-btn")) {
        const cell = sections.getCurrentContextCell();
        if (cell) sections.deleteRowAt(cell);
        sections.hideCellToolbar();
    }
    if (target.closest(".ctx-del-col-btn")) {
        const cell = sections.getCurrentContextCell();
        if (cell) sections.deleteColumnAt(cell);
        sections.hideCellToolbar();
    }

    // Column borders toggle
    if (target.closest(".col-borders-checkbox")) {
        sections.toggleColumnBorders(target.closest(".col-borders-checkbox"));
    }

    // Links
    if (target.tagName === "A" && target.closest(".link-item")) {
        // Only if it's not the actual link we want to follow
        if (target.hasAttribute("onclick") || target.title === "Click to edit") {
            e.preventDefault();
            ui.openLinkModal(target);
        }
    }
    if (target.closest(".add-link-btn")) ui.openLinkModal(null);
    if (target.id === "deleteLinkBtn") ui.deleteLink();
    if (target.closest(".icon-option")) ui.selectIcon(target.closest(".icon-option"));

    // Alignment
    if (target.closest(".btn-format")) {
        const alignMatch = target.id?.match(/align-(.*)/);
        if (alignMatch) alignment.alignText(alignMatch[1]);
    }
});

// Photo Upload & Settings
document.addEventListener("change", (e) => {
    const id = e.target.id;
    if (id === "photo-upload") {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width, height = img.height, maxDim = 400;
                if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
                else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL("image/jpeg", 0.7);
                state.setPhotoBase64(base64);
                const profileImg = document.getElementById("profile-photo");
                if (profileImg) { profileImg.src = base64; profileImg.style.display = "block"; }
                const lbl = document.getElementById("photo-label");
                if (lbl) lbl.style.display = "none";
                history.snapshot();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    if (id === "importFile") {
        storage.importData(e, applyResumeDataWrapper);
    }

    // Settings changes that should be snapshotted
    if (["fontSelector", "tableStyleSelector", "markerSelector", "toggleLinkIcons", "showDeclarationToggle"].includes(id)) {
        state.applySettings();
        history.snapshot();
    }
});

// Input / Auto-save
let _snapshotTimer, _autoSaveTimer;
document.addEventListener("input", (e) => {
    // Snapshot
    clearTimeout(_snapshotTimer);
    _snapshotTimer = setTimeout(history.snapshot, 300);

    // Auto-save
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => {
        try {
            localStorage.setItem("mySavedResume", JSON.stringify(state.getResumeData()));
        } catch (err) {}
    }, 2000);

    // Alignment tracking
    if (e.target.hasAttribute("contenteditable")) {
        alignment.setLastFocused(e.target);
        alignment.updateAlignButtons(e.target);
    }
});

document.addEventListener("focusin", (e) => {
    if (e.target.hasAttribute("contenteditable")) {
        alignment.setLastFocused(e.target);
        alignment.updateAlignButtons(e.target);
    }

    // Show cell context toolbar when focusing a table cell
    const cell = e.target.closest("td, th");
    if (cell && cell.closest(".resume-wrapper")) {
        sections.showCellToolbar(cell);
    }
});

// Hide cell toolbar when clicking outside table cells
document.addEventListener("mousedown", (e) => {
    const target = e.target;
    // Don't hide if clicking the toolbar itself or a table cell
    if (target.closest(".cell-context-toolbar") || target.closest("td, th")) return;
    sections.hideCellToolbar();
});

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        ui.closeMobileMenu();
        ui.closeLinkModal();
        ui.closeExportModal();
        closeAlert();
        closeConfirm(false);
    }

    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo(applyResumeDataWrapper);
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        history.redo(applyResumeDataWrapper);
    }
});

document.addEventListener("paste", formatting.handlePaste);

// Global Exposure for simple HTML triggers (if any left)
window.addSection = sections.addSection;
window.applySettings = state.applySettings;
window.setTheme = state.setTheme;
window.adjustZoom = ui.adjustZoom;
window.applyZoom = ui.applyZoom;
window.saveLink = ui.saveLink;
window.closeModal = ui.closeLinkModal;
window.deleteLink = ui.deleteLink;
window.selectIcon = ui.selectIcon;
window.saveToBrowser = storage.saveToBrowser;
window.clearBrowserSave = storage.clearBrowserSave;
window.exportData = storage.exportData;
window.confirmExport = storage.confirmExport;
window.closeExportModal = ui.closeExportModal;
window.importData = (ev) => storage.importData(ev, applyResumeDataWrapper);
window.formatText = formatting.formatText;
window.formatCustom = formatting.formatCustom;
window.formatCode = () => formatting.formatCustom("", "code-inline");
window.alignText = alignment.alignText;
window.toggleAppTheme = ui.toggleAppTheme;
window.toggleMobileMenu = ui.toggleMobileMenu;
window.closeMobileMenu = ui.closeMobileMenu;
window.closeAlert = closeAlert;
window.closeConfirm = closeConfirm;
window.duplicateBlock = (btn) => sections.duplicateBlock(btn);
window.deleteBlock = (btn) => sections.deleteBlock(btn);
window.addRow = (btn) => sections.addRow(btn);
window.deleteRow = (btn) => sections.deleteRow(btn, alignment.getLastFocused());
window.addColumn = (btn) => sections.addColumn(btn);
window.deleteColumn = (btn) => sections.deleteColumn(btn, alignment.getLastFocused());
window.loadPhoto = (ev) => { /* already handled by listener but kept for compat */ };
window.undo = () => history.undo(applyResumeDataWrapper);
window.redo = () => history.redo(applyResumeDataWrapper);
window.editLink = (ev, el) => ui.openLinkModal(el);
