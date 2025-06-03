# Prompts Saver - Firefox Extension

A Firefox extension for saving and organizing AI prompts. Create folders, add tags, search through prompts, and backup/restore your collection as JSON.

## Features

- Save prompts with titles and tags
- Organize in folders (with nesting)
- Search and filter prompts
- JSON backup/restore functionality
- Dark/light theme support
- Sidebar interface

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

Built with vanilla JS, uses Firefox storage API.

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
- **Export**: Use the Options page to download all data (prompts + folders) as JSON
- **Import**: Use the Options page to upload a JSON file to restore your data
- **Complete Backup**: JSON export includes both prompts and folder structure

## File Structure

```
prompts-saver/
├── manifest.json              # Extension manifest
├── background/
│   └── background.js          # Background script
├── sidebar/
│   ├── sidebar.html           # Main interface
│   ├── sidebar.css            # Styling
│   └── sidebar.js             # Application logic
├── options/
│   ├── options.html           # Options page
│   ├── options.css            # Options styling
│   └── options.js             # Folder management
├── icons/                     # Extension icons
├── docs/                      # Documentation
│   ├── USER_GUIDE.md          # Complete user guide
│   ├── API.md                 # Technical reference
│   └── CHANGELOG.md           # Version history
└── README.md                  # This file
```

## Technical Details

- **Storage**: Uses Firefox's `browser.storage.local` API
- **Data Format**: JSON with prompts and folder structures
- **Compatibility**: Firefox 109+ (Manifest V3)
- **Permissions**: Storage, theme, and sidebar access

For detailed technical information, see [API Documentation](docs/API.md).

## Development

### Quick Start
1. Clone the repository
2. Open `about:debugging` in Firefox
3. Load temporary add-on using `manifest.json`
4. Make changes and reload to test

For detailed development guide, see [User Guide](docs/USER_GUIDE.md) and [API Documentation](docs/API.md).

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

## Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive usage instructions
- **[API Documentation](docs/API.md)** - Technical reference and data structures
- **[Changelog](docs/CHANGELOG.md)** - Version history and changes
- **[Development Reports](docs/)** - Development process documentation

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include Firefox version and steps to reproduce

For detailed usage instructions, see the [User Guide](docs/USER_GUIDE.md).

For technical information, see the [API Documentation](docs/API.md).

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
  - JSON backup/restore
  - Theme support

## Disclaimer

<<<<<<< HEAD
This extension was developed with assistance from **Gemini 2.5 Pro** AI model for code generation, optimization, and documentation.

Please note that English is not my native language. AI tools were utilized to assist with translation and refinement of this README file to ensure clarity and accuracy.
=======
This extension was developed with assistance from **Gemini 2.5 Pro** AI model for code generation, optimization, and documentation.
>>>>>>> f1543c7 (Refactor documentation and remove user guide; implement JSON import/export functionality in options page; enhance API documentation; update changelog for version 1.0.0 release; improve sidebar functionality and remove CSV export/import buttons.)
