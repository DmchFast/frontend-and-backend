const express = require('express');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Товары
let products = [
  {
    id: nanoid(6),
    name: 'iPhone 15 Pro',
    category: 'Смартфоны',
    description: 'Флагманский смартфон Apple с титановым корпусом',
    price: 119990,
    stock: 15,
    rating: 4.8,
    image: '1'
  },
  {
    id: nanoid(6),
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Смартфоны',
    description: 'Флагман Samsung с S Pen и камерой 200 МП',
    price: 109990,
    stock: 10,
    rating: 4.7,
    image: '2'
  },
  {
    id: nanoid(6),
    name: 'MacBook Pro 14"',
    category: 'Ноутбуки',
    description: 'Ноутбук Apple с чипом M3 Pro, 16 ГБ RAM',
    price: 199990,
    stock: 8,
    rating: 4.9,
    image: '3'
  },
  {
    id: nanoid(6),
    name: 'ASUS ROG Zephyrus G14',
    category: 'Ноутбуки',
    description: 'Игровой ноутбук с Ryzen 9 и RTX 4060',
    price: 149990,
    stock: 5,
    rating: 4.6,
    image: '4'
  },
  {
    id: nanoid(6),
    name: 'iPad Pro 12.9"',
    category: 'Планшеты',
    description: 'Планшет Apple с экраном Liquid Retina XDR',
    price: 89990,
    stock: 12,
    rating: 4.8,
    image: '5'
  },
  {
    id: nanoid(6),
    name: 'Sony WH-1000XM5',
    category: 'Аксессуары',
    description: 'Беспроводные наушники с шумоподавлением',
    price: 29990,
    stock: 25,
    rating: 4.9,
    image: '6'
  },
  {
    id: nanoid(6),
    name: 'Xiaomi Mi Band 8',
    category: 'Аксессуары',
    description: 'Фитнес-браслет с AMOLED-экраном',
    price: 3990,
    stock: 50,
    rating: 4.5,
    image: '7'
  },
  {
    id: nanoid(6),
    name: 'Dell XPS 15',
    category: 'Ноутбуки',
    description: 'Премиальный ноутбук с OLED-экраном',
    price: 179990,
    stock: 3,
    rating: 4.7,
    image: '8'
  },
  {
    id: nanoid(6),
    name: 'Google Pixel 8 Pro',
    category: 'Смартфоны',
    description: 'Смартфон Google с AI-функциями',
    price: 89990,
    stock: 7,
    rating: 4.6,
    image: '9'
  },
  {
    id: nanoid(6),
    name: 'Apple Watch Series 9',
    category: 'Аксессуары',
    description: 'Умные часы Apple с датчиком температуры',
    price: 44990,
    stock: 18,
    rating: 4.8,
    image: '10'
  }
];

// Middleware для парсинга JSON
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});