/* =========================================================
   Zephyr Cleaning — site settings
   Change these values; the rest of the site updates itself.
   ========================================================= */
const CONFIG = {
  // ⚠️ Placeholder number. Replace with the real WhatsApp number (country code, no + or spaces).
  whatsapp: '971500000000',
  phoneDisplay: '+971 50 000 0000',

  // ⚠️ Placeholder prices in AED. Replace with real prices before going live.
  prices: {
    // Deep clean starting price by property size
    home: { studio: 250, '1br': 350, '2br': 450, '3br': 600, villa4: 900, villa5: 1250 },
    // Multiplier applied to the deep-clean price
    type: { standard: 0.55, deep: 1, move: 1.15 },
    // Carpets & fabrics, per item
    fabric: { sofaSeat: 40, carpetS: 60, carpetL: 120, mattress: 90, chair: 20 },
    fabricMinimum: 150,
    // Hourly cleaners, per cleaner per hour
    hourly: 35,
    materialsPerHour: 10,
  },
};

/* ========================================================= */
document.documentElement.classList.remove('no-js');
const waLink = (t) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Contact details
$$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
$$('.js-tel').forEach((a) => { a.href = `tel:+${CONFIG.whatsapp}`; if (a.textContent.trim().startsWith('+')) a.textContent = CONFIG.phoneDisplay; });
$$('.js-phone').forEach((a) => { a.textContent = CONFIG.phoneDisplay; });

// Header
const header = $('#header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
onScroll(); addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const menu = $('#menu'), nav = $('#nav');
const setMenu = (open) => { nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Accessible tabs helper
function tabs(listEl, onChange) {
  const btns = $$('[role="tab"]', listEl);
  const select = (btn, focus) => {
    btns.forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) btn.focus();
    onChange && onChange(btn);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select(btns[(i + d + btns.length) % btns.length], true); }
    });
  });
  return (key) => select(btns.find((b) => b.dataset.tab === key || b.id.endsWith(key)));
}

/* ---------- Estimator ---------- */
const P = CONFIG.prices;
let mode = 'home';
const sizeLabel = { studio: 'Studio', '1br': '1 bed apartment', '2br': '2 bed apartment', '3br': '3 bed apartment', villa4: '4 bed villa', villa5: '5+ bed villa' };
const typeLabel = { standard: 'Standard clean', deep: 'Deep clean', move: 'Move-in/out clean' };
const fabricLabel = { sofaSeat: 'sofa seat', carpetS: 'small rug', carpetL: 'large carpet', mattress: 'mattress', chair: 'dining chair' };
const counts = {};
$$('.stepper').forEach((s) => { counts[s.dataset.item] = +$('output', s).textContent; });

const round10 = (n) => Math.round(n / 10) * 10;
function compute() {
  if (mode === 'home') {
    const size = $('input[name="size"]:checked').value;
    const type = $('input[name="ctype"]:checked').value;
    return { total: round10(P.home[size] * P.type[type]), text: `${typeLabel[type]} for a ${sizeLabel[size]}` };
  }
  if (mode === 'fabric') {
    const items = Object.keys(fabricLabel).filter((k) => counts[k] > 0);
    const sum = items.reduce((t, k) => t + counts[k] * P.fabric[k], 0);
    const list = items.map((k) => `${counts[k]} ${fabricLabel[k]}${counts[k] > 1 ? 's' : ''}`).join(', ');
    if (!items.length) return { total: 0, text: '', empty: true };
    return { total: Math.max(sum, P.fabricMinimum), text: `Carpet & upholstery cleaning: ${list}`, min: sum < P.fabricMinimum };
  }
  const mat = $('#materials').checked;
  const total = counts.cleaners * counts.hours * (P.hourly + (mat ? P.materialsPerHour : 0));
  return { total, text: `Hourly cleaning: ${counts.cleaners} cleaner${counts.cleaners > 1 ? 's' : ''} for ${counts.hours} hours, ${mat ? 'with' : 'without'} materials` };
}

const totalEl = $('#estTotal'), bookEl = $('#estBook'), noteEl = $('#estSummary');
let last = null;
function render() {
  const r = compute();
  totalEl.textContent = r.total.toLocaleString('en-US');
  if (last !== null && last !== r.total) { totalEl.classList.remove('bump'); void totalEl.offsetWidth; totalEl.classList.add('bump'); }
  last = r.total;
  if (r.empty) {
    noteEl.textContent = 'Add at least one item to see a price.';
    bookEl.setAttribute('aria-disabled', 'true'); bookEl.removeAttribute('href');
    return;
  }
  bookEl.removeAttribute('aria-disabled');
  noteEl.textContent = r.min
    ? `Includes the AED ${P.fabricMinimum} minimum charge. A photo on WhatsApp helps us confirm the exact price.`
    : mode === 'fabric' ? 'Send a photo on WhatsApp and we confirm the exact price.'
    : mode === 'hourly' ? 'Pay only for the hours booked.'
    : 'Starting price for a typical home. We confirm the exact price on WhatsApp.';
  bookEl.href = waLink(`Hi Zephyr Cleaning, I'd like to book.\n\n${r.text}\nEstimate: AED ${r.total}\n\nWhen are you available?`);
  bookEl.target = '_blank'; bookEl.rel = 'noopener';
}

const selectTab = tabs($('.est-tabs'), (btn) => { mode = btn.dataset.tab; render(); });

$$('.stepper').forEach((s) => {
  const key = s.dataset.item, out = $('output', s);
  const min = +(s.dataset.min || 0), max = +(s.dataset.max || 20);
  const [dec, inc] = $$('button', s);
  const sync = () => { out.textContent = counts[key]; dec.disabled = counts[key] <= min; inc.disabled = counts[key] >= max; };
  $$('button', s).forEach((b) => b.addEventListener('click', () => {
    counts[key] = Math.min(max, Math.max(min, counts[key] + +b.dataset.d)); sync(); render();
  }));
  sync();
});
$$('.est input').forEach((i) => i.addEventListener('change', render));
render();

// Services jump into the estimator with presets
$$('[data-goto]').forEach((b) => b.addEventListener('click', () => {
  selectTab(b.dataset.goto);
  if (b.dataset.size) $(`input[name="size"][value="${b.dataset.size}"]`).checked = true;
  if (b.dataset.type) $(`input[name="ctype"][value="${b.dataset.type}"]`).checked = true;
  render();
  $('#estimate').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}));

// Room checklist tabs
tabs($('.room-tabs'));

/* ---------- Booking form ---------- */
const form = $('#bookForm'), err = $('#formError');
$('#area-list').innerHTML = $$('.areas li').map((li) => `<option value="${li.textContent}">`).join('');
const d = new Date();
form.date.min = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const missing = ['name', 'area'].filter((k) => !form[k].value.trim());
  ['name', 'area'].forEach((k) => form[k].classList.toggle('invalid', missing.includes(k)));
  if (missing.length) {
    err.textContent = `Add your ${missing.join(' and ')} so we can confirm the booking.`;
    err.hidden = false; form[missing[0]].focus(); return;
  }
  err.hidden = true;
  let when = '';
  if (form.date.value) {
    const [y, m, dd] = form.date.value.split('-').map(Number);
    when = new Date(y, m - 1, dd).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  if (form.time.value) when += (when ? ', ' : '') + form.time.value;
  const lines = [
    "Hi Zephyr Cleaning, I'd like to book.", '',
    `Service: ${form.service.value}`,
    `Name: ${form.name.value.trim()}`,
    `Area: ${form.area.value.trim()}`,
  ];
  if (when) lines.push(`When: ${when}`);
  if (form.notes.value.trim()) lines.push(`Details: ${form.notes.value.trim()}`);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
});
['name', 'area'].forEach((k) => form[k].addEventListener('input', () => form[k].classList.remove('invalid')));

$('#year').textContent = new Date().getFullYear();
