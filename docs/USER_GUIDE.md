# User Guide - Prompts Saver

A comprehensive guide to using the Prompts Saver Firefox extension for organizing and managing your AI prompts.

## Development Information

This extension and its documentation were developed with assistance from **Gemini 2.5 Pro** AI model for code generation, optimization, and documentation refinement.

Please note that English is not my native language. AI tools were utilized to assist with translation and refinement of this documentation to ensure clarity and accuracy.

## Table of Contents
- [Getting Started](#getting-started)
- [Basic Operations](#basic-operations)
- [Advanced Features](#advanced-features)
- [Import/Export](#importexport)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. **Install the Extension**
   - Install from Firefox Add-ons store or load manually
   - Look for the Prompts Saver icon in your toolbar
   - Click the icon to open the sidebar

2. **Initial Interface Overview**
   ```
   ┌─ Prompts Saver ─────────────┐
   │ [Search Box] [⬇] [⬆]       │
   │ Folder: [All Folders ▼]    │
   │ ───────────────────────────  │
   │ ▼ Add New Prompt           │
   │ ───────────────────────────  │
   │ (Empty - No prompts yet)    │
   │                             │
   │ Create your first prompt!   │
   └─────────────────────────────┘
   ```

3. **Create Your First Folder** (Optional)
   - Go to Firefox menu → Add-ons and Themes → Prompts Saver → Options
   - Add folders to organize your prompts before creating them

### Basic Interface Elements

| Element | Description |
|---------|-------------|
| 🔍 Search Box | Find prompts by title or content |
| 📁 Folder Dropdown | Filter prompts by folder |
| ▼ Add New Prompt | Toggle form to create prompts |

## Basic Operations

### Creating Your First Prompt

1. **Open the Add Form**
   - Click "▼ Add New Prompt" in the sidebar
   - The form will expand below

2. **Fill in Prompt Details**
   ```
   Title: [Creative Writing Helper        ]
   
   Prompt Text: [Write a creative story about a character who
                discovers they can communicate with animals.
                Include dialogue and describe the character's
                emotions throughout the discovery.]
   
   Tags: [creative, writing, storytelling, animals]
   
   Save to folder: [Writing Prompts ▼]
   
   [Save] [Cancel]
   ```

3. **Form Fields Explained**
   - **Title**: Short, descriptive name for your prompt
   - **Prompt Text**: The actual prompt content you'll use with AI
   - **Tags**: Comma-separated keywords for organization
   - **Folder**: Choose where to store the prompt

4. **Save the Prompt**
   - Click "Save" to store your prompt
   - The form will close and your prompt appears in the list

### Viewing and Managing Prompts

#### Prompt List Display
```
┌─ Creative Writing Helper ──────────────┐
│ Write a creative story about a         │
│ character who discovers they can...    │
│                                        │
│ 🏷 creative  writing  storytelling     │
│ 📁 Writing Prompts                     │
│                                        │
│ [📝] [📋] [🗑]                         │
└────────────────────────────────────────┘
```

#### Action Buttons
- **📝 Edit**: Modify the prompt title, content, tags, or folder
- **📋 Copy**: Copy prompt text to clipboard for pasting into AI tools
- **🗑 Delete**: Remove the prompt permanently (with confirmation)

### Working with Folders

#### Creating Folders
1. **Via Sidebar** (Simple method)
   - Look for folder creation area in sidebar
   - Enter folder name and select parent (if any)
   - Click "+" to create

2. **Via Options Page** (Advanced method)
   - Right-click the extension icon → Manage Extension → Options
   - Use the folder management interface for complex hierarchies

#### Folder Hierarchy Example
```
📁 Work
  ├── 📁 Email Templates
  ├── 📁 Meeting Notes
  └── 📁 Project Descriptions
📁 Personal
  ├── 📁 Creative Writing
  ├── 📁 Learning
  └── 📁 Daily Tasks
📁 AI Experiments
  ├── 📁 Code Generation
  └── 📁 Content Creation
```

### Searching and Filtering

#### Search Functionality
- **Real-time Search**: Results update as you type
- **Searches In**: Prompt titles and content text
- **Case Insensitive**: "AI" finds "ai", "Ai", "AI"

#### Search Examples
| Search Term | Finds |
|-------------|-------|
| `write` | "Creative Writing", "Write code", "Rewrite email" |
| `email marketing` | Prompts containing both words anywhere |
| `python code` | Programming prompts with Python |

#### Folder Filtering
- Use the folder dropdown to show only prompts from specific folders
- "All Folders" shows everything
- Combines with search (search within selected folder)

## Advanced Features

### Tagging System

#### Best Practices for Tags
- **Use Consistent Terms**: "programming" vs "coding" vs "development"
- **Multiple Categories**: `python, beginner, tutorial, code`
- **Action-Based**: `write, analyze, summarize, explain`
- **Domain-Specific**: `marketing, technical, creative, business`

#### Tag Examples by Use Case
```
Blog Writing: content, blog, seo, marketing, social-media
Code Help: programming, debug, python, javascript, review
Learning: explain, tutorial, beginner, advanced, concepts
Business: email, presentation, meeting, strategy, analysis
```

### Editing Prompts

#### Edit Mode Interface
1. Click the 📝 edit button on any prompt
2. Form changes to edit mode:
   ```
   ▼ Edit Prompt
   
   Title: [Updated Title Here]
   Prompt Text: [Modified content...]
   Tags: [updated, tags, here]
   Save to folder: [Different Folder ▼]
   
   [Save] [Cancel]
   ```
3. Make your changes and click "Save"
4. Click "Cancel" to discard changes

#### Common Editing Tasks
- **Fix Typos**: Correct spelling or grammar mistakes
- **Improve Clarity**: Make prompts more specific or detailed
- **Update Tags**: Add new tags or remove irrelevant ones
- **Reorganize**: Move prompts to different folders
- **Enhance**: Add examples or additional context

### Bulk Operations

#### Moving Multiple Prompts
1. Export data to JSON via Options page
2. Edit the JSON file to modify `folderId` values
3. Import the updated JSON file

#### Tag Management
1. Export to JSON for bulk tag editing
2. Use text editor to find/replace tags
3. Import updated file

## Import/Export

### Exporting Your Data

#### JSON Export Process
1. Go to Options page (right-click extension → Options)
2. Click "Export All Data" button
3. Choose save location for JSON file
4. File contains all prompts and folder structure

#### JSON File Structure
The exported JSON contains both prompts and folders:
```json
{
  "prompts": [
    {
      "id": 123,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "title": "Email Template",
      "text": "Write a professional email...",
      "tags": ["email", "business", "template"],
      "folderId": 456
    }
  ],
  "folders": [
    {
      "id": 456,
      "name": "Work Templates",
      "parentId": null
    }
  ]
}
```

#### Export Use Cases
- **Backup**: Regular exports for data safety
- **Sharing**: Send prompts to colleagues or friends
- **Migration**: Move to different systems or browsers
- **Analysis**: Edit JSON for bulk operations

### Importing Data

#### JSON Import Process
1. On Options page, click "Import All Data"
2. Select your JSON file
3. **Warning**: This overwrites all existing data
4. Confirm import to proceed

#### Import File Requirements
- **Format**: Valid JSON structure
- **Required Structure**: Must contain `prompts` and `folders` arrays
- **Encoding**: UTF-8 for special characters
- **Data Validation**: Invalid prompts or folders are skipped

#### Handling Import Issues
- **Missing References**: Prompts with invalid `folderId` go to root
- **Duplicate IDs**: Existing data is completely replaced
- **Malformed Data**: Invalid entries are skipped with console warnings

### Complete Data Backup

#### Exporting Complete Backup
1. Go to Options page (right-click extension → Options)
2. Click "Export All Data" button
3. Save JSON file with complete data structure

#### Importing Complete Backup
1. On Options page, click "Import All Data"
2. Select JSON file
3. **Warning**: This overwrites existing data completely
4. Confirm to proceed

## Tips and Best Practices

### Organization Strategies

#### Hierarchical Organization
```
📁 Work Projects
  ├── 📁 Client A
  │   ├── 📁 Marketing Content
  │   └── 📁 Technical Docs
  ├── 📁 Client B
  └── 📁 Internal Tools

📁 Personal Development
  ├── 📁 Learning Goals
  ├── 📁 Practice Exercises
  └── 📁 Reference Materials
```

#### Tag-Based Organization
- **Priority**: `urgent`, `important`, `low-priority`
- **Complexity**: `simple`, `medium`, `advanced`
- **Time**: `quick`, `detailed`, `research-heavy`
- **Type**: `template`, `example`, `framework`, `checklist`

### Workflow Optimization

#### Daily Use Patterns
1. **Morning Setup**: Review and organize prompts for the day
2. **Active Work**: Quick access via search and copy functions
3. **End of Day**: Add new prompts discovered during work
4. **Weekly Review**: Clean up tags, reorganize folders

#### Prompt Quality Tips
- **Be Specific**: Include context, constraints, and desired outcomes
- **Use Examples**: Add sample inputs/outputs when helpful
- **Include Variables**: Mark areas to customize: `[YOUR_TOPIC]`
- **Test and Refine**: Improve prompts based on AI responses

### Backup and Sync Strategy

#### Regular Backups
- **Weekly JSON Export**: Complete data backup
- **Cloud Storage**: Store exports in Google Drive, Dropbox, etc.

#### Multi-Device Access
- Export from one device
- Import to another device
- Keep master copy in cloud storage
- Regular sync between devices

## Troubleshooting

### Common Issues

#### Prompts Not Saving
**Symptoms**: Form submits but prompt doesn't appear
**Solutions**:
1. Check that title and text are not empty
2. Refresh the sidebar (close and reopen)
3. Check browser console for errors (F12)
4. Try reloading the extension

#### Search Not Working
**Symptoms**: Search returns no results for known prompts
**Solutions**:
1. Clear search box and try again
2. Check folder filter (set to "All Folders")
3. Verify prompts exist by browsing folders
4. Restart browser if issue persists

#### Import Fails
**Symptoms**: JSON import shows error message
**Solutions**:
1. Verify JSON format is valid
2. Check for required structure (`prompts`, `folders` arrays)
3. Ensure file encoding is UTF-8
4. Try with smaller file first
5. Check for malformed JSON syntax

#### Missing Folders
**Symptoms**: Prompts show "undefined" or no folder path
**Solutions**:
1. Go to Options page and recreate folders
2. Import folder structure from backup
3. Edit prompts to assign valid folders
4. Check that folder IDs in import match existing folders

### Data Recovery

#### Lost Prompts
1. **Check Folder Filter**: Ensure "All Folders" is selected
2. **Search for Keywords**: Try searching for prompt content
3. **Browser Storage**: Use browser dev tools to check `storage.local`
4. **Recent Backup**: Restore from recent JSON export

#### Corrupted Data
1. **Export Current Data**: Save what's recoverable
2. **Clear Extension Data**: Reset to clean state
3. **Import from Backup**: Restore from known good export
4. **Rebuild Gradually**: Add prompts back systematically

### Performance Issues

#### Slow Loading
- **Large Dataset**: Consider archiving old prompts
- **Too Many Folders**: Simplify folder structure
- **Browser Memory**: Restart browser periodically
- **Extension Conflicts**: Disable other extensions temporarily

#### Search Lag
- **Reduce Prompt Count**: Archive less-used prompts
- **Shorter Search Terms**: Use more specific queries
- **Clear Cache**: Refresh browser cache
- **Update Browser**: Ensure latest Firefox version

### Getting Help

#### Self-Help Resources
1. **Browser Console**: F12 → Console for error messages
2. **Extension Debugging**: `about:debugging` → Inspect Extension
3. **Reset Extension**: Remove and reinstall if needed
4. **Export Before Changes**: Always backup before major operations

#### Community Support
- Check project GitHub issues
- Search for similar problems
- Create detailed issue reports
- Include browser version and error messages

#### Reporting Bugs
Include in your report:
- Firefox version
- Extension version
- Steps to reproduce
- Error messages
- Expected vs actual behavior
- Sample data (if relevant)
