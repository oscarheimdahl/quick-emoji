const { BrowserWindow, screen } = require('electron');
const path = require('path');

let emojiWindow;
const [windowWidth, windowHeight] = [300, 500];

const buildEmojiWindow = () => {
  emojiWindow = new BrowserWindow({
    show: false,
    alwaysOnTop: true,
    width: windowWidth,
    height: windowHeight,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });
  emojiWindow.setVisibleOnAllWorkspaces(true);
  emojiWindow.loadFile(path.join(__dirname, '/../render/index.html'));
  emojiWindow.once('ready-to-show', () => {
    putInCorner();
    emojiWindow.show();
    // emojiWindow.webContents.openDevTools();
  });
  emojiWindow.on('blur', () => emojiWindow.hide());
  return emojiWindow;
};

const putInCorner = () => {
  const { width, height } = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  ).workArea;
  emojiWindow.setPosition(width - windowWidth, height - windowHeight);
};

module.exports = buildEmojiWindow;
