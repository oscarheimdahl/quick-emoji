const { app, globalShortcut } = require('electron');
const { ipcMain } = require('electron/main');
const Store = require('electron-store');
// Store.initRenderer();
const store = new Store();
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
  buildMenuIcon(
    store.get('hideOnCopy'),
    showSettingsWindow,
    toggleHideOnCopy,
    app.exit
  );
  emojiWindow = buildEmojiWindow();
  setShortcut();
  if (process.platform === 'darwin') app.dock.hide();
};

const showSettingsWindow = () => {
  if (!emojiWindow) return;
  emojiWindow.show();
  emojiWindow.webContents.send('show');
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
