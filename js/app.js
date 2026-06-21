let cart = JSON.parse(localStorage.getItem("cart") || "{}");
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let currentList = PRODUCTS;
let activeCategory = "Todos";

// ── DOM refs ──
const countEl = document.getElementById("count");
const countMobileEl = document.getElementById("countMobile");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");

// ── Persistence ──
function save() {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("favs", JSON.stringify(favs));
  syncCount();
  updateCart();
}

function syncCount() {
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  countEl.textContent = n;
  countMobileEl.textContent = n;
}

// ── Image viewer ──
function showImg(src) {
  viewerImg.src = src;
  viewer.classList.add("open");
}
document.getElementById("closeViewer").onclick = () =>
  viewer.classList.remove("open");

// ── Cart sidebar ──
function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
}
function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
}
document.getElementById("cartBtn").onclick = openCart;
document.getElementById("cartBtnMobile").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
document.getElementById("cartOverlay").onclick = closeCart;

// ── Home button ──
function goHome() {
  document.getElementById("search").value = "";
  filterCat("Todos");
}
document.getElementById("homeBtn").onclick = goHome;
document.getElementById("homeBtnMobile").onclick = goHome;

// ── Render products ──
function render(list = currentList) {
  document.getElementById("products").innerHTML = list.map(renderCard).join("");
}

function renderCard(p) {
  const isFav = favs.includes(p.id);
  const price = "R$ " + p.price.toFixed(2).replace(".", ",");
  return `
<div class="dcl-card">
  <div class="dcl-card-img" onclick="showImg('${p.image}')">
    <img src="${p.image}" alt="${p.name}" loading="lazy" />
    <button
      class="dcl-card-fav${isFav ? " is-fav" : ""}"
      onclick="toggleFav(${p.id}); event.stopPropagation()"
      title="${isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
    >${isFav ? "❤️" : "🤍"}</button>
  </div>
  <div class="dcl-card-body">
    <div class="dcl-card-cat">${p.category}</div>
    <div class="dcl-card-name">${p.name}</div>
    <div class="dcl-card-price">${price}</div>
  </div>
  <div class="dcl-card-footer">
    <button class="dcl-add-btn" onclick="addCart(${p.id})">
      <i class="ph ph-shopping-cart"></i> Adicionar
    </button>
  </div>
</div>`;
}

// ── Favorites ──
function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  save();
  render();
}

// ── Cart CRUD ──
function addCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
}
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  save();
}
function removeFromCart(id) {
  delete cart[id];
  save();
}

// ── Cart render ──
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");

  const keys = Object.keys(cart);
  if (keys.length === 0) {
    cartItems.innerHTML = `
<div class="dcl-cart-empty">
  <i class="ph ph-shopping-cart"></i>
  <p>Seu carrinho está vazio.</p>
</div>`;
    if (cartTotalEl) cartTotalEl.textContent = "R$ 0,00";
    return;
  }

  let total = 0;
  cartItems.innerHTML = keys
    .map((id) => {
      const q = cart[id];
      const p = PRODUCTS.find((x) => x.id == id);
      if (!p) return "";
      const sub = p.price * q;
      total += sub;
      const priceStr = p.price.toFixed(2).replace(".", ",");
      const subStr = sub.toFixed(2).replace(".", ",");
      return `
<div class="dcl-cart-item">
  <div class="dcl-item-info">
    <div class="dcl-item-name">${p.name}</div>
    <div class="dcl-item-unit">R$ ${priceStr} × ${q}</div>
    <div class="dcl-item-sub">R$ ${subStr}</div>
    <div class="dcl-qty-row">
      <button class="dcl-qty-btn" onclick="changeQty(${id}, -1)">−</button>
      <span class="dcl-qty-num">${q}</span>
      <button class="dcl-qty-btn" onclick="changeQty(${id}, 1)">+</button>
    </div>
  </div>
  <button class="dcl-remove-btn" onclick="removeFromCart(${id})" title="Remover item">
    <i class="ph ph-trash"></i>
  </button>
</div>`;
    })
    .join("");

  if (cartTotalEl)
    cartTotalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// ── Search ──
document.getElementById("search").oninput = (e) => {
  const t = e.target.value.toLowerCase();
  const base =
    activeCategory === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);
  currentList = base.filter((p) => p.name.toLowerCase().includes(t));
  render();
};

// ── Category filters ──
const cats = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
document.getElementById("filters").innerHTML = cats
  .map(
    (c) =>
      `<button class="dcl-filter-btn${c === "Todos" ? " active" : ""}" onclick="filterCat('${c}')">${c}</button>`,
  )
  .join("");

function filterCat(c) {
  activeCategory = c;
  currentList =
    c === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === c);
  document
    .querySelectorAll(".dcl-filter-btn")
    .forEach((btn) => btn.classList.toggle("active", btn.textContent === c));
  render();
}

// ── WhatsApp ──
document.getElementById("sendWhats").onclick = () => {
  let msg = "Olá! Tenho interesse nos seguintes produtos:\n\n";
  let total = 0;
  Object.entries(cart).forEach(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id == id);
    if (p) {
      const sub = p.price * q;
      total += sub;
      msg += `• *${p.name}*\n  Qtd: ${q} × R$ ${p.price.toFixed(2).replace(".", ",")} = R$ ${sub.toFixed(2).replace(".", ",")}\n\n`;
    }
  });
  msg += `*Total a pagar: R$ ${total.toFixed(2).replace(".", ",")}*`;
  open("https://wa.me/5519997811408?text=" + encodeURIComponent(msg), "_blank");
};

// ── Init ──
syncCount();
updateCart();
render();
