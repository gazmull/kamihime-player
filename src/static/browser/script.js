/* eslint-disable no-undef, no-invalid-this*/

let cookieData = {};
const parseCookie = cookie => {
  const data = {};
  const entries = cookie.split('&');

  for (const entry of entries) {
    const [key, value] = entry.split('=');

    data[key] = ['true', 'false'].includes(value) ? value === 'true' : value;
  }

  return data;
};
const saveCookie = () => {
  const entries = [];

  for (const key in cookieData) {
    const value = cookieData[key];

    entries.push(`${key}=${value}`);
  }

  document.cookie = entries.join('&');
};

$(this).on('beforeunload', () => {
  if (cookieData.enabled)
    saveCookie();
});

$(() => {
  if (!document.cookie) {
    const cookieConfirmed = window.confirm([
      'This site uses cookie to save your last browsing position.',
      'Would you like to accept cookies?\n\n',
      'It may be as good as your grandma\'s!'
    ].join(' '));

    document.cookie = [
      `enabled=${cookieConfirmed}`,
      'lastNav=all'
    ].join('&');
  }

  cookieData = parseCookie(document.cookie);

  $(`#${cookieData.lastNav}`)
    .attr('class', 'visible');

  $(`button[id=${cookieData.lastNav}btn]`)
    .css('background-color', '#ff65ae');

  $('#searchBar').on('keyup click input', ({ currentTarget: $this }) => {
    let query = $($this).val();
    query = query.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());

    const divs = '#characters > div[class=\'visible\'] > div';
    const toHide = $(`${divs}[name!='${query}']`);
    const toShow = $(`${divs}[name*='${query}']`);

    if (query) {
      toHide
        .attr('class', 'name hiddenInstant')
        .css('position', 'absolute');
      toShow
        .attr('class', 'name visible')
        .css('position', 'relative');
    } else
      $(`${divs}[class*='hiddenInstant']`)
        .attr('class', 'name visible')
        .css('position', 'relative');
  });

  $('.toggleForm').click(({ currentTarget: $this }) => {
    const $btnID = $($this).attr('id');
    const $btnCode = $($this).attr('nav');
    const $btnCode_sliced = $btnCode.slice(1);

    if (cookieData.enabled)
      cookieData.lastNav = $btnCode_sliced;

    $('#searchBar').val('');
    $(`${$btnCode} > div[class='hiddenInstant']`)
      .attr('class', 'visible')
      .css('position', 'relative');
    $($btnCode).attr('class', 'visible');
    $(`#${$btnID}`).css('background-color', '#ff65ae');
    $(`#characters > div[id!='${$btnCode_sliced}']`).attr('class', 'hidden');
    $(`#buttons > button[id!='${$btnID}']`).css('background-color', '#666f8b');
  });

  $('.name').hover(
    ({ currentTarget: $this }) => {
      const id = $($this).attr('name');

      $('#thumbnail')
        .css('background-image', `url("/info/${id}?image=true")`)
        .show();
    },
    () => $('#thumbnail').hide()
  );
});
