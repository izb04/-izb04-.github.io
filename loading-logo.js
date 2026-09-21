// A traveling wave keeps the original collage intact, including its paper edges.
(() => {
  let started = false;
  function startWave() {
  if (started) return;
  started = true;
  const host = document.querySelector('.site-loader-logo');
  if (!host) return;
  const original = host.querySelector('img');
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 -60 2172 844');
  svg.setAttribute('aria-hidden', 'true');
  const slices = 96;
  const width = 2172 / slices;
  for (let i = 0; i < slices; i++) {
    const wave = document.createElementNS(ns, 'g');
    wave.classList.add('logo-wave');
    wave.style.setProperty('--wave-delay', `${-2.4 - i * 0.014}s`);
    const slice = document.createElementNS(ns, 'svg');
    slice.setAttribute('x', String(i * width));
    slice.setAttribute('y', '0');
    slice.setAttribute('width', String(width + 0.5));
    slice.setAttribute('height', '724');
    slice.setAttribute('viewBox', `${i * width} 0 ${width + 0.5} 724`);
    slice.setAttribute('overflow', 'hidden');
    const image = document.createElementNS(ns, 'image');
    image.setAttribute('href', '/images/isobel-bartels-logo.webp');
    image.setAttribute('width', '2172');
    image.setAttribute('height', '724');
    slice.append(image);
    wave.append(slice);
    svg.append(wave);
  }
  // Keep a static logo if decoding fails or motion is disabled.
  const ready = original.decode ? original.decode() : Promise.resolve();
  ready.then(() => {
    if (host.isConnected) host.replaceChildren(svg);
  }).catch(() => {});
  }
  if (document.documentElement.classList.contains('site-loading')) startWave();
  else document.addEventListener('show-site-loader', startWave, { once: true });
})();
