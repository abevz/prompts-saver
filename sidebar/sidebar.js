document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const addForm = document.getElementById('add-prompt-form');
    const titleInput = document.getElementById('prompt-title-input');
    const textTextarea = document.getElementById('prompt-text-textarea');
    const tagsInput = document.getElementById('prompt-tags-input');
    const promptsContainer = document.getElementById('prompts-list-container');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-csv-btn');
    const importBtn = document.getElementById('import-csv-btn');
    const importFileInput = document.getElementById('import-file-input');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitleH2 = document.querySelector('.add-form-container .add-form h2');
    const folderFilterSelect = document.getElementById('folder-filter-select');
    const addFolderForm = document.getElementById('add-folder-form');
    const newFolderNameInput = document.getElementById('new-folder-name');
    const promptFolderSelect = document.getElementById('prompt-folder-select');
    const devAddSubfolderBtn = document.getElementById('dev-add-subfolder');

    // --- STATE VARIABLES ---
    let allPrompts = [];
    let allFolders = [];
    let editingPromptId = null;

    // --- THEME MANAGEMENT ---
    function applyThemeBasedOnColors(themeInfo) {
        if (themeInfo && themeInfo.colors && themeInfo.colors.toolbar_text) {
            const textColor = themeInfo.colors.toolbar_text;
            const rgbMatch = textColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const rgb = rgbMatch.map(Number);
                const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                if (brightness > 128) { document.body.classList.add('dark-theme'); }
                else { document.body.classList.add('dark-theme'); }
            } else { document.body.classList.add('dark-theme'); }
        } else { document.body.classList.add('dark-theme'); }
    }
    try {
        browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => console.error("Error getting theme:", e));
        browser.theme.onUpdated.addListener(() => {
            browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => console.error("Error updating theme:", e));
        });
    } catch (e) { console.error("Failed to initialize theme API:", e); }

    // --- TAG COLOR GENERATION ---
    function getTagColor(tagStr) {
        let hash = 0;
        for (let i = 0; i < tagStr.length; i++) { hash = tagStr.charCodeAt(i) + ((hash << 5) - hash); }
        const hue = Math.abs(hash) % 360;
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) { return `hsl(${hue}, 65%, 45%)`; }
        else { return `hsl(${hue}, 70%, 88%)`; }
    }

    // --- COLLAPSIBLE FORM LOGIC ---
    function openForm() {
        addForm.classList.remove('hidden');
        toggleFormBtn.classList.add('is-open');
        if (!editingPromptId) { toggleFormBtn.textContent = 'Collapse Form'; }
    }
    function closeForm() {
        addForm.classList.add('hidden');
        toggleFormBtn.classList.remove('is-open');
        toggleFormBtn.textContent = 'Add New Prompt';
        resetForm();
    }

    // --- FOLDER LOGIC ---
    function populateFolderOptionsRecursive(selectElement, parentId, depth) {
        const indent = ' '.repeat(depth * 2) + (depth > 0 ? '↳ ' : '');
        allFolders
            .filter(folder => folder.parentId === parentId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(folder => {
                selectElement.add(new Option(indent + folder.name, folder.id));
                populateFolderOptionsRecursive(selectElement, folder.id, depth + 1);
            });
    }
    function renderFolders() {
        const currentFilterVal = folderFilterSelect.value;
        const currentPromptFolderVal = promptFolderSelect.value;
        folderFilterSelect.innerHTML = '';
        promptFolderSelect.innerHTML = '';
        folderFilterSelect.add(new Option("All Folders", "all"));
        folderFilterSelect.add(new Option("Uncategorized", "null"));
        promptFolderSelect.add(new Option("Uncategorized (Top Level)", "null"));
        populateFolderOptionsRecursive(folderFilterSelect, null, 0);
        populateFolderOptionsRecursive(promptFolderSelect, null, 0);
        folderFilterSelect.value = currentFilterVal || "all";
        promptFolderSelect.value = currentPromptFolderVal || "null";
    }
    async function saveAllFolders(folders) {
        try { await browser.storage.local.set({ folders }); }
        catch (e) { console.error("Error saving folders:", e); }
    }
    async function handleAddFolder(e) {
        e.preventDefault();
        const folderName = newFolderNameInput.value.trim();
        if (folderName && !allFolders.some(f => f.name === folderName && f.parentId === null)) {
            const newFolder = { id: Date.now(), name: folderName, parentId: null };
            allFolders = [...allFolders, newFolder];
            await saveAllFolders(allFolders);
            newFolderNameInput.value = '';
        } else if (!folderName) {
            alert("Folder name cannot be empty.");
        } else {
            alert("A top-level folder with this name already exists.");
        }
    }
    function getDescendantFolderIds(parentFolderId, foldersArray) {
        let ids = [parentFolderId];
        let children = foldersArray.filter(f => f.parentId === parentFolderId);
        while (children.length > 0) {
            let nextChildren = [];
            for (const child of children) {
                ids.push(child.id);
                nextChildren.push(...foldersArray.filter(f => f.parentId === child.id));
            }
            children = nextChildren;
        }
        return ids.map(id => id === null ? "null" : String(id));
    }

    // --- PROMPT RENDERING AND DATA LOGIC ---
    function escapeHTML(str) {
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(str || "")); // Ensure str is not null/undefined
        return p.innerHTML;
    }
    function renderPrompts(prompts) {
        promptsContainer.innerHTML = '';
        if (!prompts || prompts.length === 0) {
            promptsContainer.innerHTML = `<p style="text-align:center; color:var(--text-secondary-color);">No prompts found.</p>`;
            return;
        }
        prompts.forEach(prompt => {
            const promptElement = document.createElement('div');
            promptElement.className = 'prompt-item';
            promptElement.dataset.promptId = prompt.id;
            const tagsHTML = (prompt.tags && prompt.tags.length > 0) ? `<div class="prompt-tags">${prompt.tags.map(tag => { const bgColor = getTagColor(tag); return `<span class="tag-item" style="background-color: ${bgColor}">${escapeHTML(tag)}</span>`; }).join('')}</div>` : '';
            promptElement.innerHTML = `<h3 class="prompt-title">${escapeHTML(prompt.title || '(Untitled)')}</h3><p class="prompt-text">${escapeHTML(prompt.text)}</p>${tagsHTML} <div class="prompt-actions"> <button class="copy-btn">Copy</button> <button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button> </div>`;
            promptsContainer.appendChild(promptElement);
        });
    }
    function renderFilteredPrompts() {
        const selectedFolderValue = folderFilterSelect.value;
        const searchTerm = searchInput.value.toLowerCase();
        let promptsToDisplay = allPrompts;
        if (selectedFolderValue === "null") {
            promptsToDisplay = promptsToDisplay.filter(p => p.folderId === null || p.folderId === undefined);
        } else if (selectedFolderValue !== "all") {
            const folderIdsToFilterBy = getDescendantFolderIds(Number(selectedFolderValue), allFolders);
            promptsToDisplay = promptsToDisplay.filter(p => p.folderId && folderIdsToFilterBy.includes(String(p.folderId)));
        }
        if (searchTerm) {
            promptsToDisplay = promptsToDisplay.filter(p => {
                const titleMatch = p.title?.toLowerCase().includes(searchTerm);
                const textMatch = p.text?.toLowerCase().includes(searchTerm); // Added null check for text
                const tagsMatch = p.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
                return titleMatch || textMatch || tagsMatch;
            });
        }
        renderPrompts(promptsToDisplay);
    }
    async function saveAllPrompts(prompts) {
        try { await browser.storage.local.set({ prompts }); }
        catch (error) { console.error("Error saving prompts:", error); }
    }
    function resetForm() {
        addForm.reset();
        editingPromptId = null;
        toggleFormBtn.textContent = 'Add New Prompt';
        if (formTitleH2) formTitleH2.textContent = "Add New Prompt";
        saveBtn.textContent = "Save";
        cancelBtn.classList.add('hidden');
    }

    // --- CSV PARSING ---
    function parseCSV(csvText) {
        const promptsFromCSV = [];
        const lines = csvText.trim().split(/\r\n|\n|\r/);
        if (lines.length < 2) return promptsFromCSV;
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const idIdx = header.indexOf('id'); const createdAtIdx = header.indexOf('createdat'); const titleIdx = header.indexOf('title'); const textIdx = header.indexOf('text'); const tagsIdx = header.indexOf('tags'); const folderIdIdx = header.indexOf('folderid');
        if (idIdx === -1 || textIdx === -1) { alert("CSV Format Error: Missing 'id' or 'text' columns."); return promptsFromCSV; }
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i]; if (!line.trim()) continue; const values = []; let currentVal = ''; let inQuotes = false;
            for (let k = 0; k < line.length; k++) {
                let char = line[k];
                if (char === '"' && inQuotes && k + 1 < line.length && line[k + 1] === '"') { currentVal += '"'; k++; }
                else if (char === '"') { inQuotes = !inQuotes; }
                else if (char === ',' && !inQuotes) { values.push(currentVal); currentVal = ''; }
                else { currentVal += char; }
            }
            values.push(currentVal);
            try {
                const id = Number(values[idIdx]); if (isNaN(id)) { console.warn("Skipping CSV row: invalid ID", values[idIdx]); continue; }
                const prompt = { id: id, createdAt: createdAtIdx !== -1 && values[createdAtIdx] ? values[createdAtIdx].replace(/^"|"$/g, '') : new Date().toISOString(), title: titleIdx !== -1 && values[titleIdx] ? values[titleIdx].replace(/^"|"$/g, '') : 'Imported Prompt', text: values[textIdx] ? values[textIdx].replace(/^"|"$/g, '') : '', tags: tagsIdx !== -1 && values[tagsIdx] ? values[tagsIdx].replace(/^"|"$/g, '').split(',').map(t => t.trim()).filter(Boolean) : [], folderId: folderIdIdx !== -1 && values[folderIdIdx] ? Number(values[folderIdIdx]) : null };
                if (prompt.folderId !== null && !allFolders.some(f => f.id === prompt.folderId)) { prompt.folderId = null; } promptsFromCSV.push(prompt);
            } catch (e) { console.error("Error parsing CSV row:", line, e); }
        } return promptsFromCSV;
    }

    // --- INITIALIZATION ---
    async function initialize() {
        const data = await browser.storage.local.get(["prompts", "folders"]);
        allPrompts = data.prompts || [];
        allFolders = data.folders || [];
        renderFolders();
        renderFilteredPrompts();
        closeForm();
    }

    // --- EVENT LISTENERS ---
    toggleFormBtn.addEventListener('click', () => { if (addForm.classList.contains('hidden')) { openForm(); } else { closeForm(); } });
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const title = titleInput.value.trim(); const text = textTextarea.value.trim(); const tags = tagsInput.value.trim().split(',').map(tag => tag.trim()).filter(Boolean);
        const selectedFolderIdValue = promptFolderSelect.value; const folderId = selectedFolderIdValue === "null" ? null : Number(selectedFolderIdValue);
        if (!title || !text) return;
        if (editingPromptId) { const promptToUpdate = allPrompts.find(p => p.id === editingPromptId); if (promptToUpdate) { promptToUpdate.title = title; promptToUpdate.text = text; promptToUpdate.tags = tags; promptToUpdate.folderId = folderId; }
        } else { const newPrompt = { id: Date.now(), title, text, tags, folderId, createdAt: new Date().toISOString() }; allPrompts = [newPrompt, ...allPrompts]; }
        await saveAllPrompts(allPrompts); closeForm();
    });
    promptsContainer.addEventListener('click', (e) => {
        const target = e.target; const promptItem = target.closest('.prompt-item'); if (!promptItem) return; const promptId = Number(promptItem.dataset.promptId);
        if (target.classList.contains('copy-btn')) { const promptToCopy = allPrompts.find(p => p.id === promptId); if (promptToCopy) { navigator.clipboard.writeText(promptToCopy.text).then(() => { target.textContent = 'Copied!'; target.disabled = true; setTimeout(() => { target.textContent = 'Copy'; target.disabled = false; }, 1500); }).catch(err => console.error('Error copying:', err)); } }
        else if (target.classList.contains('delete-btn')) { if (confirm("Are you sure you want to delete this prompt?")) { allPrompts = allPrompts.filter(p => p.id !== promptId); saveAllPrompts(allPrompts); } }
        else if (target.classList.contains('edit-btn')) { const promptToEdit = allPrompts.find(p => p.id === promptId); if (promptToEdit) { openForm(); editingPromptId = promptId; titleInput.value = promptToEdit.title; textTextarea.value = promptToEdit.text; tagsInput.value = (promptToEdit.tags || []).join(', '); promptFolderSelect.value = promptToEdit.folderId === null || promptToEdit.folderId === undefined ? "null" : promptToEdit.folderId; toggleFormBtn.textContent = `Editing: ${escapeHTML(promptToEdit.title).substring(0, 20)}...`; if (formTitleH2) formTitleH2.textContent = "Edit Prompt"; saveBtn.textContent = "Update"; cancelBtn.classList.remove('hidden'); addForm.scrollIntoView({ behavior: 'smooth' }); titleInput.focus(); } }
    });
    addFolderForm.addEventListener('submit', handleAddFolder);
    folderFilterSelect.addEventListener('change', renderFilteredPrompts);
    searchInput.addEventListener('input', renderFilteredPrompts);
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            let reRenderPromptsFlag = false; let reRenderFoldersFlag = false;
            if (changes.prompts) { allPrompts = changes.prompts.newValue || []; reRenderPromptsFlag = true; }
            if (changes.folders) { allFolders = changes.folders.newValue || []; reRenderFoldersFlag = true; }
            if (reRenderFoldersFlag) renderFolders();
            if (reRenderPromptsFlag || reRenderFoldersFlag) renderFilteredPrompts();
        }
    });
    cancelBtn.addEventListener('click', () => { closeForm(); });
    exportBtn.addEventListener('click', () => {
        if (allPrompts.length === 0) { alert("No prompts to export."); return; } const header = "id,createdAt,title,text,tags,folderId\n";
        const rows = allPrompts.map(p => { const id = p.id; const createdAt = `"${p.createdAt}"`; const title = `"${(p.title || '').replace(/"/g, '""')}"`; const text = `"${(p.text || '').replace(/"/g, '""')}"`; const tags = `"${(p.tags || []).join(',').replace(/"/g, '""')}"`; const folderId = p.folderId === null || p.folderId === undefined ? "" : p.folderId; return `${id},${createdAt},${title},${text},${tags},${folderId}`; }).join("\n");
        const csvContent = header + rows; const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
        const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `prompts_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    });
    importBtn.addEventListener('click', () => { importFileInput.click(); });
    importFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0]; if (file) { const reader = new FileReader();
            reader.onload = async (e) => {
                const csvText = e.target.result; const importedPrompts = parseCSV(csvText);
                if (importedPrompts.length === 0 && csvText.trim().split(/\r\n|\n|\r/).length > 1) { alert("Could not parse prompts. Check CSV format & UTF-8 encoding."); event.target.value = null; return; }
                if (importedPrompts.length === 0) { alert("No prompts found to import, or file is empty (except header)."); event.target.value = null; return; }
                let newPromptsAddedCount = 0; const currentPromptIds = new Set(allPrompts.map(p => p.id)); const promptsToActuallyAdd = [];
                for (const importedPrompt of importedPrompts) { if (!currentPromptIds.has(importedPrompt.id)) { promptsToActuallyAdd.push(importedPrompt); newPromptsAddedCount++; } }
                if (newPromptsAddedCount > 0) { allPrompts = [...promptsToActuallyAdd, ...allPrompts]; await saveAllPrompts(allPrompts); alert(`${newPromptsAddedCount} new prompts imported successfully!`); }
                else { alert("No new prompts to import. All prompts from file might already exist."); }
            };
            reader.readAsText(file, 'UTF-8'); // Specify UTF-8 encoding
        }
        event.target.value = null;
    });

    // DEV Button for adding subfolders
    if (devAddSubfolderBtn) {
        devAddSubfolderBtn.addEventListener('click', async () => {
            if (allFolders.length === 0) { alert("Create a top-level folder first!"); return; }
            const firstFolderId = allFolders[0].id; const subFolderName = `Subfolder for ${allFolders[0].name}`;
            if (allFolders.some(f => f.name === subFolderName && f.parentId === firstFolderId)) { alert(`Subfolder "${subFolderName}" already exists.`); return; }
            const newSubFolder = { id: Date.now(), name: subFolderName, parentId: firstFolderId };
            allFolders = [...allFolders, newSubFolder]; await saveAllFolders(allFolders);
            alert(`Test subfolder "${subFolderName}" created under "${allFolders[0].name}".`);
        });
    }
    
    initialize();
});