const { Tray, Menu } = require('electron');
const path = require('path');
let menuIcon;
const buildMenuIcon = (checked, show, toggleHideOnCopy, quit) => {
  menuIcon = new Tray(path.join(__dirname, '../icons/IconTemplate.png'));
  setMenu(checked, show, toggleHideOnCopy, quit);
};

function toggleHideOnCopyWrapper(show, toggleHideOnCopy, quit) {
  const checked = toggleHideOnCopy();
  setMenu(checked, show, toggleHideOnCopy, quit);
}

function setMenu(checked, show, toggleHideOnCopy, quit) {
  const menu = new Menu.buildFromTemplate([
    {
      label: `Show         ${process.platform === 'darwin' ? '⌘' : 'Ctrl'} + .`,
      click: show,
    },
    {
      label: 'Hide on copy',
      click: () => toggleHideOnCopyWrapper(show, toggleHideOnCopy, quit),
      type: 'checkbox',
      checked,
    },
    { type: 'separator' },
    { label: 'Quit', click: quit },
  ]);
  menuIcon.setContextMenu(menu);
}

module.exports = buildMenuIcon;
