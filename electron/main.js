const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '视频播放器',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/video');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      window.electronAPI = {
        openVideoDialog: async () => {
          return new Promise((resolve) => {
            window.electronCallback = (result) => {
              resolve(result);
              delete window.electronCallback;
            };
            window.postMessage({ type: 'open-video-dialog' });
          });
        }
      };
    `);
  });

  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('open-video-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '视频文件', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }

  return result.filePaths;
});

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault();
  });

  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });

  contents.on('ipc-message', (event, channel) => {
    if (channel === 'open-video-dialog') {
      ipcMain.invoke('open-video-dialog').then((result) => {
        contents.executeJavaScript(`
          if (window.electronCallback) {
            window.electronCallback(${JSON.stringify(result)});
          }
        `);
      });
    }
  });
});