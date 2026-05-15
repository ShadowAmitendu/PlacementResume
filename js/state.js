import { showToast, showAlert } from './utils.js';

export const THEMES = {
    classic: { color: "#000000", bg: "#d9d9d9", text: "#ffffff" },
    navy: { color: "#003366", bg: "#e6edf5", text: "#ffffff" },
    burgundy: { color: "#660000", bg: "#f5e6e6", text: "#ffffff" },
    forest: { color: "#004d00", bg: "#e6f0e6", text: "#ffffff" },
    slate: { color: "#4a4a4a", bg: "#eeeeee", text: "#ffffff" },
    teal: { color: "#006666", bg: "#e0f0f0", text: "#ffffff" },
    purple: { color: "#3d0066", bg: "#ede0f0", text: "#ffffff" },
    emerald: { color: "#10b981", bg: "#d1fae5", text: "#ffffff" },
    violet: { color: "#8b5cf6", bg: "#ede9fe", text: "#ffffff" },
    crimson: { color: "#dc2626", bg: "#fee2e2", text: "#ffffff" },
    amber: { color: "#d97706", bg: "#fef3c7", text: "#ffffff" },
};

export let _currentTheme = "classic";
export let _photoBase64 = null;
export let _isDarkMode = false;

export function setPhotoBase64(val) { _photoBase64 = val; }
export function setIsDarkMode(val) { _isDarkMode = val; }

/**
 * Maps icon names to SVG definitions or Material Symbols.
 */
export const LINK_ICONS = {
    none: { type: "material", name: "link" },
    github: { type: "svg", svgHref: "#ico-github", style: "fill:var(--theme-color)" },
    linkedin: { type: "svg", svgHref: "#ico-linkedin", style: "fill:var(--theme-color)" },
    globe: { type: "material", name: "public" },
    twitter: { type: "svg", svgHref: "#ico-twitter", style: "fill:var(--theme-color)" },
    instagram: { type: "svg", svgHref: "#ico-instagram", style: "fill:var(--theme-color)" },
    youtube: { type: "svg", svgHref: "#ico-youtube", style: "fill:var(--theme-color)" },
    facebook: { type: "svg", svgHref: "#ico-facebook", style: "fill:var(--theme-color)" },
    email: { type: "material", name: "mail" },
};

export function buildLinkSvg(iconKey) {
    const cfg = LINK_ICONS[iconKey] || LINK_ICONS.none;
    if (cfg.type === "material") {
        return `<span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle; color:var(--theme-color); margin-right:4px;">${cfg.name}</span>`;
    }
    
    // For brand icons, we'll use inline SVGs since we removed symbol defs from index.html
    // I need to provide the paths here.
    const paths = {
        github: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
        linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
        twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z",
        instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.75-2.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
        youtube: "M23 7.5a3.5 3.5 0 0 0-2.46-2.48C18.4 4.5 12 4.5 12 4.5s-6.4 0-8.54.52A3.5 3.5 0 0 0 1 7.5 36.1 36.1 0 0 0 .5 12c0 1.5.2 3 .5 4.5a3.5 3.5 0 0 0 2.46 2.48C5.6 19.5 12 19.5 12 19.5s6.4 0 8.54-.52A3.5 3.5 0 0 0 23 16.5c.3-1.5.5-3 .5-4.5s-.2-3-.5-4.5zM10 15V9l5 3-5 3z",
        facebook: "M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.7c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.5l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z"
    };

    return `<svg viewBox="0 0 24 24" width="13" height="13" style="${cfg.style}; vertical-align:middle; margin-right:4px;"><path d="${paths[iconKey]}"/></svg>`;
}

export function getResumeData() {
    const sections = [];
    const header = document.querySelector(".header");
    if (header) {
        const headerClone = header.cloneNode(true);
        headerClone.querySelectorAll(".no-print").forEach((el) => el.remove());
        sections.push({ type: "header", html: headerClone.innerHTML });
    }

    document.querySelectorAll("#sortable-sections .section-block").forEach((block) => {
        const clone = block.cloneNode(true);
        clone.querySelectorAll(".no-print, .resizer").forEach((el) => el.remove());
        sections.push({ type: "section", html: clone.innerHTML });
    });

    const finalBlock = document.getElementById("declarationSection");
    if (finalBlock) {
        const clone = finalBlock.cloneNode(true);
        clone.querySelectorAll(".no-print").forEach((el) => el.remove());
        sections.push({ type: "final", html: clone.innerHTML });
    }

    return {
        sections,
        photo: _photoBase64,
        theme: _currentTheme,
        font: document.getElementById("fontSelector")?.value,
        marker: document.getElementById("markerSelector")?.value,
        tableStyle: document.getElementById("tableStyleSelector")?.value,
        showLinkIcons: document.getElementById("toggleLinkIcons")?.checked || false,
        zoom: document.getElementById("zoomSlider")?.value,
        version: 3,
    };
}

export function setTheme(name) {
    const t = THEMES[name];
    if (!t) return;

    _currentTheme = name;
    const root = document.documentElement;
    root.style.setProperty("--theme-color", t.color);
    root.style.setProperty("--theme-bg-light", t.bg);
    root.style.setProperty("--theme-text-light", t.text);

    document.querySelectorAll(".swatch").forEach((s) =>
        s.classList.toggle("active", s.dataset.theme === name)
    );
}

export function applySettings() {
    const root = document.documentElement;
    const fontSelector = document.getElementById("fontSelector");
    const markerSelector = document.getElementById("markerSelector");
    const tableStyleSelector = document.getElementById("tableStyleSelector");
    const toggleLinkIcons = document.getElementById("toggleLinkIcons");
    const showDeclarationToggle = document.getElementById("showDeclarationToggle");
    const declarationSection = document.getElementById("declarationSection");
    const resumeWrapper = document.getElementById("resumeWrapper");

    if (fontSelector) root.style.setProperty("--main-font", fontSelector.value);
    if (markerSelector) root.style.setProperty("--section-marker", `"${markerSelector.value}"`);
    if (resumeWrapper && tableStyleSelector) {
        resumeWrapper.setAttribute("data-table-style", tableStyleSelector.value);
    }

    if (toggleLinkIcons && resumeWrapper) {
        resumeWrapper.classList.toggle("links-no-icons", !toggleLinkIcons.checked);
    }

    if (showDeclarationToggle && declarationSection) {
        declarationSection.style.display = showDeclarationToggle.checked ? "block" : "none";
    }
}
