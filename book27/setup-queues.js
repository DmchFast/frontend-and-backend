import amqplib from 'amqplib';

async function setupQueues() {
  const connection = await amqplib.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // 1. Dead Letter Exchange (DLX)
  await channel.assertExchange('dlx_exchange', 'direct', { durable: true });

  // 2. Dead Letter Queue (DLQ)
  await channel.assertQueue('dead_letter_queue', { durable: true });

  // 3. Привязываем DLQ к DLX с routing key 'dead'
  await channel.bindQueue('dead_letter_queue', 'dlx_exchange', 'dead');

  // 4. Основная очередь с параметрами DLX
  await channel.assertQueue('tasks_queue', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'dlx_exchange', // отклон
      'x-dead-letter-routing-key': 'dead',
      'x-message-ttl': 60000, // сообщение живёт
    },
  });

  console.log('Очереди настроены: tasks_queue → DLX → dead_letter_queue');
  await connection.close();
}

setupQueues().catch(console.error);