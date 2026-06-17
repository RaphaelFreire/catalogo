let cart = JSON.parse(localStorage.getItem("cart") || "{}");
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
const count = document.getElementById("count");

function save() {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("favs", JSON.stringify(favs));
  updateCart();
}
function showImg(src) {
  viewer.classList.remove("d-none");
  viewerImg.src = src;
}
closeViewer.onclick = () => viewer.classList.add("d-none");

function render(list = PRODUCTS) {
  products.innerHTML = list
    .map(
      (p) => `
<div class='col-6 col-md-4'>
<div class='card h-100'>
<img src='${p.image}' onclick="showImg('${p.image}')">
<div class='card-body'>
<div class='d-flex justify-content-between'><h6>${p.name}</h6><span class='favorite' onclick='toggleFav(${p.id})'>${favs.includes(p.id) ? "❤️" : "🤍"}</span></div>
<div>R$ ${p.price.toFixed(2).replace(".", ",")}</div>
<button class='btn btn-dark w-100 mt-2' onclick='addCart(${p.id})'>Adicionar</button>
</div></div></div>`,
    )
    .join("");
}
function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  save();
  render(currentList);
}
function addCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
}
function changeQty(id, delta) {
  if (cart[id]) {
    cart[id] += delta;
    if (cart[id] <= 0) {
      delete cart[id];
    }
    save();
  }
}
function removeFromCart(id) {
  if (cart[id]) {
    delete cart[id];
    save();
  }
}
function updateCart() {
  const cartTotalEl = document.getElementById("cartTotal");
  count.textContent = Object.values(cart).reduce((a, b) => a + b, 0);

  let total = 0;

  if (Object.keys(cart).length === 0) {
    cartItems.innerHTML =
      "<div class='text-center text-muted py-4'>Seu carrinho está vazio.</div>";
    if (cartTotalEl) cartTotalEl.textContent = "R$ 0,00";
    return;
  }

  cartItems.innerHTML = Object.entries(cart)
    .map(([id, q]) => {
      const p = PRODUCTS.find((x) => x.id == id);
      if (!p) return "";
      const subtotal = p.price * q;
      total += subtotal;

      const priceStr = p.price.toFixed(2).replace(".", ",");
      const subtotalStr = subtotal.toFixed(2).replace(".", ",");

      return `
<div class="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
  <div class="flex-grow-1 me-2" style="min-width: 0;">
    <h6 class="mb-1 text-truncate" title="${p.name}" style="font-size: 0.95rem;">${p.name}</h6>
    <div class="small text-muted">
      Unitário: R$ ${priceStr}<br>
      Total: <strong class="text-dark">R$ ${subtotalStr}</strong>
    </div>
  </div>
  <div class="d-flex align-items-center gap-2">
    <button class="btn btn-sm btn-outline-secondary py-0 px-2 fw-bold" onclick="changeQty(${id}, -1)">-</button>
    <span class="fw-medium">${q}</span>
    <button class="btn btn-sm btn-outline-secondary py-0 px-2 fw-bold" onclick="changeQty(${id}, 1)">+</button>
    <button class="btn btn-sm text-danger p-0 ms-1" onclick="removeFromCart(${id})" title="Remover item">
      <i class="ph ph-trash fs-5"></i>
    </button>
  </div>
</div>`;
    })
    .join("");

  if (cartTotalEl) {
    cartTotalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }
}
let currentList = PRODUCTS;
search.oninput = (e) => {
  const t = e.target.value.toLowerCase();
  currentList = PRODUCTS.filter((p) => p.name.toLowerCase().includes(t));
  render(currentList);
};
const cats = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
filters.innerHTML = cats
  .map(
    (c) =>
      `<button class='btn btn-outline-dark btn-sm' onclick="filterCat('${c}')">${c}</button>`,
  )
  .join("");
function filterCat(c) {
  currentList =
    c === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === c);
  render(currentList);
}
sendWhats.onclick = () => {
  let msg = "Olá! Tenho interesse nos seguintes produtos:\n\n";
  let total = 0;
  Object.entries(cart).forEach(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id == id);
    if (p) {
      const subtotal = p.price * q;
      total += subtotal;
      msg += `• *${p.name}*\n  Qtd: ${q} × R$ ${p.price.toFixed(2).replace(".", ",")} = R$ ${subtotal.toFixed(2).replace(".", ",")}\n\n`;
    }
  });
  msg += `*Total a pagar: R$ ${total.toFixed(2).replace(".", ",")}*`;
  open("https://wa.me/5519997811408?text=" + encodeURIComponent(msg), "_blank");
};
updateCart();
render();

// V4 - Resumo financeiro do carrinho
function gerarResumoFinanceiro() {
  let totalItens = 0,
    totalValor = 0;
  Object.entries(cart).forEach(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id == id);
    if (p) {
      totalItens += q;
      totalValor += p.price * q;
    }
  });
  return { totalItens, totalValor };
}
