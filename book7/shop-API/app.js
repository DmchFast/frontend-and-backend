const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Товары
let users = [];
let products = [
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Valhalla',
    category: 'Xbox Series X|S, Xbox One',
    description: 'Станьте викингом по имени Эйвор и приведите свой клан к славе среди суровых земель Англии',
    price: 2999,
    stock: 15,
    rating: 4.2,
    image: '/img/Assassins Creed Valhalla.webp'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Mirage',
    category: 'Xbox Series X|S, Xbox One',
    description: 'Откройте для себя историю Басима, вора, ставшего ассасином, в атмосферном Багдаде',
    price: 3499,
    stock: 12,
    rating: 4.7,
    image: '/img/Assassins Creed Mirage.webp'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Unity',
    category: 'Xbox One',
    description: 'Погрузитесь в Париж времен Французской революции и раскройте тайны города',
    price: 1299,
    stock: 10,
    rating: 4.5,
    image: '/img/Assassins Creed Unity.webp'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed IV: Black Flag',
    category: 'Xbox One, Xbox 360',
    description: 'Станьте пиратом Эдвардом Кенуэем и бороздите воды Карибского моря',
    price: 1399,
    stock: 25,
    rating: 5.0,
    image: '/img/Assassins Creed IV Black Flag.webp'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed III Remastered',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Станьте свидетелем Американской революции в роли Коннора, ассасина из клана могавков',
    price: 1499,
    stock: 10,
    rating: 4.5,
    image: '/img/Assassins Creed III Remastered.webp'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Ezio Collection',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Три легендарные игры: AC II, Brotherhood и Revelations с улучшенной графикой',
    price: 2499,
    stock: 15,
    rating: 4.9,
    image: '/img/Assassins Creed Ezio Collection.webp'
  }
];

// Middleware для парсинга JSON
app.use(express.json());

app.use('/img', express.static(path.join(__dirname, 'img')));

// CORS настройка (для связи с фронтендом)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// хелпер для паролей
async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// Вход, регистр маршруты


app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  // Валидация
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ 
      error: 'Все поля обязательны для заполнения' 
    });
  }

  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Некорректный формат email' 
    });
  }

  // Проверка существ пользователя
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ 
      error: 'Пользователь с таким email уже существует' 
    });
  }

  // Создание нового пользователя
  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    hashedPassword: await hashPassword(password)
  };

  users.push(newUser);
  
  // Возврат хеш пароля
  const { hashedPassword, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email и пароль обязательны' 
    });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ 
      error: 'Неверные учетные данные' 
    });
  }

  const isValid = await verifyPassword(password, user.hashedPassword);
  if (!isValid) {
    return res.status(401).json({ 
      error: 'Неверные учетные данные' 
    });
  }

  const { hashedPassword, ...userWithoutPassword } = user;
  res.status(200).json({ 
    success: true,
    user: userWithoutPassword 
  });
});

// Товары маршруты

// GET получение списка товаров
app.get("/api/products", (req, res) => {
  res.json(products);
});

// получения товара проверка
function findProductOr404(id, res) {
  const product = products.find(p => p.id == id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

// GET получение товара по ID
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

// POST создание нового товара
app.post("/api/products", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  
  const newProduct = {
    id: nanoid(6),
    name: name?.trim() || "Без названия",
    category: category?.trim() || "Без категории",
    description: description?.trim() || "",
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    rating: rating ? Number(rating) : 0,
    image: image?.trim() || "image"
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PATCH изменение товара
app.patch("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  
  // Проверка обновления
  if (req.body?.name === undefined && req.body?.category === undefined && 
      req.body?.description === undefined && req.body?.price === undefined && 
      req.body?.stock === undefined && req.body?.rating === undefined && 
      req.body?.image === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  
  const { name, category, description, price, stock, rating, image } = req.body;
  
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image.trim();
  
  res.json(product);
});

// DELETE удаление товара
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some((p) => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });
  
  products = products.filter((p) => p.id !== id);
  res.status(204).send();
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// обработка ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log('Доступные маршруты:');
  console.log('  Аутентификация:');
  console.log('    POST /api/auth/register');
  console.log('    POST /api/auth/login');
  console.log('  Товары:');
  console.log('    GET /api/products');
  console.log('    GET /api/products/:id');
  console.log('    POST /api/products');
  console.log('    PATCH /api/products/:id');
  console.log('    DELETE /api/products/:id');
});