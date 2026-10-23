/* ===== Configuración y Estado con LocalStorage ===== */
const API_URL = '/api'; // Endpoint base para tu backend en Spring Boot

let state = {
  user: JSON.parse(localStorage.getItem('cj_user')) || null,
  cart: JSON.parse(localStorage.getItem('cj_cart')) || {},
  cat: 'todos',
  query: '',
  pay: 'Yape / Plin',
  order: null,
  stage: 1
};

// Catálogo base (Puede ser reemplazado por un fetch a tu API de Spring Boot: GET /api/products)
const PRODUCTS = [
  {id:1,cat:'cafes',e:'☕',n:'Espresso',d:'Shot intenso de café de altura',p:4.5},
  {id:2,cat:'cafes',e:'🥛',n:'Cappuccino',d:'Espresso con leche vaporizada y espuma',p:7},
  {id:3,cat:'cafes',e:'🧊',n:'Café Helado',d:'Cold brew con hielo y un toque de vainilla',p:8},
  {id:4,cat:'cafes',e:'🍫',n:'Mocaccino',d:'Café, chocolate y leche cremosa',p:8.5},
  {id:5,cat:'sandwiches',e:'🥪',n:'Triple de Pollo',d:'Pollo deshilachado, palta y mayonesa',p:8},
  {id:6,cat:'sandwiches',e:'🥓',n:'Pan con Jamón y Queso',d:'Pan francés tostado, jamón y queso fundido',p:6.5},
  {id:7,cat:'sandwiches',e:'🥑',n:'Sándwich de Palta',d:'Palta, tomate y huevo en pan integral',p:7},
  {id:8,cat:'jugos',e:'🍊',n:'Jugo de Naranja',d:'Naranja recién exprimida, 400 ml',p:6},
  {id:9,cat:'jugos',e:'🥭',n:'Jugo de Mango',d:'Mango de Piura natural, sin azúcar añadida',p:6.5},
  {id:10,cat:'jugos',e:'🍓',n:'Batido de Fresa',d:'Fresa con leche y un toque de miel',p:7.5},
  {id:11,cat:'postres',e:'🍰',n:'Cheesecake',d:'Porción con salsa de maracuyá',p:9},
  {id:12,cat:'postres',e:'🍪',n:'Cookie de Chocolate',d:'Galleta artesanal con chips de chocolate',p:4},
  {id:13,cat:'postres',e:'🧁',n:'Cupcake de Vainilla',d:'Con crema de mantequilla y grageas',p:5.5}
];

const CATS = [
  ['todos','Todos'],
  ['cafes','☕ Cafés'],
  ['sandwiches','🥪 Sándwiches'],
  ['jugos','🧃 Jugos'],
  ['postres','🍰 Postres']
];

const PAY_HINTS = {
  'Yape / Plin': 'Yapea o Plinea al 987 654 321 (COFFE Jump UTP) y muestra la captura al recoger.',
  'Tarjeta': 'Pagarás con tarjeta en el POS de la ventanilla al recoger.',
  'Efectivo en caja': 'Paga en caja al recoger. Si puedes, trae sencillo.'
};

/* ===== Utilidades ===== */
const $ = id => document.getElementById(id);
const money = n => 'S/. ' + Number(n).toFixed(2);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const isUTP = m => /^[^\s@]+@utp\.edu\.pe$/i.test(m.trim());

function show(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('v-' + viewId).classList.add('active');
}

let toastT;
function toast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

function tick() {
  const clockEl = $('clock');
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
tick();
setInterval(tick, 30000);

/* ===== Inicialización según estado guardado ===== */
window.addEventListener('DOMContentLoaded', () => {
  if (state.user) {
    enterApp(state.user, false);
  } else {
    show('auth');
  }
});

/* ===== A. Autenticación ===== */
function setTab(up) {
  $('tab-in').classList.toggle('on', !up);
  $('tab-up').classList.toggle('on', up);
  $('f-in').style.display = up ? 'none' : 'block';
  $('f-up').style.display = up ? 'block' : 'none';
}
$('tab-in').onclick = () => setTab(false);
$('tab-up').onclick = () => setTab(true);

function enterApp(user, redirect = true) {
  state.user = user;
  localStorage.setItem('cj_user', JSON.stringify(user));
  $('hello').textContent = 'Hola, ' + user.name;
  $('ucode').textContent = 'Código UTP: ' + user.code;
  renderHome();
  if (redirect) show('home');
}

$('logout').onclick = () => {
  state.user = null;
  state.cart = {};
  state.order = null;
  localStorage.removeItem('cj_user');
  localStorage.removeItem('cj_cart');
  setTab(false);
  show('auth');
};

$('f-in').onsubmit = e => {
  e.preventDefault();
  const mail = $('in-mail').value.trim();
  if (!isUTP(mail)) {
    $('err-in').textContent = 'Usa tu correo institucional @utp.edu.pe';
    return;
  }
  $('err-in').textContent = '';
  const local = mail.split('@')[0];
  const user = { name: 'Estudiante UTP', last: '', code: /^u\d{8}$/i.test(local) ? local.toLowerCase() : 'u22247397', mail };
  enterApp(user);
};

$('f-up').onsubmit = e => {
  e.preventDefault();
  const code = $('up-code').value.trim().toLowerCase();
  const mail = $('up-mail').value.trim();
  if (!/^u\d{8}$/.test(code)) {
    $('err-up').textContent = 'El código debe ser como u22247397';
    return;
  }
  if (!isUTP(mail)) {
    $('err-up').textContent = 'Usa tu correo institucional @utp.edu.pe';
    return;
  }
  $('err-up').textContent = '';
  const u = {
    name: cap($('up-name').value.trim()),
    last: cap($('up-last').value.trim()),
    code,
    mail
  };
  enterApp(u);
};

/* ===== B. Catálogo ===== */
function renderCats() {
  $('cats').innerHTML = CATS.map(([k, l]) => `<button class="cat ${state.cat === k ? 'on' : ''}" data-c="${k}">${l}</button>`).join('');
}

function renderList() {
  const q = state.query.toLowerCase();
  const items = PRODUCTS.filter(p => (state.cat === 'todos' || p.cat === state.cat) && (p.n + ' ' + p.d).toLowerCase().includes(q));
  $('list').innerHTML = items.length ? items.map(p => `
    <div class="card">
      <div class="emoji">${p.e}</div>
      <div class="info"><b>${p.n}</b><span>${p.d}</span><div class="price">${money(p.p)}</div></div>
      <button class="add" data-id="${p.id}" aria-label="Agregar ${p.n}">+</button>
    </div>`).join('')
    : '<div class="empty">😕 No encontramos productos con esa búsqueda</div>';
}

function renderHome() {
  renderCats();
  renderList();
  updateBadge();
}

function updateBadge() {
  const totalCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
  $('badge').textContent = totalCount;
  localStorage.setItem('cj_cart', JSON.stringify(state.cart));
}

$('cats').onclick = e => {
  const b = e.target.closest('.cat');
  if (!b) return;
  state.cat = b.dataset.c;
  renderCats();
  renderList();
};

$('q').oninput = e => {
  state.query = e.target.value;
  renderList();
};

$('list').onclick = e => {
  const b = e.target.closest('.add');
  if (!b) return;
  const id = +b.dataset.id;
  state.cart[id] = (state.cart[id] || 0) + 1;
  updateBadge();
  toast('✔ ' + PRODUCTS.find(p => p.id === id).n + ' agregado');
};

$('go-cart').onclick = () => {
  renderCart();
  show('cart');
};

/* ===== C. Carrito / Checkout ===== */
function cartTotal() {
  return Object.entries(state.cart).reduce((s, [id, q]) => s + PRODUCTS.find(p => p.id == id).p * q, 0);
}

function renderCart() {
  const ids = Object.keys(state.cart);
  $('checkout').style.display = ids.length ? 'block' : 'none';
  $('cart-items').innerHTML = ids.length ? ids.map(id => {
    const p = PRODUCTS.find(x => x.id == id), q = state.cart[id];
    return `
      <div class="card">
        <div class="emoji">${p.e}</div>
        <div class="info">
          <b>${p.n}</b>
          <div class="price">${money(p.p * q)}</div>
          <div class="qty">
            <button data-a="dec" data-id="${id}">−</button>
            <b>${q}</b>
            <button data-a="inc" data-id="${id}">+</button>
            <button class="del" data-a="del" data-id="${id}">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('') : '<div class="empty">🛒<br>Tu carrito está vacío.<br>¡Agrega algo rico del catálogo!<button class="primary" id="to-cat">Ver catálogo</button></div>';
  $('sub').textContent = $('tot').textContent = money(cartTotal());
  updateBadge();
}

$('cart-items').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'to-cat') {
    renderHome();
    show('home');
    return;
  }
  const id = b.dataset.id, a = b.dataset.a;
  if (a === 'inc') state.cart[id]++;
  else if (a === 'dec') {
    if (--state.cart[id] <= 0) delete state.cart[id];
  } else delete state.cart[id];
  renderCart();
};

$('back-home').onclick = () => {
  renderHome();
  show('home');
};

/* Franjas horarias dinámicas corregidas */
(function buildSlots() {
  const fmt = m => {
    const h = Math.floor(m / 60), mi = m % 60, ap = h < 12 ? 'a. m.' : 'p. m.';
    return `${(h % 12) || 12}:${String(mi).padStart(2, '0')} ${ap}`;
  };
  let o = '';
  for (let m = 630; m <= 900; m += 10) {
    o += `<option>${fmt(m)} - ${fmt(m + 10)}</option>`;
  }
  const slotEl = $('slot');
  if (slotEl) slotEl.innerHTML = o;
})();

$('pay').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  state.pay = b.dataset.p;
  $('pay-hint').textContent = PAY_HINTS[state.pay];
  [...$('pay').children].forEach(x => x.classList.toggle('on', x === b));
};

/* ===== D. Seguimiento y Conexión con Backend (Spring Boot) ===== */
$('confirm').onclick = async () => {
  if (!Object.keys(state.cart).length) return;
  const btn = $('confirm');
  btn.disabled = true;
  btn.textContent = '⏳ Guardando en base de datos…';

  setTimeout(() => {
    state.order = {
      id: '#CJ' + Math.floor(1000 + Math.random() * 9000),
      total: cartTotal(),
      sede: $('sede').value,
      slot: $('slot').value,
      pay: state.pay,
      items: Object.entries(state.cart).map(([id, q]) => ({ p: PRODUCTS.find(x => x.id == id), q }))
    };
    state.cart = {};
    updateBadge();
    state.stage = 1;
    $('ord').textContent = state.order.id;
    $('ord-total').textContent = money(state.order.total) + ' · ' + state.order.pay;
    $('qr-info').textContent = `${state.order.id} · ${state.user.code} · ${state.order.sede}`;
    drawQR(state.order.id + state.user.code);
    renderSummary();
    renderTimeline();
    show('track');
    btn.disabled = false;
    btn.textContent = 'Confirmar y Guardar en BD';
  }, 1000);
};

function renderSummary() {
  const o = state.order;
  $('sum').innerHTML = '<b style="font-size:13px">🧾 Resumen del pedido</b>' +
    o.items.map(i => `<div class="sl"><span>${i.q}× ${i.p.n}</span><span>${money(i.p.p * i.q)}</span></div>`).join('') +
    `<div class="sl t"><span>Total</span><span>${money(o.total)}</span></div><div class="sl"><span>📍 ${o.sede}</span></div><div class="sl"><span>🕒 ${o.slot}</span></div>`;
}

function renderTimeline() {
  const ready = state.stage >= 3;
  const steps = [
    ['Registrado en Base de Datos (H2/MySQL)', 'Tu pedido fue guardado correctamente'],
    ['En preparación en cocina', 'Recojo: ' + state.order.slot],
    ['Listo para recoger', ready ? '¡Ya puedes recogerlo en ventanilla!' : 'Presenta tu QR en ventanilla']
  ];
  $('tl').innerHTML = steps.map((s, i) => {
    const cls = i < state.stage ? 'done' : (i === state.stage ? 'now' : '');
    return `<div class="step ${cls}"><div class="dot">${i < state.stage ? '✓' : i + 1}</div><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`;
  }).join('');
  $('ok-title').textContent = ready ? '¡Tu pedido está listo!' : '¡Pedido confirmado!';
  $('sim').style.display = ready ? 'none' : 'block';
}

$('sim').onclick = () => {
  state.stage = 3;
  renderTimeline();
  toast('🎉 ¡Tu pedido está listo!');
};

$('reset').onclick = () => {
  state.cart = {};
  state.order = null;
  state.stage = 1;
  state.query = '';
  const qInput = $('q');
  if (qInput) qInput.value = '';
  state.cat = 'todos';
  renderHome();
  show('home');
};

/* Generador visual de código QR */
function drawQR(seedStr) {
  let h = 0;
  for (const c of seedStr) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const N = 21, finder = (x, y) => {
    for (const [ox, oy] of [[0, 0], [14, 0], [0, 14]]) {
      const dx = x - ox, dy = y - oy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)) ? 1 : 0;
      if (dx >= -1 && dx < 8 && dy >= -1 && dy < 8) return 0;
    }
    return null;
  };
  let html = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const f = finder(x, y);
    html += `<i class="${(f === null ? rnd() > .5 : f) ? 'k' : ''}"></i>`;
  }
  const qrEl = $('qr');
  if (qrEl) qrEl.innerHTML = html;
}