// sidebar/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const addForm = document.getElementById('add-prompt-form');
    const titleInput = document.getElementById('prompt-title-input');
    const textTextarea = document.getElementById('prompt-text-textarea');
    const tagsInput = document.getElementById('prompt-tags-input');
    const promptsContainer = document.getElementById('prompts-list-container');
    const searchInput = document.getElementById('search-input');
    // CSV Export/Import buttons are removed from sidebar
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formTitleText = document.getElementById('form-title-text'); // Assuming this ID is on the H2 inside the form
    const folderFilterSelect = document.getElementById('folder-filter-select');
    const promptFolderSelect = document.getElementById('prompt-folder-select');
    const toggleTagFilterBtn = document.getElementById('toggle-tag-filter-btn');
    const tagFilterContainer = document.getElementById('tag-filter-container');
    const tagFilterList = document.getElementById('tag-filter-list');
    const clearTagFilterBtn = document.getElementById('clear-tag-filter-btn');
    const tagSearchInput = document.getElementById('tag-search-input');

    // --- STATE VARIABLES ---
    let allPrompts = [];
    let allFolders = [];
    let editingPromptId = null;
    let uniqueTags = [];
    let selectedFilterTags = [];

    // --- THEME MANAGEMENT ---
    function applyThemeClass(isDark) { if (isDark) { document.body.classList.add('dark-theme'); } else { document.body.classList.remove('dark-theme'); } }
    function applyThemeBasedOnColors(themeInfo) { if (themeInfo && themeInfo.colors && themeInfo.colors.toolbar_text) { const textColor = themeInfo.colors.toolbar_text; const rgbMatch = textColor.match(/\d+/g); if (rgbMatch && rgbMatch.length >= 3) { const rgb = rgbMatch.map(Number); const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000; applyThemeClass(brightness > 128); } else { applyThemeClass(true); } } else { applyThemeClass(true); } }
    try { browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => { console.error("Error getting theme:", e); applyThemeClass(true); }); browser.theme.onUpdated.addListener(() => { browser.theme.getCurrent().then(applyThemeBasedOnColors).catch(e => { console.error("Error updating theme:", e); applyThemeClass(true); }); });
    } catch (e) { console.error("Failed to initialize theme API:", e); applyThemeClass(true); }

    // --- TAG COLOR GENERATION ---
    function getTagColor(tagStr) { let hash = 5381; for (let i = 0; i < tagStr.length; i++) { const char = tagStr.charCodeAt(i); hash = ((hash << 5) + hash) + char; } const hue = Math.abs(hash) % 360; const isDark = document.body.classList.contains('dark-theme'); if (isDark) { return `hsl(${hue}, 80%, 60%)`; } else { return `hsl(${hue}, 70%, 78%)`; } }

    // --- COLLAPSIBLE FORM LOGIC ---
    function openForm() { addForm.classList.remove('hidden'); if (toggleFormBtn) { toggleFormBtn.classList.add('is-open'); if (!editingPromptId) { toggleFormBtn.textContent = 'Collapse Form'; } } }
    function closeForm() { addForm.classList.add('hidden'); if (toggleFormBtn) { toggleFormBtn.classList.remove('is-open'); toggleFormBtn.textContent = 'Add New Prompt'; } resetForm(); }
    
    // --- FOLDER LOGIC ---
    function populateFolderOptionsRecursive(selectElement, parentId, depth) { const indent = (depth > 0 ? '—'.repeat(depth) + ' ' : ''); allFolders.filter(folder => folder.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name)).forEach(folder => { selectElement.add(new Option(indent + escapeHTML(folder.name), folder.id)); populateFolderOptionsRecursive(selectElement, folder.id, depth + 1); }); }
    function renderFolders() { const currentFilterVal = folderFilterSelect.value; const currentPromptFolderVal = promptFolderSelect.value; folderFilterSelect.innerHTML = ''; promptFolderSelect.innerHTML = ''; folderFilterSelect.add(new Option("All Folders", "all")); folderFilterSelect.add(new Option("Uncategorized", "null")); promptFolderSelect.add(new Option("Uncategorized (Top Level)", "null")); populateFolderOptionsRecursive(folderFilterSelect, null, 0); populateFolderOptionsRecursive(promptFolderSelect, null, 0); try { folderFilterSelect.value = currentFilterVal || "all"; } catch(e){ folderFilterSelect.value = "all"; } try { promptFolderSelect.value = currentPromptFolderVal || "null"; } catch(e){ promptFolderSelect.value = "null";} }
    function getFolderPath(folderId, foldersArray) { if (folderId === null || folderId === undefined) { return ""; } let pathSegments = []; let currentFolderId = folderId; const foldersById = foldersArray.reduce((acc, folder) => { acc[folder.id] = folder; return acc; }, {}); let safetyCounter = 0; while (currentFolderId !== null && foldersById[currentFolderId] && safetyCounter < 10) { const folder = foldersById[currentFolderId]; pathSegments.unshift(escapeHTML(folder.name)); currentFolderId = folder.parentId; safetyCounter++; } return pathSegments.join(' → '); }
    function getDescendantFolderIds(parentFolderId, foldersArray) { let ids = [parentFolderId]; let children = foldersArray.filter(f => f.parentId === parentFolderId); while (children.length > 0) { let nextChildren = []; for (const child of children) { ids.push(child.id); nextChildren.push(...foldersArray.filter(f => f.parentId === child.id)); } children = nextChildren; } return ids.map(id => id === null ? "null" : String(id)); }

    // --- TAG FILTER LOGIC ---
    function updateUniqueTags() { const tagSet = new Set(); allPrompts.forEach(prompt => { if (prompt.tags && prompt.tags.length > 0) { prompt.tags.forEach(tag => tagSet.add(tag)); } }); uniqueTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b)); }
    
    function renderTagFilterDropdown() {
        if (!tagFilterList || !tagSearchInput) return; 
        
        const currentSearchTerm = tagSearchInput.value.toLowerCase();
        const filteredUniqueTags = uniqueTags.filter(tag => tag.toLowerCase().includes(currentSearchTerm));

        tagFilterList.innerHTML = '';
        if (filteredUniqueTags.length === 0) {
            tagFilterList.innerHTML = `<p style="font-size:0.9em; color:var(--text-secondary-color);">${currentSearchTerm ? 'No tags match search.' : 'No tags available.'}</p>`;
            return;
        }
        filteredUniqueTags.forEach(tag => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.checked = selectedFilterTags.includes(tag);
            checkbox.addEventListener('change', handleTagFilterChange);
            
            label.appendChild(checkbox);

            // --- Styled tag element ---
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag-item'; // Use existing class
            tagSpan.style.backgroundColor = getTagColor(tag); // Dynamic background
            tagSpan.textContent = escapeHTML(tag);
            // Additional styles for tag in filter list (can also be in CSS)
            tagSpan.style.marginLeft = '5px'; 
            tagSpan.style.padding = '2px 6px'; // Slightly smaller than in prompt
            tagSpan.style.fontSize = '0.9em';  // Slightly smaller
            tagSpan.style.borderRadius = '10px'; // Like regular tags
            // --- End of styled tag ---
            
            label.appendChild(tagSpan);
            tagFilterList.appendChild(label);
        });
    }
    function handleTagFilterChange(event) { const tagName = event.target.value; if (event.target.checked) { if (!selectedFilterTags.includes(tagName)) { selectedFilterTags.push(tagName); } } else { selectedFilterTags = selectedFilterTags.filter(t => t !== tagName); } renderFilteredPrompts(); }

    // --- PROMPT RENDERING AND DATA LOGIC ---
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
            textEl.textContent = prompt.text;
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

            const footerDiv = document.createElement('div'); // Create footerDiv
            footerDiv.className = 'prompt-item-footer';

            const pathEl = document.createElement('div'); // Always create pathEl
            pathEl.className = 'prompt-folder-path';
            if (prompt.folderId !== null && prompt.folderId !== undefined) {
                const path = getFolderPath(prompt.folderId, allFolders);
                if (path) {
                    pathEl.textContent = path;
                }
            }
            footerDiv.appendChild(pathEl); // Add pathEl (empty or with path) to footer
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'prompt-actions';
            actionsDiv.innerHTML = `
                <button class="copy-btn icon-btn" title="Copy Text"><svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg></button>
                <button class="edit-btn icon-btn" title="Edit Prompt"><svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg></button>
                <button class="delete-btn icon-btn" title="Delete Prompt"><svg viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="url(#sharedIconGradient)" filter="url(#sharedIconDropShadow)"/></svg></button>
            `;
            footerDiv.appendChild(actionsDiv); // Add actionsDiv to footer

            promptElement.appendChild(footerDiv); // Add footerDiv to promptElement
            
            promptsContainer.appendChild(promptElement);
        });
    }
    
    function renderFilteredPrompts() { 
        const selectedFolderValue = folderFilterSelect.value; const mainSearchTerm = searchInput.value.toLowerCase(); let promptsToDisplay = allPrompts;
        if (selectedFolderValue === "null") { promptsToDisplay = promptsToDisplay.filter(p => p.folderId === null || p.folderId === undefined); }
        else if (selectedFolderValue !== "all") { const folderIdsToFilterBy = getDescendantFolderIds(Number(selectedFolderValue), allFolders); promptsToDisplay = promptsToDisplay.filter(p => p.folderId && folderIdsToFilterBy.includes(String(p.folderId))); }
        if (mainSearchTerm) { promptsToDisplay = promptsToDisplay.filter(p => { const titleMatch = p.title?.toLowerCase().includes(mainSearchTerm); const textMatch = p.text?.toLowerCase().includes(mainSearchTerm); return titleMatch || textMatch; }); }
        if (selectedFilterTags.length > 0) { promptsToDisplay = promptsToDisplay.filter(prompt => { if (!prompt.tags || prompt.tags.length === 0) return false; return selectedFilterTags.every(filterTag => prompt.tags.includes(filterTag)); }); }
        renderPrompts(promptsToDisplay);
    }
    async function saveAllPrompts(prompts) { try { await browser.storage.local.set({ prompts }); } catch (error) { console.error("Error saving prompts:", error); } }
    function resetForm() { 
        addForm.reset(); editingPromptId = null; 
        if(toggleFormBtn) toggleFormBtn.textContent = 'Add New Prompt'; 
        if (formTitleText) formTitleText.textContent = "Add New Prompt"; 
        if(saveBtn) saveBtn.textContent = "Save"; 
        if(cancelBtn) cancelBtn.classList.add('hidden');
    }
    
    // --- INITIALIZATION ---
    async function initialize() {
        try {
            const data = await browser.storage.local.get(["prompts", "folders"]);
            allPrompts = data.prompts || [];
            allFolders = data.folders || [];
        } catch (e) { console.error("[Sidebar] Error LOADING from storage during initialize:", e); allPrompts = []; allFolders = []; }
        updateUniqueTags(); 
        renderFolders();
        renderTagFilterDropdown(); 
        renderFilteredPrompts();
        closeForm();
    }

    // --- EVENT LISTENERS ---
    if(toggleFormBtn) toggleFormBtn.addEventListener('click', () => { const isFormHidden = addForm.classList.contains('hidden'); if(!isFormHidden) { closeForm(); } else { openForm(); if (!tagFilterContainer.classList.contains('hidden')) tagFilterContainer.classList.add('hidden'); } });
    if(addForm) addForm.addEventListener('submit', async (e) => { e.preventDefault(); const title = titleInput.value.trim(); const text = textTextarea.value.trim(); const tags = tagsInput.value.trim().split(',').map(tag => tag.trim()).filter(Boolean); const selectedFolderIdValue = promptFolderSelect.value; const folderId = selectedFolderIdValue === "null" ? null : Number(selectedFolderIdValue); if (!title || !text) return; if (editingPromptId) { const promptToUpdate = allPrompts.find(p => p.id === editingPromptId); if (promptToUpdate) { promptToUpdate.title = title; promptToUpdate.text = text; promptToUpdate.tags = tags; promptToUpdate.folderId = folderId; } } else { const newPrompt = { id: Date.now(), title, text, tags, folderId, createdAt: new Date().toISOString() }; allPrompts = [newPrompt, ...allPrompts]; } await saveAllPrompts(allPrompts); updateUniqueTags(); renderTagFilterDropdown(); closeForm(); });
    if(promptsContainer) promptsContainer.addEventListener('click', (e) => { const targetButton = e.target.closest('button.icon-btn'); if (!targetButton) return; const promptItem = targetButton.closest('.prompt-item'); if (!promptItem) return; const promptId = Number(promptItem.dataset.promptId); if (targetButton.classList.contains('copy-btn')) { const promptToCopy = allPrompts.find(p => p.id === promptId); if(promptToCopy && typeof promptToCopy.text === 'string') { navigator.clipboard.writeText(promptToCopy.text).then(() => { const originalContent = targetButton.innerHTML; targetButton.textContent = 'Copied!'; targetButton.disabled = true; setTimeout(() => { targetButton.innerHTML = originalContent; targetButton.disabled = false; }, 1500); }).catch(err => { console.error('Failed to copy text to clipboard:', err); alert('Error: Could not copy text. See console for details.'); }); } else { console.error("Cannot copy: Prompt text is missing or not a string.", promptToCopy); alert("Cannot copy: Prompt content is invalid."); } } else if (targetButton.classList.contains('delete-btn')) { 
            const promptToDelete = allPrompts.find(p => p.id === promptId);
            if (promptToDelete) {
                const promptTitle = promptToDelete.title || '(Untitled)';
                const confirmationMessage = `Are you sure you want to delete the prompt titled "${promptTitle}"?`;
                if (confirm(confirmationMessage)) {
                    allPrompts = allPrompts.filter(p => p.id !== promptId); 
                    saveAllPrompts(allPrompts); 
                    updateUniqueTags(); 
                    renderTagFilterDropdown();
                    // If the deleted prompt was being edited, reset the form
                    if (editingPromptId === promptId) {
                        closeForm(); // This will also call resetForm
                    }
                }
            } else {
                console.error("Prompt to delete not found with ID:", promptId);
                // Could add alert if prompt not found, though this is unlikely
            }
        } else if (targetButton.classList.contains('edit-btn')) { const promptToEdit = allPrompts.find(p => p.id === promptId); if (promptToEdit) { openForm(); editingPromptId = promptId; titleInput.value = promptToEdit.title; textTextarea.value = promptToEdit.text; tagsInput.value = (promptToEdit.tags || []).join(', '); promptFolderSelect.value = promptToEdit.folderId === null || promptToEdit.folderId === undefined ? "null" : promptToEdit.folderId;            if(toggleFormBtn) toggleFormBtn.textContent = `Editing: ${promptToEdit.title.substring(0, 20)}...`;if (formTitleText) formTitleText.textContent = "Edit Prompt"; if(saveBtn) saveBtn.textContent = "Update"; if(cancelBtn) cancelBtn.classList.remove('hidden'); addForm.scrollIntoView({ behavior: 'smooth' }); titleInput.focus(); } } });

    if(folderFilterSelect) folderFilterSelect.addEventListener('change', renderFilteredPrompts);
    if(searchInput) searchInput.addEventListener('input', renderFilteredPrompts);
    browser.storage.onChanged.addListener((changes, area) => { if (area === 'local') { let reRenderPromptsFlag = false; let reRenderFoldersFlag = false; if (changes.prompts) { allPrompts = changes.prompts.newValue || []; updateUniqueTags(); renderTagFilterDropdown(); reRenderPromptsFlag = true; } if (changes.folders) { allFolders = changes.folders.newValue || []; reRenderFoldersFlag = true; } if (reRenderFoldersFlag) renderFolders(); if (reRenderPromptsFlag || reRenderFoldersFlag) renderFilteredPrompts(); } });
    if(cancelBtn) cancelBtn.addEventListener('click', () => { closeForm(); });
    // CSV Export/Import logic has been removed.
    if (toggleTagFilterBtn) { toggleTagFilterBtn.addEventListener('click', () => { const isFormOpen = !addForm.classList.contains('hidden'); if(isFormOpen) { closeForm(); } tagFilterContainer.classList.toggle('hidden'); if (!tagFilterContainer.classList.contains('hidden') && tagSearchInput) { tagSearchInput.value = ''; renderTagFilterDropdown(); tagSearchInput.focus(); } }); }
    if (clearTagFilterBtn) { clearTagFilterBtn.addEventListener('click', () => { selectedFilterTags = []; if (tagSearchInput) tagSearchInput.value = ""; renderTagFilterDropdown(); renderFilteredPrompts(); }); }
    if (tagSearchInput) { tagSearchInput.addEventListener('input', renderTagFilterDropdown); }
    
    initialize();
});