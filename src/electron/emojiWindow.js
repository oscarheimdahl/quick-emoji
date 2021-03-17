const { BrowserWindow, screen } = require('electron');
const path = require('path');

let emojiWindow;
const [windowWidth, windowHeight] = [300, 400];

const buildEmojiWindow = () => {
  emojiWindow = new BrowserWindow({
    skipTaskbar: true,
    show: false,
    alwaysOnTop: true,
    width: windowWidth,
    height: windowHeight,
    frame: false,
    fullscreenable: false,
    maximizable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });
  emojiWindow.setVisibleOnAllWorkspaces(true);
  emojiWindow.loadFile(path.join(__dirname, '/../render/index.html'));
  emojiWindow.on('blur', () => emojiWindow.hide());
  return emojiWindow;
};

const putInCorner = () => {
  const cursorPos = screen.getCursorScreenPoint();
  let displayNearestCursor;
  screen.getAllDisplays().forEach((display) => {
    console.log(display.bounds.x);
    console.log(cursorPos.x);
    console.log(display.bounds.width);
    console.log('-');
    if (
      cursorPos.x > display.bounds.x &&
      cursorPos.x < display.bounds.x + display.bounds.width &&
      cursorPos.y > display.bounds.y &&
      cursorPos.y < display.bounds.y + display.bounds.height
    )
      displayNearestCursor = display;
  });
  console.log(displayNearestCursor);
  const { width, height, x, y } = displayNearestCursor.workArea;
  emojiWindow.setPosition(width - windowWidth + x, height - windowHeight + y);
};

module.exports = { buildEmojiWindow, putInCorner };
