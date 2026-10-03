const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  saveFile: (filename, data) => ipcRenderer.invoke('save-file', { filename, data }),
  saveFileDirect: (filePath, data) => ipcRenderer.invoke('save-file-direct', { filePath, data }),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
});
