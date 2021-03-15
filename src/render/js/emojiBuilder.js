const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

const defaultFavorites = [
  {
    codes: '1F33F',
    char: '🌿',
    name: 'herb',
    category: 'Animals & Nature (plant-other)',
    group: 'Animals & Nature',
    subgroup: 'plant-other',
  },
  {
    codes: '1F44D 1F3FB',
    char: '👍🏻',
    name: 'thumbs up: light skin tone',
    category: 'People & Body (hand-fingers-closed)',
    group: 'People & Body',
    subgroup: 'hand-fingers-closed',
  },
  {
    codes: '1F4A9',
    char: '💩',
    name: 'pile of poo',
    category: 'Smileys & Emotion (face-costume)',
    group: 'Smileys & Emotion',
    subgroup: 'face-costume',
  },
  {
    codes: '1F60A',
    char: '😊',
    name: 'smiling face with smiling eyes',
    category: 'Smileys & Emotion (face-smiling)',
    group: 'Smileys & Emotion',
    subgroup: 'face-smiling',
  },
  {
    codes: '2764 FE0F',
    char: '❤️',
    name: 'red heart',
    category: 'Smileys & Emotion (emotion)',
    group: 'Smileys & Emotion',
    subgroup: 'emotion',
  },
];

let defaultGrid;
$(function () {
  buildFavorites();
  // $('.emoji-grid').css('display', 'none');
  // JSON.parse(emojis).forEach((emojiInfo, i) => {
  //   $('.emoji-grid').append(emojiButton(emojiInfo, 'all-emoji'));
  // });
  // setFavoriteIndicators();
  // $('.emoji-grid').css('display', 'grid');
  // defaultGrid = document.getElementsByClassName('emoji-grid')[0].innerHTML;
});

function setFavoriteIndicators() {
  $('.favorite-emoji').each((i, obj) => {
    $(`.all-emoji[codes='${obj.attributes.codes.value}']`)
      .children('.favorite')
      .css('display', 'block');
  });
}

ipcRenderer.on('show', function () {
  $('#search-bar').focus();
});

function buildFavorites() {
  let favorites;
  const favoriteData = store.get('favorites');
  if (favoriteData) favorites = JSON.parse(favoriteData);
  else {
    favorites = defaultFavorites;
    store.set('favorites', JSON.stringify(defaultFavorites));
  }
  $('.favorites-grid').empty();
  favorites.forEach((emojiInfo, i) => {
    // console.log(JSON.stringify(emojiInfo));
    $('.favorites-grid').append(emojiButton(emojiInfo, 'favorite-emoji'));
  });
}
function emojiButton(emojiInfo, type) {
  return `
  <button
    class="move ${type}"
    codes="${emojiInfo.codes}"
    name="${emojiInfo.name}"
    category="${emojiInfo.category}"
    group="${emojiInfo.group}"
    subgroup="${emojiInfo.subgroup}"
    title="${emojiInfo.name}\n${emojiInfo.group}"
  >
    <div class="emoji-char">${emojiInfo.char}</div>
    <div class="favorite"></div>
    <div class="copied">Copied!</div>
  </button>
`;
}
