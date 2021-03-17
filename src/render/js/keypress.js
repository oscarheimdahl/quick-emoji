const cols = 6;
$(document).keydown(function (e) {
  if (e.keyCode == 40) handleArrowKey(e, 'down');
  else if (e.keyCode == 39 && $('#search-bar:focus').length !== 1)
    handleArrowKey(e, 'right');
  else if (e.keyCode == 38) handleArrowKey(e, 'up');
  else if (e.keyCode == 37 && $('#search-bar:focus').length !== 1)
    handleArrowKey(e, 'left');
  else if (e.keyCode == 13) toClipboard($('.move:focus .emoji-char').text());
  //enter
  else if (e.keyCode == 32) createFavorite();
  //space
  else if (e.keyCode !== 9) $('#search-bar').focus();
});

$(document).on('click', (e) => {
  if (e.target.className === 'emoji-char')
    toClipboard(e.target.innerText, true);
});

$(function () {
  $('#search-bar').on('input', (e) => {
    handleSearch(e);
  });
  handleScrollBottom();
});

function handleArrowKey(e, direction) {
  e.preventDefault();
  const nextIndex = direction === 'up' || direction === 'down' ? cols - 1 : 0;
  const nextEmoji =
    direction === 'left' || direction === 'up'
      ? $('.move:focus').prevAll()[nextIndex]
      : $('.move:focus').nextAll()[nextIndex];
  if (nextEmoji) {
    nextEmoji.focus({ preventScroll: true });
    if (!emojiInViewport())
      if (direction === 'down' || direction === 'right')
        $(window).scrollTop(
          $('.move:focus').offset().top - $(window).height() + 45
        );
      else $(window).scrollTop($('.move:focus').offset().top);
  } else {
    goBetweenGrids(direction);
  }
}

function createFavorite() {
  const emojiButton = $('.move:focus');
  const i = emojiButton.index();
  emojiButton.children('.favorite').toggle();
  const newFavorite = {
    codes: emojiButton.attr('codes'),
    char: $('.move:focus .emoji-char').text(),
    name: emojiButton.attr('name'),
    category: emojiButton.attr('category'),
    group: emojiButton.attr('group'),
    subgroup: emojiButton.attr('subgroup'),
  };
  if (!newFavorite.char) {
    return;
  }
  toggleFavorite(newFavorite);
  buildFavorites();
  if (emojiButton.hasClass('favorite-emoji')) {
    changeFavoriteFocus(i);
    removeFavoriteIndicator(emojiButton.attr('codes'));
  }
}

function removeFavoriteIndicator(codes) {
  $(`.all-emoji[codes='${codes}']`)
    .children('.favorite')
    .css('display', 'none');
}
function changeFavoriteFocus(index) {
  if (index === 0 && $('.favorite-emoji').length > 0) {
    $('.favorite-emoji')[0].focus();
  } else if ($('.favorite-emoji').length > 0) {
    $('.favorite-emoji')[index - 1].focus();
  } else {
    $('.all-emoji')[0].focus();
  }
}

function toggleFavorite(newFavorite) {
  const favoriteData = store.get('favorites');
  let favorites;
  if (favoriteData) {
    favorites = JSON.parse(favoriteData);
    const dublicate = removeIfDuplicate(newFavorite, favorites);
    if (dublicate === true) return;
  } else favorites = [];
  favorites.push(newFavorite);
  store.set('favorites', JSON.stringify(favorites));
}

function removeIfDuplicate(newFavorite, favorites) {
  let removeIndex = null;
  favorites.forEach((fav, i) => {
    if (fav.char === newFavorite.char) removeIndex = i;
  });
  if (removeIndex !== null) {
    favorites.splice(removeIndex, 1);
    store.set('favorites', JSON.stringify(favorites));
    return true;
  }
  return false;
}

function goBetweenGrids(direction) {
  if ($('.favorite-emoji').length === 0) $(window).scrollTop(0);
  // const searchFocused = $('#search-bar:focus').length > 0;
  const favoriteFocused = $('.favorite-emoji:focus').length > 0;
  const allEmojiFocused = $('.all-emoji:focus').length > 0;
  if (
    (allEmojiFocused && direction === 'up') ||
    (favoriteFocused && direction === 'down')
  )
    $('#search-bar').focus();
  else if (direction === 'up') $('.favorite-emoji').last().focus();
  else if (direction === 'down' && !allEmojiFocused) {
    $('.emoji-grid').children()[0].focus();
  }
}

function toClipboard(text, click) {
  navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
    if (result.state == 'granted' || result.state == 'prompt') {
      navigator.clipboard.writeText(text.trim()).then(() => {
        setTimeout(() => ipcRenderer.send('hide'), 300);
        if (!click) enterFeedback();
        // copyFeedback();
      });
    }
  });
}

function copyFeedback() {
  const copiedText = $('.move:focus .copied');
  copiedText.css('display', 'block');
  setTimeout(() => {
    copiedText.removeAttr('style');
  }, 800);
}
function enterFeedback() {
  const emoji = $('.move:focus .emoji-char');
  emoji.css('transform', 'scale(1.8)');
  setTimeout(() => {
    emoji.removeAttr('style');
  }, 200);
}

function emojiInViewport() {
  const top_of_element = $('.move:focus').offset().top + 30;
  const bottom_of_element =
    $('.move:focus').offset().top + $('.move:focus').outerHeight() - 30;
  const bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
  const top_of_screen = $(window).scrollTop();
  return bottom_of_screen > top_of_element && top_of_screen < bottom_of_element;
}
let blocker = false;
function blockSearchUpdate() {
  return blocker;
}

let search = false;
let searchResult = [];
async function handleSearch(e) {
  buildIndex = 0;
  $('.emoji-grid').empty();
  if (e.target.value.length === 0) {
    search = false;
    buildPart();
    return;
  }
  search = true;
  const hits = emojis.filter((emoji) => {
    if (e.target.value === 'all') return true;
    const words = e.target.value.split(' ');
    let foundScore = 0;
    words.forEach((word) => {
      if (word.length === 0) return;
      if (emoji.name.toLowerCase().includes(word.toLowerCase())) foundScore++;
      if (emoji.group.toLowerCase().includes(word.toLowerCase())) foundScore++;
      if (emoji.subgroup.toLowerCase().includes(word.toLowerCase()))
        foundScore++;
    });
    emoji.foundScore = foundScore;
    return foundScore > 0;
  });
  searchResult = hits.sort((a, b) => {
    return b.foundScore - a.foundScore;
  });
  buildIndex = 0;
  buildPart();
}

let canRebuild = true;
function handleScrollBottom() {
  $(window).scroll(function () {
    if (
      $(window).scrollTop() + $(window).height() > $(document).height() - 100 &&
      canRebuild
    ) {
      buildPart();
      setTimeout(() => (canRebuild = true), 300);
    }
  });
}
