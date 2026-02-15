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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});