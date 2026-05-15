import { getResumeData } from './state.js';
import { showToast, showAlert, showConfirm } from './utils.js';
import { snapshot } from './history.js';

export function saveToBrowser() {
    try {
        localStorage.setItem("mySavedResume", JSON.stringify(getResumeData()));
        showToast("Saved to browser!");
    } catch (e) {
        showAlert("Could not save — your browser storage may be full.", "Save Failed");
    }
}

export function clearBrowserSave() {
    showConfirm(
        "This will erase your saved resume from the browser. You cannot undo this.",
        "Clear Browser Save?",
        "Clear"
    ).then((ok) => {
        if (ok) {
            localStorage.removeItem("mySavedResume");
            showToast("Browser save cleared.");
        }
    });
}

/**
 * Opens the export modal and populates the default filename.
 */
export function exportData() {
    const h1 = document.querySelector(".header h1");
    let defaultName = "My_Resume";
    
    if (h1 && h1.textContent.trim()) {
        // Strip brackets if they are still there
        let rawName = h1.textContent.trim().replace(/^\[|\]$/g, '');
        if (rawName && rawName !== "Your Full Name") {
            // Clean up name but keep some character (allow spaces if user wants, but underscores are safer)
            // Let's use spaces if they want, browsers handle it fine nowadays
            defaultName = rawName + " Resume";
        }
    }
    
    const modal = document.getElementById("exportModal");
    const input = document.getElementById("exportFileName");
    if (modal && input) {
        input.value = defaultName;
        modal.style.display = "flex";
        input.focus();
        input.select();
    }
}

/**
 * Performs the actual file export after confirmation from the modal.
 */
export function confirmExport() {
    const input = document.getElementById("exportFileName");
    const fileName = input?.value || "my_resume";
    const data = getResumeData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}.resumeBuilder`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    
    const modal = document.getElementById("exportModal");
    if (modal) modal.style.display = "none";
    
    showToast(`Exported as ${fileName}.resumeBuilder`);
}

/**
 * Imports resume data from .resbuild, .resumeBuilder, or .html files.
 */
export function importData(event, applyCallback) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let content = e.target.result;
            
            // Check if it's the HTML shim format
            if (content.trim().startsWith("<!DOCTYPE html>")) {
                const match = content.match(/const resumeData = ({.*?});/s);
                if (match) {
                    content = match[1];
                }
            }
            
            const data = JSON.parse(content);
            applyCallback(data);
            snapshot();
            showToast("Resume loaded successfully!");
        } catch (err) {
            console.error("Import error:", err);
            showAlert(
                "This file could not be loaded. Make sure it is a valid .resbuild or .resumeBuilder file.",
                "Invalid File"
            );
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}
