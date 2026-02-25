const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

// Товары
let products = [
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Valhalla',
    category: 'Xbox Series X|S, Xbox One',
    description: 'Станьте викингом по имени Эйвор и приведите свой клан к славе среди суровых земель Англии',
    price: 2999,
    stock: 15,
    rating: 4.2,
    image: 'ac_valhalla'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Mirage',
    category: 'Xbox Series X|S, Xbox One',
    description: 'Откройте для себя историю Басима, вора, ставшего ассасином, в атмосферном Багдаде',
    price: 3499,
    stock: 12,
    rating: 4.7,
    image: 'ac_mirage'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Odyssey',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Отправьтесь в эпическое путешествие по Древней Греции и станьте легендарным спартанским героем',
    price: 1999,
    stock: 20,
    rating: 3.7,
    image: 'ac_odyssey'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Origins',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Узнайте историю создания Братства ассасинов в Древнем Египте',
    price: 1799,
    stock: 18,
    rating: 4.1,
    image: 'ac_origins'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Syndicate',
    category: 'Xbox One',
    description: 'Возглавьте преступный мир Лондона викторианской эпохи в роли близнецов-ассасинов',
    price: 1299,
    stock: 8,
    rating: 3.9,
    image: 'ac_syndicate'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Unity',
    category: 'Xbox One',
    description: 'Погрузитесь в Париж времен Французской революции и раскройте тайны города',
    price: 1299,
    stock: 10,
    rating: 4.5,
    image: 'ac_unity'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed IV: Black Flag',
    category: 'Xbox One, Xbox 360',
    description: 'Станьте пиратом Эдвардом Кенуэем и бороздите воды Карибского моря',
    price: 999,
    stock: 25,
    rating: 5.0,
    image: 'ac_black_flag'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Rogue',
    category: 'Xbox One, Xbox 360',
    description: 'Узнайте историю ассасина, ставшего тамплиером, в сеттинге Северной Америки',
    price: 899,
    stock: 7,
    rating: 4.4,
    image: 'ac_rogue'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed III Remastered',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Станьте свидетелем Американской революции в роли Коннора, ассасина из клана могавков',
    price: 1499,
    stock: 10,
    rating: 4.5,
    image: 'ac_3'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Ezio Collection',
    category: 'Xbox One, Xbox Series X|S',
    description: 'Три легендарные игры: AC II, Brotherhood и Revelations с улучшенной графикой',
    price: 2499,
    stock: 15,
    rating: 4.9,
    image: 'ac_ezio'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Chronicles Trilogy',
    category: 'Xbox One',
    description: 'Три приключения в Китае, Индии и России в уникальном 2.5D стиле',
    price: 799,
    stock: 6,
    rating: 4.0,
    image: 'ac_chronicles'
  },
  {
    id: nanoid(6),
    name: 'Assassin\'s Creed Liberation HD',
    category: 'Xbox One, Xbox 360',
    description: 'История первой женщины-ассасина в сеттинге Нового Орлеана XVIII века',
    price: 599,
    stock: 10,
    rating: 4.1,
    image: 'ac_liberation'
  }
];

// Middleware для парсинга JSON
app.use(express.json());

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
});