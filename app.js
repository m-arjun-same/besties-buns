// Lenis smooth scroll — same config as reference: lerp .085, wheelMultiplier .9, syncTouch false
if (window.Lenis) {
  new window.Lenis({ autoRaf: true, anchors: true, allowNestedScroll: true, smoothWheel: true, syncTouch: false, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1 });
}

// Reveal animations (data-anim in reference)
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-vidno'); io.unobserve(e.target); } }), { rootMargin: '80px' });
document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

// Intro labels parallax — reference offsets: auntie 42/-68/10, tante -52/56/-9, teta 38/70/8, my -36/-58/-8
(() => {
  const sec = document.querySelector('.tf-uvod'); if (!sec) return;
  const labels = [
    { el: sec.querySelector('.tf-uvod__oznaka--auntie'), x: 42, y: -68, r: 10 },
    { el: sec.querySelector('.tf-uvod__oznaka--tante'), x: -52, y: 56, r: -9 },
    { el: sec.querySelector('.tf-uvod__oznaka--teta'), x: 38, y: 70, r: 8 },
    { el: sec.querySelector('.tf-uvod__oznaka--my'), x: -36, y: -58, r: -8 },
  ].filter(i => i.el);
  let raf = 0;
  const render = () => { raf = 0; const rect = sec.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
    labels.forEach(i => { i.el.style.transform = `translate(${i.x * p}px, ${i.y * p}px) rotate(${i.r * p}deg)`; }); };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  addEventListener('scroll', schedule, { passive: true }); render();
})();

// Marquee — scroll-driven like reference: clones group, shift = progress * period * 1.2
document.querySelectorAll('.tf-marquee__sled').forEach((track, idx) => {
  const group = track.querySelector('.tf-marquee__skupina'); if (!group) return;
  const period = group.getBoundingClientRect().width;
  for (let i = 0; i < 3; i++) { const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
  track.style.display = 'flex'; track.style.width = 'max-content';
  let raf = 0;
  const render = () => { raf = 0; const sec = track.closest('.tf-marquee'), rect = sec.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
    const shift = (p * period * 1.2) % period;
    track.style.transform = idx === 0 ? `translate3d(${-shift}px,0,0)` : `translate3d(${shift - period}px,0,0)`; };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  addEventListener('scroll', schedule, { passive: true }); render();
});

// Product sliders — same engine pattern for all 4 sections: selector, prev/next, status, current name
document.querySelectorAll('[data-slider]').forEach(sec => {
  const track = sec.querySelector('[data-track]');
  const slides = [...track.children];
  const status = sec.querySelector('[data-status]');
  const current = sec.querySelector('[data-current]');
  const selector = sec.querySelector('[data-selector]');
  let i = 0;
  slides.forEach((s, n) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = s.dataset.name; b.addEventListener('click', () => go(n)); selector.appendChild(b); });
  const btns = [...selector.children];
  function go(n) { i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    status.textContent = `${i + 1} / ${slides.length}`;
    current.innerHTML = slides[i].dataset.name;
    btns.forEach((b, m) => b.classList.toggle('is-aktiven', m === i)); }
  sec.querySelector('[data-prev]').addEventListener('click', () => go(i - 1));
  sec.querySelector('[data-next]').addEventListener('click', () => go(i + 1));
  go(0);
});

// CART — one cart for all sections, stored in localStorage
(() => {
  const KEY = 'bb_cart_v1';
  let cart = {}; try { cart = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { cart = {}; }
  const drawer = document.querySelector('[data-cart]'); if (!drawer) return;
  const backdrop = document.querySelector('[data-cart-backdrop]');
  const list = drawer.querySelector('[data-cart-list]');
  const empty = drawer.querySelector('[data-cart-empty]');
  const totalEl = drawer.querySelector('[data-cart-total]');
  const countEl = document.querySelector('[data-cart-count]');
  const openBtn = document.querySelector('[data-cart-open]');
  const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
  const total = () => Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const clean = s => { const d = document.createElement('div'); d.innerHTML = s; return d.textContent; };
  function render() {
    countEl.textContent = total(); totalEl.textContent = total();
    list.innerHTML = ''; empty.style.display = total() ? 'none' : 'block';
    Object.entries(cart).forEach(([name, item]) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="ime">${name}<small>${item.section}</small></span>
        <button type="button" aria-label="Less">−</button><strong>${item.qty}</strong>
        <button type="button" aria-label="More">+</button>
        <button type="button" class="odstrani" aria-label="Remove">×</button>`;
      const [less, more, del] = li.querySelectorAll('button');
      less.onclick = () => { item.qty--; if (item.qty <= 0) delete cart[name]; save(); render(); };
      more.onclick = () => { item.qty++; save(); render(); };
      del.onclick = () => { delete cart[name]; save(); render(); };
      list.appendChild(li);
    });
  }
  const open = () => { drawer.hidden = false; backdrop.hidden = false; };
  const close = () => { drawer.hidden = true; backdrop.hidden = true; };
  openBtn.addEventListener('click', open);
  drawer.querySelector('[data-cart-close]').addEventListener('click', close);
  backdrop.addEventListener('click', close);
  drawer.querySelector('[data-cart-clear]').addEventListener('click', () => { cart = {}; save(); render(); });
  document.querySelectorAll('[data-slider]').forEach(sec => {
    const qtyEl = sec.querySelector('[data-qty]'); let qty = 1;
    sec.querySelector('[data-qty-minus]').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; });
    sec.querySelector('[data-qty-plus]').addEventListener('click', () => { qty = Math.min(99, qty + 1); qtyEl.textContent = qty; });
    sec.addEventListener('click', e => { if (e.target.closest('[data-prev],[data-next],.tf-produkt__izbirnik')) setTimeout(() => { qty = 1; qtyEl.textContent = 1; }, 60); });
    const addBtn = sec.querySelector('[data-add]');
    addBtn.addEventListener('click', () => {
      const name = clean(sec.querySelector('[data-current]').innerHTML);
      const section = clean(sec.querySelector('.tf-produkt__naslov').textContent).replace(/\s+/g, ' ').trim();
      if (!cart[name]) cart[name] = { qty: 0, section };
      cart[name].qty += qty; save(); render();
      openBtn.classList.remove('is-utripa'); void openBtn.offsetWidth; openBtn.classList.add('is-utripa');
      const old = addBtn.textContent; addBtn.textContent = 'Added ✓'; setTimeout(() => addBtn.textContent = old, 1200);
    });
  });
  render();
})();
