(() => {
  const root = document.documentElement;
  root.classList.add('site-loading');
  root.style.setProperty('--cork-texture', 'none');

  let revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    clearTimeout(deadline);
    root.classList.add('site-revealing');
    root.classList.remove('site-loading');
    setTimeout(() => {
      root.classList.remove('site-revealing');
      document.querySelector('.site-loader')?.remove();
    }, 400);
  }
  // A failed or slow asset must never trap visitors behind the loading screen.
  const deadline = setTimeout(reveal, 8000);
  window.addEventListener('pageshow', event => {
    if (event.persisted) reveal();
  });

  function decode(image) {
    if (typeof image.decode === 'function') return image.decode().catch(() => {});
    if (image.complete) return Promise.resolve();
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }
  function loadImage(url) {
    const image = new Image();
    image.src = url;
    return decode(image).then(() => image);
  }
  const textureReady = loadImage('/images/cork-seamless.jpg').then(image => {
    if (image.naturalWidth) {
      root.style.setProperty('--cork-texture', `url("${image.src}")`);
    }
  });

  async function preparePage() {
    const assets = [textureReady];
    for (const image of document.images) {
      if (image.loading !== 'lazy') assets.push(decode(image));
    }
    // Include the collage name and any other images painted by CSS.
    const backgrounds = new Set();
    for (const element of document.querySelectorAll('body, body *')) {
      const background = getComputedStyle(element).backgroundImage;
      for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        backgrounds.add(match[1]);
      }
    }
    for (const url of backgrounds) assets.push(loadImage(url));
    if (document.fonts) assets.push(document.fonts.ready);
    await Promise.allSettled(assets);
    requestAnimationFrame(() => requestAnimationFrame(reveal));
  }
  document.addEventListener('DOMContentLoaded', () => {
    preparePage().catch(reveal);
  }, { once: true });
})();
