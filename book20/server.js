const mongoose = require('mongoose');
const express = require('express');
const app = express();

app.use(express.json());

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://YourMongoAdmin:1234@localhost:27017/back_users_db_20', {
   useNewUrlParser: true,
   useUnifiedTopology: true
})
   // Проверка подключения к базе данных
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('Connection error:', err));

// Запуск сервера
app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});