// options/options.js
document.addEventListener('DOMContentLoaded', () => {
    // --- THEME MANAGEMENT ---
    function isThemeDarkOptions(themeInfo) { if (!themeInfo || !themeInfo.colors || !themeInfo.colors.toolbar_text) { return window.matchMedia('(prefers-color-scheme: dark)').matches; } const textColor = themeInfo.colors.toolbar_text; const rgbMatch = textColor.match(/\d+/g); if (rgbMatch && rgbMatch.length >= 3) { const rgb = rgbMatch.map(Number); const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000; return brightness > 128; } return window.matchMedia('(prefers-color-scheme: dark)').matches; }
    function applyThemeClassOptions(isDark) { if (isDark) { document.body.classList.add('dark-theme'); } else { document.body.classList.remove('dark-theme'); } }
    function loadAndApplyTheme() { browser.theme.getCurrent().then(themeInfo => applyThemeClassOptions(isThemeDarkOptions(themeInfo))).catch(e => { console.error("Error getting current theme for options page:", e); applyThemeClassOptions(window.matchMedia('(prefers-color-scheme: dark)').matches); }); }
    loadAndApplyTheme(); browser.theme.onUpdated.addListener(loadAndApplyTheme); window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { applyThemeClassOptions(e.matches); });

    // --- DOM ELEMENTS ---
    const folderTreeList = document.getElementById('folder-tree-list');
    const parentFolderSelectOptions = document.getElementById('parent-folder-select-options');
    const newFolderNameInputOptions = document.getElementById('new-folder-name-options');
    const addFolderBtnOptions = document.getElementById('add-folder-btn-options');
    const selectedFolderActionsDiv = document.querySelector('.selected-folder-actions');
    const currentSelectedFolderNameSpan = document.getElementById('current-selected-folder-name');
    const renameFolderInput = document.getElementById('rename-folder-input');
    const renameFolderBtn = document.getElementById('rename-folder-btn-options');
    const deleteFolderBtn = document.getElementById('delete-folder-btn-options');
    const exportFoldersBtn = document.getElementById('export-folders-btn');
    const importFoldersBtn = document.getElementById('import-folders-btn');
    const importFoldersFileInput = document.getElementById('import-folders-file-input');

    // --- STATE ---
    let allFolders = [];
    let allPrompts = [];
    let selectedFolderForActions = null;

    // --- HELPER FUNCTIONS ---
    function escapeHTML(str) { const p = document.createElement("p"); p.appendChild(document.createTextNode(str || "")); return p.innerHTML; }
    function getDescendantFolderIds(startFolderId, foldersArray) { const idsToProcess = [startFolderId]; const descendantIds = new Set([startFolderId]); let head = 0; while(head < idsToProcess.length) { const currentParentId = idsToProcess[head++]; foldersArray.forEach(folder => { if (folder.parentId === currentParentId) { if (!descendantIds.has(folder.id)) { descendantIds.add(folder.id); idsToProcess.push(folder.id); } } }); } return Array.from(descendantIds); }

    // --- FOLDER TREE & DROPDOWN RENDERING ---
    function buildFolderTreeHTML(parentId = null, depth = 0) {
        let html = '';
        const children = allFolders.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
        if (children.length > 0) {
            html += `<ul style="padding-left: ${depth === 0 ? 0 : '20px'};">`;
            children.forEach(folder => {
                const isSelected = selectedFolderForActions && selectedFolderForActions.id === folder.id;
                html += `<li data-id="${folder.id}" class="${isSelected ? 'selected' : ''}">${escapeHTML(folder.name)}`;
                html += buildFolderTreeHTML(folder.id, depth + 1);
                html += `</li>`;
            });
            html += `</ul>`;
        } return html;
    }
    function populateParentFolderSelect() {
        parentFolderSelectOptions.innerHTML = '<option value="null">-- Top Level Folder --</option>';
        function addOptionsRecursive(parentId = null, depth = 0) {
            const indent = (depth > 0 ? '—'.repeat(depth) + ' ' : '');
            allFolders.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name)).forEach(folder => { parentFolderSelectOptions.add(new Option(indent + escapeHTML(folder.name), folder.id)); addOptionsRecursive(folder.id, depth + 1); });
        } addOptionsRecursive(null, 0);
    }
    function renderFolderManagementArea() {
        if (folderTreeList) { folderTreeList.innerHTML = buildFolderTreeHTML() || '<p>No folders yet. Create one!</p>'; }
        populateParentFolderSelect();
        if (selectedFolderForActions && currentSelectedFolderNameSpan && renameFolderInput && selectedFolderActionsDiv) {
            currentSelectedFolderNameSpan.textContent = escapeHTML(selectedFolderForActions.name);
            renameFolderInput.value = selectedFolderForActions.name;
            selectedFolderActionsDiv.style.display = 'block';
        } else if (selectedFolderActionsDiv) {
            selectedFolderActionsDiv.style.display = 'none';
        }
    }

    // --- STORAGE FUNCTIONS ---
    async function saveDataToStorage() { try { await browser.storage.local.set({ folders: allFolders, prompts: allPrompts }); console.log("Folders and Prompts saved."); } catch (e) { console.error("Error saving data:", e); } }
    async function saveFoldersOnlyToStorage() { try { await browser.storage.local.set({ folders: allFolders }); console.log("Folders saved."); } catch (e) { console.error("Error saving folders:", e); } }

    // --- FOLDER ACTIONS ---
    if(addFolderBtnOptions) addFolderBtnOptions.addEventListener('click', async () => {
        const folderName = newFolderNameInputOptions.value.trim();
        const parentIdValue = parentFolderSelectOptions.value;
        const parentId = parentIdValue === "null" ? null : Number(parentIdValue);
        if (!folderName) { alert("Folder name cannot be empty."); return; }
        if (allFolders.some(f => f.name === folderName && f.parentId === parentId)) { alert(`A folder named "${folderName}" already exists here.`); return; }
        const newFolder = { id: Date.now(), name: folderName, parentId: parentId };
        allFolders.push(newFolder); await saveFoldersOnlyToStorage();
        newFolderNameInputOptions.value = ''; // Reset input
    });
    if(folderTreeList) folderTreeList.addEventListener('click', (e) => {
        const targetLi = e.target.closest('li'); if (!targetLi) return;
        const folderId = Number(targetLi.dataset.id);
        const clickedFolder = allFolders.find(f => f.id === folderId);
        if (selectedFolderForActions && selectedFolderForActions.id === folderId) { selectedFolderForActions = null; } 
        else { selectedFolderForActions = clickedFolder; }
        renderFolderManagementArea();
    });
    if(renameFolderBtn) renameFolderBtn.addEventListener('click', async () => {
        if (!selectedFolderForActions) { alert("No folder selected."); return; }
        const newName = renameFolderInput.value.trim();
        if (!newName) { alert("New folder name cannot be empty."); return; }
        if (allFolders.some(f => f.id !== selectedFolderForActions.id && f.parentId === selectedFolderForActions.parentId && f.name === newName)) {
            alert(`Another folder named "${newName}" already exists in this location.`); return;
        }
        const folderToUpdate = allFolders.find(f => f.id === selectedFolderForActions.id);
        if (folderToUpdate) {
            folderToUpdate.name = newName; await saveFoldersOnlyToStorage();
            selectedFolderForActions.name = newName; renderFolderManagementArea(); alert("Folder renamed.");
        }
    });
    if(deleteFolderBtn) deleteFolderBtn.addEventListener('click', async () => {
        if (!selectedFolderForActions) { alert("No folder selected."); return; }
        const folderToDelete = selectedFolderForActions;
        const confirmationMessage = `Delete "${escapeHTML(folderToDelete.name)}"? Subfolders will also be deleted. Prompts will be moved to Uncategorized.`;
        if (confirm(confirmationMessage)) {
            const folderIdsToDelete = getDescendantFolderIds(folderToDelete.id, allFolders);
            allPrompts = allPrompts.map(prompt => { if (prompt.folderId && folderIdsToDelete.includes(prompt.folderId)) { return { ...prompt, folderId: null }; } return prompt; });
            allFolders = allFolders.filter(f => !folderIdsToDelete.includes(f.id));
            await saveDataToStorage(); selectedFolderForActions = null; renderFolderManagementArea(); alert(`Folder "${escapeHTML(folderToDelete.name)}" deleted.`);
        }
    });

    // --- FOLDER EXPORT/IMPORT ---
    if (exportFoldersBtn) exportFoldersBtn.addEventListener('click', () => { if (allFolders.length === 0) { alert("No folders to export."); return; } const jsonData = JSON.stringify(allFolders, null, 2); const blob = new Blob([jsonData], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'prompts_saver_folders_export.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); });
    if (importFoldersBtn) importFoldersBtn.addEventListener('click', () => { importFoldersFileInput.click(); });
    if (importFoldersFileInput) importFoldersFileInput.addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = async (e) => { try { const importedFolders = JSON.parse(e.target.result); if (!Array.isArray(importedFolders)) { throw new Error("Not an array."); } if (importedFolders.length > 0 && (importedFolders[0].id === undefined || importedFolders[0].name === undefined)) { throw new Error("Incorrect structure."); } if (confirm("OVERWRITE current folder structure?")) { allFolders = importedFolders; await saveFoldersOnlyToStorage(); alert("Folder structure imported."); } } catch (err) { console.error("Import error:", err); alert("Import failed. Check JSON.\nError: " + err.message); } }; reader.readAsText(file); } event.target.value = null; });

    // --- INITIALIZATION ---
    async function initializeOptionsPage() {
        try {
            const data = await browser.storage.local.get(["folders", "prompts"]);
            allFolders = data.folders || [];
            allPrompts = data.prompts || [];
        } catch (e) { console.error("Error loading data in Options:", e); allFolders = []; allPrompts = []; }
        renderFolderManagementArea();
    }
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            let needsUIRefresh = false;
            if (changes.folders) { allFolders = changes.folders.newValue || []; needsUIRefresh = true; }
            if (changes.prompts) { allPrompts = changes.prompts.newValue || []; } // Keep prompts updated
            if (needsUIRefresh) { renderFolderManagementArea(); }
        }
    });
    initializeOptionsPage();
});