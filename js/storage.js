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
 * Exports resume data. 
 * Improved: Generates an HTML file that can redirect to the builder.
 */
export function exportData() {
    const data = getResumeData();
    const dataStr = JSON.stringify(data);
    
    // Create an HTML shim that redirects to the builder website
    // "I will make it work afterwards" - The user will replace the URL.
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Resume Data - ${data.sections[0]?.html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || 'Export'}</title>
    <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f9; }
        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Resume Data File</h2>
        <p>This file contains your resume data. Click the button below to open it in the Resume Builder.</p>
        <button id="openBtn">Open in Builder</button>
        <p style="font-size: 12px; color: #666; margin-top: 1rem;">(Note: You can also import this file directly in the app)</p>
    </div>
    <script>
        const resumeData = ${dataStr};
        document.getElementById('openBtn').addEventListener('click', () => {
            // Encode data and redirect. User said they will make it work afterwards.
            const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
            const blob = new Blob([JSON.stringify(resumeData)], {type: 'application/json'});
            const reader = new FileReader();
            reader.onload = function() {
                const b64 = btoa(reader.result);
                // We'll use a hash fragment to pass data
                window.location.href = baseUrl + "index.html#import=" + b64;
            };
            reader.readAsBinaryString(blob);
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my_resume.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast("Exported as HTML!");
}

export function importData(event, applyCallback) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let content = e.target.result;
            // Check if it's the new HTML format or old JSON format
            if (content.trim().startsWith("<!DOCTYPE html>")) {
                const match = content.match(/const resumeData = ({.*?});/s);
                if (match) {
                    content = match[1];
                }
            }
            applyCallback(JSON.parse(content));
            snapshot();
            showToast("Resume loaded!");
        } catch (err) {
            showAlert("This file could not be loaded. Make sure it is a valid resume file.", "Invalid File");
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}
