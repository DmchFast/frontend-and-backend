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
    image: 'https://via.placeholder.com/200?text=iPhone+15'
  },
  {
    id: nanoid(6),
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Смартфоны',
    description: 'Флагман Samsung с S Pen и камерой 200 МП',
    price: 109990,
    stock: 10,
    rating: 4.7,
    image: 'https://via.placeholder.com/200?text=Samsung+S24'
  },
  {
    id: nanoid(6),
    name: 'MacBook Pro 14"',
    category: 'Ноутбуки',
    description: 'Ноутбук Apple с чипом M3 Pro, 16 ГБ RAM',
    price: 199990,
    stock: 8,
    rating: 4.9,
    image: 'https://via.placeholder.com/200?text=MacBook+Pro'
  },
  {
    id: nanoid(6),
    name: 'ASUS ROG Zephyrus G14',
    category: 'Ноутбуки',
    description: 'Игровой ноутбук с Ryzen 9 и RTX 4060',
    price: 149990,
    stock: 5,
    rating: 4.6,
    image: 'https://via.placeholder.com/200?text=ASUS+ROG'
  },
  {
    id: nanoid(6),
    name: 'iPad Pro 12.9"',
    category: 'Планшеты',
    description: 'Планшет Apple с экраном Liquid Retina XDR',
    price: 89990,
    stock: 12,
    rating: 4.8,
    image: 'https://via.placeholder.com/200?text=iPad+Pro'
  },
  {
    id: nanoid(6),
    name: 'Sony WH-1000XM5',
    category: 'Аксессуары',
    description: 'Беспроводные наушники с шумоподавлением',
    price: 29990,
    stock: 25,
    rating: 4.9,
    image: 'https://via.placeholder.com/200?text=Sony'
  },
  {
    id: nanoid(6),
    name: 'Xiaomi Mi Band 8',
    category: 'Аксессуары',
    description: 'Фитнес-браслет с AMOLED-экраном',
    price: 3990,
    stock: 50,
    rating: 4.5,
    image: 'https://via.placeholder.com/200?text=Mi+Band'
  },
  {
    id: nanoid(6),
    name: 'Dell XPS 15',
    category: 'Ноутбуки',
    description: 'Премиальный ноутбук с OLED-экраном',
    price: 179990,
    stock: 3,
    rating: 4.7,
    image: 'https://via.placeholder.com/200?text=Dell+XPS'
  },
  {
    id: nanoid(6),
    name: 'Google Pixel 8 Pro',
    category: 'Смартфоны',
    description: 'Смартфон Google с AI-функциями',
    price: 89990,
    stock: 7,
    rating: 4.6,
    image: 'https://via.placeholder.com/200?text=Pixel+8'
  },
  {
    id: nanoid(6),
    name: 'Apple Watch Series 9',
    category: 'Аксессуары',
    description: 'Умные часы Apple с датчиком температуры',
    price: 44990,
    stock: 18,
    rating: 4.8,
    image: 'https://via.placeholder.com/200?text=Watch'
  }
];

// Middleware для парсинга JSON
app.use(express.json());


app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});