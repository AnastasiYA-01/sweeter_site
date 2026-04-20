// === УВЕДОМЛЕНИЯ (свои, красивые) ===
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span>${type === "success" ? "✅" : type === "error" ? "❌" : "🍰"}</span>
        <span>${message}</span>
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2500);
}

// === КАТАЛОГ ТОВАРОВ ===
const products = [
  {
    id: 1,
    name: "Медовик",
    price: 1200,
    image: "https://via.placeholder.com/300x200?text=Медовик",
    category: "Торты",
  },
  {
    id: 2,
    name: "Наполеон",
    price: 1300,
    image: "https://via.placeholder.com/300x200?text=Наполеон",
    category: "Торты",
  },
  {
    id: 3,
    name: "Красный бархат",
    price: 1500,
    image: "https://via.placeholder.com/300x200?text=Красный+бархат",
    category: "Торты",
  },
  {
    id: 4,
    name: "Чизкейк",
    price: 1400,
    image: "https://via.placeholder.com/300x200?text=Чизкейк",
    category: "Торты",
  },
  {
    id: 5,
    name: "Капкейк ванильный",
    price: 350,
    image: "https://via.placeholder.com/300x200?text=Капкейк",
    category: "Капкейки",
  },
  {
    id: 6,
    name: "Капкейк шоколадный",
    price: 380,
    image: "https://via.placeholder.com/300x200?text=Капкейк+шок",
    category: "Капкейки",
  },
  {
    id: 7,
    name: "Печенье овсяное",
    price: 250,
    image: "https://via.placeholder.com/300x200?text=Печенье",
    category: "Печенье",
  },
  {
    id: 8,
    name: "Печенье шоколадное",
    price: 280,
    image: "https://via.placeholder.com/300x200?text=Печенье+шок",
    category: "Печенье",
  },
  {
    id: 9,
    name: "Эклер",
    price: 180,
    image: "https://via.placeholder.com/300x200?text=Эклер",
    category: "Пирожные",
  },
];

// === КОРЗИНА (через localStorage) ===
function getCart() {
  return JSON.parse(localStorage.getItem("sweeter_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("sweeter_cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(name, price, quantity = 1) {
  let cart = getCart();
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name, price, quantity });
  }
  saveCart(cart);
  showNotification(`🍰 ${name} добавлен в корзину! x${quantity}`, "success");
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter((item) => item.name !== name);
  saveCart(cart);
  showNotification(`🗑️ Товар удалён из корзины`, "info");
}

function clearCart() {
  localStorage.removeItem("sweeter_cart");
  updateCartUI();
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
      cartItemsDiv.innerHTML = "<p>Корзина пуста</p>";
      if (totalSpan) totalSpan.textContent = "0";
      return;
    }

    cartItemsDiv.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${item.price * item.quantity} ₽</span>
                <button onclick="removeFromCart('${item.name}')">🗑️</button>
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

// === КАТЕГОРИИ ===
function filterCategory(category) {
  const filtered = products.filter((p) => p.category === category);
  if (filtered.length > 0) {
    showNotification(
      `🍰 В категории «${category}» есть: ${filtered.map((p) => p.name).join(", ")}`,
      "info",
    );
  } else {
    showNotification(`В категории «${category}» пока нет товаров`, "error");
  }
}

// === ЗАГРУЗКА ТОВАРОВ С СЧЁТЧИКОМ ===
let selectedQuantities = {};

function changeQuantity(productName, delta) {
  const key = productName.replace(/\s/g, "");
  const current = selectedQuantities[key] || 1;
  const newVal = Math.max(1, current + delta);
  selectedQuantities[key] = newVal;

  const span = document.getElementById(`qty-${key}`);
  if (span) span.textContent = newVal;
}

function addCurrentQuantityToCart(productName, price) {
  const key = productName.replace(/\s/g, "");
  const quantity = selectedQuantities[key] || 1;
  addToCart(productName, price, quantity);
  selectedQuantities[key] = 1;
  const span = document.getElementById(`qty-${key}`);
  if (span) span.textContent = 1;
}

function loadProducts(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let productsToShow = products;
  if (limit) productsToShow = products.slice(0, limit);

  container.innerHTML = productsToShow
    .map((p) => {
      const key = p.name.replace(/\s/g, "");
      return `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price">${p.price} ₽</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeQuantity('${p.name}', -1)">-</button>
                    <span class="quantity-value" id="qty-${key}">1</span>
                    <button class="quantity-btn" onclick="changeQuantity('${p.name}', 1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addCurrentQuantityToCart('${p.name}', ${p.price})">🛒 В корзину</button>
            </div>
        `;
    })
    .join("");
}

// === ОТЗЫВЫ (с модерацией) ===
function submitReview() {
  const text = document.getElementById("review-text")?.value.trim();
  const author = document.getElementById("review-author")?.value.trim();
  const rating = document.getElementById("review-rating")?.value || 5;

  if (!text || !author) {
    showNotification("Заполните текст отзыва и имя!", "error");
    return;
  }

  const pendingReviews = JSON.parse(
    localStorage.getItem("sweeter_pending_reviews") || "[]",
  );
  pendingReviews.push({
    id: Date.now(),
    text,
    author,
    rating: parseInt(rating),
    date: new Date().toLocaleString(),
    status: "pending",
  });
  localStorage.setItem(
    "sweeter_pending_reviews",
    JSON.stringify(pendingReviews),
  );

  document.getElementById("review-text").value = "";
  document.getElementById("review-author").value = "";
  if (document.getElementById("review-rating"))
    document.getElementById("review-rating").value = 5;

  showNotification(
    "Спасибо за отзыв! Он будет опубликован после проверки администратором.",
    "success",
  );
}

function loadPublishedReviews() {
  const reviews = JSON.parse(
    localStorage.getItem("sweeter_published_reviews") || "[]",
  );
  const container = document.getElementById("reviews-grid");
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:40px;">✨ Пока нет опубликованных отзывов. Будьте первым!</div>';
    return;
  }

  container.innerHTML = reviews
    .slice(-6)
    .reverse()
    .map(
      (r) => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${getAvatar(r.author)}</div>
                <div class="review-info">
                    <div class="review-author">${escapeHtml(r.author)}</div>
                    <div class="review-date">${r.date}</div>
                    <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                </div>
            </div>
            <div class="review-text">«${escapeHtml(r.text)}»</div>
        </div>
    `,
    )
    .join("");
}

function getAvatar(name) {
  return name.charAt(0).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// === ЧАТ ===
function sendMessage() {
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
    return "💰 Цены указаны в карточке товара! От 250 до 1500 ₽.";
  if (msg.includes("доставк"))
    return "🚚 Доставка по городу — 200 ₽, от 2000 ₽ — бесплатно!";
  if (msg.includes("состав"))
    return "📜 Все десерты из натуральных продуктов. Уточняйте состав у кондитера!";
  if (msg.includes("аллерг") || msg.includes("орех"))
    return "🥜 Предупредите нас об аллергии — подберём безопасный вариант!";
  if (msg.includes("завтра"))
    return "📅 Да, принимаем заказы на завтра! Свяжемся для уточнения времени.";
  if (msg.includes("сахар")) return "🍬 Да, можем приготовить без сахара 👍";
  return "💛 Спасибо за вопрос! Напишу кондитеру, он скоро ответит.";
}

function sendQuickMessage(text) {
  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML += `<div class="message user">${text}</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  setTimeout(() => {
    let reply = getBakerReply(text);
    messagesDiv.innerHTML += `<div class="message baker">${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 300);
}

// === ЗАКАЗ ===
function submitOrder() {
  const name = document.getElementById("name")?.value;
  const phone = document.getElementById("phone")?.value;
  const address = document.getElementById("address")?.value;
  const comment = document.getElementById("comment")?.value;

  if (!name || !phone || !address) {
    showNotification("Заполните все поля!", "error");
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    showNotification("Корзина пуста! Добавьте товары.", "error");
    return;
  }

  const order = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    name: name,
    phone: phone,
    address: address,
    comment: comment || "",
    items: cart,
    total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
    status: "Новый",
  };

  const orders = JSON.parse(localStorage.getItem("sweeter_orders") || "[]");
  orders.push(order);
  localStorage.setItem("sweeter_orders", JSON.stringify(orders));

  clearCart();

  showNotification(
    `✅ Заказ оформлен, ${name}! Сумма: ${order.total} ₽`,
    "success",
  );

  setTimeout(() => {
    location.href = "index.html";
  }, 1500);
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener("DOMContentLoaded", function () {
  updateCartUI();
  loadPublishedReviews();

  if (document.getElementById("popular-grid")) loadProducts("popular-grid", 3);
  if (document.getElementById("catalog-grid")) loadProducts("catalog-grid");

  window.addEventListener("storage", function (e) {
    if (e.key === "sweeter_cart") updateCartUI();
  });
});
