const { Tray, Menu } = require('electron');
const path = require('path');
let menuIcon;
const buildMenuIcon = (show, quit) => {
  menuIcon = new Tray(path.join(__dirname, '../icons/IconTemplate.png'));
  const menu = new Menu.buildFromTemplate([
    {
      label: 'Show         ⌘ + .',
      click: show,
    },
    { type: 'separator' },
    { label: 'Quit', click: () => quit() },
  ]);
  menuIcon.setContextMenu(menu);
};

module.exports = buildMenuIcon;
