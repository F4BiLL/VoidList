# VoidList

VoidList is a lightweight, customizable web app that lets users create multiple colored lists, add tasks, and personalize their experience with theme and feature settings. Data persists across sessions via `localStorage`.

---

## Features

- Create, select, and delete multiple to-do lists, each with a unique color.
- Add and manage tasks within each list.
- Persistent storage of lists, colors, and tasks using `localStorage`.
- Theme support: light, dark, and system (auto) modes.
- Settings modal to toggle animations and progress bar visibility.
- Responsive UI with modals, buttons, and cursor/input state management.

---

## File Overview

- [`index.html`](./index.html): Main HTML structure and layout.
- [`style.css`](./style.css): CSS styles, including theme variables.
- [`script.js`](./script.js): Core logic for UI interaction, data handling, and theming.
- [`assets/`](./assets/): Icons and fonts used in the app.

---

## Usage

### Creating a New List

1. Click the `+ New List` button.
2. Enter a unique list title.
3. Choose a color using the color picker.
4. Submit to add the list; it will appear in the sidebar.

### Selecting a List

1. Click a list in the sidebar to activate it.
2. The selected list’s tasks appear in the Tasks section.
3. Input fields and buttons for adding tasks become enabled.

### Adding Tasks

1. With a list selected, type a task in the input field.
2. Click Add Task to append it to the current list.
3. Tasks display immediately under the selected list.

### Deleting a List

1. Select the list you want to remove.
2. Click the trash icon to delete it and all its tasks.
3. Confirm by clicking `Delete`.

### Using the Settings Modal

- Open settings via the Settings button.
- Switch between light, dark, and system themes.
- Enable or disable animations and the progress bar.

➩ Submit to apply changes.

---

## Data Structure

Lists and tasks are stored as an object with this structure:

```json
{
  "listName": {
    "color": "#2c3dd0",
    "tasks": [
      {
        "id": 000000000000,
        "name": "taskName",
        "description": "optional",
        "priority": "low" | "medium" | "high",
        "dueDate": "YYYY-MM-DD" | null,
        "completed": true | false
      }
    ]
  }
}
```

This object is saved and loaded from `localStorage` under the key `VoidList`.

---

## Future Improvements

- Sync across devices (maybe P2P/WebRTC).
- Import lists using file handling.
- Re-design modals.
- Export lists as plain text instead of json format.
- Custom "Toast"-notifications and pop-ups.

---

## License & Disclaimer

The source code is the exclusive intellectual property of the author and is provided for informational purposes only.  
No part of the code, in whole or in part, may be copied, modified, redistributed, or used to create derivative works without explicit prior written permission.

No warranties or guarantees are made regarding the accuracy, completeness, or suitability of this app or its content.  
The author is not liable for any damages, losses, or issues resulting directly or indirectly from use of this app.
