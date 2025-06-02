// prompts-saver/sidebar/sidebar.js
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
    // const addFolderForm = document.getElementById('add-folder-form'); // Removed
    // const newFolderNameInput = document.getElementById('new-folder-name'); // Removed
    const promptFolderSelect = document.getElementById('prompt-folder-select');
    // const devAddSubfolderBtn = document.getElementById('dev-add-subfolder'); // Removed

    // --- STATE VARIABLES ---
    let allPrompts = [];
    let allFolders = [];
    let editingPromptId = null;

    // --- THEME MANAGEMENT & TAG COLOR ---
    function applyThemeBasedOnColors(themeInfo) {
        if (themeInfo && themeInfo.colors && themeInfo.colors.toolbar_text) {
            const textColor = themeInfo.colors.toolbar_text;
            const rgbMatch = textColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const rgb = rgbMatch.map(Number);
                const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                applyThemeClass(brightness > 128);
            } else { applyThemeClass(true); } // Fallback to dark if color format unexpected
        } else { applyThemeClass(true); } // Default to dark if no color info
    }
    function applyThemeClass(isDark) {
        if (isDark) { document.body.classList.add('dark-theme'); }
        else { document.body.classList.remove('dark-theme'); }
    }
    try {
        browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => { console.error("Error getting theme:", e); applyThemeClass(true); });
        browser.theme.onUpdated.addListener(() => {
            browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => { console.error("Error updating theme:", e); applyThemeClass(true); });
        });
    } catch (e) { console.error("Failed to initialize theme API:", e); applyThemeClass(true); }

    function getTagColor(tagStr) {
        let hash = 0; for (let i = 0; i < tagStr.length; i++) { hash = tagStr.charCodeAt(i) + ((hash << 5) - hash); }
        const hue = Math.abs(hash) % 360;
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) { return `hsl(${hue}, 75%, 65%)`; }
        else { return `hsl(${hue}, 70%, 88%)`; }
    }

    // --- COLLAPSIBLE FORM LOGIC ---
    function openForm() {
        addForm.classList.remove('hidden');
        if(toggleFormBtn) {
            toggleFormBtn.classList.add('is-open');
            if (!editingPromptId) { toggleFormBtn.textContent = 'Collapse Form'; }
        }
    }
    function closeForm() {
        addForm.classList.add('hidden');
        if (toggleFormBtn) {
            toggleFormBtn.classList.remove('is-open');
            toggleFormBtn.textContent = 'Add New Prompt';
        }
        resetForm();
    }
    
    // --- FOLDER LOGIC ---
    function populateFolderOptionsRecursive(selectElement, parentId, depth) {
        const indent = (depth > 0 ? '—'.repeat(depth) + ' ' : '');
        allFolders.filter(folder => folder.parentId === parentId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(folder => {
                selectElement.add(new Option(indent + escapeHTML(folder.name), folder.id));
                populateFolderOptionsRecursive(selectElement, folder.id, depth + 1);
            });
    }
    function renderFolders() {
        // console.log('[Sidebar] renderFolders - allFolders:', JSON.parse(JSON.stringify(allFolders)));
        const currentFilterVal = folderFilterSelect.value;
        const currentPromptFolderVal = promptFolderSelect.value;
        folderFilterSelect.innerHTML = ''; promptFolderSelect.innerHTML = '';
        folderFilterSelect.add(new Option("All Folders", "all"));
        folderFilterSelect.add(new Option("Uncategorized", "null"));
        promptFolderSelect.add(new Option("Uncategorized (Top Level)", "null"));
        populateFolderOptionsRecursive(folderFilterSelect, null, 0);
        populateFolderOptionsRecursive(promptFolderSelect, null, 0);
        try { folderFilterSelect.value = currentFilterVal || "all"; } catch(e){ folderFilterSelect.value = "all"; }
        try { promptFolderSelect.value = currentPromptFolderVal || "null"; } catch(e){ promptFolderSelect.value = "null";}
    }
    async function saveAllFolders(folders) { try { await browser.storage.local.set({ folders }); } catch (e) { console.error("Error saving folders:", e); } }
    
    function getFolderPath(folderId, foldersArray) {
        if (folderId === null || folderId === undefined) { return ""; }
        let pathSegments = []; let currentFolderId = folderId;
        const foldersById = foldersArray.reduce((acc, folder) => { acc[folder.id] = folder; return acc; }, {});
        let safetyCounter = 0;
        while (currentFolderId !== null && foldersById[currentFolderId] && safetyCounter < 10) {
            const folder = foldersById[currentFolderId];
            pathSegments.unshift(escapeHTML(folder.name)); currentFolderId = folder.parentId; safetyCounter++;
        }
        return pathSegments.join(' → ');
    }
    function getDescendantFolderIds(parentFolderId, foldersArray) {
        let ids = [parentFolderId]; let children = foldersArray.filter(f => f.parentId === parentFolderId);
        while (children.length > 0) { let nextChildren = []; for (const child of children) { ids.push(child.id); nextChildren.push(...foldersArray.filter(f => f.parentId === child.id)); } children = nextChildren; }
        return ids.map(id => id === null ? "null" : String(id));
    }

    // --- PROMPT RENDERING (РЕФАКТОРИНГ) ---
    function escapeHTML(str) { const p = document.createElement("p"); p.appendChild(document.createTextNode(str || "")); return p.innerHTML; }
    
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

            const titleEl = document.createElement('h3');
            titleEl.className = 'prompt-title';
            titleEl.textContent = escapeHTML(prompt.title || '(Untitled)');
            promptElement.appendChild(titleEl);

            const textEl = document.createElement('p');
            textEl.className = 'prompt-text';
            textEl.textContent = escapeHTML(prompt.text); // Используем textContent для безопасности
            promptElement.appendChild(textEl);

            if (prompt.tags && prompt.tags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'prompt-tags';
                prompt.tags.forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'tag-item';
                    tagSpan.style.backgroundColor = getTagColor(tag);
                    tagSpan.textContent = escapeHTML(tag);
                    tagsContainer.appendChild(tagSpan);
                });
                promptElement.appendChild(tagsContainer);
            }

            if (prompt.folderId !== null && prompt.folderId !== undefined) {
                const path = getFolderPath(prompt.folderId, allFolders);
                if (path) {
                    const pathEl = document.createElement('div');
                    pathEl.className = 'prompt-folder-path';
                    pathEl.textContent = path;
                    promptElement.appendChild(pathEl);
                }
            }
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'prompt-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn icon-btn';
            copyBtn.title = 'Copy Text';
            copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg>`;
            actionsDiv.appendChild(copyBtn);

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn icon-btn';
            editBtn.title = 'Edit Prompt';
            editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg>`;
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn icon-btn';
            deleteBtn.title = 'Delete Prompt';
            deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg>`;
            actionsDiv.appendChild(deleteBtn);

            promptElement.appendChild(actionsDiv);
            promptsContainer.appendChild(promptElement);
        });
    }
    
    function renderFilteredPrompts() { 
        const selectedFolderValue = folderFilterSelect.value; const searchTerm = searchInput.value.toLowerCase(); let promptsToDisplay = allPrompts;
        if (selectedFolderValue === "null") { promptsToDisplay = promptsToDisplay.filter(p => p.folderId === null || p.folderId === undefined); }
        else if (selectedFolderValue !== "all") { const folderIdsToFilterBy = getDescendantFolderIds(Number(selectedFolderValue), allFolders); promptsToDisplay = promptsToDisplay.filter(p => p.folderId && folderIdsToFilterBy.includes(String(p.folderId))); }
        if (searchTerm) { promptsToDisplay = promptsToDisplay.filter(p => { const titleMatch = p.title?.toLowerCase().includes(searchTerm); const textMatch = p.text?.toLowerCase().includes(searchTerm); const tagsMatch = p.tags?.some(tag => tag.toLowerCase().includes(searchTerm)); return titleMatch || textMatch || tagsMatch; }); }
        renderPrompts(promptsToDisplay);
    }
    async function saveAllPrompts(prompts) { try { await browser.storage.local.set({ prompts }); } catch (error) { console.error("Error saving prompts:", error); } }
    function resetForm() { 
        addForm.reset(); editingPromptId = null; 
        if(toggleFormBtn) toggleFormBtn.textContent = 'Add New Prompt'; 
        if (formTitleH2) formTitleH2.textContent = "Add New Prompt"; 
        if(saveBtn) saveBtn.textContent = "Save"; 
        if(cancelBtn) cancelBtn.classList.add('hidden');
    }
    
    function parseCSV(csvText) { /* ... как в прошлой версии ... */ }
    parseCSV = (csvText) => { const promptsFromCSV = []; const lines = csvText.trim().split(/\r\n|\n|\r/); if (lines.length < 2) return promptsFromCSV; const header = lines[0].split(',').map(h => h.trim().toLowerCase()); const idIdx = header.indexOf('id'); const createdAtIdx = header.indexOf('createdat'); const titleIdx = header.indexOf('title'); const textIdx = header.indexOf('text'); const tagsIdx = header.indexOf('tags'); const folderIdIdx = header.indexOf('folderid'); if (idIdx === -1 || textIdx === -1) { alert("CSV Format Error: Missing 'id' or 'text' columns."); return promptsFromCSV; } for (let i = 1; i < lines.length; i++) { const line = lines[i]; if (!line.trim()) continue; const values = []; let currentVal = ''; let inQuotes = false; for (let k = 0; k < line.length; k++) { let char = line[k]; if (char === '"' && inQuotes && k + 1 < line.length && line[k + 1] === '"') { currentVal += '"'; k++; } else if (char === '"') { inQuotes = !inQuotes; } else if (char === ',' && !inQuotes) { values.push(currentVal); currentVal = ''; } else { currentVal += char; } } values.push(currentVal); try { const id = Number(values[idIdx]); if (isNaN(id)) { console.warn("Skipping CSV row: invalid ID", values[idIdx]); continue; } const prompt = { id: id, createdAt: createdAtIdx !== -1 && values[createdAtIdx] ? values[createdAtIdx].replace(/^"|"$/g, '') : new Date().toISOString(), title: titleIdx !== -1 && values[titleIdx] ? values[titleIdx].replace(/^"|"$/g, '') : 'Imported Prompt', text: values[textIdx] ? values[textIdx].replace(/^"|"$/g, '') : '', tags: tagsIdx !== -1 && values[tagsIdx] ? values[tagsIdx].replace(/^"|"$/g, '').split(',').map(t => t.trim()).filter(Boolean) : [], folderId: folderIdIdx !== -1 && values[folderIdIdx] && values[folderIdIdx].trim() !== "" ? Number(values[folderIdIdx]) : null }; if (prompt.folderId !== null && !allFolders.some(f => f.id === prompt.folderId)) { prompt.folderId = null; } promptsFromCSV.push(prompt); } catch (e) { console.error("Error parsing CSV row:", line, e); } } return promptsFromCSV; };

    // --- INITIALIZATION ---
    async function initialize() {
        console.log('[Sidebar] Initialize START. Loading prompts and folders.');
        try {
            const data = await browser.storage.local.get(["prompts", "folders"]);
            allPrompts = data.prompts || [];
            allFolders = data.folders || [];
        } catch (e) {
            console.error("[Sidebar] Error LOADING from storage during initialize:", e);
            allPrompts = []; allFolders = [];
        }
        renderFolders();
        renderFilteredPrompts();
        closeForm();
    }

    // --- EVENT LISTENERS ---
    if(toggleFormBtn) toggleFormBtn.addEventListener('click', () => { if (addForm.classList.contains('hidden')) { openForm(); } else { closeForm(); } });
    
    if(addForm) addForm.addEventListener('submit', async (e) => { 
        e.preventDefault(); const title = titleInput.value.trim(); const text = textTextarea.value.trim(); const tags = tagsInput.value.trim().split(',').map(tag => tag.trim()).filter(Boolean);
        const selectedFolderIdValue = promptFolderSelect.value; const folderId = selectedFolderIdValue === "null" ? null : Number(selectedFolderIdValue);
        if (!title || !text) return;
        if (editingPromptId) { const promptToUpdate = allPrompts.find(p => p.id === editingPromptId); if (promptToUpdate) { promptToUpdate.title = title; promptToUpdate.text = text; promptToUpdate.tags = tags; promptToUpdate.folderId = folderId; }
        } else { const newPrompt = { id: Date.now(), title, text, tags, folderId, createdAt: new Date().toISOString() }; allPrompts = [newPrompt, ...allPrompts]; }
        await saveAllPrompts(allPrompts); closeForm();
    });
    
    if(promptsContainer) promptsContainer.addEventListener('click', (e) => { 
        const target = e.target.closest('button'); // Делегируем на кнопку
        if (!target) return; 

        const promptItem = target.closest('.prompt-item'); 
        if (!promptItem) return; 
        
        const promptId = Number(promptItem.dataset.promptId);
        
        if (target.classList.contains('copy-btn')) {
            const promptToCopy = allPrompts.find(p => p.id === promptId);
            if(promptToCopy && typeof promptToCopy.text === 'string') {
                navigator.clipboard.writeText(promptToCopy.text)
                    .then(() => { target.innerHTML = 'Copied!'; target.disabled = true; setTimeout(() => { target.innerHTML = `<svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg>`; target.disabled = false; }, 1500); })
                    .catch(err => { console.error('Failed to copy text to clipboard:', err); alert('Error: Could not copy text. See console for details.'); });
            } else { console.error("Cannot copy: Prompt text is missing or not a string.", promptToCopy); alert("Cannot copy: Prompt content is invalid."); }
        } else if (target.classList.contains('delete-btn')) { 
            if (confirm("Are you sure you want to delete this prompt?")) { allPrompts = allPrompts.filter(p => p.id !== promptId); saveAllPrompts(allPrompts); }
        } else if (target.classList.contains('edit-btn')) { 
            const promptToEdit = allPrompts.find(p => p.id === promptId); 
            if (promptToEdit) { 
                openForm(); editingPromptId = promptId; titleInput.value = promptToEdit.title; textTextarea.value = promptToEdit.text; tagsInput.value = (promptToEdit.tags || []).join(', '); promptFolderSelect.value = promptToEdit.folderId === null || promptToEdit.folderId === undefined ? "null" : promptToEdit.folderId; 
                if(toggleFormBtn) toggleFormBtn.textContent = `Editing: ${escapeHTML(promptToEdit.title).substring(0, 20)}...`; 
                if (formTitleH2) formTitleH2.textContent = "Edit Prompt"; 
                if(saveBtn) saveBtn.textContent = "Update"; 
                if(cancelBtn) cancelBtn.classList.remove('hidden'); 
                addForm.scrollIntoView({ behavior: 'smooth' }); titleInput.focus(); 
            } 
        }
    });
    
    // if(addFolderForm) addFolderForm.addEventListener('submit', handleAddFolder); // Removed
    if(folderFilterSelect) folderFilterSelect.addEventListener('change', renderFilteredPrompts);
    if(searchInput) searchInput.addEventListener('input', renderFilteredPrompts);
    
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            let reRenderPromptsFlag = false; let reRenderFoldersFlag = false;
            if (changes.prompts) { allPrompts = changes.prompts.newValue || []; reRenderPromptsFlag = true; }
            if (changes.folders) { allFolders = changes.folders.newValue || []; reRenderFoldersFlag = true; }
            if (reRenderFoldersFlag) renderFolders();
            if (reRenderPromptsFlag || reRenderFoldersFlag) renderFilteredPrompts();
        }
    });
    
    if(cancelBtn) cancelBtn.addEventListener('click', () => { closeForm(); });
    if(exportBtn) exportBtn.addEventListener('click', () => { /* ... как в прошлой версии ... */ });
    if(exportBtn) exportBtn.onclick = () => { if (allPrompts.length === 0) { alert("No prompts to export."); return; } const header = "id,createdAt,title,text,tags,folderId\n"; const rows = allPrompts.map(p => { const id = p.id; const createdAt = `"${p.createdAt}"`; const title = `"${(p.title || '').replace(/"/g, '""')}"`; const text = `"${(p.text || '').replace(/"/g, '""')}"`; const tags = `"${(p.tags || []).join(',').replace(/"/g, '""')}"`; const folderId = p.folderId === null || p.folderId === undefined ? "" : p.folderId; return `${id},${createdAt},${title},${text},${tags},${folderId}`; }).join("\n"); const csvContent = header + rows; const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `prompts_export_${new Date().toISOString().split('T')[0]}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
    if(importBtn) importBtn.addEventListener('click', () => { importFileInput.click(); });
    if(importFileInput) importFileInput.addEventListener('change', async (event) => { /* ... как в прошлой версии ... */ });
    if(importFileInput) importFileInput.onchange = async (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = async (e) => { const csvText = e.target.result; const importedPrompts = parseCSV(csvText); if (importedPrompts.length === 0 && csvText.trim().split(/\r\n|\n|\r/).length > 1) { alert("Could not parse prompts. Check CSV format & UTF-8 encoding."); event.target.value = null; return; } if (importedPrompts.length === 0) { alert("No prompts found to import, or file is empty (except header)."); event.target.value = null; return; } let newPromptsAddedCount = 0; const currentPromptIds = new Set(allPrompts.map(p => p.id)); const promptsToActuallyAdd = []; for (const importedPrompt of importedPrompts) { if (!currentPromptIds.has(importedPrompt.id)) { promptsToActuallyAdd.push(importedPrompt); newPromptsAddedCount++; } } if (newPromptsAddedCount > 0) { allPrompts = [...promptsToActuallyAdd, ...allPrompts]; await saveAllPrompts(allPrompts); alert(`${newPromptsAddedCount} new prompts imported successfully!`); } else { alert("No new prompts to import. All prompts from file might already exist."); } }; reader.readAsText(file, 'UTF-8'); } event.target.value = null; };

    // Developer button logic removed
    // if (devAddSubfolderBtn) { devAddSubfolderBtn.addEventListener('click', ...); }
    
    initialize();
});