(() => {
  const root = document.documentElement;
  const sessionKey = 'isobel-visited';
  let firstVisit = true;
  try {
    firstVisit = sessionStorage.getItem(sessionKey) !== '1';
    sessionStorage.setItem(sessionKey, '1');
  } catch (_) { /* Browsing still works when storage is unavailable. */ }
  const internalNavigation = document.referrer && new URL(document.referrer).origin === location.origin;
  const navigation = performance.getEntriesByType('navigation')[0];
  const eligible = location.pathname === '/' && firstVisit && !internalNavigation && navigation?.type !== 'back_forward';
  let finished = false;
  let showTimer;
  let deadline;
  root.classList.add(eligible ? 'site-pending' : 'site-instant');
  root.style.setProperty('--cork-texture', 'none');

  function reveal() {
    if (finished) return;
    finished = true;
    clearTimeout(showTimer);
    clearTimeout(deadline);
    const wasVisible = root.classList.contains('site-loading');
    if (wasVisible) root.classList.add('site-revealing');
    root.classList.remove('site-pending', 'site-loading');
    setTimeout(() => {
      root.classList.remove('site-revealing');
      document.querySelector('.site-loader')?.remove();
    }, wasVisible ? 200 : 0);
  }
  if (eligible) {
    showTimer = setTimeout(() => {
      if (finished) return;
      root.classList.add('site-loading');
      document.dispatchEvent(new Event('show-site-loader'));
    }, 700);
    // Slow or failed downloads must not block the site indefinitely.
    deadline = setTimeout(reveal, 4000);
  }
  window.addEventListener('pageshow', event => { if (event.persisted) reveal(); });

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
  const textureReady = loadImage('/images/cork-seamless.webp').then(image => {
    if (image.naturalWidth) root.style.setProperty('--cork-texture', `url("${image.src}")`);
  });

  async function preparePage() {
    if (!eligible || finished) { reveal(); return; }
    const assets = [textureReady, loadImage('/images/isobel-bartels-logo.webp')];
    // Only wait for images in the initial viewport, never the entire gallery.
    for (const image of document.querySelectorAll('body > :not(.site-loader) img')) {
      const rect = image.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0 && rect.width > 0) {
        image.loading = 'eager';
        assets.push(decode(image));
      }
    }
    await Promise.allSettled(assets);
    reveal();
  }
  document.addEventListener('DOMContentLoaded', () => { preparePage().catch(reveal); }, { once: true });
})();
