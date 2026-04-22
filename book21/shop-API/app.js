const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const port = 3000;

// JWT access
const JWT_SECRET = 'your-secret-key-change-in-production';
const ACCESS_EXPIRES_IN = '15m';

// JWT refresh
const REFRESH_SECRET = "refresh_secret";
const REFRESH_EXPIRES_IN = "7d";

const refreshTokens = new Set(); // хранилище

// Время жизни кэша (в секундах)
const USERS_CACHE_TTL = 60;       // 1 минута
const PRODUCTS_CACHE_TTL = 600;   // 10 минут

// Товары и пользователи
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

// Redis client setup
const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

async function initRedis() {
  await redisClient.connect();
  console.log('Redis connected');
}

// Middleware для парсинга JSON
app.use(express.json());

app.use('/img', express.static(path.join(__dirname, 'img')));

// CORS настройка (для связи с фронтендом)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"], // добавлен PUT
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

// Создание базового пользователя
const createBaseUser = async () => {
  const adminPassword = await bcrypt.hash('admin', 10);
  const sellerPassword = await bcrypt.hash('seller', 10);
  const userPassword = await bcrypt.hash('user', 10);

  users.push({ // * Данные админа
    id: nanoid(),
    email: 'admin@test.ru',
    first_name: 'Админ',
    last_name: 'Админ',
    hashedPassword: adminPassword,
    role: 'admin'
  });

  users.push({ // * Данные продавца
    id: nanoid(),
    email: 'seller@test.ru',
    first_name: 'Продавец',
    last_name: 'Продавец',
    hashedPassword: sellerPassword,
    role: 'seller'
  });

  users.push({ // * Данные пользователя
    id: nanoid(),
    email: 'user@test.ru',
    first_name: 'Пользователь',
    last_name: 'Пользователь',
    hashedPassword: userPassword,
    role: 'user'
  });
  
};

(async () => {
  await createBaseUser();
  console.log('Тестовые пользователи созданы (admin, seller, user)');
})();

// Хелперы для паролей
async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// Генерация токенов access и refresh
function generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// JWT middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';

  // формат Bearer <token>
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ 
      error: 'Отсутствует или неверный формат заголовка Authorization' 
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Срок действия токена истек' });
    }
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

// Middleware ролей
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    next(); 
  };
}

// Кэширование с Redis
function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json({ source: 'cache', data: JSON.parse(cached) });
      }
      req.cacheKey = key;
      req.cacheTTL = ttl;
      next();
    } catch (err) {
      console.error('Cache read error:', err);
      next();
    }
  };
}

async function saveToCache(key, data, ttl) {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (err) {
    console.error('Cache save error:', err);
  }
}

async function invalidateUsersCache(userId = null) {
  try {
    await redisClient.del('users:all');
    if (userId) await redisClient.del(`users:${userId}`);
  } catch (err) {
    console.error('Users cache invalidate error:', err);
  }
}

async function invalidateProductsCache(productId = null) {
  try {
    await redisClient.del('products:all');
    if (productId) await redisClient.del(`products:${productId}`);
  } catch (err) {
    console.error('Products cache invalidate error:', err);
  }
}

// Регистрация
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

  // Создание нового пользователя с ролью
  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    hashedPassword: await hashPassword(password),
    role: 'user'
  };

  users.push(newUser);
  
  // Возврат без пароля
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  refreshTokens.add(refreshToken);

  res.status(200).json({ 
    accessToken,
    refreshToken
  });
});

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      error: "refreshToken is required",
    });
  }
  
  // Tокен в хранилище
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({
      error: "Invalid refresh token",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    
    // Ротация refresh-токена
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    
  } catch (err) {
    refreshTokens.delete(refreshToken);
    return res.status(401).json({
      error: "Invalid or expired refresh token",
    });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userId = req.user.sub;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const { hashedPassword, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Маршруты admin
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), cacheMiddleware(() => 'users:all', USERS_CACHE_TTL),
  async (req, res) => {
    const data = users.map(({ hashedPassword, ...rest }) => rest);
    await saveToCache(req.cacheKey, data, req.cacheTTL);
    res.json({ source: 'server', data });
  }
);

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
  async (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const { hashedPassword, ...data } = user;
    await saveToCache(req.cacheKey, data, req.cacheTTL);
    res.json({ source: 'server', data });
  }
);

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name, role } = req.body;
  
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  // Обновление полей
  if (email) user.email = email;
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (role && ['user', 'seller', 'admin'].includes(role)) user.role = role;
  
  await invalidateUsersCache(user.id);

  const { hashedPassword, ...userData } = user;
  res.json(userData);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  if (id === req.user.sub) {
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  }
  
  users.splice(index, 1);

  await invalidateUsersCache(id);

  res.status(204).send();
});

// Товары маршруты

// GET получение списка товаров
app.get('/api/products', authMiddleware, cacheMiddleware(() => 'products:all', PRODUCTS_CACHE_TTL),
  async (req, res) => {
    await saveToCache(req.cacheKey, products, req.cacheTTL);
    res.json({ source: 'server', data: products });
  }
);

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
app.get('/api/products/:id', authMiddleware, cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
  async (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    await saveToCache(req.cacheKey, product, req.cacheTTL);
    res.json({ source: 'server', data: product });
  }
);

// POST создание нового товара только seller и admin
app.post("/api/products", authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  
  const newProduct = {
    id: nanoid(6),
    name: name?.trim() || "Без названия",
    category: category?.trim() || "Без категории",
    description: description?.trim() || "",
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    rating: rating ? Number(rating) : 0,
    image: image?.trim() || "image",
    createdBy: req.user.sub // ID создателя
  };
  
  products.push(newProduct);

  await invalidateProductsCache();

  res.status(201).json(newProduct);
});

// PATCH изменение товара seller и admin
app.patch("/api/products/:id", authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
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

  await invalidateProductsCache(product.id);

  res.json(product);
});

// DELETE удаление товара  admin
app.delete("/api/products/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const id = req.params.id;
  const exists = products.some((p) => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });
  
  products = products.filter((p) => p.id !== id);

  await invalidateProductsCache(id);

  res.status(204).send();
});

// доступ продавцу и админу
app.get("/api/protected-route",
  authMiddleware, roleMiddleware(["seller", "admin"]),
  (req, res) => {
    res.json({
      message: "Protected route for seller or admin",
      user: req.user
    });
  }
);
// доступ только админу
app.get("/api/protected-admin-route",
  authMiddleware, roleMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: "Admin only route",
      user: req.user
      });
  }
);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// обработка ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

initRedis().then(() => {
  app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log('Доступные маршруты:');
    console.log('  Аутентификация:');
    console.log('    POST /api/auth/register');
    console.log('    POST /api/auth/login');
    console.log('    POST /api/auth/refresh');
    console.log('    GET /api/auth/me');
    console.log('  Пользователи (admin only):');
    console.log('    GET /api/users');
    console.log('    GET /api/users/:id');
    console.log('    PUT /api/users/:id');
    console.log('    DELETE /api/users/:id');
    console.log('  Товары:');
    console.log('    GET /api/products');
    console.log('    GET /api/products/:id');
    console.log('    POST /api/products (seller/admin)');
    console.log('    PATCH /api/products/:id (seller/admin)');
    console.log('    DELETE /api/products/:id (admin)');
  });
});