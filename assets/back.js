// Send "回作品集" back to the listing that opened this demo; default is the home page.
// shortcut: relies on document.referrer, so a direct visit or a stripped referrer falls back to home.
if (/\/gallery\/(index\.html)?$/.test(document.referrer)) {
  document.querySelectorAll('[data-back]').forEach((a) => { a.href = '../gallery/'; });
}
