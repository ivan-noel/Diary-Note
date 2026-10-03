const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const appIconPath = path.join(__dirname, 'assets', 'icon.ico');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    title: 'Diary Note',
    icon: appIconPath,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenuBarVisibility(false); // Diary Note has its own File/View/Settings bar
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Custom title bar controls (needed now that the OS title bar is off)
ipcMain.on('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});
ipcMain.on('window-maximize', (event) => {
  const w = BrowserWindow.fromWebContents(event.sender);
  if (!w) return;
  w.isMaximized() ? w.unmaximize() : w.maximize();
});
ipcMain.on('window-close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});
// Native "Save As" dialog + write to disk, called from the renderer via preload.js
ipcMain.handle('save-file', async (event, { filename, data }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(win, {
    defaultPath: filename,
    filters: [{ name: 'Text File', extensions: ['txt'] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  fs.writeFileSync(result.filePath, data, 'utf-8');
  return { canceled: false, filePath: result.filePath };
});

// Silent re-save to a path we already have (no dialog) — plain Ctrl+S behavior
ipcMain.handle('save-file-direct', async (event, { filePath, data }) => {
  try {
    fs.writeFileSync(filePath, data, 'utf-8');
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});
