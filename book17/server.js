const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// VAPID‑ключи
const vapidKeys = {
   publicKey: 'BOJiaqcO7tfLgZPenU247ZsowLKXNQS3y6Riej9mBN8s5MlAT1iFUqWXycy-ul5BwwOhgs-ejlKhsSCIrN2fFqE',
   privateKey: '_brfu-Zl-Namz9ITBPaR3NtxqYF5-Tb4C5rjiArvsIA'
};

webpush.setVapidDetails(
   'mailto:your-chuvaev.d.s@edu.mirea.ru',
   vapidKeys.publicKey,
   vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

let subscriptions = [];

// Хранилище активных напоминаний
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
   cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
   console.log('Клиент подключён:', socket.id);

   socket.on('newTask', (task) => {
      io.emit('taskAdded', task);

      const payload = JSON.stringify({
         title: 'Новая задача',
         body: task.text
      });

      subscriptions.forEach(sub => {
         webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
      });
   });

   // Обработка нового напоминания от клиента
   socket.on('newReminder', (reminder) => {
      const { id, text, reminderTime } = reminder;
      const delay = reminderTime - Date.now();
      if (delay <= 0) return;

      // Сохраняем таймер
      const timeoutId = setTimeout(() => {
         // Отправляем push-уведомление всем подписанным клиентам
         const payload = JSON.stringify({
            title: '⏰ Напоминание',
            body: text,
            reminderId: id
         });

         subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
         });

         // Удаляем напоминание из хранилища после отправки
         reminders.delete(id);
      }, delay);

      reminders.set(id, { timeoutId, text, reminderTime });
   });

   socket.on('disconnect', () => {
      console.log('Клиент отключён:', socket.id);
   });
});

app.post('/subscribe', (req, res) => {
   subscriptions.push(req.body);
   res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
   const { endpoint } = req.body;
   subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
   res.status(200).json({ message: 'Подписка удалена' });
});

// Эндпоинт откладывания напоминания на 5 минут
app.post('/snooze', (req, res) => {
   const reminderId = parseInt(req.query.reminderId, 10);
   if (!reminderId || !reminders.has(reminderId)) {
      return res.status(400).json({ error: 'Reminder not found' });
   }

   const reminder = reminders.get(reminderId);
   // Отменяем предыдущий таймер
   clearTimeout(reminder.timeoutId);

   // Устанавливаем новый через 5 минут (300 000 мс)
   const newDelay = 5 * 60 * 1000; 
   const newTimeoutId = setTimeout(() => {
      const payload = JSON.stringify({
         title: 'Напоминание отложено',
         body: reminder.text,
         reminderId: reminderId
      });

      subscriptions.forEach(sub => {
         webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
      });

      reminders.delete(reminderId);
   }, newDelay);

   // Обновляем хранилище
   reminders.set(reminderId, { timeoutId: newTimeoutId, text: reminder.text, reminderTime: Date.now() + newDelay });
   res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

const PORT = 3001;
server.listen(PORT, () => {
   console.log(`Сервер запущен на http://localhost:${PORT}`);
});