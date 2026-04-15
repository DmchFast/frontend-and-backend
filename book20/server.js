const mongoose = require('mongoose');
const express = require('express');
const app = express();

app.use(express.json());

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://YourMongoAdmin:1234@localhost:27017/back_users_db_20?authSource=admin')

// Проверка подключения к базе данных
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('Connection error:', err));

// Определение модели User
const userSchema = new mongoose.Schema({
   first_name: { type: String, required: true },
   last_name: { type: String, required: true },
   age: { type: Number, required: true },
   created_at: { type: Date, default: Date.now },
   updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Запуск сервера
app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});

// CRUD операции

// POST /api/users
app.post('/api/users', async (req, res) => {
   try {
      const user = new User(req.body);
      await user.save();
      res.status(201).send(user);
   } catch (err) {
      res.status(400).send(err.message);
   }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
   try {
      const users = await User.find();
      res.send(users);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
   try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

// PATCH /api/users/:id
app.patch('/api/users/:id', async (req, res) => {
   try {
      const updateData = { ...req.body, updated_at: Date.now() };
      const user = await User.findByIdAndUpdate(
         req.params.id,
         updateData,
         { new: true }
      );
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
   } catch (err) {
      res.status(400).send(err.message);
   }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
   try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send({ message: 'User deleted' });
   } catch (err) {
      res.status(500).send(err.message);
   }
});