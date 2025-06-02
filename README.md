# Prompts Saver - Firefox Extension

A powerful Firefox extension for organizing and managing AI prompts with hierarchical folder structure, tagging, and import/export capabilities.

## Features

### Core Functionality
- **Save Prompts**: Store and organize your AI prompts with titles and descriptions
- **Hierarchical Folders**: Create nested folder structures to categorize prompts
- **Tagging System**: Add multiple tags to prompts for enhanced organization
- **Search & Filter**: Quickly find prompts using search and folder filtering
- **Import/Export**: Backup and share prompts via CSV format
- **Theme Support**: Automatic dark/light theme detection

### User Interface
- **Sidebar Panel**: Main interface for browsing and managing prompts
- **Options Page**: Advanced folder management and bulk operations
- **Collapsible Forms**: Clean, space-efficient interface design
- **Responsive Design**: Works across different screen sizes

## Installation

### From Firefox Add-ons Store
*Coming soon - extension pending review*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension folder
6. The extension will be loaded and available in your toolbar

## Usage

### Getting Started
1. Click the Prompts Saver icon in your Firefox toolbar
2. The sidebar will open with the main interface
3. Click "Add New Prompt" to create your first prompt
4. Fill in the title, prompt text, tags, and select a folder
5. Click "Save" to store your prompt

### Managing Prompts
- **View Prompts**: All prompts are displayed in the main list
- **Edit Prompts**: Click the edit icon (pencil) on any prompt
- **Delete Prompts**: Click the delete icon (trash) to remove prompts
- **Copy Prompts**: Click the copy icon to copy prompt text to clipboard
- **Search**: Use the search bar to find prompts by title or content
- **Filter by Folder**: Select a folder from the dropdown to view only those prompts

### Folder Management
1. **Creating Folders**: 
   - In the sidebar: Use the folder creation form
   - In options: Go to the Options page for advanced folder management

2. **Folder Hierarchy**: Create nested folder structures for better organization

3. **Moving Prompts**: When editing a prompt, select a different folder from the dropdown

### Import/Export
- **Export**: Click the export button to download all prompts as CSV
- **Import**: Click the import button to upload a CSV file with prompts
- **Folder Export/Import**: Use the Options page for folder structure backup

## File Structure

```
prompts-saver/
├── manifest.json              # Extension manifest
├── background/
│   └── background.js          # Background script for extension lifecycle
├── sidebar/
│   ├── sidebar.html           # Main interface HTML
│   ├── sidebar.css            # Styling for sidebar
│   └── sidebar.js             # Main application logic
├── options/
│   ├── options.html           # Options page HTML
│   ├── options.css            # Options page styling
│   └── options.js             # Folder management logic
└── icons/
    ├── prompts-saver-48.png   # Extension icon (48x48)
    ├── prompts-saver-96.png   # Extension icon (96x96)
    ├── download_arrow.svg     # Export icon
    └── upload_arrow.svg       # Import icon
```

## Technical Details

### Storage
- Uses Firefox's `browser.storage.local` API for data persistence
- Data is stored locally on the user's device
- No external servers or cloud storage required

### Data Format
Prompts are stored with the following structure:
```javascript
{
  id: number,           // Unique identifier
  title: string,        // Prompt title
  text: string,         // Prompt content
  tags: string[],       // Array of tags
  folderId: number|null,// Parent folder ID
  createdAt: string     // ISO timestamp
}
```

Folders use this structure:
```javascript
{
  id: number,           // Unique identifier
  name: string,         // Folder name
  parentId: number|null // Parent folder ID (null for root)
}
```

### Browser Compatibility
- **Minimum Firefox Version**: 109 (for Manifest V3 support)
- **Permissions Required**:
  - `storage`: For saving prompts and folders
  - `theme`: For automatic theme detection
  - `sidebarAction`: For sidebar panel functionality

## Development

### Prerequisites
- Firefox Developer Edition (recommended)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of WebExtensions API

### Setup Development Environment
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd prompts-saver
   ```

2. Load in Firefox:
   - Open `about:debugging`
   - Click "Load Temporary Add-on"
   - Select `manifest.json`

3. Development workflow:
   - Make changes to source files
   - Click "Reload" in `about:debugging` to test changes
   - Use Firefox Developer Tools for debugging

### Code Structure

#### Background Script (`background/background.js`)
- Handles extension lifecycle events
- Manages toolbar icon and sidebar state
- Minimal implementation for sidebar-focused extension

#### Sidebar Interface (`sidebar/`)
- **HTML**: Clean, semantic structure with form and list elements
- **CSS**: CSS custom properties for theming, flexbox layouts
- **JavaScript**: Modular functions for CRUD operations, UI updates, and data management

#### Options Page (`options/`)
- **HTML**: Advanced folder management interface
- **CSS**: Consistent styling with sidebar
- **JavaScript**: Folder tree rendering, drag-and-drop operations

### Adding New Features

1. **New Prompt Fields**: 
   - Update the data structure in storage
   - Modify the form HTML and validation
   - Update import/export functionality

2. **Additional Storage Options**:
   - Implement in `background.js`
   - Add UI controls in options page
   - Update manifest permissions if needed

3. **Enhanced Search**:
   - Extend search logic in `sidebar.js`
   - Add filters for tags, dates, folders
   - Consider adding search operators

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes following the existing code style
4. Test thoroughly in Firefox
5. Submit a pull request with detailed description

### Code Style Guidelines
- Use consistent indentation (4 spaces)
- Add comments for complex logic
- Use descriptive variable and function names
- Follow existing patterns for UI interactions
- Test edge cases (empty data, long text, special characters)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include Firefox version and steps to reproduce

## Roadmap

### Planned Features
- [ ] Prompt templates and variables
- [ ] Advanced search with operators
- [ ] Keyboard shortcuts
- [ ] Bulk operations (move, delete, tag)

### Version History
- **v1.0.0**: Initial release with core functionality
  - Basic prompt management
  - Folder organization
  - CSV import/export
  - Theme support
