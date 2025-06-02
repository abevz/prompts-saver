// Unique ID for our context menu item
const CONTEXT_MENU_ID = "SAVE_PROMPT_AS_NOTE"; // Renamed for clarity, was SAVE_PROMPT

/**
 * Function to create the context menu item.
 * It will be called when the add-on is installed.
 */
function setupContextMenu() {
  browser.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save selected text as Prompt", // Translated
    contexts: ["selection"], // Show only when text is selected
  });
}

// When the add-on is installed, call the menu creation function.
// onInstalled fires once upon installation or update.
browser.runtime.onInstalled.addListener(() => {
  console.log("Prompts Saver: Add-on installed. Creating context menu."); // Translated
  setupContextMenu();
});

// Listener for clicks on context menu items.
browser.contextMenus.onClicked.addListener((info, tab) => {
  // Check if the click was on our menu item
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const selectedText = info.selectionText;
    if (selectedText) {
      savePrompt(selectedText);
    }
  }
});

/**
 * Generates a title from the first few words of the text.
 * @param {string} text
 * @returns {string}
 */
function generateTitleFromText(text) {
    const words = text.trim().split(/\s+/);
    // Take the first 5 words and add ellipsis if more words exist
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
}

/**
 * Saves a new prompt to browser.storage.local.
 * @param {string} text - The text of the prompt to save.
 */
async function savePrompt(text) {
  try {
    // 1. Get current data from storage under the 'prompts' key
    const data = await browser.storage.local.get("prompts");
    // 2. If no data, create an empty array. Otherwise, use the existing one.
    const prompts = data.prompts || [];
    // 3. Create a new prompt object with a unique ID and text
    const newPrompt = {
      id: Date.now(), // Use timestamp as a simple unique ID
      title: generateTitleFromText(text), // Generate title
      text: text,
      tags: [], // Empty array for tags
      folderId: null, // Default to no folder
      createdAt: new Date().toISOString() // Add creation date
    };
    // 4. Add the new prompt to the beginning of the array
    prompts.unshift(newPrompt);
    // 5. Save the updated array back to storage
    await browser.storage.local.set({ prompts: prompts });
    console.log("Prompts Saver: Prompt saved successfully!"); // Translated
  } catch (error) {
    console.error("Prompts Saver: Error saving prompt:", error); // Translated
  }
}