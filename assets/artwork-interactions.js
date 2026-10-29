// A convenience deterrent, not copy protection. Public image URLs remain accessible.
(() => {
  const isArtwork = target => target instanceof Element && Boolean(target.closest('img, picture, #art-process .viewer, #lb-image, #artwork-dialog-image'));
  document.addEventListener('contextmenu', event => {
    if (isArtwork(event.target)) event.preventDefault();
  });
  document.addEventListener('dragstart', event => {
    if (isArtwork(event.target)) event.preventDefault();
  });
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) {
      event.target.draggable = false;
      event.target.classList.add('artwork-no-save');
    }
  }, true);
  document.querySelectorAll('img').forEach(image => {
    image.draggable = false;
    image.classList.add('artwork-no-save');
  });
})();
