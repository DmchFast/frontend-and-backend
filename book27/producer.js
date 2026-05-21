import express from 'express';
import amqplib from 'amqplib';

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'tasks_queue';

async function sendToQueue(task) {
  let connection;
  let channel;
  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dlx_exchange',
        'x-dead-letter-routing-key': 'dead',
        'x-message-ttl': 60000,
      },
    });
    const message = JSON.stringify(task);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
    console.log(`[Producer] Отправлено: ${message}`);
  } catch (err) {
    console.error('[Producer] Ошибка отправки:', err.message);
    throw err;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

app.post('/tasks', async (req, res) => {
  const task = req.body;
  if (!task || !task.type || !task.payload) {
    return res.status(400).json({ error: 'Поля type и payload обязательны' });
  }
  try {
    await sendToQueue(task);
    res.status(202).json({ status: 'accepted', task });
  } catch (err) {
    console.error('[API] Ошибка:', err);
    res.status(500).json({ error: 'Ошибка очереди', details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Producer API на http://localhost:${PORT}`);
});