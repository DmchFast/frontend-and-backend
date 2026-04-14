const { Sequelize } = require('sequelize');

// Подключение к базе данных PostgreSQL
const sequelize = new Sequelize('back_users_db_19', 'postgres', 'EnD37927', {
   host: 'localhost',
   dialect: 'postgres',
});

// Проверка подключения к базе данных
sequelize.authenticate()
   .then(() => console.log('Connected to PostgreSQL'))
   .catch(err => console.error('Connection error:', err));