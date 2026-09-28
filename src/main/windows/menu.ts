import { app, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { getMainWindow, createMainWindow } from './mainWindow';
import { togglePickerWindow } from './pickerWindow';

export function openAboutModal(): void {
  const win = getMainWindow() || createMainWindow();
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
  win.webContents.send('app:openAbout');
}

export function setupApplicationMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About Sticker Chest',
                click: () => openAboutModal(),
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Quick Picker',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => togglePickerWindow(),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Sticker Chest',
          accelerator: 'F1',
          click: () => openAboutModal(),
        },
        { type: 'separator' },
        {
          label: 'Documentation & Guide',
          click: () => shell.openExternal('https://github.com/Biodam/StickerChest#readme'),
        },
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/Biodam/StickerChest'),
        },
        {
          label: 'Report an Issue',
          click: () => shell.openExternal('https://github.com/Biodam/StickerChest/issues'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
