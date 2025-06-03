# API Documentation

This document provides detailed technical information about the Prompts Saver extension's internal APIs and data structures.

## Storage API

### Data Models

#### Prompt Object
```typescript
interface Prompt {
  id: number;           // Unique identifier (timestamp-based)
  title: string;        // Prompt title/name
  text: string;         // Main prompt content
  tags: string[];       // Array of tag strings
  folderId: number | null; // Reference to parent folder (null = root)
  createdAt: string;    // ISO 8601 timestamp
}
```

#### Folder Object
```typescript
interface Folder {
  id: number;           // Unique identifier (timestamp-based)
  name: string;         // Folder display name
  parentId: number | null; // Reference to parent folder (null = root)
}
```

### Storage Keys

#### `prompts`
- **Type**: `Prompt[]`
- **Description**: Array of all saved prompts
- **Default**: `[]`

#### `folders`
- **Type**: `Folder[]`
- **Description**: Array of all folder structures
- **Default**: `[]`

### Storage Operations

#### Save Data
```javascript
// Save both prompts and folders
await browser.storage.local.set({
  prompts: allPrompts,
  folders: allFolders
});

// Save only folders
await browser.storage.local.set({
  folders: allFolders
});
```

#### Load Data
```javascript
const data = await browser.storage.local.get(["prompts", "folders"]);
const prompts = data.prompts || [];
const folders = data.folders || [];
```

#### Listen for Changes
```javascript
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.prompts) {
      // Handle prompts update
      const newPrompts = changes.prompts.newValue || [];
    }
    if (changes.folders) {
      // Handle folders update
      const newFolders = changes.folders.newValue || [];
    }
  }
});
```

## Core Functions

### Prompt Management

#### `createPrompt(promptData)`
Creates a new prompt with validation.

**Parameters:**
- `promptData.title` (string): Prompt title
- `promptData.text` (string): Prompt content
- `promptData.tags` (string[]): Array of tags
- `promptData.folderId` (number|null): Parent folder ID

**Returns:** `Prompt` object with generated ID and timestamp

**Example:**
```javascript
const newPrompt = createPrompt({
  title: "Creative Writing Prompt",
  text: "Write a story about...",
  tags: ["creative", "writing"],
  folderId: 123
});
```

#### `updatePrompt(id, updates)`
Updates an existing prompt.

**Parameters:**
- `id` (number): Prompt ID to update
- `updates` (Partial<Prompt>): Fields to update

**Returns:** `boolean` - Success status

#### `deletePrompt(id)`
Removes a prompt from storage.

**Parameters:**
- `id` (number): Prompt ID to delete

**Returns:** `boolean` - Success status

### Folder Management

#### `createFolder(name, parentId)`
Creates a new folder in the hierarchy.

**Parameters:**
- `name` (string): Folder name
- `parentId` (number|null): Parent folder ID

**Returns:** `Folder` object with generated ID

**Validation:**
- Name cannot be empty
- No duplicate names in the same parent folder
- Parent must exist if specified

#### `getFolderPath(folderId)`
Gets the full path string for a folder.

**Parameters:**
- `folderId` (number): Target folder ID

**Returns:** `string` - Path like "Parent/Child/Target"

**Example:**
```javascript
const path = getFolderPath(456); // "Work/AI Prompts/Marketing"
```

#### `getDescendantFolderIds(folderId, includeSelf)`
Gets all descendant folder IDs for deletion/moving operations.

**Parameters:**
- `folderId` (number): Starting folder ID
- `includeSelf` (boolean): Whether to include the folder itself

**Returns:** `number[]` - Array of folder IDs

#### `buildFolderTree(parentId, depth)`
Recursively builds HTML tree structure for folder display.

**Parameters:**
- `parentId` (number|null): Parent folder to start from
- `depth` (number): Current nesting depth

**Returns:** `string` - HTML string for folder tree

### Search and Filtering

#### `searchPrompts(query, folderId)`
Searches prompts by title and content.

**Parameters:**
- `query` (string): Search term
- `folderId` (number|null): Folder filter (null = all folders)

**Returns:** `Prompt[]` - Filtered prompt array

**Search Logic:**
- Case-insensitive search
- Searches in title and text content
- Respects folder filtering
- Real-time filtering as user types

#### `filterByTags(prompts, tags)`
Filters prompts by specified tags.

**Parameters:**
- `prompts` (Prompt[]): Source prompt array
- `tags` (string[]): Tags to filter by

**Returns:** `Prompt[]` - Filtered results

## UI Components

### Form Management

#### `resetForm()`
Resets the add/edit form to default state.

**Actions:**
- Clears all form fields
- Resets form title to "Add New Prompt"
- Hides cancel button
- Clears editing state

#### `populateForm(prompt)`
Fills form with existing prompt data for editing.

**Parameters:**
- `prompt` (Prompt): Prompt object to edit

**Actions:**
- Sets form fields with prompt data
- Changes form title to "Edit Prompt"
- Shows cancel button
- Sets editing state

#### `validateForm(formData)`
Validates form input before saving.

**Parameters:**
- `formData` (object): Form field values

**Returns:** `{valid: boolean, errors: string[]}` - Validation result

**Validation Rules:**
- Title is required and non-empty
- Text content is required
- Tags are properly formatted (comma-separated)
- Folder selection is valid

### Theme Management

#### `isThemeDark(themeInfo)`
Determines if current Firefox theme is dark.

**Parameters:**
- `themeInfo` (object): Firefox theme information

**Returns:** `boolean` - True if dark theme

**Detection Logic:**
1. Checks Firefox theme colors
2. Analyzes toolbar text brightness
3. Falls back to system preference
4. Applies appropriate CSS classes

#### `applyThemeClass(isDark)`
Applies theme-specific CSS classes.

**Parameters:**
- `isDark` (boolean): Whether to apply dark theme

**CSS Variables Updated:**
- `--primary-bg`: Main background color
- `--secondary-bg`: Secondary background color
- `--text-color`: Primary text color
- `--text-secondary-color`: Secondary text color
- `--border-color`: Border and separator color
- Button and component color schemes

### Event Handlers

#### Form Events
```javascript
// Form submission
addPromptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Validation and save logic
});

// Form toggle
toggleFormBtn.addEventListener('click', () => {
  // Show/hide form logic
});
```

#### Prompt List Events
```javascript
// Edit prompt
editBtn.addEventListener('click', () => {
  populateForm(prompt);
  // Switch to edit mode
});

// Delete prompt
deleteBtn.addEventListener('click', async () => {
  if (confirm('Delete this prompt?')) {
    await deletePrompt(prompt.id);
    renderPromptsList();
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(prompt.text);
  // Show success feedback
});
```

## Import/Export

### JSON Data Format

#### Complete Export Structure
```json
{
  "prompts": [
    {
      "id": 123,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "title": "Sample Prompt",
      "text": "Prompt content",
      "tags": ["tag1", "tag2"],
      "folderId": 456
    }
  ],
  "folders": [
    {
      "id": 456,
      "name": "Work Prompts",
      "parentId": null
    }
  ]
}
```

#### Import Validation
- Required root keys: `prompts`, `folders`
- Prompts array must contain valid prompt objects
- Folders array must contain valid folder objects
- Invalid data entries are skipped with warnings
- Missing folder references default prompts to root

#### JSON Processing Logic
```javascript
const processImport = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate structure
    if (!data.prompts || !Array.isArray(data.prompts)) {
      throw new Error('Invalid prompts data');
    }
    if (!data.folders || !Array.isArray(data.folders)) {
      throw new Error('Invalid folders data');
    }
    
    // Process and validate each entry
    const validPrompts = data.prompts.filter(validatePrompt);
    const validFolders = data.folders.filter(validateFolder);
    
    return { prompts: validPrompts, folders: validFolders };
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};
```

### JSON Export/Import API
```javascript
// Export all data
const exportAllData = async () => {
  const storage = await browser.storage.local.get(['prompts', 'folders']);
  const data = {
    prompts: storage.prompts || [],
    folders: storage.folders || []
  };
  return JSON.stringify(data, null, 2);
};

// Import all data (overwrites existing)
const importAllData = async (jsonString) => {
  const data = processImport(jsonString);
  await browser.storage.local.set({
    prompts: data.prompts,
    folders: data.folders
  });
};
```

## Error Handling

### Storage Errors
```javascript
try {
  await browser.storage.local.set(data);
} catch (error) {
  console.error("Storage error:", error);
  // Show user-friendly error message
  alert("Failed to save data. Please try again.");
}
```

### Import Errors
```javascript
try {
  const importedData = JSON.parse(fileContent);
  validateImportData(importedData);
} catch (error) {
  console.error("Import error:", error);
  alert(`Import failed: ${error.message}`);
}
```

### Form Validation Errors
```javascript
const validation = validateForm(formData);
if (!validation.valid) {
  // Display validation errors
  showValidationErrors(validation.errors);
  return;
}
```

## Browser Compatibility

### WebExtensions APIs Used
- `browser.storage.local`: Data persistence
- `browser.theme.getCurrent()`: Theme detection
- `browser.theme.onUpdated`: Theme change events
- `browser.sidebarAction`: Sidebar management

### Modern JavaScript Features
- `async/await`: Asynchronous operations
- Arrow functions: Concise function syntax
- Template literals: String interpolation
- Destructuring: Object/array unpacking
- Spread operator: Array/object manipulation

### CSS Features
- CSS Custom Properties: Theme variables
- Flexbox: Layout management
- CSS Grid: Complex layouts
- CSS Transitions: Smooth animations

## Performance Considerations

### Data Management
- Lazy loading of prompt content
- Efficient search algorithms
- Minimal DOM updates
- Event delegation for dynamic content

### Memory Usage
- Garbage collection friendly
- Avoid memory leaks in event listeners
- Efficient data structures
- Regular cleanup of unused references

### Storage Optimization
- Batch storage operations
- Minimize storage calls
- Compress large datasets
- Regular cleanup of orphaned data
