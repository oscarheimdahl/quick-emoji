const { app, globalShortcut } = require('electron');
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
// Store.initRenderer();
const store = new Store();
const buildMenuIcon = require('./menuIcon.js');
const { buildEmojiWindow, putInCorner } = require('./emojiWindow.js');
require('electron-reload')(__dirname + '/../render/');

if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let emojiWindow;

const setShortcut = () => {
  globalShortcut.register('CommandOrControl+Shift+.', () => {
    if (emojiWindow.isVisible()) app.hide();
    else showAndMoveWindow();
  });
};

const showAndMoveWindow = () => {
  putInCorner();
  emojiWindow.show();
};

const init = () => {
  buildMenuIcon(
    store.get('hideOnCopy'),
    showAndMoveWindow,
    toggleHideOnCopy,
    app.exit
  );
  emojiWindow = buildEmojiWindow();
  setShortcut();
  if (process.platform === 'darwin') app.dock.hide();
};

const toggleHideOnCopy = () => {
  if (!emojiWindow) return;
  const hideOnCopy = store.get('hideOnCopy');
  store.set('hideOnCopy', !hideOnCopy);
  emojiWindow.webContents.send('hideOnCopy');
  return !hideOnCopy;
};

app.on('ready', init);

////

ipcMain.on('print', (_, data) => {
  console.log(data);
});
ipcMain.on('hide', (_, data) => {
  if (store.get('hideOnCopy')) app.hide();
});
