// === БАЗОВЫЙ URL СЕРВЕРА ===
const API_URL = "http://localhost:3000/api";

// === УВЕДОМЛЕНИЯ ===
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "🍰"}</span><span>${message}</span>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2500);
}

// === АВТОРИЗАЦИЯ ===
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("sweeter_current_user") || "null");
}

function setCurrentUser(user) {
  localStorage.setItem("sweeter_current_user", JSON.stringify(user));
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logout() {
  localStorage.removeItem("sweeter_current_user");
  showNotification("Вы вышли из аккаунта", "info");
  setTimeout(() => (location.href = "index.html"), 500);
}

function requireAuth(action) {
  if (!isLoggedIn()) {
    showNotification(`Чтобы ${action}, нужно войти в аккаунт`, "error");
    setTimeout(() => (location.href = "login.html"), 1000);
    return false;
  }
  return true;
}

// === ОБНОВЛЕНИЕ ШАПКИ ===
function updateHeader() {
  const currentUser = getCurrentUser();
  const profileLink = document.querySelector('nav a[href="profile.html"]');
  const orderLink = document.querySelector('nav a[href="order.html"]');
  const chatLink = document.querySelector('nav a[href="chat.html"]');

  if (currentUser) {
    if (profileLink) profileLink.innerHTML = `👤 ${currentUser.name}`;
    if (orderLink) orderLink.style.display = "inline-block";
    if (chatLink) chatLink.style.display = "inline-block";
  } else {
    if (profileLink) {
      profileLink.innerHTML = `👤 Профиль`;
      profileLink.href = "login.html";
    }
    if (orderLink) orderLink.style.display = "none";
    if (chatLink) chatLink.style.display = "none";
  }
}

// === API ЗАПРОСЫ ===
async function apiRequest(url, method, data) {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Ошибка запроса");
    return result;
  } catch (error) {
    showNotification(error.message, "error");
    throw error;
  }
}

// === КАТАЛОГ ТОВАРОВ ===
const products = [
  {
    id: 1,
    name: "Медовик",
    price: 1200,
    image: "images/medovik.jpg",
    category: "Торты",
  },
  {
    id: 2,
    name: "Наполеон",
    price: 1300,
    image: "images/napoleon.jpg",
    category: "Торты",
  },
  {
    id: 3,
    name: "Красный бархат",
    price: 1500,
    image: "images/red-velvet.jpg",
    category: "Торты",
  },
  {
    id: 4,
    name: "Чизкейк",
    price: 1400,
    image: "images/cheesecake.jpg",
    category: "Торты",
  },
  {
    id: 5,
    name: "Капкейк ванильный",
    price: 350,
    image: "images/cupcake-vanilla.jpg",
    category: "Капкейки",
  },
  {
    id: 6,
    name: "Капкейк шоколадный",
    price: 380,
    image: "images/cupcake-chocolate.jpg",
    category: "Капкейки",
  },
  {
    id: 7,
    name: "Печенье овсяное",
    price: 250,
    image: "images/cookie-oatmeal.jpg",
    category: "Печенье",
  },
  {
    id: 8,
    name: "Печенье шоколадное",
    price: 280,
    image: "images/cookie-chocolate.jpg",
    category: "Печенье",
  },
  {
    id: 9,
    name: "Эклер",
    price: 180,
    image: "images/eclair.jpg",
    category: "Пирожные",
  },
];

// === КОРЗИНА ===
function getCart() {
  return JSON.parse(localStorage.getItem("sweeter_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("sweeter_cart", JSON.stringify(cart));
  updateCartUI();
  updateAllQuantitySelectors();
}

function addToCart(name, price, quantity = 1) {
  if (!requireAuth("добавить товар в корзину")) return false;
  let cart = getCart();
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.quantity += quantity;
  else cart.push({ name, price, quantity });
  saveCart(cart);
  showNotification(`🍰 ${name} добавлен в корзину!`, "success");
  return true;
}

function updateCartItemQuantity(name, newQuantity) {
  if (!requireAuth("изменить количество")) return;
  if (newQuantity <= 0) return removeFromCart(name);
  let cart = getCart();
  const item = cart.find((i) => i.name === name);
  if (item) item.quantity = newQuantity;
  saveCart(cart);
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter((item) => item.name !== name);
  saveCart(cart);
  showNotification(`🗑️ ${name} удалён из корзины`, "info");
}

function updateCartUI() {
  const cart = getCart();
  const cartItemsDiv = document.getElementById("cart-items");
  const cartCountSpan = document.getElementById("cart-count");
  const totalSpan = document.getElementById("cart-total");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  if (cartCountSpan) cartCountSpan.textContent = itemCount;
  if (cartItemsDiv) {
    if (cart.length === 0) {
      cartItemsDiv.innerHTML =
        '<div style="text-align:center; padding:20px;">Корзина пуста</div>';
      if (totalSpan) totalSpan.textContent = "0";
      return;
    }
    cartItemsDiv.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartItemQuantity('${item.name}', ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity('${item.name}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price * item.quantity} ₽</div>
                <button class="delete-btn" onclick="removeFromCart('${item.name}')">🗑️</button>
            </div>
        `,
      )
      .join("");
  }
  if (totalSpan) totalSpan.textContent = total;
}

function toggleCart() {
  const modal = document.getElementById("cart-modal");
  if (modal) modal.classList.toggle("show");
}

function getQuantityFromCart(productName) {
  const cart = getCart();
  return cart.find((i) => i.name === productName)?.quantity || 0;
}

function updateAllQuantitySelectors() {
  products.forEach((p) => {
    const key = p.name.replace(/\s/g, "-");
    const quantity = getQuantityFromCart(p.name);
    const btnWrapper = document.getElementById(`btn-wrapper-${key}`);
    const selector = document.getElementById(`quantity-selector-${key}`);
    const qtySpan = document.getElementById(`qty-${key}`);
    if (!btnWrapper || !selector) return;
    if (quantity > 0) {
      btnWrapper.style.display = "none";
      selector.style.display = "flex";
      if (qtySpan) qtySpan.textContent = quantity;
    } else {
      btnWrapper.style.display = "flex";
      selector.style.display = "none";
      if (qtySpan) qtySpan.textContent = "1";
    }
  });
}

function changeQuantity(productName, price, delta, key) {
  if (!requireAuth("изменить количество")) return;
  const currentQuantity = getQuantityFromCart(productName);
  let newQuantity = currentQuantity + delta;
  if (newQuantity < 0) newQuantity = 0;
  if (newQuantity === 0) removeFromCart(productName);
  else {
    let cart = getCart();
    const existing = cart.find((item) => item.name === productName);
    if (existing) existing.quantity = newQuantity;
    else cart.push({ name: productName, price, quantity: newQuantity });
    saveCart(cart);
    showNotification(`🍰 ${productName}: ${newQuantity} шт.`, "success");
  }
  const qtySpan = document.getElementById(`qty-${key}`);
  if (qtySpan) qtySpan.textContent = newQuantity > 0 ? newQuantity : 1;
  if (newQuantity === 0) {
    const btnWrapper = document.getElementById(`btn-wrapper-${key}`);
    const selector = document.getElementById(`quantity-selector-${key}`);
    if (btnWrapper) btnWrapper.style.display = "flex";
    if (selector) selector.style.display = "none";
  }
}

function loadProducts(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let productsToShow = limit ? products.slice(0, limit) : products;
  container.innerHTML = productsToShow
    .map((p) => {
      const key = p.name.replace(/\s/g, "-");
      const quantityInCart = getQuantityFromCart(p.name);
      const showSelector = quantityInCart > 0;
      return `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price">${p.price} ₽</div>
                <div id="btn-wrapper-${key}" class="cart-btn-wrapper" style="display: ${showSelector ? "none" : "flex"}; justify-content: center;">
                    <button class="add-to-cart-btn" onclick="changeQuantity('${p.name}', ${p.price}, 1, '${key}')">🛒 В корзину</button>
                </div>
                <div id="quantity-selector-${key}" class="quantity-selector" style="display: ${showSelector ? "flex" : "none"}; justify-content: center; align-items: center; gap: 15px; margin-top: 10px;">
                    <button class="quantity-btn" onclick="changeQuantity('${p.name}', ${p.price}, -1, '${key}')">−</button>
                    <span class="quantity-value" id="qty-${key}">${quantityInCart || 1}</span>
                    <button class="quantity-btn" onclick="changeQuantity('${p.name}', ${p.price}, 1, '${key}')">+</button>
                </div>
            </div>
        `;
    })
    .join("");
}

// === КАТЕГОРИИ ===
function filterCategory(category) {
  const filtered = products.filter((p) => p.category === category);
  if (filtered.length) {
    showNotification(
      `🍰 В категории «${category}»: ${filtered.map((p) => p.name).join(", ")}`,
      "info",
    );
  } else {
    showNotification(`В категории «${category}» пока нет товаров`, "error");
  }
}

// === ОТЗЫВЫ ===
async function submitReview() {
  if (!requireAuth("оставить отзыв")) return;
  const text = document.getElementById("review-text")?.value.trim();
  const author = document.getElementById("review-author")?.value.trim();
  const rating = document.getElementById("review-rating")?.value || 5;
  const currentUser = getCurrentUser();
  if (!text || !author)
    return showNotification("Заполните текст отзыва и имя!", "error");
  try {
    await apiRequest("/reviews", "POST", {
      author,
      email: currentUser?.email,
      text,
      rating: parseInt(rating),
    });
    document.getElementById("review-text").value = "";
    document.getElementById("review-author").value = "";
    if (document.getElementById("review-rating"))
      document.getElementById("review-rating").value = 5;
    showNotification(
      "Спасибо за отзыв! Он будет опубликован после проверки.",
      "success",
    );
  } catch (error) {
    console.error(error);
  }
}

async function loadPublishedReviews() {
  try {
    const reviews = await apiRequest("/reviews/published", "GET");
    const container = document.getElementById("reviews-grid");
    if (!container) return;

    if (!reviews.length) {
      container.innerHTML =
        '<div style="text-align:center; padding:40px;">✨ Пока нет опубликованных отзывов. Будьте первым!</div>';
      return;
    }

    container.innerHTML = reviews
      .map(
        (r) => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${(r.author || "А").charAt(0).toUpperCase()}</div>
                    <div class="review-info">
                        <div class="review-author">${escapeHtml(r.author)}</div>
                        <div class="review-date">${formatDate(r.date)}</div>
                        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                    </div>
                </div>
                <div class="review-text">«${escapeHtml(r.text)}»</div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error(error);
  }
}

// === ЧАТ ===
function sendMessage() {
  if (!requireAuth("написать в чат")) return;
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;
  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML += `<div class="message user">${escapeHtml(message)}</div>`;
  input.value = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  setTimeout(() => {
    let reply = getBakerReply(message);
    messagesDiv.innerHTML += `<div class="message baker">${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 500);
}

function getBakerReply(message) {
  const msg = message.toLowerCase();
  if (msg.includes("цена") || msg.includes("стоит"))
    return "💰 Цены указаны в карточке товара! От 180 до 1500 ₽.";
  if (msg.includes("доставк"))
    return "🚚 Доставка по городу — 200 ₽, от 2000 ₽ — бесплатно!";
  if (msg.includes("состав"))
    return "📜 Все десерты из натуральных продуктов. Уточняйте у кондитера!";
  if (msg.includes("аллерг") || msg.includes("орех"))
    return "🥜 Предупредите об аллергии — подберём безопасный вариант!";
  if (msg.includes("завтра"))
    return "📅 Да, принимаем заказы на завтра! Свяжемся для уточнения.";
  if (msg.includes("сахар")) return "🍬 Да, можем приготовить без сахара 👍";
  return "💛 Спасибо за вопрос! Напишу кондитеру, он скоро ответит.";
}

function sendQuickMessage(text) {
  if (!requireAuth("написать в чат")) return;
  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML += `<div class="message user">${text}</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  setTimeout(() => {
    messagesDiv.innerHTML += `<div class="message baker">${getBakerReply(text)}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 300);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, (m) =>
    m === "&" ? "&amp;" : m === "<" ? "&lt;" : "&gt;",
  );
}

// === ЗАКАЗ ===
async function submitOrder() {
  if (!requireAuth("оформить заказ")) return;
  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const comment = document.getElementById("comment")?.value;
  const currentUser = getCurrentUser();
  if (!name || !phone || !address)
    return showNotification("Заполните все поля!", "error");
  const cart = getCart();
  if (!cart.length) return showNotification("Корзина пуста!", "error");
  try {
    await apiRequest("/orders", "POST", {
      user_email: currentUser?.email,
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      address,
      phone,
      comment,
    });
    localStorage.removeItem("sweeter_cart");
    updateCartUI();
    updateAllQuantitySelectors();
    showNotification(`✅ Заказ оформлен, ${name}!`, "success");
    setTimeout(() => (location.href = "index.html"), 1500);
  } catch (error) {
    console.error(error);
  }
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener("DOMContentLoaded", function () {
  updateCartUI();
  updateHeader();
  loadPublishedReviews();

  // Загрузка товаров
  if (document.getElementById("popular-grid")) loadProducts("popular-grid", 3);
  if (document.getElementById("catalog-grid")) loadProducts("catalog-grid");

  window.addEventListener("storage", function (e) {
    if (e.key === "sweeter_cart") updateCartUI();
  });
});

// === ФОРМАТИРОВАНИЕ ДАТЫ ===
function formatDate(isoString) {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString("ru", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
