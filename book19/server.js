const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const app = express();

app.use(express.json());

// Подключение к базе данных PostgreSQL
const sequelize = new Sequelize('back_users_db_19', 'postgres', 'EnD37927', {
   host: 'localhost',
   dialect: 'postgres',
});

// Проверка подключения к базе данных
sequelize.authenticate()
   .then(() => console.log('Connected to PostgreSQL'))
   .catch(err => console.error('Connection error:', err));

// Определение модели User
const User = sequelize.define('User', {
   first_name: { type: DataTypes.STRING, allowNull: false },
   last_name: { type: DataTypes.STRING, allowNull: false },
   age: { type: DataTypes.INTEGER, allowNull: false },
   created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
   updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
   timestamps: false
});

// Синхронизация с БД
sequelize.sync({ force: false });

// Запуск сервера
app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});