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

// CRUD операции

// POST /api/users
app.post('/api/users', async (req, res) => {
   try {
      const user = await User.create(req.body);
      res.status(201).send(user);
   } catch (err) {
      res.status(400).send(err.message);
   }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
   try {
      const users = await User.findAll();
      res.send(users);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
   try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
   } catch (err) {
      res.status(500).send(err.message);
   }
});