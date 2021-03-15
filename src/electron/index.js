const { app, globalShortcut } = require('electron');
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
Store.initRenderer();
const buildMenuIcon = require('./menuIcon.js');
const buildEmojiWindow = require('./emojiWindow.js');
require('electron-reload')(__dirname + '/../render/');

if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let emojiWindow;

const setShortcut = () => {
  globalShortcut.register('CommandOrControl+.', () => {
    if (emojiWindow.isVisible()) app.hide();
    else showSettingsWindow();
  });
};

const init = () => {
  buildMenuIcon(showSettingsWindow, app.exit);
  emojiWindow = buildEmojiWindow();
  setShortcut();
  app.dock.hide();
};

const showSettingsWindow = () => {
  if (!emojiWindow) return;
  emojiWindow.show();
  emojiWindow.webContents.send('show');
};

app.on('ready', init);

////

ipcMain.on('print', (_, data) => {
  console.log(data);
});
ipcMain.on('hide', (_, data) => {
  app.hide();
});
