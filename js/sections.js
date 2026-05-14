import { snapshot } from './history.js';
import { showConfirm, showAlert, showToast } from './utils.js';

/**
 * Creates HTML for section controls.
 */
export function makeBlockControls() {
    return `<div class="block-controls no-print">
        <span class="drag-handle" title="Drag to reorder"><span class="material-symbols-outlined" style="font-size:18px">drag_indicator</span></span>
        <button class="dup-btn" title="Duplicate"><span class="material-symbols-outlined" style="font-size:18px">content_copy</span></button>
        <button class="btn-danger-small del-btn" title="Delete"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
      </div>`;
}

/**
 * Creates HTML for table controls.
 */
export function makeTableControls() {
    return `<div class="table-controls no-print">
        <button class="add-row-btn"><span class="material-symbols-outlined" style="font-size:14px">add</span> Row</button>
        <button class="del-row-btn"><span class="material-symbols-outlined" style="font-size:14px">remove</span> Row</button>
        <button class="add-col-btn"><span class="material-symbols-outlined" style="font-size:14px">add</span> Col</button>
        <button class="del-col-btn"><span class="material-symbols-outlined" style="font-size:14px">remove</span> Col</button>
      </div>`;
}

export function deleteBlock(target) {
    const block = target.closest(".section-block");
    if (!block) return;
    
    showConfirm(
        "This section and all its content will be removed. You can undo with Ctrl+Z.",
        "Delete Section?",
        "Delete"
    ).then((ok) => {
        if (ok) {
            block.remove();
            snapshot();
        }
    });
}

export function duplicateBlock(target) {
    const block = target.closest(".section-block");
    if (!block) return;
    
    const clone = block.cloneNode(true);
    clone.querySelectorAll(".resizer").forEach((r) => r.remove());
    block.parentNode.insertBefore(clone, block.nextSibling);
    makeColumnsResizable();
    snapshot();
    showToast("Section duplicated");
}

export function addSection() {
    const type = document.getElementById("newSectionType")?.value;
    const container = document.getElementById("sortable-sections");
    if (!container) return;
    
    const block = document.createElement("div");
    block.className = "section-block";
    const controls = makeBlockControls();
    const tc = makeTableControls();
    
    if (type === "text") {
        block.innerHTML = controls + `<div class="section-title" contenteditable="true">New Section:</div><p class="section-text" contenteditable="true">Enter your text here...</p>`;
    } else if (type === "table") {
        block.innerHTML = controls + `<div class="section-title" contenteditable="true">New Table:</div><table class="striped"><tr><th contenteditable="true">Header 1</th><th contenteditable="true">Header 2</th></tr><tr><td contenteditable="true">Data 1</td><td contenteditable="true">Data 2</td></tr></table>${tc}`;
    } else if (type === "list") {
        block.innerHTML = controls + `<div class="section-title" contenteditable="true">New List:</div><ul class="skills-list" contenteditable="true"><li>List item one</li><li>List item two</li></ul>`;
    } else if (type === "hr") {
        block.innerHTML = controls + `<hr class="custom-hr">`;
    }
    
    container.appendChild(block);
    if (type === "table") makeColumnsResizable();
    snapshot();
    block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --- Table Helpers ---

function getTableFromBtn(btn) {
    return btn.parentElement.previousElementSibling;
}

export function addRow(btn) {
    const table = getTableFromBtn(btn);
    if (!table) return;
    const tbody = table.querySelector("tbody") || table;
    const rows = tbody.querySelectorAll("tr");
    if (!rows.length) return;
    const newRow = rows[rows.length - 1].cloneNode(true);
    newRow.querySelectorAll("[contenteditable]").forEach((el) => (el.innerHTML = "[Data]"));
    newRow.querySelectorAll(".resizer").forEach((r) => r.remove());
    tbody.appendChild(newRow);
    snapshot();
}

export function deleteRow(btn, lastFocused) {
    const table = getTableFromBtn(btn);
    if (!table) return;
    const tbody = table.querySelector("tbody") || table;
    const rows = tbody.querySelectorAll("tr");
    const hasHeader = !!table.querySelector("th");

    if (rows.length <= (hasHeader ? 2 : 1)) {
        showAlert("This is the last data row and cannot be deleted.", "Cannot Delete Row");
        return;
    }

    if (lastFocused && table.contains(lastFocused)) {
        const row = lastFocused.closest("tr");
        if (row && (!hasHeader || row.parentNode.tagName !== "THEAD")) {
            row.remove();
            snapshot();
            return;
        }
    }

    tbody.removeChild(rows[rows.length - 1]);
    snapshot();
}

export function addColumn(btn) {
    const table = getTableFromBtn(btn);
    if (!table) return;
    table.querySelectorAll("tr").forEach((row) => {
        const isHeader = !!row.querySelector("th");
        const cell = document.createElement(isHeader ? "th" : "td");
        cell.setAttribute("contenteditable", "true");
        cell.innerHTML = isHeader ? "[Header]" : "[Data]";
        row.appendChild(cell);
    });
    reinitializeResizers(table);
    snapshot();
}

export function deleteColumn(btn, lastFocused) {
    const table = getTableFromBtn(btn);
    if (!table) return;
    const rows = table.querySelectorAll("tr");
    if (!rows.length) return;

    if (rows[0].children.length <= 1) {
        showAlert("This is the last column and cannot be deleted.", "Cannot Delete Column");
        return;
    }

    if (lastFocused && table.contains(lastFocused)) {
        const cell = lastFocused.closest("td, th");
        if (cell) {
            const index = cell.cellIndex;
            rows.forEach(row => {
                if (row.children[index]) row.removeChild(row.children[index]);
            });
            reinitializeResizers(table);
            snapshot();
            return;
        }
    }

    rows.forEach((row) => {
        if (row.lastElementChild) row.removeChild(row.lastElementChild);
    });
    reinitializeResizers(table);
    snapshot();
}

// --- Resizing ---

export function makeColumnsResizable() {
    document.querySelectorAll("table").forEach(reinitializeResizers);
}

export function reinitializeResizers(table) {
    table.querySelectorAll(".resizer").forEach((r) => r.remove());
    const firstRow = table.querySelector("tr");
    if (!firstRow) return;
    const cols = firstRow.children;
    for (let i = 0; i < cols.length - 1; i++) {
        const resizer = document.createElement("div");
        resizer.className = "resizer no-print";
        cols[i].appendChild(resizer);
        createResizableColumn(cols[i], resizer);
    }
}

function createResizableColumn(col, resizer) {
    let startX, startW;
    resizer.addEventListener("mousedown", (e) => {
        startX = e.clientX;
        startW = parseInt(getComputedStyle(col).width, 10);
        resizer.classList.add("resizing");
        const onMove = (e2) => {
            col.style.width = startW + e2.clientX - startX + "px";
        };
        const onUp = () => {
            resizer.classList.remove("resizing");
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });
}
