const express = require('express');
const app = express();
const port = 3000;

let products = [
    { id: 1, name: 'Ноутбук', price: 75000, category: 'Электроника' },
    { id: 2, name: 'Смартфон', price: 45000, category: 'Электроника' },
    { id: 3, name: 'Наушники', price: 5000, category: 'Аксессуары' }
];

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Главная страница');
});

// GET для просмотра товаров
app.get('/products', (req, res) => {
    res.send(JSON.stringify(products));
});

app.get('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(JSON.stringify(product));
});

// POST для добавления товара
app.post('/products', (req, res) => {
    const { name, price, category } = req.body;
    const newProduct = { id: Date.now(), name, price, category };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH редактирования товара
app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const { name, price, category } = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    res.json(product);
});

// DELETE удаления товара
app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.send('Ok');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});