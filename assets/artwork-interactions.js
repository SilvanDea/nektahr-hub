// A convenience deterrent, not copy protection. Keep normal links and text usable.
(() => {
  const isArtwork = target => target instanceof Element && Boolean(target.closest('img, #art-process .viewer, #lb-image'));
  document.addEventListener('contextmenu', event => {
    if (isArtwork(event.target)) event.preventDefault();
  });
  document.addEventListener('dragstart', event => {
    if (isArtwork(event.target)) event.preventDefault();
  });
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) event.target.draggable = false;
  }, true);
  document.querySelectorAll('img').forEach(image => { image.draggable = false; });
})();