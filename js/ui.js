import { showToast, showAlert, showConfirm, closeAlert, closeConfirm } from './utils.js';
import { _isDarkMode, setIsDarkMode, setTheme, applySettings, buildLinkSvg } from './state.js';
import { snapshot } from './history.js';

export function toggleMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (!sidebar || !overlay) return;

    if (sidebar.classList.contains("open")) {
        closeMobileMenu();
    } else {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

export function closeMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
}

export function toggleAppTheme() {
    const newMode = !_isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);

    const label = document.getElementById("themeLabel");
    const icon = document.getElementById("themeIcon");

    if (newMode) {
        if (label) label.textContent = "Disable Dark Mode";
        if (icon) icon.textContent = "light_mode";
    } else {
        if (label) label.textContent = "Enable Dark Mode";
        if (icon) icon.textContent = "dark_mode";
    }

    try {
        localStorage.setItem("resumeAppDarkMode", newMode ? "true" : "false");
    } catch (e) {
        console.warn("Storage access blocked.");
    }
}

// --- Zoom ---

export function applyZoom() {
    const slider = document.getElementById("zoomSlider");
    const valueDisplay = document.getElementById("zoomValue");
    const container = document.getElementById("resumeContainer");
    const wrapper = document.getElementById("resumeWrapper");
    if (!slider || !container || !wrapper) return;

    const v = parseFloat(slider.value);
    if (valueDisplay) valueDisplay.textContent = Math.round(v * 100) + "%";

    container.style.transform = `scale(${v})`;
    container.style.transformOrigin = "top center";

    if (v < 1) {
        container.style.marginBottom = wrapper.offsetHeight * (v - 1) + "px";
        container.style.marginTop = "0";
    } else {
        container.style.marginBottom = "";
        container.style.marginTop = "";
    }
}

export function adjustZoom(delta) {
    const slider = document.getElementById("zoomSlider");
    if (!slider) return;
    slider.value = Math.min(1.5, Math.max(0.4, parseFloat(slider.value) + delta)).toFixed(2);
    applyZoom();
}

export function autoFitZoom() {
    if (window.innerWidth > 1024) return;
    const availableWidth = window.innerWidth - 32;
    const resumeWidth = 794;
    const fitScale = Math.max(0.4, Math.min(1, availableWidth / resumeWidth));
    const slider = document.getElementById("zoomSlider");
    if (slider) {
        slider.value = fitScale.toFixed(2);
        applyZoom();
    }
}

// --- Link Modal ---

let _activeLink = null;
let _selectedIcon = "globe";

export function selectIcon(el) {
    document.querySelectorAll(".icon-option").forEach((o) => o.classList.remove("selected"));
    el.classList.add("selected");
    _selectedIcon = el.dataset.icon;
}

export function openLinkModal(el) {
    _activeLink = el;
    const modal = document.getElementById("linkModal");
    const title = document.getElementById("modalTitle");
    const textInput = document.getElementById("linkTextInput");
    const urlInput = document.getElementById("linkUrlInput");
    const deleteBtn = document.getElementById("deleteLinkBtn");

    if (title) title.textContent = el ? "Edit Link" : "Add New Link";
    if (textInput) textInput.value = el ? el.textContent : "";
    if (urlInput) urlInput.value = el ? el.getAttribute("href") || "" : "";
    if (deleteBtn) deleteBtn.style.display = el ? "inline-block" : "none";

    const currentIcon = el ? el.closest(".link-item")?.dataset.linkIcon || "globe" : "globe";
    _selectedIcon = currentIcon;
    document.querySelectorAll(".icon-option").forEach((o) =>
        o.classList.toggle("selected", o.dataset.icon === currentIcon)
    );

    if (modal) modal.style.display = "flex";
    setTimeout(() => textInput?.focus(), 100);
}

export function closeLinkModal() {
    const modal = document.getElementById("linkModal");
    if (modal) modal.style.display = "none";
    _activeLink = null;
}

export function saveLink() {
    const textInput = document.getElementById("linkTextInput");
    const urlInput = document.getElementById("linkUrlInput");
    const text = textInput?.value.trim();
    const url = urlInput?.value.trim();

    if (!text || !url) {
        showAlert("Please fill in both the display text and the URL.", "Missing Fields");
        return;
    }

    const iconKey = _selectedIcon || "globe";
    const iconSvg = buildLinkSvg(iconKey);

    if (_activeLink) {
        _activeLink.textContent = text;
        _activeLink.setAttribute("href", url);
        const span = _activeLink.closest(".link-item");
        if (span) {
            span.dataset.linkIcon = iconKey;
            const existingSvg = span.querySelector("svg");
            if (existingSvg) existingSvg.remove();
            span.insertAdjacentHTML("afterbegin", iconSvg);
        }
    } else {
        const span = document.createElement("span");
        span.className = "link-item";
        span.dataset.linkIcon = iconKey;
        const a = document.createElement("a");
        a.href = url;
        a.textContent = text;
        a.target = "_blank";
        a.title = "Click to edit";
        // Event listener will be attached in main.js via delegation
        span.innerHTML = iconSvg;
        span.appendChild(a);
        const container = document.getElementById("linksContainer");
        if (container) {
            container.insertBefore(span, container.querySelector(".add-link-btn"));
        }
    }
    closeLinkModal();
    snapshot();
}

export function deleteLink() {
    if (!_activeLink) {
        closeLinkModal();
        return;
    }
    const linkToDelete = _activeLink;
    closeLinkModal();
    showConfirm(
        "This link will be permanently removed from your resume.",
        "Delete Link?",
        "Delete"
    ).then((ok) => {
        if (ok) {
            linkToDelete.closest(".link-item").remove();
            snapshot();
        }
    });
}

export function closeExportModal() {
    const modal = document.getElementById("exportModal");
    if (modal) modal.style.display = "none";
}
