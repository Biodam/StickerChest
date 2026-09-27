# Keyboard Shortcuts & Navigation Standards

This document defines the complete keyboard interaction specification, shortcut mappings, and ergonomics for Sticker Chest across desktop operating systems (Windows, macOS, Linux).

---

## 1. Global OS Shortcuts

Global shortcuts are registered via Electron's `globalShortcut` API and function across the entire operating system, even when other applications or full-screen games have focus.

| Platform | Shortcut | Action | Description |
|---|---|---|---|
| **Windows / Linux** | `Win + /` | **Summon / Dismiss Companion** | Toggles the frameless Quick Picker floating modal at cursor / active monitor center. |
| **macOS** | `Control + /` (`⌃/`) | **Summon / Dismiss Companion** | Clean 2-key chord that avoids conflicts with macOS Preferences (`Cmd+,`) and code editors (`Cmd+/`). |

---

## 2. Quick Picker Companion Panel Shortcuts

The Quick Picker companion modal captures keystrokes at the global window level via [`usePickerKeyboard.ts`](file:///c:/Projects/sticker-database-manager/src/renderer/picker/hooks/usePickerKeyboard.ts), ensuring smooth control without needing manual mouse focus.

### 2.1 Navigation & Selection
| Key | Action | Description |
|---|---|---|
| `↑` `↓` `←` `→` | **2D Grid Navigation** | Moves cursor across rows and columns. When typing inside search text, `←` `→` moves cursor within text. |
| `Home` | **Jump to Start** | Selects the first sticker in the active tab / search result. |
| `End` | **Jump to End** | Selects the last sticker in the active tab / search result. |
| `PageUp` | **Jump Up 4 Rows** | Moves selection up by 16 items with boundary clamping. |
| `PageDown` | **Jump Down 4 Rows** | Moves selection down by 16 items with boundary clamping. |
| `Enter` | **Primary Action (Auto-Paste)** | Copies sticker and simulates native paste into prior active app (or copies to clipboard if disabled in Settings). |
| `Shift + Enter` | **Secondary Action (Copy Only)** | Copies sticker directly to clipboard without simulating paste. |

### 2.2 Tab Switching & Resolution Toggles
| Key | Action | Description |
|---|---|---|
| `Ctrl + 1` / `Cmd + 1` | **Recent Tab** | Switches directly to recently used stickers. |
| `Ctrl + 2` / `Cmd + 2` | **Favorites Tab** | Switches directly to starred favorites. |
| `Ctrl + 3` / `Cmd + 3` | **All Tab** | Switches to full database library. |
| `Ctrl + Tab` | **Next Tab** | Cycles to next tab forward (`Recent` $\rightarrow$ `Favorites` $\rightarrow$ `All`). |
| `Ctrl + Shift + Tab` | **Previous Tab** | Cycles to previous tab backward. |
| `Ctrl + T` / `Cmd + T` | **Toggle Copy Tier** | Toggles copy resolution between **Sticker** (512px) and **Emoji** (128px transparent). |

### 2.3 Search & Bookmarking
| Key | Action | Description |
|---|---|---|
| `Ctrl + S` / `Cmd + S` | **Toggle Star / Favorite** | Toggles favorite status on the selected sticker directly in SQLite. |
| `Escape` (1st press) | **Clear Search Query** | If text is in the search box, clears query and restores full view. |
| `Escape` (2nd press) | **Hide Companion** | Closes and hides the Quick Picker window. |
| `[a-z0-9]` (Typing) | **Auto-Route to Search** | Typing printable characters while browsing grid auto-focuses search bar. |

---

## 3. Database Manager Window Shortcuts

The heavy-duty Manager desktop application supports standard power-user selection shortcuts:

| Shortcut | Context | Action |
|---|---|---|
| `Ctrl + Click` / `Cmd + Click` | Grid Items | Toggle selection of individual items without clearing others. |
| `Shift + Click` | Grid Items | Select a contiguous range of stickers from last selected item. |
| `Ctrl + A` / `Cmd + A` | Library Grid | Select all currently filtered/visible stickers. |
| `Escape` | Selection / Modals | Clears bulk selection; closes open modals / inspector. |
| `Delete` / `Backspace` | Multi-Selection | Triggers bulk delete prompt for selected stickers. |
