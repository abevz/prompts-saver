const CONTEXT_MENU_ID = "SAVE_PROMPT_AS_NOTE";

function setupContextMenu() {
  browser.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save selected text as Prompt",
    contexts: ["selection"],
  });
}

browser.runtime.onInstalled.addListener(() => {
  console.log("Prompts Saver: Add-on installed. Creating context menu.");
  setupContextMenu();
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;
    if (selectedText) {
      savePrompt(selectedText);
    }
  }
});

/**
 * Generates a title from the first few words of the text.
 */
function generateTitleFromText(text) {
    const words = text.trim().split(/\s+/);
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
}

/**
 * Saves a new prompt to browser.storage.local.
 */
async function savePrompt(text) {
  try {
    const data = await browser.storage.local.get("prompts");
    const prompts = data.prompts || [];
    const newPrompt = {
      id: Date.now(),
      title: generateTitleFromText(text),
      text: text,
      tags: [],
      folderId: null,
      createdAt: new Date().toISOString()
    };
    prompts.unshift(newPrompt);
    await browser.storage.local.set({ prompts: prompts });
    console.log("Prompts Saver: Prompt saved successfully!");
  } catch (error) {
    console.error("Prompts Saver: Error saving prompt:", error);
  }
}