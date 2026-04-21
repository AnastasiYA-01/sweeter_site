const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sweeter",
  password: "sweeter123",
  port: 5432,
});

// === ПОЛЬЗОВАТЕЛИ ===

// Регистрация
app.post("/api/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, role, created_at",
      [name, email, phone, password],
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    } else {
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
});

// Вход
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE email = $1 AND password = $2",
    [email, password],
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Неверный email или пароль" });
  }
  res.json({ success: true, user: result.rows[0] });
});

// Получить пользователя по email
app.get("/api/users/:email", async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE email = $1",
    [req.params.email],
  );
  res.json(result.rows[0] || null);
});

// === ЗАКАЗЫ ===

// Получить заказы пользователя
app.get("/api/orders/:email", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE user_email = $1 ORDER BY id DESC",
    [req.params.email],
  );
  res.json(result.rows);
});

// Создать заказ
app.post("/api/orders", async (req, res) => {
  const { user_email, items, total, address, phone, comment } = req.body;
  const result = await pool.query(
    `INSERT INTO orders (user_email, items, total, address, phone, comment) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_email, JSON.stringify(items), total, address, phone, comment],
  );
  res.json(result.rows[0]);
});

// Обновить статус заказа (для админа)
app.put("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
  res.json({ success: true });
});

// === ОТЗЫВЫ ===

// Получить опубликованные отзывы (последние 4)
app.get("/api/reviews/published", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM reviews WHERE status = $1 ORDER BY id DESC LIMIT 4",
    ["published"],
  );
  res.json(result.rows);
});

// Получить отзывы на модерации (только для админа)
app.get("/api/reviews/pending", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM reviews WHERE status = $1 ORDER BY id DESC",
    ["pending"],
  );
  res.json(result.rows);
});

// Добавить новый отзыв (статус pending)
app.post("/api/reviews", async (req, res) => {
  const { author, email, text, rating } = req.body;
  const result = await pool.query(
    "INSERT INTO reviews (author, email, text, rating, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [author, email, text, rating, "pending"],
  );
  res.json(result.rows[0]);
});

// Одобрить отзыв
app.put("/api/reviews/:id/approve", async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE reviews SET status = $1 WHERE id = $2", [
    "published",
    id,
  ]);
  res.json({ success: true });
});

// Отклонить/удалить отзыв
app.delete("/api/reviews/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
  res.json({ success: true });
});

// === ЗАПУСК СЕРВЕРА ===
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер Sweeter запущен на http://localhost:${PORT}`);
  console.log(`📦 База данных: sweeter (PostgreSQL)`);
});
