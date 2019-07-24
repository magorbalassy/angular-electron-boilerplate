import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { DtoSystemInfo } from '../ipc-dtos/dtosysteminfo';
// import os from 'os';
const os = require('os');

let win: BrowserWindow;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // In a sandbox
      sandbox: true,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/main', 'preload.js')
    }
  });

  win.setMenuBarVisibility(false);

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'));

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('dev-tools', () => {
  win.webContents.toggleDevTools();
});

ipcMain.on('request-systeminfo', () => {
  const systemInfo = new DtoSystemInfo();
  systemInfo.Arch = os.arch();
  systemInfo.Hostname = os.hostname();
  systemInfo.Platform = os.platform();
  systemInfo.Release = os.release();
  const serializedString = systemInfo.serialize();
  win.webContents.send('systeminfo', serializedString);
});
