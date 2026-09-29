export const app = {
  getPath: (name: string) => process.cwd(),
  getAppPath: () => process.cwd(),
  isPackaged: false,
  quit: () => {},
  on: () => {},
  whenReady: async () => {},
  requestSingleInstanceLock: () => true,
};

export const clipboard = {
  writeImage: () => {},
  write: async () => {},
  readImage: () => ({ isEmpty: () => true }),
  readText: () => '',
};

export const nativeImage = {
  createFromBuffer: () => ({ isEmpty: () => false }),
  createFromPath: () => ({ isEmpty: () => false }),
  createEmpty: () => ({ isEmpty: () => true }),
};

export const BrowserWindow = class {
  loadURL = async () => {};
  loadFile = async () => {};
  on = () => {};
  once = () => {};
  show = () => {};
  hide = () => {};
  focus = () => {};
  isDestroyed = () => false;
  isMinimized = () => false;
  isVisible = () => true;
  setAlwaysOnTop = () => {};
  restore = () => {};
  webContents = {
    on: () => {},
    send: () => {},
    setWindowOpenHandler: () => {},
  };
};

export const screen = {
  getCursorScreenPoint: () => ({ x: 0, y: 0 }),
  getDisplayNearestPoint: () => ({
    workArea: { x: 0, y: 0, width: 1920, height: 1080 },
  }),
};

export const Tray = class {
  setToolTip = () => {};
  setContextMenu = () => {};
  on = () => {};
  destroy = () => {};
};

export const Menu = {
  buildFromTemplate: () => ({}),
};

export const shell = {
  openExternal: async () => {},
  showItemInFolder: () => {},
};

export const ipcMain = {
  handle: () => {},
  on: () => {},
};

export default {
  app,
  clipboard,
  nativeImage,
  BrowserWindow,
  screen,
  Tray,
  Menu,
  shell,
  ipcMain,
};
