const cols = 6;
$(document).keydown(function (e) {
  if (e.keyCode == 40) handleArrowKey(e, 'down');
  if (e.keyCode == 39 && $('#search-bar:focus').length !== 1)
    handleArrowKey(e, 'right');
  if (e.keyCode == 38) handleArrowKey(e, 'up');
  if (e.keyCode == 37 && $('#search-bar:focus').length !== 1)
    handleArrowKey(e, 'left');
  if (e.keyCode == 13) toClipboard($('.move:focus .emoji-char').text()); //enter
  if (e.keyCode == 32) createFavorite(); //space
  if (e.keyCode == 9) {
    e.preventDefault();
    $('#search-bar').focus();
  }
});

$(function () {
  $('.move').on('click', function (e) {
    if (e.detail !== 1) return;
    toClipboard($(this).children('.emoji-char').text(), true);
  });
  handleSearch();
});

function handleArrowKey(e, direction) {
  e.preventDefault();
  // if ($('.move:focus').length === 0) {
  //   if (direction === 'right' || direction === 'down')
  //     if ($('.all-emoji').length > 0) $('.all-emoji')[0].focus();
  //     else if ($('.favorite-emoji').length > 0)
  //       $('.favorite-emoji').last().focus();
  //     else $('#search-bar').focus();
  //   return;
  // }
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
  else if (direction === 'down') $('.all-emoji')[0].focus();
}

function toClipboard(text, click) {
  navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
    if (result.state == 'granted' || result.state == 'prompt') {
      navigator.clipboard.writeText(text.trim()).then(() => {
        ipcRenderer.send('hide');
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
let searchInput = false;
async function rebuildAll() {
  if (searchInput) return;
  document.getElementsByClassName('emoji-grid')[0].innerHTML = defaultGrid;
  setFavoriteIndicators();
}

function handleSearch() {
  $('#search-bar').on('input', (e) => {
    $('.emoji-grid').empty();
    if (e.target.value.length === 0) {
      return;
    }
    const hits = JSON.parse(emojis).filter((emoji) => {
      const words = e.target.value.split(' ');
      let foundScore = 0;
      words.forEach((word) => {
        if (emoji.name.includes(word)) foundScore++;
        if (emoji.group.includes(word)) foundScore++;
        if (emoji.subgroup.includes(word)) foundScore++;
      });
      emoji.foundScore = foundScore;
      return foundScore > 0;
    });

    hits
      .sort((a, b) => {
        return b.foundScore - a.foundScore;
      })
      .splice(0, 102)
      .forEach((emojiInfo, i) => {
        $('.emoji-grid').append(emojiButton(emojiInfo, i, 'all-emoji'));
      });
    setFavoriteIndicators();
  });
}
