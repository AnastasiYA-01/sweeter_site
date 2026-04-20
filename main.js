// Данные товаров
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
    name: "Капкейк",
    price: 350,
    image: "https://via.placeholder.com/300x200?text=Капкейк",
    category: "Капкейки",
  },
];

// Корзина
let cart = [];

// Функция добавления в корзину
function addToCart(name, price) {
  cart.push({ name, price });
  alert(`🍰 ${name} добавлен в корзину!`);
  console.log("Корзина:", cart);
}

// Функция оформления заказа
function submitOrder() {
  const name = document.getElementById("name")?.value;
  const phone = document.getElementById("phone")?.value;
  const address = document.getElementById("address")?.value;
  const product = document.getElementById("product")?.value;

  if (!name || !phone || !address) {
    alert("Пожалуйста, заполните все поля!");
    return;
  }

  alert(
    `✅ Заказ оформлен, ${name}!\n\nТовар: ${product}\nАдрес: ${address}\n\nСкоро с вами свяжется кондитер.`,
  );
}

// Загрузка каталога на главной странице (популярное)
if (document.getElementById("popular-grid")) {
  const popular = products.slice(0, 3);
  const grid = document.getElementById("popular-grid");
  popular.forEach((p) => {
    grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price">${p.price} ₽</div>
                <button class="btn" onclick="addToCart('${p.name}', ${p.price})">Заказать</button>
            </div>
        `;
  });
}

// Загрузка каталога на странице catalog.html
if (document.getElementById("catalog-grid")) {
  const grid = document.getElementById("catalog-grid");
  products.forEach((p) => {
    grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <div class="price">${p.price} ₽</div>
                <button class="btn" onclick="addToCart('${p.name}', ${p.price})">В корзину</button>
            </div>
        `;
  });
}

// Чат
function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML += `<div class="message user">${message}</div>`;
  input.value = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  setTimeout(() => {
    messagesDiv.innerHTML += `<div class="message baker">Спасибо за сообщение! Я свяжусь с вами в ближайшее время 💛</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 500);
}

function sendQuickMessage(text) {
  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML += `<div class="message user">${text}</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  setTimeout(() => {
    let reply = "";
    if (text.includes("сахар")) reply = "Да, можем приготовить без сахара 👍";
    else if (text.includes("город"))
      reply = "Доставка за город обсуждается индивидуально!";
    else if (text.includes("скидка"))
      reply = "Да, скидка 10% на первый заказ по промокоду SWEETER10";
    else reply = "Хороший вопрос! Я уточню у кондитера ✨";

    messagesDiv.innerHTML += `<div class="message baker">${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 500);
}
